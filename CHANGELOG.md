# Changelog

All notable changes to the Aman project will be documented in this file.
 
## [2.0.0] - 2026-04-19
### Added
- **Automated Session Duration**: Replaced manual minute entry with a Start/Finish time system that automatically calculates and rounds duration.
- **Rounding Logic**: Implemented 15-minute interval rounding with a guaranteed 15-minute minimum for any session.
- **Financial Year (FY) Reporting**: Aligned all YTD (Year-to-Date) dashboard and payment ledger calculations with the Indian Financial Year (April 1st – March 31st).
- **Billing-Aware Status badges**: Introduced state-aware labels in the session table: **Received** (paid), **Invoiced** (billed), **Completed**, and **Scheduled**.
- **UPI Integration**: Added dynamic UPI ID management in Settings and automated injection into PDF invoices and emails.

### Changed
- **Branding & Terminology**: Transitioned "Pastoral Practice" to **"Counselling"** and "Session Invoice" to **"Therapy sessions billing"** across the entire platform.
- **Indian Accounting Format**: Standardized all currency displays to use the Indian format (comma separators and 2 decimal points).
- **Invoice Header Refinement**: Simplified invoice branding by removing the personal name and focusing on the practice identity.

### Database
- **Schema Migration**: Added `ended_at` (timestamptz) and `upi_id` (text) to the sessions and practice settings tables.

## [1.3.0] - 2026-04-12
### Added
- **Global Quick-filters**: Implemented comprehensive toggle-based filtering for the Sessions and Invoices pages (Scheduled, Completed, Generated, Paid, etc.).
- **Redesigned Scheduling Dialog**: Overhauled the "New Session" box with full-width selectors, Title Case capitalization for all options, and a "slicker" improved layout.
- **Dynamic Fee Selection**: Updated the Fee Scheme selector to display the amount (e.g., ₹2000) directly in the selection field once picked.
- **Enhanced Invoices Table**: Integrated status-aware filtering that dynamically re-groups clients based on selected invoice states.

### Fixed
- **Outstanding Revenue Sync**: Resolved a dashboard bug where balances showed as zero by synchronizing the internal `'draft'` status with the financial summary engine.
- **Selection Interaction Recovery**: Fixed the unresponsive client dropdown in the "Record Payment" dialog by migrating to the standard `SelectValue` architecture.
- **Import Integrity**: Fixed a Vercel deployment failure caused by a missing `cn` utility import in the Sessions page.
- **UI Capitalization**: Applied consistent Title Case formatting to all clinical modality and session type labels across the platform.

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
