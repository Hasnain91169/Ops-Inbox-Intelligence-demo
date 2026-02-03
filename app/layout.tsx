import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Demo 2 - Ops Inbox AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', padding: 20 }}>
          {children}
        </main>
      </body>
    </html>
  )
}
