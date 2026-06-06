# Aman — Clinical Practice Management

Aman is a modern, lightweight practice management system designed for solo counselors. It streamlines the "Golden Path" of clinical work: scheduling sessions, writing clinical notes, and automating monthly invoicing.

## ✨ Core Features

- **Practice Dashboard**: High-level metrics for unbilled sessions, revenue, upcoming appointments, clinical risk flags, and client progress summaries.
- **Client Management**: Secure database for client records, default fee schemes (INR & USD), termination workflow with invoicing options, and duplicate email detection with reactivation flow.
- **Sessions Dashboard**: Fast scheduling with modality tracking and recurring sessions. Filter by Active/All/individual clients and by time period (Today, This Week, This Month, YTD, or a custom date range); sort by client name. Duration shows actual clocked time for completed sessions and planned time for scheduled ones. Cancel/no-show with a reason and a 0/50/100% fee quick-fill.
- **Pro-rata billing**: Session fees scale to the actual duration by 15-minute quartile (e.g. 45 min → 0.75×), with a standard-hour grace band for near-60-minute sessions.
- **Clinical Note Editor**: Professional structured note editor (SOAP / Custom) with ORS & SRS rating scales (0–10) — set via precision sliders or typed directly to one decimal. Completing a note auto-marks the session as billable.
- **Progress Charts**: Per-client ORS & SRS trend charts with RCI/CSC detection, colour-banded benchmarks, and regression trend projection.
- **Invoicing Engine**: One-click batch generation of monthly invoices. Fully currency-aware — INR and USD clients are handled separately in batch totals and all display symbols.
- **Payments Ledger**: Multi-currency payment recording with FIFO allocation across outstanding invoices.
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
- [ ] **Phase 5**: Calendar View (Scheduling, recurring sessions, reminders)

## 📄 License

MIT


