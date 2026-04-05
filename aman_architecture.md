# AMAN — Counselor Session Logging & Invoicing System
### Technical Architecture & Developer Handover Document
*Version 1.0 | April 2026*

---

## 1. Project Overview

Aman is a lightweight, single-counselor practice management tool built to streamline session logging, clinical note-taking, and monthly invoicing. It is not a bloated EHR — it is purpose-built for a solo counselor who wants to spend less time on admin and more time with clients.

| Field | Detail |
|---|---|
| **Product Name** | Aman |
| **Primary User** | Single counsellor (no multi-user support required) |
| **Invoicing Cycle** | Monthly — batch invoices sent by email from within the system |
| **Stack** | Next.js 14 · Neon (PostgreSQL) · Resend · Razorpay · Claude AI API |
| **Hosting** | Vercel (frontend + API routes) · Neon (serverless Postgres) |

---

## 2. Core Goals

- Log sessions immediately after they happen, with structured SOAP notes
- Generate and email monthly invoices to clients — no manual spreadsheet work
- Track outstanding payments and flag overdue invoices
- Give clients a read-only portal to view invoice history and payment status
- Surface client progress trends over time *(Phase 2)*
- Add AI-assisted note drafting to reduce documentation time *(Phase 2)*
- Integrate a calendar view for scheduling and session planning *(Phase 3)*

---

## 3. System Architecture

### 3.1 High-Level Diagram

Aman follows a monolithic Next.js architecture — frontend, API routes, and background jobs all within one Vercel deployment. This keeps the system simple, cheap, and fast to iterate on.

```
┌──────────────────────────────────────────────────────┐
│            AMAN — Next.js 14 App (Vercel)            │
│  ┌────────────────┐  ┌──────────────────────────┐   │
│  │  React / UI    │  │  /api/* Route Handlers   │   │
│  │  (shadcn/ui)   │  │  (sessions, invoices,    │   │
│  │                │  │   clients, notes)        │   │
│  └────────────────┘  └──────────────────────────┘   │
└────────────────────────────┬─────────────────────────┘
                             │
      ┌──────────────────────┼──────────────────────┐
      ▼                      ▼                      ▼
┌──────────┐        ┌──────────────┐      ┌──────────────┐
│   Neon   │        │    Resend    │      │   Razorpay   │
│ Postgres │        │ (email +     │      │ (payment     │
│          │        │  invoice PDF)│      │  gateway)    │
└──────────┘        └──────────────┘      └──────────────┘
                                                │ Phase 2
                                     ┌──────────────────┐
                                     │  Anthropic API   │
                                     │  (AI SOAP notes) │
                                     └──────────────────┘
```

### 3.2 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Full-stack React, file-based routing, co-located API |
| UI Components | shadcn/ui + Tailwind CSS | Accessible, unstyled-first, fast to build |
| Database | Neon (serverless PostgreSQL) | Scales to zero, pay-per-use, excellent Vercel integration |
| ORM | Drizzle ORM | Type-safe, lightweight, works natively with Neon |
| Auth | NextAuth.js (Credentials) | Simple email/password for single counselor login |
| Email & PDFs | Resend + React Email | Reliable transactional email; React-based invoice templates |
| Payments | Razorpay | India-first, UPI support, easy integration |
| AI Notes | Anthropic Claude API | SOAP note drafting from session summary *(Phase 2)* |
| Hosting | Vercel | Zero-config Next.js deployment, serverless functions |
| File Storage | Vercel Blob | Invoice PDF storage (small volume, no separate bucket needed) |

---

## 4. Database Schema

All tables use UUID primary keys and include `created_at` / `updated_at` timestamps. There is no multi-counselor support — counselor identity is handled via the single authenticated session.

### 4.1 `clients`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `name` | TEXT NOT NULL | Full name |
| `email` | TEXT | For invoice emails |
| `phone` | TEXT | WhatsApp/SMS *(Phase 2)* |
| `date_of_birth` | DATE | Optional |
| `default_fee` | NUMERIC(10,2) | Default session fee in INR |
| `fee_type` | TEXT | `hourly \| per_session \| package \| sliding_scale` |
| `tags` | TEXT[] | e.g. `['anxiety','cbt','teenager']` |
| `is_active` | BOOLEAN | Default `true`; soft-delete via `false` |
| `intake_notes` | TEXT | Private counselor notes — not on client portal |
| `created_at` | TIMESTAMPTZ | Auto-set |

