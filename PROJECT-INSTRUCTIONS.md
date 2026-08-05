# Aman — Project Instructions

## What this is

A clinical practice management product for solo counsellors in India, built around one thing nobody else does: telling a counsellor whether their clients are actually getting better. The product works and is in daily use by one practice. **This project is about turning it into a business.**

Repo: `github.com/adityajh/aman` (`main`). Local: `~/Documents/Antigravity/Aman`.

**Read `business/03-business-strategy.md` before doing substantive work.** The full document set and reading order are in `business/README.md`.

## Who

- **Adi** — co-founder, builds the product, owns the commercial side.
- **Vijay** — co-founder, practicing counsellor. Clinical authority, only live user, and the only real distribution asset (warm introductions).

## The thesis

> In India there is no way to tell a good counsellor from a bad one — including for the counsellor themselves. Aman gives counsellors evidence of their own effectiveness, **privately**, so they can improve. Business is a byproduct.

Admin is the wedge. The "am I any good?" question is the product. Pro (₹1,999) is the business; Practice (₹999) is a capped wedge that wins on ease of setup, not features — Zoho gives the admin layer away free, so it has no pricing power.

## Honest state

Zero revenue, one free tenant. No payment collection, no trial enforcement, no onboarding, no data import. **Automated measure delivery does not exist** — counsellors type scores by hand, which is the single biggest product gap. The Outcome Report doesn't exist either. Pricing is inferred, not validated.

Never claim revenue, customers plural, or validated pricing.

## Hard rules

**Medicine vs poison.** ICP research found a therapist harmed by outcome measurement imposed from above. The same feature helps or harms depending on who holds it. Non-negotiable: never sell to organisations, at any price. No employer/supervisor view. No comparative rankings, public badges, directories, streaks or gamification. Flags describe the client, never the clinician. The practice dashboard always carries the "this describes a caseload, not a clinician" line.

**Never-build list** (`03` §3): scheduling · telehealth · booking pages · insurance · directories · AI note drafting · GST · expense management · clinic management · badges · gamification. When someone asks, the answer is a link to the list, not a roadmap conversation.

**Copy rules** (`06` §2, hard constraints): never name a specific outcome instrument in public copy until IP review clears · never say "multi-tenant" or "row-level security" · never claim the software improves outcomes · never claim novelty (OQ-Analyst got there in the 1990s) · never say competitors have no measurement · concede the losing rows openly · every statistic needs a real citation · all screenshots use fabricated demo data.

**Operating constraint:** 10–12 founder-hours/month. Self-serve only, no demos ever, email support only. Judge every idea by whether it adds support or sales load.

## North star

> **Counsellors who have recorded outcome scores for four consecutive weeks.**

Not signups, not MRR. Judge product decisions against it.

## Build order

1. Strip instrument names from public copy · rename the product · IP review
2. Onboarding under five minutes
3. **Automated measure delivery** (re-scope the Phase 4 portal) — highest-value unbuilt thing
4. **The Outcome Report**
5. Benchmark pool — the only compounding moat

## Where things go

`business/` — numbered docs 01–07 are the canonical set; `research/`, `commercial/`, `marketing/`, `customers/` accumulate new work. See `business/README.md`.
Root — `aman_architecture.md`, `CHANGELOG.md` (the real history), `usage_guide.md`.

## Engineering guardrails

Next.js 16 · React 19 · Neon Postgres · Drizzle · NextAuth v4 · Vercel.

1. **This is not the Next.js in your training data.** Read `node_modules/next/dist/docs/` first.
2. **Every tenant-scoped DB call goes through `withTenantContext()`** (`src/lib/tenant.ts`), with `tenantId` set on inserts. A leak here is a clinical-data breach.
3. **Never hard-delete.** Soft-delete plus audit log.
4. **Money logic is load-bearing** — pro-rata 15-min quartiles with the 53–70 min grace band, manual overrides honoured, invoice numbers from `MAX+1`, INR and USD never mixed.
5. **IST timezone** — `src/lib/tz.ts`; ranges are `[start, end)`.
6. Update `CHANGELOG.md` for anything user-visible.

## How to work here

- Be concrete and numerate. Show the arithmetic, state the assumptions.
- **Keep verified and inferred separate.** The document set is rigorous about this; match it. Don't invent traction, competitor features, or market figures.
- Push back. If a plan won't survive 10 founder-hours a month, say so.
- Write deliverables into `business/`, not walls of chat text.

## Blocking / unverified

1. **Product name** — `practiceSettings` still defaults to "Aman Counseling" and Vijay's real name and city. Blocks the pricing page, footer, and launch.
2. **Indian supervision rates** — the primary pricing anchor for Pro, not found. Ask Vijay before any price goes public.
3. **Willingness to pay ₹1,999** — inferred from credential-buying behaviour, not observed. Beta question 1 tests it.
4. **IP review** of the pluggable-instrument model — blocks launch.
5. **Competitor cells** — inferred from marketing pages. Re-verify before publishing any comparison.
6. **ORS scale inconsistency** — editor and schema use 0–10; Reports logic and `NOTE-FOR-VIJAY.md` describe the standard 0–40. Confirm with Vijay.
