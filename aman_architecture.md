# AMAN — Counselor Session Logging & Invoicing System
### Technical Architecture & Developer Handover Document
*Version 1.0 April 2026 · revised November 2026 to match the code*

---

## 1. Project Overview

Aman is a lightweight, single-counselor practice management tool built to streamline session logging, clinical note-taking, and monthly invoicing. It is not a bloated EHR — it is purpose-built for a solo counselor who wants to spend less time on admin and more time with clients.

| Field | Detail |
|---|---|
| **Product Name** | Deepen (formerly Aman) |
| **Architecture** | Multi-tenant SaaS (RLS isolated PostgreSQL) |
| **Primary User** | Independent therapists and solo counselors |
| **Invoicing Cycle** | Monthly — batch invoices sent by email from within the system |
| **Stack** | Next.js 16 · React 19 · Neon (PostgreSQL) · Gmail SMTP (Nodemailer) · Razorpay (Subscriptions & Connect) |
| **Hosting** | Vercel (frontend + API routes + Cron) · Neon (serverless Postgres) |

---

## 2. Core Goals

| Goal | Status |
|---|---|
| Log sessions immediately after they happen, with structured notes and outcome scores (ORS/SRS) | Built |
| Generate and email monthly invoices — no manual spreadsheet work | Built |
| Track outstanding payments and flag overdue invoices, with reminder emails | Built |
| Surface client progress trends over time (ORS/SRS charts, predicted progress) | Built |
| Let clients pay online, recorded automatically (Razorpay Connect) | Built, not yet live |
| Give clients a read-only portal to view invoice history and payment status | Not built |
| AI-assisted note drafting | Not built |
| Calendar view for scheduling | Not built |

---

## 3. System Architecture

### 3.1 High-Level Diagram

A monolithic Next.js app: UI, API routes and scheduled jobs all in one Vercel deployment.

```
┌──────────────────────────────────────────────────────┐
│         DEEPEN — Next.js 16 App (Vercel)             │
│  ┌────────────────┐  ┌──────────────────────────┐   │
│  │  React 19 UI   │  │  /api/* Route Handlers   │   │
│  │  (shadcn/ui)   │  │  + Vercel Cron           │   │
│  └────────────────┘  └──────────────────────────┘   │
└────────────────────────────┬─────────────────────────┘
                             │
      ┌──────────────────────┼──────────────────────┐
      ▼                      ▼                      ▼
┌──────────┐        ┌──────────────┐      ┌──────────────────────┐
│   Neon   │        │  Gmail SMTP  │      │       Razorpay       │
│ Postgres │        │ (Nodemailer) │      │ Subscriptions (ours) │
│  + RLS   │        │              │      │ Connect (counsellor) │
└──────────┘        └──────────────┘      └──────────────────────┘
```

### 3.2 Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 16 (App Router, Turbopack), React 19 | Read `node_modules/next/dist/docs/` before changing framework code; APIs differ from older versions |
| UI Components | shadcn/ui (Base UI) + Tailwind CSS v4 | Brand tokens (paper, ink, teal, terracotta) in `globals.css` |
| Database | Neon (serverless PostgreSQL) | One database for local, preview and production |
| ORM | Drizzle ORM | HTTP driver for simple queries, WebSocket pool for RLS transactions |
| Auth | NextAuth.js (Credentials) | Email + password per counsellor; session carries `tenantId` and `planTier` |
| Email | Nodemailer over Gmail SMTP | HTML templates built inline in the API routes. `resend` is installed but unused |
| PDFs | `jspdf` + `html-to-image` (client side) | Progress chart PDFs. Invoices are sent as HTML emails, not PDFs |
| Payments | Razorpay | Subscriptions bill counsellors for Deepen; Connect (OAuth) lets clients pay counsellors |
| Import | SheetJS (`xlsx`) | Client bulk import wizard |
| Hosting | Vercel | Cron in `vercel.json` |
| File storage | None | The UPI QR code is stored as a data URL in `practice_settings` |

