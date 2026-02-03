'use client'

import React, { useEffect, useState } from 'react'
import { INBOX, type Email } from '@/data/inbox'

type Result = {
  email_id: string
  category: string
  confidence: number
  sentiment: string
  urgency_score: number
  route_outcome: string
  customer_response: string
  internal_summary: string
  reasoning_log: any
  audit_event: any
}

export default function InboxDemoPage() {
  const [selected, setSelected] = useState<string | null>(INBOX[0]?.email_id ?? null)
  const [results, setResults] = useState<Record<string, Result | null>>({})
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    // initialize empty results
    const map: Record<string, Result | null> = {}
    for (const e of INBOX) map[e.email_id] = null
    setResults(map)
  }, [])

  function resetAll() {
    const map: Record<string, Result | null> = {}
    for (const e of INBOX) map[e.email_id] = null
    setResults(map)
  }

  async function processAll() {
    setProcessing(true)
    const res = await fetch('/api/inbox/process', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'all' }) })
    const data = await res.json()
    const map: Record<string, Result> = {}
    for (const r of data.results) {
      map[r.email_id] = r
    }
    setResults(prev => ({ ...prev, ...map }))
    setProcessing(false)
  }

  function badgeStyle(color: string) {
    return { padding: '4px 8px', borderRadius: 6, fontSize: 12, background: color, color: '#fff' }
  }

  const selectedResult = selected ? (results[selected] as Result | null) : null
  const selectedEmail = INBOX.find(e => e.email_id === selected) || INBOX[0]

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ width: 360 }}>
        <h2>Inbox</h2>
        <div style={{ marginBottom: 10 }}>
          <button onClick={processAll} disabled={processing} style={{ marginRight: 8 }}>
            {processing ? 'Processing...' : 'Process All'}
          </button>
          <button onClick={resetAll}>Reset</button>
        </div>

        <div style={{ border: '1px solid #eee', borderRadius: 6, padding: 8 }}>
          {INBOX.map(email => {
            const r = results[email.email_id]
            return (
              <div key={email.email_id} onClick={() => setSelected(email.email_id)} style={{ padding: 8, borderBottom: '1px solid #f5f5f5', cursor: 'pointer', background: email.email_id === selected ? '#fafafa' : 'transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{email.subject}</strong>
                    <div style={{ fontSize: 12, color: '#666' }}>{email.from} • {new Date(email.received_ts).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <div style={badgeStyle(r ? (r.category === 'exception' ? '#d9534f' : r.category === 'billing' ? '#f0ad4e' : r.category === 'booking' ? '#5bc0de' : '#5cb85c') : '#bbb')}>{r ? r.category : '—'}</div>
                    <div style={badgeStyle(r ? (r.urgency_score >= 80 ? '#b52d2d' : r.urgency_score >= 50 ? '#c76a00' : '#6c757d') : '#bbb')}>{r ? r.urgency_score : '—'}</div>
                    <div style={badgeStyle(r ? (r.route_outcome === 'escalate' ? '#6610f2' : r.route_outcome === 'auto_reply' ? '#20c997' : '#17a2b8') : '#bbb')}>{r ? r.route_outcome : '—'}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h2>Message</h2>
        <div style={{ border: '1px solid #eee', borderRadius: 6, padding: 12 }}>
          <h3>{selectedEmail.subject}</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{selectedEmail.body}</pre>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div style={{ flex: 1, border: '1px solid #eee', borderRadius: 6, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Customer Response</strong>
              <div>
                <button onClick={() => { if (selectedResult) navigator.clipboard.writeText(selectedResult.customer_response) }} disabled={!selectedResult}>Copy</button>
              </div>
            </div>
            <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{selectedResult ? selectedResult.customer_response : 'Not processed'}</div>
          </div>

          <div style={{ flex: 1, border: '1px solid #eee', borderRadius: 6, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Internal Summary</strong>
              <div>
                <button onClick={() => { if (selectedResult) navigator.clipboard.writeText(selectedResult.internal_summary) }} disabled={!selectedResult}>Copy</button>
              </div>
            </div>
            <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{selectedResult ? selectedResult.internal_summary : 'Not processed'}</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <details>
            <summary><strong>Audit Trail</strong></summary>
            {selectedResult ? (
              <div style={{ padding: 8 }}>
                <h4>Extraction</h4>
                <pre>{JSON.stringify(selectedResult.reasoning_log.extracted_entities, null, 2)}</pre>
                <h4>Classification</h4>
                <pre>{JSON.stringify({ category: selectedResult.category, confidence: selectedResult.confidence, matched_keywords: selectedResult.reasoning_log.matched_keywords }, null, 2)}</pre>
                <h4>Routing</h4>
                <pre>{JSON.stringify(selectedResult.reasoning_log.routing_decision, null, 2)}</pre>
                <h4>Outputs (Hashes)</h4>
                <pre>{JSON.stringify(selectedResult.audit_event.outputs, null, 2)}</pre>
                <h4>Full Audit Event</h4>
                <pre>{JSON.stringify(selectedResult.audit_event, null, 2)}</pre>
              </div>
            ) : (
              <div style={{ padding: 8 }}>Not processed yet.</div>
            )}
          </details>
        </div>
      </div>
    </div>
  )
}
