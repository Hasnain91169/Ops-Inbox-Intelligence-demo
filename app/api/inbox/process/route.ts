import { NextResponse } from 'next/server'
import { INBOX } from '@/data/inbox'
import { SHIPMENTS } from '@/data/shipments'
import { ORDERS } from '@/data/orders'
import { INVOICES } from '@/data/invoices'
import { extractEntities } from '@/lib/extract'
import { classify, computeUrgency, routingDecision } from '@/lib/classify'
import { generateTemplates } from '@/lib/templates'
import { buildAuditEvent } from '@/lib/audit'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const mode = body.mode || 'all'

  const targetIds: string[] = []
  if (mode === 'single' && body.email_id) {
    targetIds.push(body.email_id)
  } else {
    for (const e of INBOX) targetIds.push(e.email_id)
  }

  const results: any[] = []
  let idx = 1
  for (const eid of targetIds) {
    const email = INBOX.find(e => e.email_id === eid)
    if (!email) continue

    const extracted = extractEntities({ subject: email.subject, body: email.body })
    const classification = classify({ subject: email.subject, body: email.body }, extracted)
    const urgency = computeUrgency({ subject: email.subject, body: email.body }, extracted)
    const routing = routingDecision(classification, urgency.urgency_score, urgency.sentiment, extracted)

    const templates = generateTemplates({ category: classification.category, route_outcome: routing.route_outcome, extracted })

    // Reasoning log
    const reasoning_log = {
      extracted_entities: extracted,
      matched_keywords: classification.matched_keywords,
      urgency: urgency,
      routing_decision: routing
    }

    const rules_applied: string[] = []
    rules_applied.push(`classification:${classification.category}`)
    rules_applied.push(`routing:${routing.route_outcome}`)

    const audit_event = buildAuditEvent({
      idx,
      email_id: email.email_id,
      received_ts: email.received_ts,
      subject: email.subject,
      extracted_entities: extracted,
      classification: { category: classification.category, confidence: classification.confidence },
      sentiment: { label: urgency.sentiment, urgency_score: urgency.urgency_score },
      rules_applied,
      route_outcome: routing.route_outcome,
      automation_allowed: routing.automation_allowed,
      escalated_to: routing.escalated_to,
      customer_response: templates.customer_response,
      internal_summary: templates.internal_summary
    })

    results.push({
      email_id: email.email_id,
      category: classification.category,
      confidence: classification.confidence,
      sentiment: urgency.sentiment,
      urgency_score: urgency.urgency_score,
      route_outcome: routing.route_outcome,
      customer_response: templates.customer_response,
      internal_summary: templates.internal_summary,
      reasoning_log,
      audit_event
    })

    idx += 1
  }

  return NextResponse.json({ results })
}
