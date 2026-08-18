# Deepen — Pricing Plan and Code Change Plan

*17 August 2026, v1.1. Supersedes the pricing sections of 03 and 04. Written for the agent building this. Read the whole file before touching code. v1.1 adds the definition of "active", the 90-day nudge, and the home page v2 reference.*

---

## Part 1 · The pricing plan

### 1.1 The decision

One plan at launch. Everything switched on, including measurement. Pro arrives later, above it, when the Outcome Report exists.

| | **Deepen** | **Deepen Pro** |
|---|---|---|
| Price | **₹999 / month** | ₹1,999 / month |
| Status | Live at launch | Not sold until the Outcome Report ships |
| Billing | Monthly only. **No annual option for now.** | Monthly only |
| Feature flag | `deepen` | `pro` |
| Fence | One counsellor. **Up to 30 active clients.** | Same fence |

**Founding 50.** The first fifty paying counsellors pay **₹699 / month**, locked for at least three years. Stated at signup. Counted server-side, never by hand.

**No free tier.** 14-day trial, card at signup, no charge until the trial ends.

### 1.2 What is in each

**Deepen (₹999)**, the whole product as it exists today:

- Clients, sessions, structured notes, clinical history, termination workflow
- Batch monthly invoicing, receipts, part-payments, credits, pro-rata and cancellation fee logic, multi-currency batches
- A short check-in recorded each session, a progress chart per client, an alert when a client is sliding
- Full export, any time

**Deepen Pro (₹1,999)**, the practice layer. Everything in Deepen, plus:

- Predicted progress (where a client is likely to end up)
- The practice outcomes dashboard (whole caseload on one screen; always carries the line "these numbers describe a caseload, not a clinician")
- The Outcome Report (PDF, generated on demand, counsellor decides who sees it) — *not built*
- Benchmark comparison, opt-in and anonymous — *not built*

The line between the two is the question being answered. **Deepen answers "how is this client doing." Pro answers "how am I doing."** Never describe the split as basic versus advanced, or admin versus clinical.

### 1.3 Why this shape

- Measurement sits in the cheapest plan because a counsellor who has never measured will not pay extra for it. They have to experience it first. A paywall means the sceptics never do.
- Two of Pro's four features do not exist. Nothing is sold that is not built.
- One plan is the easiest possible thing to explain to a non-technical buyer, and it removes a decision from signup.
- Admin is included and never charged for separately. In India the admin layer is worth ₹0 (PracFlow ₹0 + 5%, PractiPal free to five clients, Zoho free). We do not compete there and we say so.
- ₹999 keeps clear of PractiPal's ₹1,499, which is the price at which a buyer starts counting features. Deepen loses a feature count on purpose.
- Founding 50 at ₹699 is the low entry Adi wanted, without setting ₹699 as the permanent floor. It can become permanent later if the market says so; the reverse move is not available.

### 1.4 The fence, and what it is not

The 30-active-client cap exists for one reason: to stop a group or organisation running several counsellors through one account. **It is not an upgrade lever and must never read as one.** Copy above the line does not say "upgrade". It says Deepen is built for one counsellor.

**Definition of "active".** An active client is one the counsellor has not terminated. That is the whole definition. It is a count of open client records (`clients.isActive = true`), not a monthly activity meter. It has nothing to do with sessions this month or invoices this month. Terminated clients keep their full record forever and do not count.

Rules:

- Active clients only. Terminated clients never count.
- The counsellor moves a client between active and terminated. The system never does it for her. Termination is a clinical decision (it carries a reason and a planned/unplanned type that feed the outcome data), so it stays a human call.
- The system may **suggest**: a client with no session in 90 days gets a quiet note on the clients list with Terminate one click away. Suggest, never auto-close. A client on a planned break is still hers.
- Reactivating a terminated client is allowed and is checked against the fence exactly like a new client.
- Terminating a client to make room, then reactivating them later, is fine. It is their record. The fence is a fence, not a trap. Say this in the terms.
- One login per account. No seats, no invites, ever.
- Existing clients, sessions, notes, scores and invoices are **never** blocked by the fence. Only the creation or reactivation of a 31st active client is refused.
- Admin can exempt a tenant (existing `isExempt`).

### 1.5 The pitch, in order

