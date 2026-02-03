export interface Email {
  email_id: string;
  received_ts: string;
  from: string;
  subject: string;
  body: string;
}

export const INBOX: Email[] = [
  {
    email_id: 'e1',
    received_ts: '2026-01-30T09:12:00Z',
    from: 'ops@carrier.com',
    subject: 'Container ABC123 – ETA update?',
    body: `Hi team,

Can you confirm the ETA for container ABC123? The client is asking for an update and we need to notify customs if there are any delays.

Thanks,
Logistics`
  },
  {
    email_id: 'e2',
    received_ts: '2026-01-30T10:05:00Z',
    from: 'importer@example.com',
    subject: 'URGENT: Customs hold on 55321 due to missing HS code.',
    body: `URGENT

Customs have placed a hold on shipment 55321 due to missing HS code information. We need this resolved ASAP to avoid demurrage and further delays.

Please advise.
Customer Imports Team`
  },
  {
    email_id: 'e3',
    received_ts: '2026-01-28T14:20:00Z',
    from: 'booking@forwarder.com',
    subject: 'Request booking for 20 ft LCL from Shanghai to LA, dep 20 Feb.',
    body: `Hello,

We need a booking for a 20 ft LCL from Shanghai to Los Angeles, departing 20 Feb. Please confirm space and rate, and advise cut-off and documentation required.

Regards,
Booking Desk`
  },
  {
    email_id: 'e4',
    received_ts: '2026-01-26T08:45:00Z',
    from: 'accounting@client.com',
    subject: 'Invoice discrepancy for shipment 78212 – overcharged by £300.',
    body: `Good morning,

We've reviewed invoice for shipment 78212 and we have been overcharged by £300 compared to the expected amount. Please investigate and advise on credit or correction.

Thanks,
Client Accounting`
  },
  {
    email_id: 'e5',
    received_ts: '2026-01-31T01:15:00Z',
    from: 'alerts@refrigeration.com',
    subject: 'Temperature excursion alert: pharmaceuticals in truck 9918.',
    body: `Alert

Temperature excursion detected in truck 9918 carrying pharmaceuticals. Temperature logged above setpoint for 45 minutes. Please advise on containment and next steps.

Ops Team`
  },
  {
    email_id: 'e6',
    received_ts: '2026-01-29T11:00:00Z',
    from: 'sales@retailer.com',
    subject: 'Can we expedite order 60347? Customer complaining.',
    body: `Hi,

Customer is complaining about order 60347. Can we expedite shipment and provide an updated ETA? This is becoming an escalation.

Regards,
Account Manager`
  },
  {
    email_id: 'e7',
    received_ts: '2026-01-27T16:38:00Z',
    from: 'customer@shop.com',
    subject: 'Pls send POD for order #45678.',
    body: `Hello,

Please send the POD for order #45678 as the customer requires proof of delivery to close their case.

Thanks,
Customer Service`
  }
];

export const emails: Email[] = INBOX;
