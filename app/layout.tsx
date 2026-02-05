import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Demo 2 - Ops Inbox AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="app">{children}</main>
      </body>
    </html>
  )
}