### 4.2 `sessions`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `client_id` | UUID FK | References `clients(id)` |
| `scheduled_at` | TIMESTAMPTZ | Session date + time |
| `duration_min` | INTEGER | Default `60` |
| `session_type` | TEXT | `individual \| couples \| group \| intake \| followup` |
| `status` | TEXT | `scheduled \| completed \| no_show \| cancelled \| rescheduled` |
| `cancellation_reason` | TEXT | Required when status is `cancelled` or `no_show` |
| `cancellation_fee` | NUMERIC(10,2) | Fee charged despite cancellation |
| `modality` | TEXT | `in_person \| video \| phone` |
| `fee_charged` | NUMERIC(10,2) | Actual fee — may differ from client default |
| `fee_override` | BOOLEAN | `true` if fee differs from client default |
| `invoice_id` | UUID FK NULL | Set once billed; `NULL` = unbilled |
| `created_at` | TIMESTAMPTZ | |

### 4.3 `session_notes` (SOAP)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `session_id` | UUID FK UNIQUE | One note per session |
| `subjective` | TEXT | S: Client's reported feelings / complaints |
| `objective` | TEXT | O: Counselor's observations |
| `assessment` | TEXT | A: Clinical interpretation, patterns |
| `plan` | TEXT | P: Next steps, homework, goals |
| `mood_score` | INTEGER | 1–10 client self-reported mood *(Phase 2)* |
| `goal_progress` | TEXT | Free text on progress toward treatment goals |
| `risk_flag` | TEXT | `none \| low \| medium \| high` — surfaces on dashboard |
| `note_type` | TEXT | `SOAP` (default) \| `DAP \| BIRP \| free` |
| `ai_drafted` | BOOLEAN | `true` if AI generated the draft *(Phase 2)* |
| `completed_at` | TIMESTAMPTZ | `NULL` = draft in progress |
| `created_at` | TIMESTAMPTZ | |

### 4.4 `invoices`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `client_id` | UUID FK | References `clients(id)` |
| `invoice_number` | TEXT UNIQUE | `INV-2026-0001` — auto-generated |
| `billing_month` | DATE | First day of billed month e.g. `2026-04-01` |
| `issued_date` | DATE | Default `CURRENT_DATE` |
| `due_date` | DATE | Typically `issued_date + 7` days |
| `subtotal` | NUMERIC(10,2) | Sum of line items |
| `discount` | NUMERIC(10,2) | Default `0` |
| `tax_amount` | NUMERIC(10,2) | Default `0` |
| `total` | NUMERIC(10,2) | `subtotal - discount` |
| `amount_paid` | NUMERIC(10,2) | Running total from payments; auto-updated by trigger |
| `status` | TEXT | `draft \| sent \| paid \| partial \| overdue \| void` |
| `sent_at` | TIMESTAMPTZ | When emailed to client |
| `pdf_url` | TEXT | Stored invoice PDF URL |
| `payment_link` | TEXT | Razorpay payment link *(Phase 2)* |
| `notes` | TEXT | Optional counselor note on invoice |
| `created_at` | TIMESTAMPTZ | |

### 4.5 `invoice_line_items`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `invoice_id` | UUID FK | References `invoices(id)` |
| `session_id` | UUID FK NULL | References `sessions(id)` — `null` for manual items |
| `description` | TEXT | e.g. `'Session — 3 Apr 2026 (60 min, Video)'` |
| `quantity` | INTEGER | Default `1` |
| `unit_price` | NUMERIC(10,2) | Fee at time of billing |
| `amount` | NUMERIC(10,2) | `quantity × unit_price` |

### 4.6 `payments`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `invoice_id` | UUID FK | References `invoices(id)` |
| `amount` | NUMERIC(10,2) | Amount received |
| `payment_date` | DATE | |
| `method` | TEXT | `cash \| upi \| bank_transfer \| card \| online \| other` |
| `reference_id` | TEXT | UPI ref, cheque no., Razorpay ID |
| `notes` | TEXT | Optional |
| `created_at` | TIMESTAMPTZ | |