---

## 4. Database Schema

All tables use UUID primary keys and include `created_at` / `updated_at` timestamps. The application is **multi-tenant**. Every domain table (except `users` and `tenants`) includes a `tenant_id` column. PostgreSQL Row Level Security (RLS) policies enforce strict data isolation between practices. The `tenant_id` context is injected into all database operations via the `withTenantContext` middleware using `set_config('app.current_tenant_id')`.

### 4.1 `clients`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `name` | TEXT NOT NULL | Full name |
| `email` | TEXT | For invoice emails |
| `phone` | TEXT | Contact number |
| `date_of_birth` | DATE | Optional |
| `default_fee` | NUMERIC(10,2) | Default session fee |
| `default_fee_scheme_id` | UUID FK | References `fee_schemes(id)` (`INR` or `USD`) |
| `fee_type` | TEXT | `hourly \| per_session \| package \| sliding_scale` |
| `timezone` | TEXT | Default `'Asia/Kolkata'` |
| `tags` | TEXT[] | e.g. `['anxiety','cbt','teenager']` |
| `is_active` | BOOLEAN | Default `true`; soft-delete via `false` |
| `intake_notes` | TEXT | Private counselor notes — not on client portal |
| `pool_consent` | TEXT | `yes \| no \| not_asked` (comparison pool intake consent) |
| `pool_consent_at` | TIMESTAMPTZ | Timestamp when consent was recorded |
| `pool_consent_method` | TEXT | `in_person \| paper \| message` |
| `termination_reason` | TEXT | Set when a client is terminated |
| `termination_type` | TEXT | `planned \| unplanned` |
| `terminated_at` | TIMESTAMPTZ | |
| `premature_termination_manual` | BOOLEAN | Counsellor's manual override of the premature-ending flag |
| `created_at`, `updated_at` | TIMESTAMPTZ | Auto-set |

### 4.2 `sessions`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `client_id` | UUID FK | References `clients(id)` |
| `scheduled_at` | TIMESTAMPTZ | Session date + time |
| `ended_at` | TIMESTAMPTZ | |
| `duration_min` | INTEGER | Default `60` |
| `actual_start_time` | TIMESTAMPTZ | Capture clock-in time |
| `actual_end_time` | TIMESTAMPTZ | Capture clock-out time |
| `invoiced_duration_min` | INTEGER | Billed minutes based on logic |
| `session_type` | TEXT | `individual \| couples \| group \| intake \| followup` |
| `status` | TEXT | `scheduled \| completed \| no_show \| cancelled \| rescheduled` |
| `cancellation_reason` | TEXT | Required when status is `cancelled` or `no_show` |
| `cancellation_fee` | NUMERIC(10,2) | Fee charged despite cancellation |
| `modality` | TEXT | `in_person \| video \| phone` |
| `fee_charged` | NUMERIC(10,2) | Actual fee — may differ from client default |
| `fee_override` | BOOLEAN | `true` if fee differs from client default |
| `fee_scheme_id` | UUID FK NULL | References `fee_schemes(id)` |
| `invoice_id` | UUID FK NULL | Set once billed; `NULL` = unbilled |
| `created_at` | TIMESTAMPTZ | |

### 4.3 `session_notes`

