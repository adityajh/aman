# Changelog

All notable changes to the Aman project will be documented in this file.

## [4.0.1] - 2026-08-04
### Fixed
- **Touch Device Accessibility**: Made the "delete receipt" (trash can) button on the Payments Ledger permanently visible. It was previously hidden behind a CSS hover state (`opacity-0 group-hover:opacity-100`), making it invisible and inaccessible on iPads and other touch devices.

---

## [4.0.0] - 2026-07-27
### Added
- **Multi-Tenancy Architecture**: Converted the platform into a true SaaS application. Data is now strictly isolated by practice/tenant using PostgreSQL Row Level Security (RLS) policies.
- **Tenant Context Middleware**: Implemented `withTenantContext` wrapper to securely apply the current user's `tenant_id` to all database transactions.
- **Marketing Landing Page**: Built a modern, high-converting public landing page at `/home` showcasing features and pricing tiers (Basic / Pro).
- **Change Password Workflow**: Added a secure password update form under the practice Settings page (`/dashboard/settings`).
- **Dynamic Routing**: Restructured the app by moving the core application to `/dashboard`. Unauthenticated users visiting the root are redirected to `/home`, and authenticated users to `/dashboard`.

### Database
- Added `tenants` and `users` tables.
- Linked every domain table (`clients`, `sessions`, `invoices`, etc.) to `tenant_id` with strict RLS enforcement.
- Created `drizzle/0006_multi_tenancy.sql` containing the full migration and RLS policy definitions.

---

## [3.6.1] - 2026-07-02
### Changed
- **Risk flag → two automatic ORS/SRS flags**: The single none/low/medium/high risk dropdown is replaced by two independent **YES / NO** flags derived from the scores, shown in the note editor as you enter scores:
  - **ORS flag** — YES when ORS dropped ≥ the deterioration threshold from the client's baseline.
  - **SRS flag** — YES when SRS is below the cutoff **or** dropped ≥ the decline threshold from the previous session.
  - A scale that isn't recorded shows "—" (N/A). Thresholds remain configurable in Settings. The rule lives in one shared place (`@/lib/riskFlags`) used by the editor, save, backfill, reports, and dashboard.
