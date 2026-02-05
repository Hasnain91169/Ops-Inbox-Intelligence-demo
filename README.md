# Demo 2 — Ops Inbox AI (Next.js + TypeScript)

This repository is a deterministic, self-contained demo converting the original CLI "Demo 2" into a Next.js App Router + TypeScript web demo.

Features
- App page: /ops-inbox-demo
- API: POST /api/inbox/process
- Deterministic extraction → classification → routing → templates → audit → hashing
- Optional OpenAI enhancement (fallbacks to deterministic templates if not configured)

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
- All logic is deterministic and rule-based by default. If OPENAI_API_KEY is set,
  the demo will enrich responses using OpenAI with a strict timeout.

Optional OpenAI setup
1. Set OPENAI_API_KEY in your environment or Vercel project.
2. (Optional) Set OPENAI_MODEL (default gpt-4.1-mini).
3. (Optional) Set OPENAI_TIMEOUT_MS (default 3500).
4. (Optional) Set OPENAI_LLM_MODE=off to disable LLM.

