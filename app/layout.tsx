import './globals.css'
import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Demo 2 - Ops Inbox AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="site-topbar">
            <Link href="/" className="brand">
              <span className="brand-mark">AI</span>
              <span className="brand-text">Ops Intelligence</span>
            </Link>
            <nav className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/ops-inbox-demo">Demo 2</Link>
            </nav>
            <Link href="/ops-inbox-demo" className="nav-cta">
              Get Started
            </Link>
          </header>
          <main className="app">{children}</main>
        </div>
      </body>
    </html>
  )
}
