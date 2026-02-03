import { INBOX } from '@/data/inbox'
import { SHIPMENTS } from '@/data/shipments'

export type Extracted = {
  container?: string | null
  shipment_id?: string | null
  order_id?: string | null
  truck_id?: string | null
  date?: string | null
  amount_gbp?: number | null
  missing_field?: string | null
  keyword_hits: string[]
  matched_strings: string[]
}

const containerRegex = /[A-Z]{3}\d{3,}/g
const shipmentRegex = /shipment\s*(\d{5})|\b(\d{5})\b/gi
const orderRegex = /order\s*(\d{5})|#(\d{5})/gi
const truckRegex = /truck\s*(\d{1,6})/gi
const dateRegex = /\b(20\s?Feb(?:ruary)?|20\s?February)\b/gi
const moneyRegex = /£\s?([\d,]+(?:\.\d+)?)/g
const missingFieldRegex = /HS code/gi

export function extractEntities(email: { subject: string; body: string }) {
  const text = `${email.subject}\n${email.body}`
  const matched_strings: string[] = []
  const keyword_hits: string[] = []

  const containerMatch = text.match(containerRegex)
  const container = containerMatch ? containerMatch[0] : null
  if (container) matched_strings.push(container)

  let shipment_id: string | null = null
  let m: RegExpExecArray | null
  while ((m = shipmentRegex.exec(text)) !== null) {
    const id = m[1] || m[2]
    if (id) {
      shipment_id = id
      matched_strings.push(`shipment ${id}`)
      break
    }
  }

  let order_id: string | null = null
  while ((m = orderRegex.exec(text)) !== null) {
    const id = m[1] || m[2]
    if (id) {
      order_id = id
      matched_strings.push(`order ${id}`)
      break
    }
  }

  let truck_id: string | null = null
  while ((m = truckRegex.exec(text)) !== null) {
    const id = m[1]
    if (id) {
      truck_id = id
      matched_strings.push(`truck ${id}`)
      break
    }
  }

  let date: string | null = null
  const dateMatch = text.match(dateRegex)
  if (dateMatch) {
    date = dateMatch[0]
    matched_strings.push(date)
  }

  let amount_gbp: number | null = null
  while ((m = moneyRegex.exec(text)) !== null) {
    const raw = m[1].replace(/,/g, '')
    amount_gbp = parseFloat(raw)
    matched_strings.push(`£${raw}`)
    break
  }

  const missing_field = missingFieldRegex.test(text) ? 'HS code' : null
  if (missing_field) matched_strings.push('HS code')

  // keyword hits (simple checks)
  const keywords = ['customs hold', 'hold', 'missing hs code', 'temperature excursion', 'pharmaceuticals', 'urgent', 'request booking', 'booking', '20 ft', 'lcl', 'fcl', 'invoice', 'discrepancy', 'overcharged', '£', 'eta', 'pod', 'update', 'expedite', 'complaining']
  for (const kw of keywords) {
    if (text.toLowerCase().includes(kw)) {
      keyword_hits.push(kw)
    }
  }

  return {
    container,
    shipment_id,
    order_id,
    truck_id,
    date,
    amount_gbp,
    missing_field,
    keyword_hits,
    matched_strings
  } as Extracted
}
