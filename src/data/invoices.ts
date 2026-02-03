export type Invoice = {
  shipment_id: string
  billed_amount_gbp: number
  expected_amount_gbp: number
}

export const INVOICES: Invoice[] = [
  {
    shipment_id: '78212',
    billed_amount_gbp: 1300,
    expected_amount_gbp: 1000
  }
]