- **Clients page**: the small ORS trend sparkline is replaced by two compact **ORS** and **SRS** flag columns (each client's latest completed-session note).
- **Reports / Dashboard "at-risk"** now count active clients whose latest note has the ORS or SRS flag set (was medium/high risk).

### Database
- Added `session_notes.ors_flag` / `session_notes.srs_flag` (boolean, nullable). Migration `drizzle/0005_add_note_flags.sql`; existing notes were backfilled from their scores.

---

## [3.6.0] - 2026-07-02
### Added
- **Receipts as first-class records**: Every payment now creates a numbered **receipt** (`RCP-2026-NNNN`, its own sequence). A receipt is the money the client actually paid; the existing `payments` rows became **allocations** of that receipt across invoices (or excess credit). Recording a payment, or Confirm-Payment on an invoice, both create a receipt; emailing a receipt records when it was **sent**.
- **Client statement**: Clicking a client in the Payments ledger now opens a running **statement of account** — a single chronological list with **Invoiced** and **Received** columns and a running **Balance**, each row referencing its `INV-…` or `RCP-…` number (with an "emailed" marker on sent receipts). Replaces the old two-table drill-in.

### Changed
- **Credit re-application keeps its receipt**: When advance credit is auto-applied to a newly generated invoice, the allocation stays under the **original** receipt (the money was receipted once), so a client's receipt count reflects real payments.
- **Deleting a payment** now deletes the whole **receipt** (all its allocations) and recalculates every invoice it touched.

### Database
- New `receipts` table + `payments.receipt_id` (FK, cascade). Migration `drizzle/0004_add_receipts.sql`. Existing payments were **backfilled** into receipts (grouped by payment event; totals reconcile exactly per client/currency).

---

## [3.5.2] - 2026-07-01
### Added
- **Payments page — client ledger & invoice views**: The Payments page is now two tabs. **By Client** shows a per-client ledger (Invoiced / Received / Balance, alphabetical; credit balances shown in green) — click any client to drill into their invoices and payments. **By Invoice** lists every invoice sorted by number with its received amount and balance. The raw per-transaction list is replaced by these two views.
- **Advance-credit auto-application**: When a batch invoice is generated, any unallocated credit the client is holding in that currency (from a past overpayment) is now **automatically applied** to the new invoice — drawing down the credit and marking the invoice paid/partial. Previously the credit just sat unused.

---

## [3.5.1] - 2026-07-01
### Fixed
- **Batch generation failed with "0 invoices generated"**: Invoice numbers were built from `count(*)`, which Postgres returns as a **string** — so `count + 1` string-concatenated (55 → `INV-2026-0551`) and, because deletions return the count to earlier values, regenerated an **already-used** number, hitting the unique constraint. Numbers are now computed from `MAX(suffix) + 1` for the year (robust to deletions/gaps).
- **Silent failure**: the New Batch dialog reported "Generated 0 invoices" even when the batch errored. It now surfaces the actual reason (and flags partial failures).

---

## [3.5.0] - 2026-06-27
### Added
- **Client dashboard (`/clients/[id]`)**: The **Charts** button now opens a dedicated full-page client view — key stats (completed sessions, last session, total billed) plus the ORS/SRS/Predicted progress charts at full width and height. Replaces the old cramped modal.
- **Richer progress charts**: Soft gradient fills under the ORS/SRS lines, subtle coloured **zone bands** (Distress / At Risk / Functional) replacing the hard dashed lines, **summary stat tiles** above the charts (Latest ORS, ORS change from baseline, Latest SRS, sessions scored), and an enriched hover **tooltip** showing the score, clinical risk, and that session's note snippet.
- **"Not recorded" scores**: The clinical note editor has a per-block toggle for ORS and SRS that saves the scale as `null` instead of `0`, so a skipped scale no longer plots a misleading zero — the chart bridges the gap. Reopening a note restores the toggle.
- **Automatic risk flagging**: The note editor auto-suggests **High Risk** from the configurable practice-settings thresholds (ORS drop from baseline, SRS drop from last session or below cutoff) and shows the reason. It's overridable, respects a saved flag, and never auto-downgrades.
- **Invoice summary cards**: The Invoices page gained currency-aware metric cards — Pending Billing (relocated from the old sidebar), Outstanding, Overdue / Partial, and Collected.
- **Invoice due dates**: The New Batch dialog now has a **Payment Due** pulldown (**Net 7 / Net 15 / Custom days**) with a live due-date preview, defaulting from a new configurable practice setting (**Settings → Invoice Billing → Payment due**). Generated invoices store an issue and due date, both shown on the invoice preview and email. This is what makes the **Overdue** card / filter / badge meaningful.

### Changed
- **Invoices page redesign**: Full-width, flat, **sortable** invoice table (by date, client, total, status) replacing the client-grouped table + sidebar. Secondary actions collapsed into a clean **"…" menu** (View / Confirm Payment / Void) with **Send** kept inline for drafts. Modern pill status badges, a filter bar with per-status **counts**, a search box (invoice # / client / email), and a polished empty state.
- **Invoice line items are chronological**: Generated invoices list sessions oldest-first; the preview and email re-sort by session date at render time, so existing invoices read in order too.
- **Sessions Fees column**: Cancelled / no-show rows show the **actual cancellation fee** (0 / 50 / 100%) instead of the full default fee, with a **"waived <amount>"** sub-line when less than the full fee.
- **Sessions defaults**: The Sessions page now defaults to **Today** (time) and **All Clients** (was This Month / Active).
- **Clinical note editor layout**: Actual Start/End time moved to the **bottom**, beside the ORS/SRS blocks, to avoid scrolling when finalizing. SRS questions reordered to **Goals → Approach → Relationship → Overall**.
- **Dynamic overdue status**: Sent invoices past their due date are reported as **overdue** automatically, so the Overdue card / filter / badge reflect reality.

### Fixed
- **Cancellation notes leaked onto invoices**: The free-text cancellation/no-show reason was printed in the invoice line-item description. Lines now read just **"No show - <date>"** / **"Cancellation - <date>"**; the internal reason stays on the session only.
- **Rupee symbol in invoice preview**: The preview endpoint now sends `charset=utf-8`, so `₹` renders correctly instead of as mojibake.

### API
- `GET /api/clients/[id]/progress` now returns a `note` snippet and `risk` flag per data point (for chart tooltips).
- `GET /api/invoices` computes `overdue` status dynamically for past-due sent invoices.
- `POST /api/invoices/batch` accepts `dueDays` and sets each invoice's `issuedDate` + `dueDate` (IST-anchored); `GET`/`POST /api/settings` read/write `invoiceDueDays`.

### Database
- Added `practice_settings.invoice_due_days integer NOT NULL DEFAULT 15`. Migration `drizzle/0003_add_invoice_due_days.sql` (idempotent `ADD COLUMN IF NOT EXISTS`), applied to the shared Neon DB via direct push. Existing **unpaid** invoices were backfilled with `due_date = issued_date + invoice_due_days`.

---

## [3.4.0] - 2026-06-10
### Added
- **Client search**: A search box on the **Clients** page filters the roster live by **name, email, or phone**, stacking on top of the existing Active / Terminated status filter.
- **Session search**: A search box on the **Sessions** page filters the ledger live by **client name or email**, stacking on top of the existing time / client / status filters and the client-name sort.

### Changed
- **Sidebar order**: **Reports** moved from near the top (just under Clients) to the bottom group, **just above Settings**. New order: Dashboard · Clients · Sessions · Invoices · Payments · Fees · Reports · Settings.
- **Client details / edit dialog widened** to `sm:max-w-4xl`.

### Fixed
- **Client details — Practice Summary**: Total Sessions, Last Session, and Total Billed were hardcoded placeholders. A new lightweight `GET /api/clients/[id]/stats` endpoint (single `findMany` over completed sessions) now populates these live when the details dialog opens.
- **Client edit — Default Fee Scheme preselection**: The fee scheme dropdown was blank on open due to a state timing race. State is now seeded when the details dialog opens and re-seeded when edit mode activates, and `SelectValue` continues to use the manual-render pattern required by this shadcn/ui build (the `label`-prop/native approach renders raw UUIDs in this version).
- **Session fee & scheme corrections (one-time data fix)**: Five completed, uninvoiced sessions that were created with flat fees and no scheme link have been corrected:
  - **Krithika Balaji 9 May** — scheme attached (Disc-INR-I ₹3,500/hr), fee corrected to ₹5,250 for 90 min billed.
  - **Krithika Balaji 17 May** — scheme attached (Disc-INR-I ₹3,500/hr), fee unchanged at ₹3,500 for 60 min billed.
  - **Salima Hooda 7 May** — scheme attached (Disc-INR-I ₹3,500/hr), fee corrected to ₹2,625 for 45 min billed.
  - **Ayushi Walia 7 May** — scheme attached (Disc-INR-II ₹3,000/hr), fee corrected to ₹2,250 for 45 min billed.
  - **Purnima Chaudhry 6 Jun** — billed duration corrected 60 → 45 min, fee corrected $72 → $54 (Indiv-USD $72/hr scheme was already linked).

---

## [3.3.0] - 2026-06-09
### Added
- **Reports page (clinical outcomes)**: New **Reports** entry in the sidebar (between Clients and Sessions) showing outcomes across **closed clients**. Overview cards (closed-client count, % who started in distress with initial ORS ≤ cutoff, median tenure in weeks, median completed sessions), **Outcome Ratios** for the distress cohort with both a first and last ORS (RCI improvement, deterioration, no-change, clinically significant change), an **Effectiveness** block (Cohen's *d* effect size and average SRS alliance), and **Pre-Mature Termination** (PTR-I auto, PTR-II manual, combined Final PTR). A separate **Live — At-Risk Clients** card is the one forward-looking metric: *active* clients whose latest completed-session note is flagged medium/high risk. Cutoffs (ORS cutoff, RCI threshold) read from practice settings.
- **PTR-II manual flag**: Closed clients who started above the ORS cutoff (so PTR-I can't auto-classify them) can be manually flagged as premature terminations from the client view; the flag feeds PTR-II and the Final PTR rate.
- **Predicted progress vs. cohort**: The client detail progress chart now overlays a prognosis band built from a cohort of clients whose **initial ORS started within ±5** of the current client. Requires ≥5 similar clients and ≥3 scored sessions for the current client before a band is drawn; falls back to an "insufficient data" state otherwise.

### API
- New `GET /api/reports` — computes all closed-client outcome metrics plus the live at-risk count.
- New `GET /api/clients/[id]/predicted-progress` — returns the cohort-based trajectory band for one client.
- `PATCH /api/clients/[id]` now accepts `prematureTerminationManual`.

### Database
- Added `clients.premature_termination_manual boolean` (nullable). Migration `drizzle/0002_add_ptr_manual.sql` (idempotent `ADD COLUMN IF NOT EXISTS`). The column was already live in the shared Neon DB via `drizzle-kit push`; note that this migration is not registered in the Drizzle journal.

---

## [3.2.0] - 2026-06-06
### Added
- **Pro-rata short-session billing**: Sessions are now billed by the nearest 15-minute quartile of actual time instead of a flat hour — e.g. 30 min → 0.5×, 45 min → 0.75×. The 53–70 min "standard hour" grace band is preserved (still bills 60), and >70 min continues to bill pro-rata upward. Applies on note finalize when a fee scheme is linked and the fee hasn't been manually overridden.
- **Cancellation fee quick-fill**: The Cancel / No-Show dialog gained **0% / 50% / 100%** buttons that fill the fee field with that fraction of the session fee. Free-text entry still works.
- **Session time filters — Today, This Week, Custom Range**: Added Today and This Week options, and activated the previously-disabled **Custom Range** (From/To IST date inputs). The default Sessions view is now **This Month**.
- **Sortable Client column**: Clicking the **Client** header on the Sessions ledger toggles alphabetical sort (ascending → descending → off), overlaid on the default newest-first date order.
- **ORS / SRS direct decimal entry**: The score number boxes now accept typed decimals (e.g. `7.5`) directly — a local typing buffer preserves the decimal point that a controlled numeric value used to strip. Canonical scores stay numeric, so the save payload is unchanged.

### Changed
- **Sessions Duration column**: Completed sessions show the **actual** clocked duration (black) with the **billed** minutes always shown beneath; scheduled sessions show their **planned** duration in blue. Cancelled / no-show rows stay neutral.
- **Default Sessions filter** is now This Month (was YTD).
- **Unbilled-client picker** on the Invoices page is ordered **alphabetically** (case-insensitive).
- **Sessions list** keeps newest-first with a `created_at` tie-breaker for sessions sharing a scheduled time (e.g. recurring batches).
- **Client Add & Edit dialogs widened**: the base `DialogContent` pins `sm:max-w-sm`, which a plain `max-w-*` couldn't override, clamping the dialogs to ~384px on desktop. Now `sm:max-w-2xl` (Add) / `sm:max-w-3xl` (Edit) for roomier fields.

### Fixed
- **Time filters leaked future-dated sessions**: the Sessions time filters were lower-bound only ("This Month" meant "this month and everything after"), so recurring sessions booked months ahead appeared under Today / This Week / This Month / YTD. Each filter is now a closed-open range `[start, end)` bounded on both sides.

### Timezone helpers
- `istStartOfFYUTC()` accepts an optional `ref` so the FY end boundary can be derived; added `istStartOfDayUTC()` and `istStartOfWeekUTC()` (Monday-anchored).

### Data
- **One-time pro-rata backfill**: recomputed invoiced duration + fee for 15 completed, **not-yet-invoiced** sessions under the new rule. Already-invoiced sessions were never touched. Sessions carrying a flat `feeCharged` with no fee-scheme link kept their fee by design (only the billed minutes were corrected). The temporary admin endpoint used for this was removed after the run.

---

## [3.1.2] - 2026-05-20
### Fixed
- **New Session double-submit creating duplicate rows**: The Schedule button stayed clickable while the POST was in flight, so a quick second tap (iPad touch latency) produced two identical sessions seconds apart. Added a `scheduling` state guard: the handler returns early if already submitting, the button is disabled and shows a spinner ("Scheduling…"), and the dialog can't be closed mid-submit. A duplicate Ridhima Bahl row from this bug was cleaned up directly in the DB.

---

## [3.1.1] - 2026-05-18
### Changed
- **Sessions Ledger — Time column reflects reality**: For completed sessions where the clinical note captured an actual start/end different from the scheduled time, the Time column now displays the **actual** times (with a small "actual" tag) instead of the scheduled times. Scheduled, cancelled, and no-show rows still show the scheduled times. Helps when the counselor logs a session retroactively with default times — the row stops misrepresenting when the session actually happened.

---

## [3.1.0] - 2026-05-07
### Added
- **Void Invoice**: Each invoice row that isn't paid, already void, or has any payment recorded against it now has a Trash button. Clicking it opens a confirm dialog ("voiding will release N sessions back to unbilled"). On confirm, the invoice is marked `void`, its line items are deleted, and every linked session's `invoice_id` is reset to `NULL` — so those sessions reappear in the unbilled picker and can be batched again. Available in both Test Mode and live mode (the safety is the payment / status guard, not the mode).
- **Void Status Pill**: New grey strike-through `Void` badge so voided invoices remain visible in the ledger for audit. They're filtered the same as other statuses.

### Changed
- **Confirm Payment Button**: Now hidden on `void` invoices (in addition to `draft` and `paid`).

### API
- New `POST /api/invoices/[id]/void`. Returns 400 if the invoice is already void/paid or carries any recorded payment.

---

## [3.0.0] - 2026-05-07
### Added
- **Sessions Ledger Compacted**: Merged Start + End into a single "Time (IST)" column, merged Sch./Act./Inv. into one "Duration" column (shows invoiced minutes primary, actual minutes secondary only when they differ), trimmed Date to `EEE, d MMM`, and iconified the Actions column (XCircle = cancel/no-show, Trash = delete, FileText = view/write note). The table now fits comfortably under 1100 px without horizontal scrolling.
- **Cancel / No-Show Dialog with Fee**: Cancel button on Scheduled sessions opens a unified dialog with a Cancellation / No-Show type toggle, a fee field (defaults to 100% of the session fee), and the existing optional reason. Setting the fee to `0` skips billing.
- **Cancelled / No-Show Sessions Now Invoiced**: Batch invoice generation and the "unbilled" picker on the Invoices page now include cancelled and no-show sessions when their `cancellationFee > 0`. Line-item descriptions read "Late cancellation — 5 May 2026 (reason)" or "No-show — 5 May 2026" so they're distinct from regular session lines.
- **Invoice Test Mode**: New toggle in Settings → Invoice Test Mode. When ON, every invoice and receipt email is rerouted to the counselor's own address with a `[TEST → client@…]` subject prefix and a yellow banner inside the body. Invoices stay in `draft` while test mode is on, so the counselor can flip the toggle off and re-send for real. Backed by a new `practice_settings.email_override boolean` column.
- **Recurring Sessions**: New Session dialog gained a "Repeat this session" toggle with frequency (Week / Fortnight / 3 Weeks / 4 Weeks) and total session count (capped at 52). On submit, the API inserts the whole batch in one shot, each row sharing the same time-of-day and fee, with only the date advancing.
- **One-Click Confirm Payment + Auto-Receipt**: Every non-draft, non-paid invoice row on the Invoices page now has a green "Confirm Payment" button. It opens a pre-filled dialog (amount = outstanding, date = today in IST, method = UPI, currency = invoice currency) with a "Email receipt to client" toggle on by default. Recording the payment updates the invoice's `amountPaid` + status and emails a green-branded receipt PDF/HTML to the client. Receipt emails also honor Test Mode.

### Changed
- **Status Badge for Billed Cancellations**: A cancelled or no-show session that has been added to an invoice now shows "Cancelled • Billed" (rose) or "Cancelled • Paid" (green) — visually distinct from uncharged cancellations (slate).
- **Sessions Status PATCH**: `PATCH /api/sessions/[id]` now accepts `cancellationFee` and applies the invoiced-session guard to both `cancelled` and `no_show` transitions.

### Database
- Added `practice_settings.email_override boolean NOT NULL DEFAULT false`. Migration ran via `/api/admin/run-migration` (and a one-shot script for the working DB).

---

## [2.9.1] - 2026-05-07
### Added
- **Hard Delete for Sessions**: Trash icon on every Sessions Ledger row that hasn't been invoiced. Confirm dialog warns when an attached clinical note will be removed alongside the session. Deletion is blocked at the API layer for any session whose `invoiceId` is set, preserving invoice integrity.

### Changed
- **Clients List Ordering**: The Clients page now lists clients alphabetically by name (case-insensitive) instead of by creation date.

---

## [2.9.0] - 2026-05-07
### Added
- **IST as System-Wide Source of Truth**: All wall-clock times the counselor enters and views are now interpreted as IST regardless of where the browser or server runs. Introduced `src/lib/tz.ts` (`formatIST`, `formatTz`, `istToUTC`, `istDateTimeToUTC`, `istStartOfMonthUTC`, `istStartOfFYUTC`, etc.) built on `date-fns-tz`.
- **Per-Client Timezone**: New `clients.timezone` column (defaults to `Asia/Kolkata`). Add/Edit Client dialogs now expose a curated dropdown (IST, US ET/CT/MT/PT, UK, CET, Gulf, Singapore, Sydney). Existing clients are seeded to IST and stay there until the counselor changes them.
- **Dual-Time Sessions Ledger**: For non-IST clients, the Start, End, and Actual columns show the IST instant on the primary line and the client's local time as a secondary `7:30 AM ET`-style line.

### Changed
- **Clinical Note Editor — IST Times**: Actual Start / End fields are formatted and parsed strictly in IST and converted to absolute UTC instants on save, eliminating drift from the previous browser-local `setHours` path.
- **Sessions Form**: New-session form's date/time defaults and submit conversion now use IST helpers; the FY / month filter and `resetForm` defaults switched to IST anchors.
- **Server-Side Date Math**: Dashboard, payments outstanding summary, and invoice batch endpoints now compute month-start, FY-start, "next 7 days", default `billingMonth`, invoice-number year, and default `paymentDate` against IST instead of the runtime's local TZ (Vercel runs in UTC).
- **Display Formatting**: Payments, Invoices, Fees, and Clients pages, the invoice email body, and the per-client progress chart axis labels all render dates/times via `formatIST`.

### Fixed
- **ORS Toggle Crash on Older Notes**: `ScoreSelector` was calling `value.toFixed(1)` on values that came back from Drizzle as strings (numeric columns are returned as strings), throwing on render and showing the dialog's error overlay. The component now coerces incoming `value` to a `number` once and the fetch path + total calculations route through a `num()` helper so accumulators no longer string-concatenate.
- **Appearance That "Editing Actual Time Messed Up the Appointment Time"**: Root cause was browser-vs-server TZ drift in the editor's wall-clock parsing. Now both the displayed scheduled time and the stored actual time are anchored to IST, so the original appointment time stays put.

### Database
- Added `clients.timezone text NOT NULL DEFAULT 'Asia/Kolkata'`. Migration step added to `/api/admin/run-migration`.

---

## [2.8.0] - 2026-05-03
### Added
- **Automated Billing Formula**: Sessions now follow a strict duration-based billing logic.
  - Up to 70 mins → invoiced as 60 mins.
  - Over 70 mins → rounded to the nearest 15-minute quartile (75, 90, 105, etc.).
  - `feeCharged` is automatically recalculated upon finalizing a clinical note based on this formula.
- **Clinical Note "Blind Mode"**: Added a Precise/Blind toggle for ORS and SRS sliders. Blind mode removes all numbers, colors, and tick marks to prevent anchoring bias during assessments.
- **Session Time Tracking**: Captures `Actual Start Time` and `Actual End Time` within the clinical note editor (defaults to scheduled times).
- **Payment Ledger Filters**: Added Client-wise and Period-wise (Month/Year) filtering to the Payments page.
- **Payment Auto-Currency**: Recording a new payment now automatically sets the currency (USD/INR) to match the selected client's default fee scheme.
- **Sessions Ledger Duration Columns**: Replaced standard duration with three detailed columns: Scheduled, Actual (with exact clock times), and Invoiced duration.

### Changed
- **System-wide Dropdown Sync**: Completely resolved the "raw UUID gibberish" issue across all dialogs and pre-filled dropdowns. Enforced explicit manual children overrides in `<SelectValue>` to bypass `@base-ui/react`'s lazy mounting limitations.
- **Clinical Note Default State**: "Blind Mode" is now universally enforced as the default view when opening the note editor. 
- **Risk Assessment UI**: Removed Total Score badges from Blind Mode entirely, and stripped the Risk Status column out of the main Sessions ledger for a cleaner operational view.
- **Dialog Architecture**: Restored proper `DialogTrigger` registration using the `@base-ui/react` `render=` pattern, fixing the "View Note" dialog error.

### Fixed
- **Payment Ledger Filtering**: Wired up the visual client/period filters on the payments page to correctly apply to the local payments array.
- **Session Legacy Dates Crash**: Created fallback safe date strings in the note editor to prevent rendering crashes caused by malformed/missing legacy database timestamps.
- **Mary Lennon $ Display**: Standardized currency symbol fallback on the Clients page. Profiles without an assigned fee scheme now display fee amounts neutrally rather than defaulting incorrectly to INR.
- **Database Schema**: Added `actual_start_time`, `actual_end_time`, and `invoiced_duration_min` to the `sessions` table.
- **Timezone Shift on Session Notes**: Moved date-and-time combination logic to the client-side browser to construct precise UTC ISO strings, preventing the server from applying a 5.5 hour IST offset to user inputs.
- **Pending Invoice Currency Bug**: Patched the invoice batching API and unbilled revenue summaries to dynamically trace back to the `clients.defaultFeeSchemeId` instead of falling back to INR when a standalone session lacks a fee scheme.
- **Clients Table Currency Display**: Removed the hardcoded `IndianRupee` icon from the main Clients list and replaced it with a dynamic currency switch bound to the client's default scheme.
- **Sessions Ledger Currency Display**: Fixed the main Sessions table to fall back to the client's default fee scheme when a session lacks a specific fee scheme, matching the Invoicing behavior.
- **Dropdown Gibberish**: Fixed the lazy-mounting UUID text bug on the 'Add New Client' modal's Default Fee Scheme dropdown.
- **Missing Cancel Button Text**: Re-added the "Cancel" text label next to the cancellation icon on Scheduled sessions for clarity.

---
 
## [2.7.0] - 2026-05-03
### Added
- **Payment Delete & Re-enter**: Each payment row in the Payments Ledger now has a delete (trash) icon. On confirmation, the payment is deleted and the linked invoice's `amountPaid` and status are automatically recalculated. Use this to correct data entry errors by deleting the wrong amount and re-entering the correct one.

### Changed
- **Sessions Table**: Removed the 4 ORS Prev / ORS Now / SRS Prev / SRS Now columns to reduce horizontal clutter. The **Risk Status** badge column is retained. Remaining column widths are adjusted proportionally.
- **Dashboard**: Simplified the Practice Overview. Removed 5 boxes: Upcoming (7 Days), Risk Flags, Deteriorating, Dissatisfied, and No-Show Rate. The dashboard now shows only the two most actionable stats (Unbilled Sessions + Outstanding Revenue) alongside Quick Actions and Session Tracking.

### Fixed
- **ORS/SRS Arithmetic Type Errors**: Resolved pre-existing TypeScript build failures in `api/sessions/route.ts` and `api/clients/[id]/progress/route.ts` caused by Drizzle returning `numeric(5,1)` columns as `string | number`. All values are now explicitly cast to `Number()` before arithmetic operations.

---

## [2.6.0] - 2026-05-03

### Added
- **Session Cancellation**: Added a Cancel button for scheduled sessions with a confirmation reason dialog.
- **Active Clients Filter**: "Active Clients" is now the default filter on the Sessions tab, hiding sessions from terminated clients by default.
- **Invoiced Status**: Sessions that have been invoiced but not yet paid now correctly display an **Invoiced** badge (instead of just "Completed").
- **Multi-Currency Batch Invoicing**: The batch invoice generation popup now correctly displays split totals for INR and USD when mixed currency clients are selected.
- **System-wide Currency Audit**: Fixed hardcoded INR symbols in batch popup rows, client detail stat cards, and invoice group headers.

### Fixed
- **Note Save Error**: Resolved the "Failed to Save Note" error caused by a database type mismatch. ORS/SRS scores now support decimal values (0.1 increments) in the database.
- **Client Filter Labels**: Improved the client filter dropdown labels to be more descriptive.

---

## [2.5.0] - 2026-05-03
### Added
- **Duplicate Email Conflict Flow**: System now detects if a new client's email matches an existing profile.
  - Offers **"Restart / Reactivate"** for returning clients (sets to active and clears termination data).
  - Offers **"Create New Anyway"** for family members sharing an email.
  - Restart flow automatically opens the profile for review.
- **Termination — Session Handling**: Termination dialog now asks if pending sessions should be invoiced. If not, they are automatically marked as **Cancelled** to clean up the batch invoice generator.
- **Client Details — Schedule Button**: Wired the "Schedule Session" button to navigate to the Sessions page and auto-open the scheduling dialog pre-filled for that client.
- **Edit Profile — Currency Control**: Replaced static fee input in Edit Profile with a full **Fee Scheme selector**. Allows switching a client between INR and USD schemes.
- **Terminated Badges**: Added high-visibility "Terminated" badges next to client names in the **Invoices** and **Payments Ledger** views for better financial context.
- **Deep-linking**: Sessions page now supports `openNew=true` URL parameter to trigger the scheduling dialog on mount.

### Fixed
- **Sessions Filter Dropdowns**: Resolved the bug where raw UUIDs were displayed in the client filter and lowercase raw strings in the time filter after selection. Both now show human-readable labels.
- **Fee Auto-population**: Selecting a client in the New Session dialog now automatically populates their **Default Fee Scheme** and estimated amount.

---

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
