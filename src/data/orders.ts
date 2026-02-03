export type Order = {
  order_id: string
  customer?: string
  pod_available?: boolean
  pod_status?: string
}

export const ORDERS: Order[] = [
  {
    order_id: '60347',
    customer: 'Retailer A',
    pod_available: false,
    pod_status: 'not available'
  },
  {
    order_id: '45678',
    customer: 'Retailer B',
    pod_available: true,
    pod_status: 'POD scanned and available'
  }
]
