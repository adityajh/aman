# Changelog

All notable changes to the Aman project will be documented in this file.

## [1.2.0] - 2026-04-12
### Added
- **Payments Receipt Ledger**: Introduced a dedicated dashboard for tracking collections, receipts, and pending dues.
- **FIFO Allocation Engine**: Automated payment balancing that settles oldest outstanding invoices first.
- **Grouped Invoices View**: Redesigned the Invoices page to group by client, displaying session counts and per-invoice payment progress.
- **Advanced Credits**: Support for recording overpayments and advance payments as unlinked client credits.
- **Modern Typography**: Replaced Geist with **Inter** for a more refined SaaS aesthetic and **JetBrains Mono** for technical data.
- **Slick UI Theme**: Shipped a soft off-white background with high-contrast white cards for better visual depth and a modern "slick" feel.

### Fixed
- **Build Integrity**: Resolved multiple TypeScript type errors in the Payments page that were causing deployment failures on Vercel.
- **Dropdown Readability**: Implemented a state-based display name pattern for all entity-backed selectors (Clients, Fees) to permanently resolve the UUID display bug.
- **Invoice Schema**: Updated tables to support nullable invoice links for advance payments.
- **API Performance**: Optimized invoice fetching to include session counts and accurate payment status inferences.


## [1.1.0] - 2026-04-05
### Added
- **Gmail SMTP Integration**: Replaced Resend with `nodemailer` for invoice delivery via personal Gmail accounts.
- **Light Grey Theme**: Transitioned the entire dashboard workspace to a clean, light grey aesthetic with a dark branded sidebar.
- **Improved Contrast**: Updated status pills (Completed, Generated, Sent) with bold, dark-toned text for better readability.
- **Terminology Shift**: Renamed "Draft" invoices to **"Generated"** to better suit professional clinical workflows.
- **Documentation**: Created `usage_guide.md` and `setup_email_guide.md` for practice management and email configuration.

### Fixed
- **Select UI Bug**: Resolved the persistent issue where UUIDs were displayed instead of Names/Labels in the "Add Session" and "Fee Scheme" selectors.
- **Dashboard Revenue**: Updated "Outstanding Revenue" to include both "Generated" and "Sent" invoices, correctly reflecting total practice earnings.
- **Relational Integrity**: Fixed Drizzle ORM inference errors in `schema.ts`.

## [1.0.0] - 2026-04-05
### Added
- **Project Scaffolding**: Initialized Next.js 14 project with Tailwind CSS and shadcn/ui.
- **Authentication**: Implemented NextAuth.js with Credentials provider (Admin login).
- **Database Layer**: Configured Neon PostgreSQL with Drizzle ORM and relative schemas.
- **Client Management**: API and Dashboard UI for creating and listing clients.
- **Session Tracking**: Scheduling engine for clinical sessions (Video, Phone, In-person).
- **SOAP Notes**: Integrated clinical editor with Subjective, Objective, Assessment, and Plan fields.
- **Risk System**: High/Medium risk flagging for session notes.
- **Invoicing Engine**: Automated batch creation of monthly invoices from unbilled sessions.
- **Email Delivery**: Initial automated HTML invoice emails via Resend integration.
- **Dashboard**: "Practice Overview" landing page with high-level financial and clinical metrics.

### Fixed
- Next.js 15+ compatibility for asynchronous route parameters.
- Drizzle type errors for date column formatting.
- Button `asChild` prop incompatibility in newer Base UI-based shadcn components.

---
*Created by [Antigravity](https://google.com) — Advanced Agentic Coding.*