### 4.7 `portal_tokens` *(Phase 2)*

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `client_id` | UUID FK | References `clients(id)` |
| `token` | TEXT UNIQUE | Signed JWT or random 32-char token |
| `expires_at` | TIMESTAMPTZ | Default `now() + 30 days` |
| `is_active` | BOOLEAN | Default `true` |
| `created_at` | TIMESTAMPTZ | |

### 4.8 `audit_log`

Append-only. All CRUD operations on sessions, invoices, and payments write here via application middleware.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `table_name` | TEXT | `sessions \| invoices \| payments \| clients` |
| `record_id` | UUID | PK of the affected record |
| `action` | TEXT | `INSERT \| UPDATE \| DELETE` |
| `old_data` | JSONB | Previous state (`null` on INSERT) |
| `new_data` | JSONB | New state (`null` on DELETE) |
| `created_at` | TIMESTAMPTZ | When change occurred |

### 4.9 Database Helpers

The SQL schema file includes the following auto-generated triggers:

- **`set_updated_at()`** — fires `BEFORE UPDATE` on `clients`, `sessions`, `session_notes`, `invoices`
- **`update_invoice_amount_paid()`** — fires `AFTER INSERT` on `payments`; auto-recalculates `invoices.amount_paid` and updates status to `paid` or `partial`

And three useful views:

- **`v_unbilled_sessions`** — completed sessions with no `invoice_id`
- **`v_client_invoice_summary`** — billed, paid, and outstanding totals per client
- **`v_dashboard_stats`** — single-row aggregate: unbilled count, overdue count, outstanding amount, this month's revenue, upcoming sessions in 7 days, active risk flags

---

## 5. Feature List by Phase

### Phase 1 — Core MVP *(Weeks 1–5)*
*Goal: A working system the counselor can use daily. The loop: log session → write note → invoice → record payment.*

| # | Feature | Details |
|---|---|---|
| 1 | Auth | Single counselor login (email + password via NextAuth) |
| 2 | Client management | Add, edit, archive clients. Default fee, contact, tags |
| 3 | Session logging | Log date, duration, type, status, modality, fee |
| 4 | SOAP notes | Structured note per session. Blocks: S / O / A / P |
| 5 | Session status flow | `Scheduled → Completed / No-show / Cancelled` |
| 6 | Monthly invoice generation | Batch: pick month + client(s) → generate invoice from unbilled sessions |
| 7 | Invoice PDF | Branded PDF via React Email |
| 8 | Email invoice | Send PDF via Resend from within the system |
| 9 | Payment recording | Mark invoice paid/partial; record method + reference |
| 10 | Dashboard | Unbilled sessions, overdue invoices, monthly revenue, upcoming sessions |

### Phase 2 — Intelligence & Client Portal *(Weeks 6–10)*
*Goal: Reduce counselor effort on notes. Give clients a self-serve payment view.*

| # | Feature | Details |
|---|---|---|
| 9* | AI SOAP note drafting | Counselor types a quick session summary → Claude API generates full S/O/A/P draft. Counselor reviews and saves. |
| 11 | No-show / cancellation logging | Log reason, apply cancellation fee if applicable, flag on invoice |
| 17 | Progress tracking | Mood score (1–10) per session. Progress chart on client profile. Goal completion tracking. |
| 18 | Audit log | Every insert/update/delete on key tables logged with old + new state |
| CP | Client portal — payment view only | Token-based shareable link. Client sees: invoice list, status, amounts due. No session notes visible. |

### Phase 3 — Calendaring & Session Planning *(Weeks 11–14)*
*Goal: Replace any external calendar dependency. Plan sessions from within Aman.*

| # | Feature | Details |
|---|---|---|
| C1 | Calendar view | Monthly/weekly view of all sessions. Color-coded by status. |
| C2 | Session scheduling | Create upcoming sessions from the calendar. Recurring session support (weekly, fortnightly). |
| C3 | Upcoming sessions widget | Dashboard panel: next 7 days with quick-log action |
| C4 | Session reminders | Email reminders to clients 24h before via Resend |
| C5 | iCal export | Export as `.ics` for Google Calendar / Apple Calendar |

---

## 6. Key Workflows

### 6.1 End-of-Session Workflow