One note per session. The editor uses the custom fields below; the SOAP columns are kept for older notes.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `session_id` | UUID FK | One note per session |
| `updates` | TEXT | Updates (from last week) |
| `subjective` | TEXT | Shown as "Session Notes" in the editor |
| `client_actions` | TEXT | Client Actions |
| `my_actions` | TEXT | My Actions |
| `agenda` | TEXT | Next Session Agenda |
| `feedback` | TEXT | Feedback on Session |
| `objective`, `assessment`, `plan` | TEXT | Legacy SOAP fields |
| `ors_individual`, `ors_interpersonal`, `ors_social`, `ors_overall` | NUMERIC(5,1) | ORS dimensions, 0–10 each; `null` = not recorded |
| `ors_total` | NUMERIC(5,1) | 0–40 |
| `srs_relationship`, `srs_goals`, `srs_approach`, `srs_overall` | NUMERIC(5,1) | SRS dimensions, 0–10 each |
| `srs_total` | NUMERIC(5,1) | 0–40 |
| `ors_flag`, `srs_flag` | BOOLEAN | Set from the thresholds in `practice_settings` |
| `risk_flag` | TEXT | `none \| low \| medium \| high` |
| `mood_score` | INTEGER | Legacy |
| `goal_progress` | TEXT | |
| `note_type` | TEXT | |
| `ai_drafted` | BOOLEAN | Reserved for AI drafting (not built) |
| `completed_at` | TIMESTAMPTZ | `NULL` = draft |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

### 4.4 `invoices`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `client_id` | UUID FK | References `clients(id)` |
| `invoice_number` | TEXT | `INV-2026-0001` — auto-generated; unique per tenant |
| `billing_month` | DATE | First day of billed month e.g. `2026-04-01` |
| `issued_date` | DATE | Default `CURRENT_DATE` |
| `due_date` | DATE | `issued_date` + `practice_settings.invoice_due_days` (default 15) |
| `subtotal` | NUMERIC(10,2) | Sum of line items |
| `discount` | NUMERIC(10,2) | Default `0` |
| `tax_amount` | NUMERIC(10,2) | Default `0` |
| `total` | NUMERIC(10,2) | `subtotal - discount` |
| `amount_paid` | NUMERIC(10,2) | Running total of allocated payments; maintained by the app (`lib/record-payment.ts`, payment and receipt deletes) |
| `status` | TEXT | `draft \| sent \| paid \| partial \| overdue \| void` |
| `sent_at` | TIMESTAMPTZ | When emailed to client |
| `last_reminder_at` | TIMESTAMPTZ | Last overdue payment reminder email timestamp (7-day throttle) |
| `pdf_url` | TEXT | Unused (invoices are sent as HTML email) |
| `payment_link` | TEXT | Short URL of the open Razorpay payment link; `null` once the link is paid, cancelled or expired |
| `payment_link_id` | TEXT | Razorpay link id (`plink_…`), kept for history |
| `payment_link_amount` | NUMERIC(10,2) | Amount the link was made for; a stale link is replaced when this differs from what's owed |
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
| `receipt_id` | UUID FK | References `receipts(id)`; the payment event this allocation came from |
| `invoice_id` | UUID FK NULL | References `invoices(id)`; `null` = excess credit or refund |
| `client_id` | UUID FK | References `clients(id)` |
| `amount` | NUMERIC(10,2) | Amount allocated (negative for refunds) |
| `currency` | TEXT | `INR \| USD` |
| `payment_date` | DATE | |
| `method` | TEXT | `cash \| upi \| bank_transfer \| card \| online \| write_off \| credit \| refund \| other` (`write_off`, `credit`, `refund` are adjustments, excluded from received totals) |
| `reference_id` | TEXT | UPI ref, cheque no., Razorpay payment id |
| `notes` | TEXT | Optional |
| `created_at` | TIMESTAMPTZ | |

### 4.6b `receipts`

One row per payment event, numbered `RCP-<year>-<NNNN>` (client-facing). Its money is split across `payments` allocation rows. Deleting a receipt cascades its allocations and recalculates the invoices it touched.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `receipt_number` | TEXT | Unique per tenant |
| `client_id` | UUID FK | |
| `amount`, `currency` | NUMERIC(10,2), TEXT | |
| `payment_date` | DATE | |
| `method` | TEXT | Same values as `payments.method` |
| `reference_id`, `notes` | TEXT | |
| `provider_payment_id` | TEXT | Razorpay payment id for online payments; unique per tenant so a payment is never recorded twice |
| `sent_at` | TIMESTAMPTZ | When the receipt was emailed |
| `created_at` | TIMESTAMPTZ | |

