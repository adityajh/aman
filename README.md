# Aman — Clinical Practice Management

Aman is a modern, lightweight practice management system designed for independent therapists and multi-counselor clinics. Built as a secure, multi-tenant SaaS platform, it streamlines the "Golden Path" of clinical work: scheduling sessions, writing clinical notes, and automating monthly invoicing.

## ✨ Core Features

- **Practice Dashboard**: High-level metrics for unbilled sessions, revenue, upcoming appointments, clinical risk flags, and client progress summaries.
- **Client Management**: Secure database for client records, default fee schemes (INR & USD), termination workflow with invoicing options, and duplicate email detection with reactivation flow.
- **Sessions Dashboard**: Fast scheduling with modality tracking and recurring sessions. Filter by Active/All/individual clients and by time period (Today, This Week, This Month, YTD, or a custom date range); sort by client name. Duration shows actual clocked time for completed sessions and planned time for scheduled ones. Cancel/no-show with a reason and a 0/50/100% fee quick-fill.
- **Pro-rata billing**: Session fees scale to the actual duration by 15-minute quartile (e.g. 45 min → 0.75×), with a standard-hour grace band for near-60-minute sessions.
- **Clinical Note Editor**: Professional structured note editor (SOAP / Custom) with ORS & SRS rating scales (0–10) — set via precision sliders or typed directly to one decimal. Completing a note auto-marks the session as billable.
- **Progress Charts**: Per-client ORS & SRS trend charts with RCI/CSC detection, colour-banded benchmarks, and regression trend projection.
- **Invoicing Engine**: One-click batch generation of monthly invoices. Fully currency-aware — INR and USD clients are handled separately in batch totals and all display symbols.
- **Payments Ledger**: Multi-currency payment recording with FIFO allocation across outstanding invoices. Write-offs, account credit and refunds are recorded as adjustments and kept out of received totals.
- **Online Payments**: Counsellors connect their own Razorpay account. Invoices and reminders carry a Pay online link, paid links are recorded automatically with a receipt, and money goes straight to the counsellor. See [Online payments](#online-payments-razorpay-connect) for setup.
- **Resend Integration**: Automated delivery of branded HTML invoices directly to client emails.

## 🛠 Tech Stack

- **Framework**: [Next.js 16+](https://nextjs.org/) (App Router, Turbopack)
- **Database**: [Neon](https://neon.tech/) (Serverless Postgres)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Email**: [Resend](https://resend.com/) + [Nodemailer](https://nodemailer.com/) (Gmail SMTP fallback)

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+
- A Neon PostgreSQL database
- A Resend API account

### 2. Installation

```bash
git clone https://github.com/adityajh/aman.git
cd aman
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
NEXTAUTH_SECRET=your_32_char_secret
NEXTAUTH_URL=http://localhost:3000

# Gmail SMTP (for invoice sending)
SMTP_USER=you@gmail.com
SMTP_PASS=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
```

### Online payments (Razorpay Connect)

Counsellors connect their own Razorpay account from Settings → Online payments. Invoices and reminders then carry a Pay online link, and paid links are recorded automatically. Money goes straight to the counsellor's account; Deepen never holds it.

```env
RAZORPAY_OAUTH_CLIENT_ID=...          # Razorpay partner dashboard → OAuth app
RAZORPAY_OAUTH_CLIENT_SECRET=...
RAZORPAY_OAUTH_MODE=test              # "live" once the partner app is approved
RAZORPAY_CONNECT_WEBHOOK_SECRET=...   # secret on the partner app's webhook
PAYMENT_TOKEN_ENCRYPTION_KEY=...      # node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
CRON_SECRET=...                       # Vercel Cron sends this to the daily check
APP_URL=https://your-domain           # optional, defaults to NEXTAUTH_URL
```

On the Razorpay partner app, set:
- Redirect URL: `<APP_URL>/api/payments/connect/callback`
- Webhook: `<APP_URL>/api/public/razorpay/webhook`, event `payment_link.paid`

Schema: run `drizzle/manual/2026-11-razorpay-connect.sql` once. A daily cron (`vercel.json`) records any payment a webhook missed and refreshes tokens. Without these variables, the Settings card shows that online payments aren't switched on, and everything else works as before.

### 4. Database Setup

```bash
npx drizzle-kit push
```

### 5. Run Development Server

```bash
npm run dev
```

## 🛤 Roadmap

- [x] **Phase 1**: MVP (Invoicing, Clients, Sessions, Clinical Notes)
- [x] **Phase 1.5**: Clinical Analytics (ORS/SRS sliders, progress charts, risk tracking)
- [x] **Phase 2**: UX Hardening (Multi-currency, session cancellation, duplicate client detection, reactivation flow, invoicing integrity)
- [ ] **Phase 3**: AI Assistance (SOAP Note drafting via Claude API)
- [ ] **Phase 4**: Client Portal (Token-gated payment history view)
- [ ] **Online payments** (Razorpay Connect): built, awaiting Razorpay partner approval and end-to-end testing
- [ ] **Phase 5**: Calendar View (Scheduling, recurring sessions, reminders)

## 📄 License

MIT


