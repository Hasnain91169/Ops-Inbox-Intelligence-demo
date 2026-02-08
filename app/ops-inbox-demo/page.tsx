'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { INBOX } from '@/data/inbox'

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

type FilterMode = 'all' | 'processed' | 'pending'

export default function InboxDemoPage() {
  const [selected, setSelected] = useState<string | null>(INBOX[0]?.email_id ?? null)
  const [results, setResults] = useState<Record<string, Result | null>>({})
  const [processing, setProcessing] = useState(false)
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

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
    const res = await fetch('/api/inbox/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'all' }),
    })
    const data = await res.json()
    const map: Record<string, Result> = {}
    for (const r of data.results) {
      map[r.email_id] = r
    }
    setResults(prev => ({ ...prev, ...map }))
    setProcessing(false)
  }

  function formatDate(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return dateFormatter.format(date)
  }

  function categoryBadge(result: Result | null) {
    if (!result) return { label: 'pending', className: 'badge badge-muted' }
    const map: Record<string, string> = {
      exception: 'badge-category-exception',
      billing: 'badge-category-billing',
      booking: 'badge-category-booking',
      fulfillment: 'badge-category-fulfillment',
    }
    return { label: result.category, className: `badge ${map[result.category] ?? 'badge-muted'}` }
  }

  function urgencyBadge(result: Result | null) {
    if (!result) return { label: 'urg n/a', className: 'badge badge-muted' }
    if (result.urgency_score >= 80) return { label: `urg ${result.urgency_score}`, className: 'badge badge-urgency-high' }
    if (result.urgency_score >= 50) return { label: `urg ${result.urgency_score}`, className: 'badge badge-urgency-med' }
    return { label: `urg ${result.urgency_score}`, className: 'badge badge-urgency-low' }
  }

  function routeBadge(result: Result | null) {
    if (!result) return { label: 'route n/a', className: 'badge badge-muted' }
    const map: Record<string, string> = {
      escalate: 'badge-route-escalate',
      auto_reply: 'badge-route-auto_reply',
      backoffice: 'badge-route-backoffice',
      triage: 'badge-route-triage',
    }
    return { label: result.route_outcome, className: `badge ${map[result.route_outcome] ?? 'badge-muted'}` }
  }

  const processedCount = useMemo(() => Object.values(results).filter(Boolean).length, [results])
  const pendingCount = INBOX.length - processedCount

  const filteredInbox = useMemo(() => {
    const term = search.trim().toLowerCase()
    return INBOX.filter(email => {
      if (filterMode === 'processed' && !results[email.email_id]) return false
      if (filterMode === 'pending' && results[email.email_id]) return false
      if (!term) return true
      return (
        email.subject.toLowerCase().includes(term) ||
        email.from.toLowerCase().includes(term) ||
        email.body.toLowerCase().includes(term)
      )
    })
  }, [search, filterMode, results])

  const selectedResult = selected ? (results[selected] as Result | null) : null
  const selectedEmail = INBOX.find(e => e.email_id === selected) || INBOX[0]
  const statusText = processing ? 'Processing' : 'Ready'

  return (
    <div>
      <header className="page-header">
        <div>
          <div className="eyebrow">Ops Inbox AI</div>
          <h1 className="gradient-text">Ops Inbox Console</h1>
          <p className="lead">
            Review inbound operations requests, monitor AI routing, and surface
            response-ready drafts in one workspace.
          </p>
        </div>
        <div className="header-actions">
          <span className="pill">
            <span className={`status-dot ${processing ? 'is-active' : ''}`} />
            {statusText}
          </span>
          <div className="action-row">
            <button className="btn btn-primary" onClick={processAll} disabled={processing}>
              {processing ? 'Processing...' : 'Process All'}
            </button>
            <button className="btn btn-ghost" onClick={resetAll} disabled={processing}>
              Reset
            </button>
          </div>
        </div>
      </header>

      <section className="stat-strip">
        <div className="stat-chip">
          <div className="stat-label">Total Messages</div>
          <div className="stat-value">{INBOX.length}</div>
        </div>
        <div className="stat-chip">
          <div className="stat-label">Processed</div>
          <div className="stat-value">{processedCount}</div>
        </div>
        <div className="stat-chip">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{pendingCount}</div>
        </div>
        <div className="stat-chip">
          <div className="stat-label">Selected</div>
          <div className="stat-value">{selectedEmail?.email_id ?? '-'}</div>
        </div>
      </section>

      <div className="layout-grid">
        <aside className="panel inbox-panel">
          <div className="panel-header">
            <h2>Inbox</h2>
            <span className="pill">{filteredInbox.length} of {INBOX.length}</span>
          </div>

          <div className="filter-row">
            <input
              className="input"
              placeholder="Search subject, sender, or body"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="filter-tabs">
              <button
                className={`filter-pill ${filterMode === 'all' ? 'is-active' : ''}`}
                onClick={() => setFilterMode('all')}
                type="button"
              >
                All
              </button>
              <button
                className={`filter-pill ${filterMode === 'processed' ? 'is-active' : ''}`}
                onClick={() => setFilterMode('processed')}
                type="button"
              >
                Processed
              </button>
              <button
                className={`filter-pill ${filterMode === 'pending' ? 'is-active' : ''}`}
                onClick={() => setFilterMode('pending')}
                type="button"
              >
                Pending
              </button>
            </div>
          </div>

          <div className="inbox-list">
            {filteredInbox.length === 0 && (
              <div className="empty-card">No messages match this filter.</div>
            )}
            {filteredInbox.map(email => {
              const result = results[email.email_id]
              const category = categoryBadge(result)
              const urgency = urgencyBadge(result)
              const route = routeBadge(result)
              return (
                <button
                  key={email.email_id}
                  type="button"
                  className={`inbox-item ${email.email_id === selected ? 'is-active' : ''}`}
                  onClick={() => setSelected(email.email_id)}
                >
                  <div>
                    <div className="inbox-subject">{email.subject}</div>
                    <div className="inbox-meta">
                      {email.from} - {formatDate(email.received_ts)}
                    </div>
                  </div>
                  <div className="inbox-badges">
                    <span className={category.className}>{category.label}</span>
                    <span className={urgency.className}>{urgency.label}</span>
                    <span className={route.className}>{route.label}</span>
                  </div>
                </button>
              )}
            )}
          </div>
        </aside>

        <section className="panel content-panel">
          <div className="section-header">
            <div>
              <h2>Message</h2>
              <p className="muted">Selected message details with AI outputs.</p>
            </div>
            <div className="pill">{selectedEmail?.email_id ?? '-'}</div>
          </div>

          <div className="card">
            <div className="message-header">
              <h3>{selectedEmail.subject}</h3>
              <div className="message-from">
                {selectedEmail.from} - {formatDate(selectedEmail.received_ts)}
              </div>
            </div>
            <div className="message-body">{selectedEmail.body}</div>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Category</div>
              <div className="stat-value">{selectedResult ? selectedResult.category : 'Pending'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Urgency Score</div>
              <div className="stat-value">{selectedResult ? selectedResult.urgency_score : 'Pending'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Sentiment</div>
              <div className="stat-value">{selectedResult ? selectedResult.sentiment : 'Pending'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Route</div>
              <div className="stat-value">{selectedResult ? selectedResult.route_outcome : 'Pending'}</div>
            </div>
          </div>

          <div className="outputs-grid">
            <div className="card">
              <div className="card-header">
                <strong>Customer Response</strong>
                <div className="copy-actions">
                  <button
                    className="btn btn-small btn-ghost"
                    onClick={() => {
                      if (selectedResult) navigator.clipboard.writeText(selectedResult.customer_response)
                    }}
                    disabled={!selectedResult}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="copy-content">
                {selectedResult ? selectedResult.customer_response : 'Not processed'}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <strong>Internal Summary</strong>
                <div className="copy-actions">
                  <button
                    className="btn btn-small btn-ghost"
                    onClick={() => {
                      if (selectedResult) navigator.clipboard.writeText(selectedResult.internal_summary)
                    }}
                    disabled={!selectedResult}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="copy-content">
                {selectedResult ? selectedResult.internal_summary : 'Not processed'}
              </div>
            </div>
          </div>

          <details>
            <summary>Audit Trail</summary>
            {selectedResult ? (
              <div className="audit-block">
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
              <div className="audit-block">Not processed yet.</div>
            )}
          </details>
        </section>
      </div>
    </div>
  )
}

