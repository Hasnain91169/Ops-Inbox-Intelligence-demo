# Demo 2 — Ops Inbox AI (Next.js + TypeScript)

This repository is a deterministic, self-contained demo converting the original CLI "Demo 2" into a Next.js App Router + TypeScript web demo.

Features
- App page: /ops-inbox-demo
- API: POST /api/inbox/process
- Deterministic extraction → classification → routing → templates → audit → hashing
- No external services, no LLMs, no secrets, no database

Quick start
1. npm install
2. npm run dev
3. Open http://localhost:3000/ops-inbox-demo

Acceptance checklist
- Shows 7 emails
- Process All populates badges and outputs
- Email #2 (Customs hold) is escalated to Compliance Officer with DRAFT and HS code 300290 suggested in internal summary

Code layout
- app/ — Next.js app pages and API routes
- src/data/ — demo data (inbox, shipments, orders, invoices, compliance)
- src/lib/ — deterministic logic modules (extract, classify, templates, audit, hash)

Notes
- All logic is deterministic and rule-based to match the requirements exactly.

