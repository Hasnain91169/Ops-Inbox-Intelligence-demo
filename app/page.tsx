import Link from 'next/link'
import React from 'react'

export default function HomePage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1>Demo Workspace</h1>
      <p>Welcome to the Ops Inbox AI demo repository.</p>
      <ul>
        <li>
          <Link href="/ops-inbox-demo">Open Ops Inbox Console (Demo 2)</Link>
        </li>
      </ul>
    </div>
  )
}
