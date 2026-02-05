import Link from 'next/link'
import React from 'react'

export default function HomePage() {
  return (
    <div className="home">
      <header className="home-hero">
        <div>
          <div className="eyebrow">Demo Workspace</div>
          <h1>Ops Inbox AI</h1>
          <p className="lead">
            A focused console for triaging operational emails with extraction,
            classification, and routing in one view.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="./ops-inbox-demo">
              Open Ops Inbox Console
            </Link>
            <span className="pill">Demo 2</span>
          </div>
        </div>
        <div className="hero-card">
          <h3>What you can do</h3>
          <p className="lead">
            Process every inbound message, inspect AI outputs, and keep an audit
            trail available for fast reviews.
          </p>
        </div>
      </header>

      <section className="feature-grid">
        <div className="feature-card">
          <div className="feature-title">Inbox triage</div>
          <p className="lead">
            Review each customer message and track classification, urgency, and
            routing outcomes at a glance.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-title">Customer-ready replies</div>
          <p className="lead">
            Copy responses generated for each request with clean summaries and
            supporting details.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-title">Audit transparency</div>
          <p className="lead">
            Expand the audit trail to see extracted entities, routing decisions,
            and hashed outputs.
          </p>
        </div>
      </section>
    </div>
  )
}
