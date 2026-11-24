# Deepen (formerly Aman) - Project Instructions

## What this is

A clinical practice management product for solo counsellors in India, built around one thing nobody else does: telling a counsellor whether their clients are actually getting better. The product works and is in daily use by one practice. **This project is about turning it into a business.**

Repo: `github.com/adityajh/aman` (`main`). Local: `~/Documents/Antigravity/Aman`.

**Read `business/strategy/03-business-strategy.md` before doing substantive work.** The full document set and reading order are in `business/README.md`.

## Who

- **Adi**, co-founder, builds the product, owns the commercial side.
- **The clinical co-founder**, practicing counsellor. Clinical authority, only live user, and the only real distribution asset (warm introductions).

## The thesis

> In India there is no way to tell a good counsellor from a bad one, including for the counsellor themselves. Aman gives counsellors evidence of their own effectiveness, **privately**, so they can improve. Business is a byproduct.

Admin is the wedge. The "am I any good?" question is the product. Pro (₹1,999) is the business; Practice (₹999) is a capped wedge that wins on ease of setup, not features. Zoho gives the admin layer away free, so it has no pricing power.

## Honest state

*Revenue and tenant count last stated August 2026; re-check before quoting. Product facts checked against the code 17 November 2026.*

Zero revenue, one free tenant. Signup now takes a Razorpay subscription with a 7-day trial, and clients can be bulk-imported (up to 100 at a time). There is still no onboarding flow. **Automated measure delivery does not exist.** Counsellors type scores by hand, which is the single biggest product gap. The Outcome Report doesn't exist either. Pricing is inferred, not validated.

Online payments for counsellors' clients (Razorpay Connect) are built on the `feat/razorpay-connect-payment-links` branch, not merged or live.

Never claim revenue, customers plural, or validated pricing.

## Hard rules

**Medicine vs poison.** ICP research found a therapist harmed by outcome measurement imposed from above. The same feature helps or harms depending on who holds it. Non-negotiable: never sell to organisations, at any price. No employer/supervisor view. No comparative rankings, public badges, directories, streaks or gamification. Flags describe the client, never the clinician. The practice dashboard always carries the "this describes a caseload, not a clinician" line.

**Never-build list** (`strategy/03` §3): scheduling · telehealth · booking pages · insurance · directories · AI note drafting · GST · expense management · clinic management · badges · gamification. When someone asks, the answer is a link to the list, not a roadmap conversation.

**Copy rules** (`strategy/06` §2, hard constraints): never name a specific outcome instrument in public copy until IP review clears · never say "multi-tenant" or "row-level security" · never claim the software improves outcomes · never claim novelty (OQ-Analyst got there in the 1990s) · never say competitors have no measurement · concede the losing rows openly · every statistic needs a real citation · all screenshots use fabricated demo data.

**Operating constraint:** 10–12 founder-hours/month. Self-serve only, no demos ever, email support only. Judge every idea by whether it adds support or sales load.

## North star

> **Counsellors who have recorded outcome scores for four consecutive weeks.**

Not signups, not MRR. Judge product decisions against it.

## Build order

1. Strip instrument names from public copy · rename the product · IP review
2. Onboarding under five minutes
3. **Automated measure delivery** (re-scope the Phase 4 portal), highest-value unbuilt thing
4. **The Outcome Report**
5. Benchmark pool, the only compounding moat

## Where things go

`business/`, numbered docs 01–07 are the canonical set; `research/`, `commercial/`, `marketing/`, `customers/` accumulate new work. See `business/README.md`.
Root. `aman_architecture.md`, `CHANGELOG.md` (the real history), `usage_guide.md`.

## Engineering guardrails

Next.js 16 · React 19 · Neon Postgres · Drizzle · NextAuth v4 · Vercel.

1. **This is not the Next.js in your training data.** Read `node_modules/next/dist/docs/` first.
2. **Every tenant-scoped DB call goes through `withTenantContext()`** (`src/lib/tenant.ts`), with `tenantId` set on inserts. A leak here is a clinical-data breach.
3. **Never hard-delete clinical records.** Clients are soft-deleted (`is_active = false`). The `audit_log` table exists but nothing writes to it yet, so there is no change history. Receipts and payment allocations are hard-deleted when a counsellor removes one; the invoice totals are recalculated.
4. **Money logic is load-bearing**, pro-rata 15-min quartiles with the 53–70 min grace band, manual overrides honoured, invoice numbers from `MAX+1`, INR and USD never mixed.
5. **IST timezone**. `src/lib/tz.ts`; ranges are `[start, end)`.
6. Update `CHANGELOG.md` for anything user-visible, then run `npm run build:tracker` and commit `docs/tracker/index.html` with it: the plan and tracker page (`docs/tracker/`) renders `CHANGELOG.md` as its Changelog tab, and `npm run check:tracker` fails if the two drift.
7. **There is one database.** `.env.local` and Vercel previews point at the production Neon database (AWS us-east-1). Test write paths with a throwaway client and Settings → Test Mode. Schema changes are applied by hand as SQL; the Drizzle journal is not kept in sync. Put one-off SQL in `drizzle/manual/`.

## How to work here

- Be concrete and numerate. Show the arithmetic, state the assumptions.
- **Keep verified and inferred separate.** The document set is rigorous about this; match it. Don't invent traction, competitor features, or market figures.
- Push back. If a plan won't survive 10 founder-hours a month, say so.
- Write deliverables into `business/`, not walls of chat text.

## Blocking / unverified

1. **Rename to Deepen, partly executed.** `practiceSettings` now defaults to blank practice and counsellor names. The repo, package name and some internal strings still say Aman. TM search still open.
   - **Still blocking:** the invoice email (`src/app/api/invoices/[id]/send/route.ts`) hardcodes one person's HSBC bank account in the Payment Information block, for every practice.
2. **Indian supervision rates**, the primary pricing anchor for Pro, not found. Ask the clinical co-founder before any price goes public.
3. **Willingness to pay ₹1,999**, inferred from credential-buying behaviour, not observed. Beta question 1 tests it.
4. **IP review** of the pluggable-instrument model, blocks launch.
5. **Competitor cells**, inferred from marketing pages. Re-verify before publishing any comparison.
6. ~~**ORS scale inconsistency**~~ Resolved: the editor records each item 0–10 and stores totals 0–40 (`ors_total`, `srs_total`), which is what Reports uses.
7. **"Hosted in India" is not true today.** The home page, privacy page and terms say data is hosted in India. The Neon database is in AWS us-east-1. Either move the database to an India region or change the wording. Legal pages, so treat as blocking.
8. **Instrument item labels still reproduced.** The note editor still shows the eight ORS/SRS item labels word for word, and "PCOMS" appears in Settings. That is group A of `HANDOVER-measures-AB-2026-08-31.md`, not yet done.