This is the most critical flow. It must feel frictionless.

| Step | Action | UI Trigger |
|---|---|---|
| 1 | Session status → Completed | Button on session card |
| 2 | SOAP note editor opens | Auto-prompt if no note exists |
| 3 | Counselor fills or AI-drafts note | Free type or 'Draft with AI' button *(Phase 2)* |
| 4 | Note saved | Session shows green ✓ badge |
| 5 | Session shows as 'Unbilled' | Orange badge until invoiced |
| 6 | At month end: batch invoice | Select month → select clients → generate all invoices |
| 7 | Review + send | Preview PDF → click Send → email goes via Resend |

> **Design rule:** A session cannot be marked "Completed" without a note. An unbilled completed session shows a persistent orange badge until invoiced.

### 6.2 Monthly Invoicing Workflow

1. Navigate to **Invoicing → New Batch Invoice**
2. Select billing month (defaults to previous month)
3. System shows all clients with unbilled completed sessions in that month
4. Counselor selects which clients to invoice (all or subset)
5. System generates draft invoices with line items per session
6. Counselor reviews each invoice; can add a manual line item or note
7. Click **Generate & Send All** — PDFs created, emails sent via Resend
8. Invoice status → `Sent`. Sessions linked to `invoice_id`.

### 6.3 Client Portal Access

1. Counselor generates a portal link for a client (**Settings → Client Portal**)
2. Link contains a signed token (JWT, 30-day expiry)
3. Client opens link in browser — no login required
4. Client sees: invoice list, status (Paid / Partial / Overdue), amounts, payment date
5. Client **cannot** see SOAP notes, session details, or other clients
6. *(Phase 2)* Razorpay payment button on overdue invoices

---

## 7. API Route Reference

All routes are Next.js App Router API routes under `/app/api/`. All endpoints require an authenticated session except `/api/portal/[token]`.

| Method | Route | Description |
|---|---|---|
| GET | `/api/clients` | List all active clients |
| POST | `/api/clients` | Create client |
| GET | `/api/clients/[id]` | Get client + sessions + invoice summary |
| PATCH | `/api/clients/[id]` | Update client |
| GET | `/api/sessions` | List sessions (filter by client, month, status) |
| POST | `/api/sessions` | Log a new session |
| PATCH | `/api/sessions/[id]` | Update session status, fee, modality |
| GET | `/api/sessions/[id]/note` | Get SOAP note for session |
| POST | `/api/sessions/[id]/note` | Create / update SOAP note |
| POST | `/api/notes/ai-draft` | Submit session summary → get AI SOAP draft *(Phase 2)* |
| GET | `/api/invoices` | List invoices (filter by month, status, client) |
| POST | `/api/invoices/batch` | Generate batch invoices for a month |
| GET | `/api/invoices/[id]` | Get invoice + line items + payments |
| POST | `/api/invoices/[id]/send` | Generate PDF + send email via Resend |
| PATCH | `/api/invoices/[id]` | Update status, notes, due date |
| POST | `/api/invoices/[id]/void` | Void an invoice |
| POST | `/api/payments` | Record a payment against an invoice |
| GET | `/api/dashboard` | Aggregated stats: revenue, unbilled, overdue |
| GET | `/api/portal/[token]` | **Public** — client portal data (token validation, no auth) |

---

## 8. Revised Project Plan

### Phase 1 — Core MVP

| Week | Deliverable | Key Tasks |
|---|---|---|
| Week 1 | Repo + infra setup | Next.js 14 scaffold, Neon DB provisioned, Drizzle schema, NextAuth configured, Vercel deploy pipeline |
| Week 2 | Clients + Sessions | Client CRUD UI, session logging form, session list with filters, status updates |
| Week 3 | SOAP Notes | Note editor (4-section form), note completion badge on sessions, draft save |
| Week 4 | Invoicing engine | Batch invoice generation, line item calculation, invoice review UI |
| Week 5 | PDF + Email + Payments | React Email invoice template, Resend integration, PDF generation, payment recording, dashboard stats |

### Phase 2 — Intelligence & Client Portal

