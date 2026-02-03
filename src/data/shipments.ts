export type Shipment = {
  shipment_id: string
  origin?: string
  destination?: string
  cargo_type?: string
  status?: string
}

export const SHIPMENTS: Shipment[] = [
  {
    shipment_id: '78212',
    origin: 'London',
    destination: 'Hamburg',
    cargo_type: 'general',
    status: 'delivered'
  },
  {
    shipment_id: '55321',
    origin: 'Shanghai',
    destination: 'Los Angeles',
    cargo_type: 'general',
    status: 'held'
  }
]