1. Your month closes in ten minutes. *(the trigger)*
2. And it quietly keeps track of how each client is doing, so by session three you'll know. *(the wound, said softly)*
3. For one counsellor. Nobody else can see your data, including us.

Never lead with measurement. Never lead with fee increases.

### 1.6 Copy rules that bind every screen touched here

- Never name a specific outcome instrument in public copy. Say "a short check-in" or "an outcome measure". (Internal code may keep existing names.)
- Never say "multi-tenant" or "row-level security".
- Never claim the software improves outcomes. Never claim novelty. Never say competitors have no measurement.
- Concede the losing rows openly (scheduling, booking pages, video, payment gateway).
- All screenshots use fabricated demo data.

### 1.7 Numbers

Break-even at ₹999 flat is roughly 65 paying counsellors. Pro lifts it when it lands. Until automated check-in delivery ships, judge the first year on retention and the invoicing habit, not the north star.

### 1.8 Still open (do not resolve in code)

- Instrument licensing and IP review. Copy is instrument-agnostic pending that.
- Whether founding stays at 50 or extends. Server-side cap makes this a one-line change.
- Whether ₹699 becomes the permanent list price. Decide with beta data, not before.

---

## Part 2 · Code change plan

Stack: Next.js 16, React 19, Neon Postgres, Drizzle, NextAuth v4, Razorpay, Vercel. Read `node_modules/next/dist/docs/` before touching routing or server code; this is not the Next.js in training data.

Order matters. Steps 1 to 4 must land together, in one PR, because step 1 changes what the flag strings mean.

### Step 1 · Feature flags · `src/lib/tenant.ts`

Replace `PLAN_FEATURES` with two tiers that reflect the two layers. Keep `hasFeature()` signature.

```ts
const PLAN_FEATURES: Record<string, string[]> = {
  deepen: [
    "CLIENT_MANAGEMENT",
    "BILLING",
    "SESSION_NOTES",
    "CLINICAL_MEASUREMENT",   // check-in per session, per-client chart, alerts, progress mail
    "FINANCIAL_REPORTS",
  ],
  pro: [
    "CLIENT_MANAGEMENT",
    "BILLING",
    "SESSION_NOTES",
    "CLINICAL_MEASUREMENT",
    "FINANCIAL_REPORTS",
    "PRACTICE_OUTCOMES",      // predicted progress, practice outcomes dashboard, outcome report, benchmark
    "PDF_EXPORT",
  ],
};
```

- Drop `SCHEDULING` (never-build list) and the old `REPORTS`, `PROGRESS_CHARTS` (declared, never checked).
- Default tier in `getTenantContext()` becomes `"deepen"`, not `"basic"`.
- Treat legacy `"basic"` as `"deepen"` inside `hasFeature()` during migration.

### Step 2 · Schema · `src/lib/db/schema.ts` + migration

On `tenants`:

```ts
planTier: text("plan_tier").$type<"deepen" | "pro">().notNull().default("deepen"),
isFounding: boolean("is_founding").notNull().default(false),
foundingSeat: integer("founding_seat"),          // 1..50, null otherwise
priceInrMonthly: integer("price_inr_monthly"),   // 999 | 699 | 1999, what this tenant actually pays
```

Migration: `UPDATE tenants SET plan_tier = 'deepen' WHERE plan_tier = 'basic'`. Existing `pro` tenants (the live practice) stay `pro`.

### Step 3 · Gate the practice layer

Today `/api/reports` computes the entire practice outcomes engine with **no gate**. Harmless when nobody below Pro could record a score. The moment measurement is on for everyone, this route gives the practice layer away. Fix before shipping.

- `src/app/api/reports/route.ts`: split the response into `financial` (always) and `clinical` (only if `hasFeature(planTier, "PRACTICE_OUTCOMES")`). Do not compute the clinical section for tenants without the flag; return `clinical: null` with `locked: true`.
- `src/app/api/clients/[id]/predicted-progress/route.ts`: change the check from `CLINICAL_MEASUREMENT` to `PRACTICE_OUTCOMES`.
- Leave `progress`, `progress/mail`, `sessions/[id]/note` on `CLINICAL_MEASUREMENT`. They open automatically once the flag moves into `deepen`.

### Step 4 · Locked-but-visible practice layer in the UI

Hidden features never get upgraded to. Show them, greyed.