| Week | Deliverable | Key Tasks |
|---|---|---|
| Week 6 | AI Note Drafting | Anthropic API integration, session summary input, draft review + edit flow |
| Week 7 | No-show & Cancellation | Status + reason logging, cancellation fee option, invoice line item for late cancel |
| Week 8 | Progress Tracking | Mood score field, mood chart on client profile, goal progress text, session history timeline |
| Week 9 | Client Portal | Token generation, public portal route, invoice list + status view (read-only) |
| Week 10 | Audit Log + Polish | Audit log middleware, log viewer UI, bug fixes, UX improvements |

### Phase 3 — Calendaring & Session Planning

| Week | Deliverable | Key Tasks |
|---|---|---|
| Week 11 | Calendar View | Monthly calendar UI, session blocks color-coded by status, click to view/edit |
| Week 12 | Session Scheduling | Create session from calendar, recurring session setup (weekly/fortnightly) |
| Week 13 | Upcoming Sessions Widget | Dashboard panel: next 7 days, quick-complete action, next session per client on profile |
| Week 14 | Reminders + iCal | 24h email reminders via Resend, iCal export endpoint |

---

## 9. Environment Variables

All secrets stored in Vercel environment variables. Never commit to repo.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random 32-char secret for NextAuth |
| `NEXTAUTH_URL` | App URL (e.g. `https://aman.yourdomain.com`) |
| `RESEND_API_KEY` | Resend API key for email |
| `EMAIL_FROM` | Sender email (e.g. `invoices@yourdomain.com`) |
| `RAZORPAY_KEY_ID` | Razorpay public key *(Phase 2)* |
| `RAZORPAY_KEY_SECRET` | Razorpay secret *(Phase 2)* |
| `ANTHROPIC_API_KEY` | Claude API key for AI note drafting *(Phase 2)* |
| `PORTAL_JWT_SECRET` | Secret for signing client portal tokens |

---

## 10. Recommended Folder Structure

```
aman/
├── app/
│   ├── (auth)/login/           # Login page
│   ├── (dashboard)/            # Protected layout
│   │   ├── page.tsx            # Dashboard
│   │   ├── clients/            # Client list + detail
│   │   ├── sessions/           # Session log + detail
│   │   ├── invoices/           # Invoice list + batch
│   │   └── settings/           # Counselor settings
│   ├── api/
│   │   ├── clients/
│   │   ├── sessions/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── dashboard/
│   │   └── portal/[token]/     # Public portal endpoint
│   └── portal/[token]/         # Public portal UI (no layout)
├── components/                 # Shared UI components
├── lib/
│   ├── db/                     # Drizzle schema + client
│   ├── email/                  # React Email templates
│   ├── pdf/                    # Invoice PDF generator
│   ├── ai/                     # Claude API wrapper (Phase 2)
│   └── utils/
├── .env.local
└── drizzle.config.ts
```

---

## 11. Design Principles

- **Speed over features** — ship Phase 1 in 5 weeks, get the counselor using it before building Phase 2
- **Session → Note → Invoice is the golden path** — every UI decision should make this loop faster
- **No-show and cancellations are first-class** — they affect billing and must be logged properly
- **Never delete data** — use soft deletes (`is_active = false`) and the audit log
- **Invoice emails go from the system** — use Resend with a verified custom domain for deliverability
- **Client portal is read-only, token-gated** — no auth system for clients needed
- **Monthly invoicing is the billing rhythm** — don't over-engineer per-session invoicing
- **Mobile-responsive from day one** — the counselor may log sessions from a phone

---

## 12. Open Questions for Counselor Before Dev Starts

| # | Question | Impacts |
|---|---|---|
| 1 | What should the invoice look like? Share a sample or reference. | React Email template design |
| 2 | Do you need GST on invoices? Are you GST registered? | Tax field in invoice schema |
| 3 | What is your cancellation policy? Full fee, half fee, or zero? | Cancellation fee logic in sessions |
| 4 | Do you want to email from your own domain (e.g. `invoices@yourname.com`)? | Resend domain setup |
| 5 | Should the client portal show session dates or just invoice amounts? | Client portal scope |
| 6 | Do you use Razorpay currently? Or should payment be UPI manual reference? | Phase 2 payment flow |
| 7 | Do you want session reminders to clients (Phase 3)? SMS or email? | Resend vs Twilio |

---

*— End of Document —*
