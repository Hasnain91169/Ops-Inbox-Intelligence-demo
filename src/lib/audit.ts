import { sha256Hex } from './hash'

export function buildAuditEvent(params: {
  idx: number
  email_id: string
  received_ts: string
  subject: string
  extracted_entities: any
  classification: { category: string; confidence: number }
  sentiment: { label: string; urgency_score: number }
  rules_applied: string[]
  route_outcome: string
  automation_allowed: boolean
  escalated_to: string | null
  customer_response: string
  internal_summary: string
}) {
  const now = new Date().toISOString()
  const datePart = now.slice(0, 10)
  const audit_event_id = `INBOX-${datePart}-${String(params.idx).padStart(3, '0')}`

  const event = {
    audit_event_id,
    timestamp: now,
    email_id: params.email_id,
    received_ts: params.received_ts,
    subject: params.subject,
    extracted_entities: params.extracted_entities,
    classification: params.classification,
    sentiment: params.sentiment,
    rules_applied: params.rules_applied,
    route_outcome: params.route_outcome,
    automation_allowed: params.automation_allowed,
    escalated_to: params.escalated_to,
    outputs: {
      customer_response_hash: sha256Hex(params.customer_response),
      internal_summary_hash: sha256Hex(params.internal_summary)
    },
    logged_by: 'DemoSystem.InboxAI'
  }

  return event
}