### 4.6a `payment_connections`

A counsellor's own Razorpay account, connected by OAuth. One row per tenant and provider. RLS tenant isolation.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_id` | UUID FK | References `tenants(id)` |
| `provider` | TEXT | `razorpay` |
| `account_id` | TEXT | Razorpay account id (`acc_…`) |
| `mode` | TEXT | `test \| live` |
| `access_token_enc` / `refresh_token_enc` | TEXT | AES-256-GCM encrypted (`lib/secret-box.ts`) |
| `token_expires_at` | TIMESTAMPTZ | Refreshed when under 7 days remain |
| `status` | TEXT | `active \| revoked \| error` |
| `last_error` | TEXT | Shown in Settings when access is lost |
| `auto_send_receipts` | BOOLEAN | Default `true` |
| `connected_at`, `updated_at` | TIMESTAMPTZ | |

### 4.6c Other tables

| Table | Purpose |
|---|---|
| `tenants` | One per practice: name, slug, `plan_tier` (`deepen \| pro`), founding seat and price, Razorpay subscription id, `is_active`, `is_exempt`, terms acceptance |
| `users` | Counsellor logins (email, password hash), linked to a tenant |
| `fee_schemes` | Named fees per tenant with amount and currency (`INR \| USD`) |
| `practice_settings` | One per tenant: counsellor and practice details, UPI ID and QR, monthly quote, ORS/SRS thresholds, `invoice_due_days`, `email_override` (Test Mode), reminder settings |
| `promo_codes` | Founding/beta pricing codes, issued from `/admin` |

### 4.7 `portal_tokens` *(table exists; client portal not built)*

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `client_id` | UUID FK | References `clients(id)` |
| `token` | TEXT UNIQUE | Signed JWT or random 32-char token |
| `expires_at` | TIMESTAMPTZ | Default `now() + 30 days` |
| `is_active` | BOOLEAN | Default `true` |
| `created_at` | TIMESTAMPTZ | |

### 4.8 `audit_log`

The table exists, but nothing in the app writes to it yet.

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

`aman_schema.sql` (the original hand-written schema) defines a `set_updated_at()` trigger, an `update_invoice_amount_paid()` trigger on `payments`, and three views (`v_unbilled_sessions`, `v_client_invoice_summary`, `v_dashboard_stats`). The app does not rely on any of them: Drizzle (`src/lib/db/schema.ts`) is the source of truth, and the app sets `amount_paid` and `updated_at` itself. Whether these objects exist in the live database hasn't been checked. If the payment trigger exists it recalculates the same total, so it doesn't conflict.

**Row-level security.** Every tenant table has a `tenant_isolation_policy` for the `authenticated` role (`enable_rls.js`). `withTenantContext()` switches to that role and sets `app.current_tenant_id` for the transaction. Code that runs without a logged-in session (webhooks, cron) uses the HTTP driver with an explicit `tenant_id` filter instead.

---

## 5. Feature List by Phase

### Phase 1 — Core MVP

| # | Feature | Status |
|---|---|---|
| 1 | Auth (email + password via NextAuth), multi-tenant signup with Razorpay subscription | Done |
| 2 | Client management: add, edit, terminate, reactivate, duplicate detection, bulk import (up to 100) | Done |
| 3 | Session logging and scheduling, cancel/no-show with fee | Done |
| 4 | Session notes (custom fields) with ORS/SRS | Done |
| 5 | Monthly batch invoices, pro-rata billing, INR and USD | Done |
| 6 | Invoice email (HTML over Gmail SMTP), Test Mode | Done |
| 7 | Payments ledger: receipts, FIFO allocation, write-offs, credit, refunds | Done |
| 8 | Dashboard | Done |

