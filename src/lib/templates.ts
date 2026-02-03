import { COMPLIANCE } from '@/data/compliance'
import { Extracted } from './extract'

export function generateTemplates(params: {
  category: string
  route_outcome: 'auto_reply' | 'draft_for_approval' | 'escalate'
  extracted: Extracted
}) {
  const { category, route_outcome, extracted } = params
  let customer_response = ''
  let internal_summary = ''

  // Helper to mark AUTO / DRAFT
  const label = route_outcome === 'auto_reply' ? 'AUTO' : 'DRAFT'

  if (category === 'exception') {
    // Special case for customs hold with HS code
    if (extracted.missing_field === 'HS code' || extracted.matched_strings.some(s => /shipment\s*55321/.test(s) || /55321/.test(s))) {
      customer_response = `${label}: We are investigating the customs hold due to missing HS code. Our team will update you within 4 hours with the HS code required and next steps.`
      internal_summary = `Customs hold reported; missing HS code detected. Recommended HS code: ${COMPLIANCE.hs_codes.pharmaceuticals}. Risk: potential demurrage. Notify Finance for potential costs and Compliance Officer to clear.`
    } else if (extracted.keyword_hits.includes('temperature excursion') || extracted.keyword_hits.includes('pharmaceuticals')) {
      customer_response = `${label}: We have flagged a temperature excursion and our operations team is investigating. We will provide next steps within 2 hours.`
      internal_summary = `Temperature excursion reported (truck ${extracted.truck_id}). Initiate containment checks, quarantine if required, and notify Ops Lead.`
    } else {
      customer_response = `${label}: We have received your exception report and will investigate with urgency.`
      internal_summary = `Exception received; investigate and escalate as per policy.`
    }
  } else if (category === 'billing') {
    customer_response = `${label}: Thank you; we are reviewing the invoice discrepancy and will revert with corrections or credit note.`
    internal_summary = `Invoice discrepancy detected; billed ${extracted.amount_gbp ?? 'N/A'} GBP vs expected. Recommend Finance review and prepare action.`
  } else if (category === 'booking') {
    customer_response = `${label}: Booking request received for ${extracted.date ?? 'requested date'}. We will confirm space, rate, and documentation.`
    internal_summary = `Booking requested; origin/destination to be confirmed. Confirm availability for date ${extracted.date ?? 'N/A'}.`
  } else if (category === 'tracking') {
    customer_response = `${label}: Thank you for your enquiry. We are checking status and will send an ETA as soon as possible.`
    internal_summary = `Tracking enquiry; action: check container ${extracted.container ?? 'N/A'} and provide ETA.`
  } else {
    customer_response = `${label}: Thank you. We have received the enquiry and will investigate.`
    internal_summary = `Unknown category; manual triage required.`
  }

  return { customer_response, internal_summary }
}
