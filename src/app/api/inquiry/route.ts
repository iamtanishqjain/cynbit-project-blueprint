import { NextResponse } from 'next/server'
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
} from '@/lib/blueprint'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const sel = body.selection as Selection
  const contact: Contact = {
    name: String(body.contact?.name ?? ''),
    email: String(body.contact?.email ?? ''),
    company: String(body.contact?.company ?? ''),
  }

  const service = SERVICES.find((s) => s.id === sel?.service)
  const validFeatures =
    service &&
    Array.isArray(sel.features) &&
    sel.features.length > 0 &&
    sel.features.every((id) => getService(service.id).features.some((f) => f.id === id))
  const valid =
    validFeatures &&
    STAGES.some((s) => s.id === sel.stage) &&
    TIMELINES.some((t) => t.id === sel.timeline)

  if (!valid || Object.keys(validateContact(contact)).length > 0 || !estimate(sel)) {
    return NextResponse.json({ error: 'Invalid blueprint' }, { status: 422 })
  }

  const brief = buildBrief(sel, contact)

  // Prototype: forward to a webhook when configured, otherwise just log it.
  const hook = process.env.INQUIRY_WEBHOOK_URL
  if (hook) {
    await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact, brief }),
    }).catch(() => undefined)
  } else {
    console.log('[inquiry]', contact.email, '\n' + brief)
  }

  return NextResponse.json({ ok: true, brief })
}