### Phase 2 — Intelligence, payments, portal

| # | Feature | Status |
|---|---|---|
| 9 | Progress charts, RCI/CSC flags, predicted progress, PDF export and email | Done |
| 10 | Payment reminders (manual trigger) | Done; not scheduled as a cron yet |
| 11 | Online payments (Razorpay Connect) | Built, awaiting Razorpay partner approval and testing |
| 12 | AI note drafting | Not built |
| 13 | Audit log | Table only |
| 14 | Client portal (payment view) | Not built |

### Phase 3 — Calendaring

| # | Feature | Status |
|---|---|---|
| C1 | Calendar view (month/week) | Not built |
| C2 | Recurring sessions | Done (in the Sessions page) |
| C3 | Upcoming sessions view | Done (Sessions page default) |
| C4 | Session reminders to clients | Not built |
| C5 | iCal export | Not built |

---

## 6. Key Workflows

### 6.1 End-of-Session Workflow

This is the most critical flow. It must feel frictionless.

| Step | Action | UI Trigger |
|---|---|---|
| 1 | Session status → Completed | Button on session card |
| 2 | SOAP note editor opens | Auto-prompt if no note exists |
| 3 | Counselor fills the note and ORS/SRS | Free type; AI drafting not built |
| 4 | Note saved | Session shows green ✓ badge |
| 5 | Session shows as 'Unbilled' | Orange badge until invoiced |
| 6 | At month end: batch invoice | Select month → select clients → generate all invoices |
| 7 | Review + send | Preview → click Send → HTML email over Gmail SMTP |

> Completing a note marks the session billable. Unbilled completed sessions appear in the batch invoice list until invoiced.

### 6.2 Monthly Invoicing Workflow

1. Go to **Invoices → New Batch**
2. Deepen lists clients with unbilled completed sessions, with pending amounts per currency
3. Counsellor selects clients and clicks **Generate Invoices** (status `draft`, shown as "Generated")
4. Counsellor reviews (preview) and clicks **Send** per invoice: HTML email over Gmail SMTP, with opening balance, UPI details and QR, and a Pay online button if Razorpay is connected
5. Invoice status → `sent`. Sessions linked to `invoice_id`. With Test Mode on, the email goes to the counsellor and the status stays `draft`

### 6.3 Client Portal Access *(not built)*

Planned: a token link where the client sees invoices, status and amounts, and never notes or sessions. The `portal_tokens` table exists; no routes or pages do. The only public client page today is `/portal/paid`.

### 6.4 Online Payment Workflow (Razorpay Connect)

Money flows client → counsellor's own Razorpay account → her bank. Deepen never holds funds; it creates links and records payments.

1. Counsellor clicks **Settings → Online payments → Connect Razorpay**, signs in on Razorpay and approves access. Deepen stores her account id and encrypted tokens.
2. When an INR invoice or reminder is sent, Deepen creates (or reuses) a payment link on her account for the amount still owed. The link carries `deepen_tenant_id` and `deepen_invoice_id` in its notes. A link for a stale amount is cancelled and replaced.
3. Client pays by UPI, card or netbanking and lands on `/portal/paid`.
4. Deepen records the payment only after fetching the link from Razorpay and seeing it captured. Three triggers run the same check: the `payment_link.paid` webhook, the client's return redirect, and the daily cron.
5. The payment is recorded through `lib/record-payment.ts` (same path as manual payments), applied to that invoice first, with method `online`. A receipt email goes out if enabled.
6. Voiding an invoice cancels its link (or refuses the void if the client already paid). The daily check closes links on invoices settled another way. Disconnecting cancels all open links.

---

## 7. API Route Reference

All routes live under `src/app/api/`. Everything requires a logged-in session except routes excluded in `src/middleware.ts`: `/api/auth`, `/api/signup`, `/api/create-subscription`, `/api/admin` (checks `ADMIN_EMAILS` itself) and `/api/public/*` (each checks its own signature or secret).

