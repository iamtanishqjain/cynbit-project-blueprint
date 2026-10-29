'use client'

import { useState } from 'react'
import {
  SERVICES,
  STAGES,
  TIMELINES,
  buildBrief,
  estimate,
  getService,
  validateContact,
  type Contact,
  type Selection,
  type ServiceId,
} from '@/lib/blueprint'

const STEPS = ['Service', 'Scope', 'Context', 'Blueprint']

function Option({
  selected,
  onClick,
  title,
  hint,
}: {
  selected: boolean
  onClick: () => void
  title: string
  hint: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? 'border-teal-700 bg-teal-50 ring-2 ring-teal-700/30'
          : 'border-slate-200 bg-white hover:border-teal-600'
      }`}
    >
      <span className="block font-semibold text-slate-900">{title}</span>
      <span className="block text-sm text-slate-500">{hint}</span>
    </button>
  )
}

export default function BlueprintWizard() {
  const [step, setStep] = useState(0)
  const [sel, setSel] = useState<Selection>({
    service: 'ai',
    features: [],
    stage: 'idea',
    timeline: 'standard',
  })
  const [contact, setContact] = useState<Contact>({ name: '', email: '', company: '' })
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const service = getService(sel.service)
  const est = estimate(sel)
  const errors = validateContact(contact)

  const update = (patch: Partial<Selection>) => setSel((prev) => ({ ...prev, ...patch }))
  const pickService = (id: ServiceId) => update({ service: id, features: [] })
  const toggleFeature = (id: string) =>
    setSel((prev) => ({
      ...prev,
      features: prev.features.includes(id)
        ? prev.features.filter((f) => f !== id)
        : [...prev.features, id],
    }))

  const canNext = step === 1 ? sel.features.length > 0 : true

  async function send() {
    setTouched(true)
    if (Object.keys(errors).length > 0) return
    setStatus('sending')
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selection: sel, contact }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ol className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? 'step' : undefined}
            className={`flex-1 border-t-4 pt-2 ${
              i <= step ? 'border-teal-700 text-teal-800' : 'border-slate-200 text-slate-400'
            }`}
          >
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold">What do you want to build?</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {SERVICES.map((s) => (
              <Option
                key={s.id}
                selected={sel.service === s.id}
                onClick={() => pickService(s.id)}
                title={s.label}
                hint={s.tagline}
              />
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section>
          <h2 className="mb-1 text-2xl font-bold">What should it include?</h2>
          <p className="mb-4 text-slate-500">Pick everything that applies.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {service.features.map((f) => (
              <Option
                key={f.id}
                selected={sel.features.includes(f.id)}
                onClick={() => toggleFeature(f.id)}
                title={f.label}
                hint={f.hint}
              />
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <div>
            <h2 className="mb-3 text-2xl font-bold">Where are you starting from?</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {STAGES.map((s) => (
                <Option
                  key={s.id}
                  selected={sel.stage === s.id}
                  onClick={() => update({ stage: s.id })}
                  title={s.label}
                  hint={s.hint}
                />
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-2xl font-bold">When do you need it?</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {TIMELINES.map((t) => (
                <Option
                  key={t.id}
                  selected={sel.timeline === t.id}
                  onClick={() => update({ timeline: t.id })}
                  title={t.label}
                  hint={t.hint}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {step === 3 && est && status !== 'sent' && (
        <section className="space-y-6">
          <div className="rounded-2xl bg-teal-900 p-6 text-white">
            <p className="text-sm uppercase tracking-wide text-teal-200">Indicative effort</p>
            <p className="text-4xl font-bold">
              {est.weeks[0]} to {est.weeks[1]} weeks
            </p>
            <p className="mt-1 text-teal-100">
              {est.tier} project. Suggested team: {est.team.join(', ')}.
            </p>
            {est.tightTimeline && (
              <p className="mt-3 rounded-lg bg-amber-400/20 p-3 text-sm text-amber-100">
                This is longer than your target. We would discuss trimming scope or phasing it.
              </p>
            )}
          </div>
          <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            {buildBrief(sel, contact)}
          </pre>
          <div className="grid gap-4 sm:grid-cols-3">
            {(['name', 'email', 'company'] as const).map((key) => (
              <label key={key} className="block text-sm font-medium text-slate-700">
                {key === 'company' ? 'Company (optional)' : key[0].toUpperCase() + key.slice(1)}
                <input
                  value={contact[key]}
                  onChange={(e) => setContact({ ...contact, [key]: e.target.value })}
                  type={key === 'email' ? 'email' : 'text'}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {touched && errors[key] && (
                  <span role="alert" className="text-xs text-red-600">
                    {errors[key]}
                  </span>
                )}
              </label>
            ))}
          </div>
          {status === 'error' && (
            <p role="alert" className="text-sm text-red-600">
              Something went wrong. Please try again.
            </p>
          )}
          <button
            type="button"
            onClick={send}
            disabled={status === 'sending'}
            className="rounded-full bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-900 disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending...' : 'Send blueprint to Cynbit'}
          </button>
        </section>
      )}

      {status === 'sent' && (
        <section className="rounded-2xl bg-teal-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-teal-900">Blueprint received</h2>
          <p className="mt-2 text-slate-600">
            The team gets your scope and estimate, so the first call can skip the basics.
          </p>
        </section>
      )}

      {status !== 'sent' && (
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="rounded-full px-5 py-2 font-medium text-slate-600 disabled:invisible"
          >
            Back
          </button>
          {step < 3 && (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="rounded-full bg-teal-800 px-6 py-2 font-semibold text-white hover:bg-teal-900 disabled:opacity-40"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  )
}
