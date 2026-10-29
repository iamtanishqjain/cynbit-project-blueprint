export type ServiceId = 'ai' | 'software' | 'marketing'
export type StageId = 'idea' | 'existing' | 'legacy'
export type TimelineId = 'rush' | 'standard' | 'flexible'

export interface Feature {
  id: string
  label: string
  hint: string
  weeks: [number, number]
}

export interface Service {
  id: ServiceId
  label: string
  tagline: string
  team: string[]
  features: Feature[]
}

export const SERVICES: Service[] = [
  {
    id: 'ai',
    label: 'AI automation',
    tagline: 'Agents, LLM workflows and voice',
    team: ['AI engineer', 'Backend engineer'],
    features: [
      { id: 'agents', label: 'Autonomous agents', hint: 'Lead handling and coordination', weeks: [3, 6] },
      { id: 'llm', label: 'LLM document automation', hint: 'Data entry and document handling', weeks: [2, 5] },
      { id: 'voice', label: 'AI voice agents', hint: 'Voice-driven customer flows', weeks: [4, 8] },
      { id: 'stack', label: 'Embed AI in my SaaS', hint: 'Plug into an existing product', weeks: [2, 4] },
    ],
  },
  {
    id: 'software',
    label: 'Software and cloud',
    tagline: 'Web, mobile, backend and infra',
    team: ['Full-stack engineer', 'Backend engineer', 'DevOps engineer'],
    features: [
      { id: 'fullstack', label: 'Web or mobile app', hint: 'Full-stack product build', weeks: [6, 14] },
      { id: 'backend', label: 'Backend and APIs', hint: 'Secure, high-uptime services', weeks: [3, 8] },
      { id: 'cloud', label: 'Cloud infrastructure', hint: 'AWS or Azure, zero-trust setup', weeks: [2, 5] },
      { id: 'migration', label: 'Legacy migration', hint: 'Monolith to distributed system', weeks: [6, 16] },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing and SEO',
    tagline: 'Search, ads and funnels',
    team: ['Growth strategist', 'Frontend engineer'],
    features: [
      { id: 'ads', label: 'Performance ads', hint: 'Google and Meta campaigns', weeks: [2, 4] },
      { id: 'seo', label: 'Technical SEO', hint: 'Crawl, speed and structure fixes', weeks: [3, 6] },
      { id: 'crm', label: 'CRM automation', hint: 'Lead nurturing engines', weeks: [3, 6] },
      { id: 'funnel', label: 'Funnel optimisation', hint: 'High-conversion landing pages', weeks: [2, 5] },
    ],
  },
]

export const STAGES: { id: StageId; label: string; hint: string; factor: number }[] = [
  { id: 'idea', label: 'Just an idea', hint: 'Nothing built yet', factor: 1 },
  { id: 'existing', label: 'Something exists', hint: 'We extend or improve it', factor: 0.85 },
  { id: 'legacy', label: 'Legacy system', hint: 'Old code that needs untangling', factor: 1.3 },
]

export const TIMELINES: { id: TimelineId; label: string; hint: string; maxWeeks: number }[] = [
  { id: 'rush', label: 'Within 4 weeks', hint: 'As fast as it can responsibly go', maxWeeks: 4 },
  { id: 'standard', label: 'Within 3 months', hint: 'A normal delivery cycle', maxWeeks: 13 },
  { id: 'flexible', label: 'No fixed date', hint: 'Quality over speed', maxWeeks: Infinity },
]

export interface Selection {
  service: ServiceId
  features: string[]
  stage: StageId
  timeline: TimelineId
}

export interface Estimate {
  weeks: [number, number]
  tier: 'Starter' | 'Standard' | 'Complex'
  team: string[]
  tightTimeline: boolean
}

export function getService(id: ServiceId): Service {
  return SERVICES.find((s) => s.id === id)!
}

export function estimate(sel: Selection): Estimate | null {
  const service = getService(sel.service)
  const picked = service.features.filter((f) => sel.features.includes(f.id))
  if (picked.length === 0) return null

  const stage = STAGES.find((s) => s.id === sel.stage)!
  const timeline = TIMELINES.find((t) => t.id === sel.timeline)!

  // Features overlap in practice, so each extra one adds 70% of its time
  const sum = (i: 0 | 1) =>
    picked
      .map((f) => f.weeks[i])
      .sort((a, b) => b - a)
      .reduce((total, w, n) => total + (n === 0 ? w : w * 0.7), 0)

  const min = Math.max(1, Math.round(sum(0) * stage.factor))
  const max = Math.max(min + 1, Math.round(sum(1) * stage.factor))
  const mid = (min + max) / 2

  return {
    weeks: [min, max],
    tier: mid <= 6 ? 'Starter' : mid <= 14 ? 'Standard' : 'Complex',
    team: service.team,
    tightTimeline: min > timeline.maxWeeks,
  }
}

export interface Contact {
  name: string
  email: string
  company: string
}

export function buildBrief(sel: Selection, contact: Contact): string {
  const service = getService(sel.service)
  const est = estimate(sel)
  const features = service.features
    .filter((f) => sel.features.includes(f.id))
    .map((f) => f.label)
  const stage = STAGES.find((s) => s.id === sel.stage)!
  const timeline = TIMELINES.find((t) => t.id === sel.timeline)!

  return [
    `Project blueprint for ${contact.company.trim() || contact.name.trim() || 'a new project'}`,
    `Service: ${service.label}`,
    `Scope: ${features.join(', ')}`,
    `Starting point: ${stage.label}`,
    `Target: ${timeline.label}`,
    est ? `Indicative effort: ${est.weeks[0]} to ${est.weeks[1]} weeks (${est.tier})` : '',
    est ? `Suggested team: ${est.team.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export function validateContact(c: Contact): Partial<Record<keyof Contact, string>> {
  const errors: Partial<Record<keyof Contact, string>> = {}
  if (c.name.trim().length < 2) errors.name = 'Enter your name'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim())) errors.email = 'Enter a valid email'
  return errors
}