| Method | Route | Description |
|---|---|---|
| GET / POST | `/api/clients` | List (with `isActiveThisMonth`) / create clients |
| GET / PATCH | `/api/clients/[id]` | Get / update a client (incl. terminate, reactivate) |
| GET | `/api/clients/[id]/stats` | Session count, first and last session |
| GET | `/api/clients/[id]/progress` | ORS/SRS series for charts |
| GET | `/api/clients/[id]/predicted-progress` | Predicted trajectory |
| POST | `/api/clients/[id]/progress/mail` | Email the progress chart PDF |
| POST | `/api/clients/import` | Bulk import up to 100 clients |
| GET / POST | `/api/sessions` | List / create sessions (soft warning above 40 monthly active clients) |
| GET / PATCH / DELETE | `/api/sessions/[id]` | Session detail and updates |
| GET / POST | `/api/sessions/[id]/note` | Session note |
| GET / POST | `/api/fee-schemes` | List / create fee schemes |
| PUT / DELETE | `/api/fee-schemes/[id]` | Update / delete a fee scheme |
| GET | `/api/invoices` | List invoices |
| GET | `/api/invoices/unbilled` | Unbilled sessions by client |
| POST | `/api/invoices/batch` | Generate invoices |
| GET | `/api/invoices/[id]/preview` | HTML preview |
| POST | `/api/invoices/[id]/send` | Email the invoice |
| POST | `/api/invoices/[id]/receipt` | Record a payment against this invoice, optionally email a receipt |
| POST | `/api/invoices/[id]/void` | Void (refused if payments exist; settles any payment link first) |
| POST | `/api/invoices/[id]/payment-link` | Create or return the pay-online link |
| POST | `/api/invoices/remind` | Send overdue reminders (session, or `CRON_SECRET`) |
| GET / POST | `/api/payments` | List payments / record a payment (FIFO) |
| DELETE | `/api/payments/[id]` | Delete one allocation |
| GET | `/api/payments/outstanding-summary` | Outstanding and received totals by currency |
| GET | `/api/payments/connect`, `/api/payments/connect/callback` | Razorpay Connect OAuth |
| GET / PATCH / DELETE | `/api/payments/connection` | Connection status, receipt preference, disconnect |
| GET | `/api/receipts` | List receipts |
| DELETE | `/api/receipts/[id]` | Delete a receipt and its allocations |
| GET | `/api/reports` | Practice reports |
| GET | `/api/dashboard` | Dashboard stats |
| GET / POST | `/api/settings` | Practice settings |
| POST | `/api/settings/password` | Change password |
| GET | `/api/settings/export` | Data export |
| GET | `/api/settings/billing` | Deepen subscription status and history |
| POST | `/api/settings/billing/cancel`, `/api/settings/billing/reactivate` | Cancel / reactivate the subscription |
| POST | `/api/signup`, `/api/create-subscription` | **Public** — signup and subscription start |
| POST | `/api/webhooks/razorpay` | Subscription webhook. **Currently unreachable**: middleware redirects it to `/login` |
| POST | `/api/public/razorpay/webhook` | **Public** — `payment_link.paid`, signature-verified |
| GET | `/api/public/razorpay/return` | **Public** — client returns after paying; re-checks the link |
| GET | `/api/public/razorpay/reconcile` | **Public, `CRON_SECRET`** — daily backstop and token refresh |
| GET / PATCH | `/api/admin/tenants` | Platform admin: practices and controls (`ADMIN_EMAILS`) |
| GET / POST | `/api/admin/promo-codes` | Platform admin: promo codes |

---

## 8. Original Project Plan (April 2026, historical)

