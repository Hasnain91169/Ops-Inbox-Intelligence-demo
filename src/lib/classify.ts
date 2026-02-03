import { extractEntities, Extracted } from './extract'
import { INVOICES } from '@/data/invoices'
import { COMPLIANCE } from '@/data/compliance'

export type ClassificationResult = {
  category: 'tracking' | 'exception' | 'booking' | 'billing' | 'unknown'
  confidence: number
  matched_keywords: string[]
}

const exception_keywords = ['customs hold', 'hold', 'missing hs code', 'temperature excursion', 'pharmaceuticals', 'urgent']
const booking_keywords = ['request booking', 'booking', '20 ft', 'lcl', 'fcl', 'from', 'to', 'dep']
const billing_keywords = ['invoice', 'discrepancy', 'overcharged', 'credit', '£', 'payment']
const tracking_keywords = ['eta', 'pod', 'update', 'where is', 'status', 'delay', 'late', 'expedite']

export function classify(email: { subject: string; body: string }, extracted?: Extracted): ClassificationResult {
  const text = `${email.subject} ${email.body}`.toLowerCase()
  const hits: string[] = []

  function collectIfMatches(list: string[]) {
    for (const kw of list) {
      if (text.includes(kw)) hits.push(kw)
    }
  }

  collectIfMatches(exception_keywords)
  collectIfMatches(booking_keywords)
  collectIfMatches(billing_keywords)
  collectIfMatches(tracking_keywords)

  // Determine category by priority
  let category: ClassificationResult['category'] = 'unknown'
  if (hits.some(h => exception_keywords.includes(h))) category = 'exception'
  else if (hits.some(h => booking_keywords.includes(h))) category = 'booking'
  else if (hits.some(h => billing_keywords.includes(h))) category = 'billing'
  else if (hits.some(h => tracking_keywords.includes(h))) category = 'tracking'

  // Confidence heuristic: proportion of matched keywords to category keywords
  let confidence = 0.5
  const categoryMap: Record<string, string[]> = {
    exception: exception_keywords,
    booking: booking_keywords,
    billing: billing_keywords,
    tracking: tracking_keywords,
    unknown: []
  }
  const catKeys = categoryMap[category]
  if (catKeys && catKeys.length > 0) {
    const matched = hits.filter(h => catKeys.includes(h)).length
    confidence = Math.min(0.95, 0.4 + matched / catKeys.length)
  }

  return { category, confidence, matched_keywords: hits }
}

export function computeUrgency(email: { subject: string; body: string }, extracted: Extracted) {
  let score = 10
  const text = `${email.subject} ${email.body}`.toLowerCase()
  if (text.includes('urgent')) score += 50
  if (text.includes('temperature excursion') || text.includes('pharmaceuticals')) score += 40
  if (text.includes('customs hold')) score += 30
  const negativeMarkers = ['complaining', 'unacceptable', 'late again', 'again', 'angry']
  for (const nm of negativeMarkers) if (text.includes(nm)) score += 20
  if (extracted.amount_gbp && extracted.amount_gbp > 100) score += 20
  if (text.includes('expedite')) score += 10
  if (score > 100) score = 100

  let sentiment: 'neutral' | 'negative' | 'urgent' = 'neutral'
  if (score >= 80) sentiment = 'urgent'
  else if (score >= 50) sentiment = 'negative'

  return { urgency_score: score, sentiment }
}

export function routingDecision(classification: ClassificationResult, urgency_score: number, sentimentLabel: string, extracted: Extracted) {
  // returns { route_outcome, escalated_to, automation_allowed }
  let route_outcome: 'auto_reply' | 'draft_for_approval' | 'escalate' = 'escalate'
  let escalated_to: string | null = null
  let automation_allowed = false

  if (classification.category === 'exception') {
    route_outcome = 'escalate'
    // decide escalation by content
    if (extracted.keyword_hits.includes('customs hold') || extracted.matched_strings.includes('shipment 55321')) {
      escalated_to = 'Compliance Officer'
    } else if (extracted.keyword_hits.includes('temperature excursion') || extracted.keyword_hits.includes('pharmaceuticals')) {
      escalated_to = 'Ops Lead'
    } else {
      escalated_to = 'Ops Lead'
    }
    automation_allowed = false
  } else if (classification.category === 'billing') {
    route_outcome = 'draft_for_approval'
    if ((extracted.amount_gbp && extracted.amount_gbp > 100) || extracted.missing_field) {
      route_outcome = 'escalate'
      escalated_to = 'Finance'
    }
  } else if (classification.category === 'booking') {
    route_outcome = 'draft_for_approval'
    // escalate for special handling
    if (extracted.keyword_hits.includes('pharmaceuticals') || extracted.keyword_hits.includes('cold chain') || extracted.keyword_hits.includes('hazmat')) {
      route_outcome = 'escalate'
      escalated_to = 'Ops Lead'
    }
  } else if (classification.category === 'tracking') {
    if (urgency_score < 60 && sentimentLabel !== 'negative') {
      route_outcome = 'auto_reply'
      automation_allowed = true
    } else {
      route_outcome = 'draft_for_approval'
      if (sentimentLabel === 'negative' || extracted.keyword_hits.includes('late again')) {
        route_outcome = 'escalate'
        escalated_to = 'Ops Manager'
      }
    }
  } else {
    route_outcome = 'escalate'
    escalated_to = 'Ops Manager'
  }

  return { route_outcome, escalated_to, automation_allowed }
}
