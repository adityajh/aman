# Changelog

All notable changes to the Aman project will be documented in this file.
 
## [2.4.0] - 2026-04-19 (Session 2)
### Added
- **Client Status Filter**: Dropdown on the Clients page filters by **All / Active / Terminated** (defaults to Active). First letter capitalised in all dropdown labels; value and display label are always identical.
- **Dashboard — Clickable Clinical Risk Lists**: Deteriorating and Dissatisfied metric cards now show a list of flagged client names below the count. Each name links to the Clients page.
- **View Sessions Action**: Each row in the Clients table has a new **Sessions** button that navigates directly to the Sessions view pre-filtered to that client's YTD sessions.
- **Sessions URL Params**: Sessions page reads `?clientId=<id>&timeFilter=<value>` query params on mount to support deep-linking from the Clients table.
- **Dashboard — Missing Stats Fixed**: `unbilledSessions` (completed, no invoice) and `upcomingSessions` (next 7 days) were being referenced but never returned by the API — now correctly computed and returned.
- **ORS/SRS Slider Input**: Replaced the 1–10 button-grid score selector in the Clinical Note Editor with a smooth **0–10 range slider** (step 0.1) + synced **number input box**. Both are bidirectionally connected. Slider track colour-codes dynamically: red (0–3), amber (3–6), lime (6–10). Tick marks at 0, 2.5, 5, 7.5, 10 for reference.

### Fixed
- **Slider Drag Broken**: Slider was mounting/unmounting on every state update because `ScoreSelector` was defined *inside* the parent component. Moved it to module scope — drag is now fully smooth.
- **Currency Labels Missing**: Payment Ledger summary cards (Received This Month, Received YTD, Outstanding) only showed `₹`/`$` symbols. Now show explicit `INR` / `USD` code labels above each amount. Same fix applied to the Dashboard Outstanding Revenue card.
- **Dashboard Currency Audit**: Confirmed all financial calculations (FIFO allocation, outstanding totals, received summaries) correctly group by currency and never merge INR and USD amounts.
- **JSX Parse Error** (`clients/page.tsx` line 500): Missing `</div>` for the flex-wrap toolbar container was causing a Turbopack build failure.
- **TypeScript Build Error** (recharts `Tooltip.formatter`): Parameter typed as `number` — corrected to `unknown` to satisfy `ValueType | undefined`.

---

## [2.3.0] - 2026-04-19
### Added
- **Client Progress Charts**: Full ORS and SRS charts per client, accessible via a "Charts" button on every row in the clients table.
  - **ORS chart** with three configurable colour bands: Red (Distress ≤25), Amber (At Risk 26–31), Green (Functional ≥32).
  - **Linear trend line** (dashed) projecting expected progress over the next 4–8 weeks using linear regression on recorded scores.
  - **Alarm flags** overlaid on the chart when a client is flagged as Deteriorating (ORS) or Dissatisfied (SRS).
  - **Clinical status badges**: CSC Achieved / RCI Achieved / Deteriorating / Dissatisfied / On Track.
- **Mini ORS Sparklines**: Compact inline sparkline chart rendered in each row of the Clients table with a `⚠` alert overlay when a risk flag is active.
- **All Clinical Formulas in Settings**: Six formula-driven thresholds now adjustable from `Settings → Clinical Flags`:
  - ORS Cut-off (CSC boundary)
  - SRS Cut-off (alliance alarm)
  - ORS Deterioration Threshold (drop from first session to flag deteriorating)
  - SRS Decline Threshold (session-to-session drop to flag dissatisfied)
  - **ORS RCI Threshold** (min reliable change; PCOMS default = 5)
  - **ORS Amber Band Start** and **ORS Green Band Start** (controls chart colour zones)
- **New API route**: `GET /api/clients/[id]/progress` — returns full clinical chart data (ORS/SRS points, trend line, clinical flags) for a given client.

### Fixed
- TypeScript build error: `Dispatch<SetStateAction<string>>` not assignable to `onValueChange` in Termination Type `Select` (wrapped with null guard `?? "planned"`).
- TypeScript build error: Recharts `Tooltip` formatter typed as `(v: number)` — corrected to `unknown` to satisfy `ValueType | undefined`.

### Database
- Added `ors_rci_threshold`, `ors_amber_low`, `ors_green_low` columns to `practice_settings`.

---

## [2.2.0] - 2026-04-19
### Added
- **Client Termination Workflow**: Formal discharge flow accessible from every client's details view.
  - Captures **Planned** (graduation) vs **Unplanned** (dropout/referral) termination type and a free-text reason.
  - Sets `isActive = false` and timestamps `terminatedAt` — all historical session, invoice, and note data is fully preserved.
  - Terminated clients display a red `Terminated` badge in the clients list.
  - Terminated clients are **excluded** from active dashboard clinical alerts (Deteriorating / Dissatisfied).
- **Advanced Clinical Definitions** (formula-based):
  - **Deteriorating Client**: `(Initial Session ORS − Latest Session ORS) > ORS Deterioration Threshold`.
  - **Dissatisfied Client**: `Latest SRS < SRS Cut-off` **OR** `(Previous SRS − Latest SRS) > SRS Decline Threshold`.
- **Configurable Thresholds** in Settings: ORS Deterioration Threshold (default 5) and SRS Decline Threshold (default 2).
- **Clinical columns in Sessions table**: ORS Prev, ORS Now, SRS Prev, SRS Now, Risk Status (with colour-coded badges).
- **Session API enrichment**: `GET /api/sessions` now returns `_clinical` block per session containing initial/previous/current ORS & SRS and computed `orsStatus` + `srsStatus`.

### Fixed
- Stray `</div>` tag at line 370 of `clients/page.tsx` that caused a Turbopack parse error and blocked Vercel builds.

### Database
- Added `termination_reason` (text), `termination_type` (text), `terminated_at` (timestamptz) columns to `clients`.
- Added `ors_deterioration_threshold`, `srs_decline_threshold` columns to `practice_settings`.

---

## [2.1.0] - 2026-04-19
### Added
- **ORS / SRS Cut-off Settings**: `Settings → Clinical Flags` card now lets the practitioner define thresholds for Deteriorating (ORS) and Dissatisfied (SRS) alerts.
- **Auto End-Time on Sessions**: Entering a Start Time automatically populates the Finish Time to exactly Start + 60 minutes.
- **Status-based pill toggles**: Restored horizontal filter pills (Scheduled, Completed, Invoiced, Received, Exceptions) above the Sessions table.
- **Dashboard Analytics Suite**:
  - Scheduled vs Completed sessions (This Month & YTD).
  - Deteriorating Clients count.
  - Dissatisfied Clients count.
  - No-Show Rate (%).
- **No Show** added as a formal session status.

### Changed
- Filter labels capitalised ("YTD", "This Month", etc.) and filter dropdown widths widened to prevent text cutoff.
- Status badge colours standardised: Scheduled = Yellow, Completed = Blue, Received = Green, Cancelled/No Show = Gray.

### Database
- Added `ors_cutoff`, `srs_cutoff` columns to `practice_settings`.

---

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