Kept for reference. Current status is in section 5.

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
| `SMTP_USER` | Gmail Address (for invoice sending) |
| `SMTP_PASS` | Gmail App Password (16-char) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `RAZORPAY_WEBHOOK_SECRET` | Signature secret for the subscription webhook (if unset, the handler skips verification) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public key for Razorpay Checkout at signup |
| `RAZORPAY_PLAN_DEEPEN`, `RAZORPAY_PLAN_FOUNDING` | Subscription plan ids |
| `RAZORPAY_FOUNDING_OFFER_ID`, `RAZORPAY_BETA_OFFER_ID` | Subscription offer ids |
| `FOUNDING_PROMO_CODE`, `BETA_PROMO_CODE` | Signup promo codes |
| `ADMIN_EMAILS` | Comma-separated emails allowed into `/admin` |
| `RAZORPAY_KEY_ID` | Razorpay key for Deepen's own subscription billing |
| `RAZORPAY_KEY_SECRET` | Razorpay secret for Deepen's own subscription billing |
| `RAZORPAY_OAUTH_CLIENT_ID` | Partner OAuth app client id (counsellors' online payments) |
| `RAZORPAY_OAUTH_CLIENT_SECRET` | Partner OAuth app client secret |
| `RAZORPAY_OAUTH_MODE` | `test` or `live` |
| `RAZORPAY_CONNECT_WEBHOOK_SECRET` | Signing secret for the partner app webhook |
| `PAYMENT_TOKEN_ENCRYPTION_KEY` | 32 random bytes, base64; encrypts stored Razorpay tokens |
| `CRON_SECRET` | Sent by Vercel Cron to `/api/public/razorpay/reconcile` |
| `APP_URL` | Public base URL for OAuth and payment-link callbacks (defaults to `NEXTAUTH_URL`) |
| `RESEND_API_KEY` | Present in `.env.local` but unused by the code |

---

## 10. Folder Structure

```
src/
├── middleware.ts               # Auth gate; public-route allowlist
├── app/
│   ├── home, login, signup, terms, privacy, refunds, contact   # Public pages
│   ├── portal/paid/            # Public: client thank-you after paying online
│   ├── admin/                  # Platform admin
│   ├── dashboard/              # Protected app
│   │   ├── clients/ ([id], import)
│   │   ├── sessions/  invoices/  payments/  fees/
│   │   ├── reports/  inactive/  settings/
│   └── api/                    # Route handlers (section 7)
├── components/                 # App components + ui/ (shadcn)
├── lib/
│   ├── db/                     # Drizzle schema + clients (HTTP and pooled)
│   ├── tenant.ts               # Tenant context, RLS wrapper, plan features, MAC counts
│   ├── record-payment.ts       # Shared payment recording
│   ├── receipt-email.ts        # Receipt email
│   ├── razorpay-connect.ts     # Razorpay OAuth + API
│   ├── payment-links.ts        # Payment link lifecycle and sync
│   ├── secret-box.ts           # Token encryption
│   ├── tz.ts  receipts.ts  credit.ts  riskFlags.ts  utils.ts
│   └── copy/                   # UI copy
drizzle/                        # Drizzle output; manual/ holds hand-applied SQL
```

---

## 11. Design Principles

- **Speed over features** — ship Phase 1 in 5 weeks, get the counselor using it before building Phase 2
- **Session → Note → Invoice is the golden path** — every UI decision should make this loop faster
- **No-show and cancellations are first-class** — they affect billing and must be logged properly
- **Never delete data** — use soft deletes (`is_active = false`); the audit log is not wired up yet
- **Invoice emails go from the system** — currently Gmail SMTP from the practice name; a verified sending domain would help deliverability
- **Client portal is read-only, token-gated** — no auth system for clients needed
- **Monthly invoicing is the billing rhythm** — don't over-engineer per-session invoicing
- **Mobile-responsive from day one** — the counselor may log sessions from a phone

---

## 12. Open Questions for Counselor Before Dev Starts (April 2026, historical)

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