- `src/app/dashboard/reports/page.tsx`: render the financial section normally; render the clinical section as a locked panel with the copy: **"How are you doing, across all of them? That's Deepen Pro. Coming."** No price, no button, until Pro is sellable.
- Client page: predicted progress card shows the same locked treatment.
- `src/components/sidebar.tsx`: replace the "Pro Tier" badge with a small tier label for both tiers ("Deepen" / "Deepen Pro"). Nothing in nav is gated.
- The practice dashboard, when unlocked, keeps its permanent line: *these numbers describe a caseload, not a clinician.*

### Step 5 · The fence · 30 active clients

The active/terminated state machine already exists and is not to be rebuilt: `clients.isActive`, the Terminate flow (reason, planned/unplanned, optional cancel of un-invoiced sessions, `terminatedAt`) and the Reactivate action in `src/app/api/clients/[id]/route.ts` PATCH and `src/app/dashboard/clients/page.tsx`. Build on it.

- `src/app/api/clients/route.ts` POST: before insert, count `clients` where `tenantId` and `isActive = true`. If `>= MAX_ACTIVE_CLIENTS` and tenant is not `isExempt`, return `403` with `{ error: "CLIENT_LIMIT", message }`.
- Same check on the reactivate path (`src/app/api/clients/[id]/route.ts` PATCH when `isActive` flips false → true).
- Do **not** touch sessions, notes, scores, invoices, payments. The fence blocks nothing except a 31st active client.
- Soft banner at 25 active clients on the clients list page, showing the count: "27 of 30 active clients."
- **90-day nudge.** On the clients list, any active client with no session in the last 90 days shows a muted note ("no session in 90 days") and the existing Terminate action next to it. Nothing is closed automatically. No email, no push. Just the note. Compute it in the existing clients GET (last session date per client is one query); do not add a cron.
- Rename user-facing "Terminated" to "Closed" where it appears as a badge or filter, if that is a one-line change; keep the field name. Optional; skip if it touches more than the clients page.
- Fence copy (both banner and 403):
  > Deepen is built for one counsellor. Thirty active clients is more than one person can see, so we stop here. If you're a group or an organisation, Deepen isn't for you. If this is a mistake, write to us.
- Add a single line to Terms: one counsellor per account.
- Add `MAX_ACTIVE_CLIENTS = 30` as a named constant in `src/lib/tenant.ts`, not a magic number.

### Step 6 · Signup · `src/app/signup/page.tsx` + `src/app/api/signup/route.ts`

- Remove the plan picker. One plan. `planTier` is always `"deepen"`.
- Show price: **₹999 / month**. If founding seats remain, show instead: **₹699 / month · Founding 50 · locked for three years · N seats left.** N comes from the API, never hard-coded.
- Remove every mention of annual pricing.
- Subscription description string becomes `Deepen Monthly Subscription` (or `Deepen Founding Monthly Subscription`).
- Copy under the price, three lines, in this order: *Your month closes in ten minutes. · It quietly keeps track of how each client is doing. · For one counsellor. Nobody else can see your data, including us.*
- Keep the `FREEBIE` bypass and `isExempt` as they are.

### Step 7 · Razorpay · `src/app/api/create-subscription/route.ts`

- Two Razorpay plans, monthly, no annual: **Deepen ₹999** and **Deepen Founding ₹699**. Create them in the Razorpay dashboard; put the IDs in env (`RAZORPAY_PLAN_DEEPEN`, `RAZORPAY_PLAN_FOUNDING`). Verify the amount on the existing `plan_TOl5mRuFjG4FZM` before reusing it as the ₹999 plan; do not assume.
- The route no longer accepts `planTier` from the client. It decides server-side:
  1. Count tenants where `isFounding = true`. If `< 50`, use the founding plan and reserve the seat.
  2. Else use the ₹999 plan.
