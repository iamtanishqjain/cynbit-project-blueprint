import { describe, expect, it } from 'vitest'
import { buildBrief, estimate, validateContact, type Selection } from './blueprint'

const base: Selection = { service: 'ai', features: ['agents'], stage: 'idea', timeline: 'standard' }

describe('estimate', () => {
  it('returns null with no features picked', () => {
    expect(estimate({ ...base, features: [] })).toBeNull()
  })

  it('uses the feature range for a single feature', () => {
    expect(estimate(base)?.weeks).toEqual([3, 6])
  })

  it('adds extra features at 70% so overlap is not double counted', () => {
    const one = estimate(base)!
    const two = estimate({ ...base, features: ['agents', 'voice'] })!
    expect(two.weeks[1]).toBeGreaterThan(one.weeks[1])
    expect(two.weeks[1]).toBeLessThan(6 + 8)
  })

  it('scales legacy work up and existing work down', () => {
    const idea = estimate(base)!.weeks[1]
    expect(estimate({ ...base, stage: 'legacy' })!.weeks[1]).toBeGreaterThan(idea)
    expect(estimate({ ...base, stage: 'existing' })!.weeks[1]).toBeLessThan(idea)
  })

  it('flags a timeline shorter than the minimum effort', () => {
    const big: Selection = { service: 'software', features: ['fullstack'], stage: 'idea', timeline: 'rush' }
    expect(estimate(big)?.tightTimeline).toBe(true)
    expect(estimate({ ...big, timeline: 'flexible' })?.tightTimeline).toBe(false)
  })
})

describe('validateContact', () => {
  it('rejects a bad email and short name', () => {
    expect(validateContact({ name: 'A', email: 'nope', company: '' })).toEqual({
      name: 'Enter your name',
      email: 'Enter a valid email',
    })
  })

  it('accepts a valid contact', () => {
    expect(validateContact({ name: 'Tanishq Jain', email: 'a@b.co', company: '' })).toEqual({})
  })
})

describe('buildBrief', () => {
  it('lists the chosen scope and falls back to the name when no company is given', () => {
    const brief = buildBrief(base, { name: 'Tanishq Jain', email: 'a@b.co', company: '' })
    expect(brief).toContain('Project blueprint for Tanishq Jain')
    expect(brief).toContain('Scope: Autonomous agents')
    expect(brief).toContain('Indicative effort: 3 to 6 weeks')
  })

  it('has a heading before any name is entered', () => {
    const brief = buildBrief(base, { name: '', email: '', company: '' })
    expect(brief).toContain('Project blueprint for a new project')
  })
})