- Reserve the seat atomically (transaction, or a `founding_seats` table with a unique seat number) so two signups in the same second cannot both take seat 50.
- On successful signup, write `isFounding`, `foundingSeat`, `priceInrMonthly` to the tenant.
- `total_count` stays at 100 (Razorpay's cap). The three-year lock is a promise we keep, not a Razorpay setting; founding tenants are never migrated to a higher plan without their consent.
- Remove the old `pro` plan ID from this route. Pro is not purchasable yet.

### Step 8 · Home page · `src/app/home/page.tsx`

A full redesign mock exists at `business/marketing/_working/home-mock-2026-08.html` (v2, ~530 words). Rebuild the page to that structure and copy: hero "Run your practice. Know it's working." · three-layer cards · one proof section · privacy band · one plan · four FAQs · close. Specifics that must land regardless:

- Pricing section: one card, **Deepen ₹999 / month**, with the founding line beneath it while seats remain. One muted line under it: **Deepen Pro, ₹1,999, arrives with the Outcome Report.** No second card, no button.
- Remove the invented "thousands who started in a similar place" claim, the uncited "industry average is 8–10%", the "0.82 Overall Progress" tile, and every use of "alert" (brand lexicon: flag, something to look at, worth a closer look).
- Remove `₹9,990/year` and `₹19,990/year`.
- Rename "Practice" to "Deepen" wherever the old tier name appears, including the FAQ answer at the "I don't measure outcomes at the moment" question. New answer: *Yes. Your notes and billing get sorted either way, and the check-in is there when you're curious. Nobody sees it but you.*
- Comparison table: keep the losing rows (scheduling, video, gateway) and mark them lost. Header for the Indian column should not overstate their price; verify PractiPal ₹1,499 and PracFlow ₹1,199 to ₹1,499 on the day.
- Remove the paragraph that says an Indian practice tool "doesn't measure anything". Copy rule: never say competitors have no measurement.
- No instrument names anywhere on the page.

### Step 9 · Admin · `src/app/admin/page.tsx`

- Show `planTier`, `isFounding`, `foundingSeat`, `priceInrMonthly` per tenant.
- Add a "founding seats used: N / 50" counter.
- Add a manual "set tier to pro" toggle (admin only, for the live practice and for beta), so Pro can be granted before it is sellable.

### Step 10 · Verify

- [ ] New tenant lands on `deepen`, can record a check-in, see a per-client chart, receive a slide alert, send progress mail.
- [ ] New tenant on `deepen` calling `/api/reports` gets `financial` and `clinical: null, locked: true`. Never the clinical numbers.
- [ ] `predicted-progress` returns 403 for `deepen`, 200 for `pro`.
- [ ] Existing `pro` tenant sees no change anywhere.
- [ ] 31st active client returns 403 with the fence copy; sessions and invoices for existing clients still work at 30.
- [ ] Reactivating a terminated client at 30 active is refused; terminating one and then reactivating works.
- [ ] Terminated clients do not count toward 30. A tenant with 40 terminated and 29 active can add a client.
- [ ] A client with no session in 90 days shows the nudge; nothing about that client changes without the counsellor acting.
- [ ] Banner reads "N of 30" from 25 upward and is absent below 25.
- [ ] Two concurrent signups cannot both take founding seat 50.
- [ ] Signup shows ₹699 while seats remain, ₹999 after, and never a plan picker or the word "annual".
- [ ] `grep -ri "annual\|9,990\|19,990\|basic\|Practice tier"` across `src/app` returns nothing user-facing.
- [ ] No instrument name in any public route or component under `src/app/home` or `src/app/signup`.

### Step 11 · Docs to update after the code lands

- `business/strategy/04-pricing-plan.md`: replace with Part 1 of this file.
- `business/strategy/03-business-strategy.md` §4 and §6: one plan now, Pro later, founding 50, no annual.
- `business/strategy/02-market-analysis.md` §2 and §7: verified competitor prices (17 Aug 2026): PractiPal free to 5 clients / ₹1,499; PracFlow ₹0 + 5% with all premium features / ₹1,499 monthly / ₹1,199 annual.
- `business/strategy/05-homepage-content.md`: replace with the v2 mock copy.
- `CHANGELOG.md`.

### Reference mocks (demo data, not to be copied verbatim into the app)

- `business/marketing/_working/home-mock-2026-08.html` — home page v2
- `business/marketing/_working/outcome-report-mock-2026-08.html` — the Outcome Report, plain-language v2. Not part of this build; it is what Pro will sell.

---

## What this deliberately does not do

No annual billing. No client portal or automated check-in delivery (that is build item 3 and the most important thing on the roadmap, but it is not this PR). No Outcome Report. No benchmark. No Pro checkout. No invoice-value meter. No commission of any kind, ever.
