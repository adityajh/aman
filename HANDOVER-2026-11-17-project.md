# Handover: Deepen project state, 17 November 2026

**For:** the agent taking this project on. You have not seen the conversations that produced this.
**From:** the previous agent session (7 to 17 November 2026).
**Owner:** Adi, co-founder. He builds the product and owns the commercial side.

Read this whole note before touching anything. Then read, in order:

1. `AGENTS.md`. This Next.js is version 16 and differs from your training data. Read `node_modules/next/dist/docs/` before writing framework code.
2. `PROJECT-INSTRUCTIONS.md`. The thesis, hard rules, never-build list, guardrails and blockers. Updated on 17 Nov to match the code (on branch `docs/sync-project-docs`, see section 2).
3. `business/marketing/brand-guide.md`. Voice, colour and copy rules. Several exist to keep counsellors safe, not just tidy.

---

## 1. Environment facts that will hurt you if you miss them

- **There is one database, and it is production.** `.env.local` and Vercel preview deployments both point at the live Neon database. Anything you run locally that writes, writes to real practices' data.
- **Never run a schema change or data write without asking Adi first.** Schema changes are applied by hand as SQL. The Drizzle migration journal is out of sync, so do not trust `drizzle-kit migrate`. One-off SQL goes in `drizzle/manual/`.
- **Test write paths** with a throwaway client and Settings → Test Mode (`practice_settings.email_override`), which redirects client emails to the counsellor.
- **Neon access.** The database host is `ep-proud-wildflower-amwa5kz2.c-5.us-east-1.aws.neon.tech` (AWS us-east-1). It is **not** in the Neon organisation the Neon MCP connector can see ("Lets Enterprise"), so Neon tools (branches, snapshots, password reset) don't work on it. It is probably a Vercel-managed Neon database; Adi was told to check Vercel → aman project → Storage. You can still reach it via the connection string in `.env.local`.
- **Credential exposure, not yet acted on.** The previous session accidentally printed the full `DATABASE_URL`, password included, into its tool log. Adi was advised to reset the `neondb_owner` password and update `.env.local` and Vercel. Assume this has not been done; remind him once.
- **Deploys.** Pushing a branch makes Vercel build a preview, and previews use the production database. Do not push a branch whose code expects a schema change that hasn't been applied. For the payments branch that matters a lot: Drizzle selects every column it knows about, so before the SQL is applied every `invoices` or `receipts` query on that preview fails (Invoices and Payments pages, sending, reminders).
- **Git.** Commit or push only when Adi asks. One branch per concern. End commit messages with the `Co-Authored-By` line in use on this repo.

---

## 2. Branches

None of these branches is pushed or merged yet. `main` is at `59d7d52` (see "Also on main" below), and each branch has had `main` merged into it, with no rebase, so the commit IDs below are stable.

| Branch | Commits on top of `main` | What it holds | Can merge? |
|---|---|---|---|
| `feat/razorpay-connect-payment-links` | `3c628f8`, `1928bba`, `78bf0de`, merge `9a7141c` | Online payments feature (section 3) plus doc updates (CHANGELOG, README, usage guide, architecture doc). `1928bba` is a docs commit made under Adi's name by someone other than the previous agent; two lines of its `usage_guide.md` edits are inaccurate (see the reply file) | **No.** Needs the schema change and Razorpay setup first |
| `docs/sync-project-docs` | `f302feb`, `06a7132`, merge `0e2e89b`, plus the commit adding the reply file | Fixes to `PROJECT-INSTRUCTIONS.md`, `business/README.md`, `drizzle/NOTE-0009-consent.md`, `NOTE-FOR-VIJAY.md`; this handover note; the reply to the cloud agent | Yes, any time |
| `docs/client-diary-scope` | `f92cdb7`, merge `fcfa920` | Client diary research, scope and design prompt (section 4) | Yes, any time |

**Also on `main`:** `59d7d52`, by the cloud agent working from GitHub. It fixes billing, cancel/reactivate and the dashboard lockout, which read whichever practice Postgres listed first instead of the signed-in one (CHANGELOG 5.0.8). Its note is `NOTE-FOR-PREVIOUS-AGENT-2026-11-17.md` on `claude/compassionate-fermat-98iytt`. The reply is `REPLY-TO-NOTE-FOR-PREVIOUS-AGENT-2026-11-17.md` on `docs/sync-project-docs`.

**CHANGELOG numbering:** online payments is `[Unreleased]`. 5.0.8 is the billing fix and 5.0.7 is monthly active clients, as on `main`. The 11 Oct bulk import is logged as `[Unversioned]`.

The README and architecture doc on the payments branch were brought in line with the whole codebase, not just payments. They reach `main` when that branch merges. Adi chose that over a separate docs branch.

---

## 3. Work stream: online payments (Razorpay Connect)

### What it is

Each counsellor connects her **own** Razorpay account by OAuth from Settings → Online payments. Invoice and reminder emails then show "Pay ₹X online" for the amount owed. The counsellor can also copy the link from an invoice's "…" menu. When the client pays, Deepen records the payment and (by default) emails a receipt. Money goes client → her Razorpay → her bank. **Deepen never holds funds.** That is deliberate: it keeps Deepen out of RBI payment-aggregator rules.

Decisions Adi made: OAuth (Option A), not pasted API keys. Receipts sent automatically by default, switchable. INR invoices only for now.

### How it works (files)

| File | Role |
|---|---|
| `src/lib/razorpay-connect.ts` | OAuth (authorize, token exchange, refresh, revoke), signed `state`, connection storage, Razorpay API calls, webhook signature check |
| `src/lib/payment-links.ts` | Link lifecycle: `ensurePaymentLink`, `syncPaymentLink`, `closePaymentLinkForVoid`, `reconcileTenantLinks`, `closeAllLinks` |
| `src/lib/record-payment.ts` | Shared payment recording (receipt + FIFO allocation). Used by manual and online payments. Extracted from `POST /api/payments` with behaviour unchanged |
| `src/lib/receipt-email.ts` | Receipt email, extracted from `/api/invoices/[id]/receipt` |
| `src/lib/secret-box.ts` | AES-256-GCM for stored tokens |
| `src/lib/pay-online-html.ts` | The email button |
| `src/app/api/payments/connect/*`, `/api/payments/connection` | Connect, callback, status, preferences, disconnect |
| `src/app/api/invoices/[id]/payment-link` | Copy-link action |
| `src/app/api/public/razorpay/{webhook,return,reconcile}` | Public routes (middleware allows `/api/public/*`) |
| `src/app/portal/paid/page.tsx` | Client thank-you page |
| `src/components/online-payments-settings.tsx` | Settings card |
| `vercel.json` | Daily cron at 02:30 UTC (08:00 IST) for `reconcile` |
| `drizzle/manual/2026-11-razorpay-connect.sql` | Schema change. **Not applied** |

**Core rule:** a payment is recorded only after Deepen fetches the link from Razorpay and sees a captured payment. Three triggers run that check: the webhook, the client's return redirect, and the daily cron. Each Razorpay payment id is recorded at most once (unique index on `receipts(tenant_id, provider_payment_id)`; a race throws `23505`, which is caught).

### Status

- Type-checks with zero errors. `next build` passes. Unit-tested with `tsx`: encryption round-trip and tamper detection, signed state, webhook signature.
- **Never run against Razorpay.** Nothing end to end has been tested.

### To go live (in order)

1. Adi applies to the Razorpay partner program and creates a **test** OAuth app. Redirect URL: `<APP_URL>/api/payments/connect/callback`. Webhook: `<APP_URL>/api/public/razorpay/webhook`, event `payment_link.paid`.
2. Set the env vars locally and in Vercel: `RAZORPAY_OAUTH_CLIENT_ID`, `RAZORPAY_OAUTH_CLIENT_SECRET`, `RAZORPAY_OAUTH_MODE=test`, `RAZORPAY_CONNECT_WEBHOOK_SECRET`, `PAYMENT_TOKEN_ENCRYPTION_KEY` (32 random bytes, base64), `CRON_SECRET`, optional `APP_URL`. The README has the details.
3. With Adi's approval, apply `drizzle/manual/2026-11-razorpay-connect.sql`. Additive only. It also enables RLS on the new table.
4. Test end to end with a throwaway client and Test Mode on: connect, send an invoice, pay with Razorpay test UPI or card, and confirm the receipt and invoice status. Also test: void with an open link, void after paying, a part-payment then resend (the stale link is replaced), disconnect, and calling the reconcile route with the cron secret.
5. Switch to `live` mode once the partner app is approved. Roll out to one beta counsellor first.

### Assumptions to verify during testing

Razorpay's docs were thin on the OAuth case. Check these first:

- **Webhook delivery.** Whether `payment_link.paid` events from connected accounts reach the partner app's webhook, and whether payloads carry a top-level `account_id`. The design tolerates both being wrong, because the return redirect and the daily cron also trigger the check.
- **Payments on a fetched link.** The shape of `payments[]` on `GET /v1/payment_links/:id` (fields `payment_id`, `amount`, `status: "captured"`, `method`, `created_at`).
- **The `mode` parameter** on the token exchange, and the token lifetimes (access token about 90 days, refresh token 180 days).
- **Fees.** Razorpay's standard rate appears to be about 2% plus GST, including UPI. Confirm before telling counsellors.

---

## 4. Work stream: client diary (not started in code)

Adi wants each client to have a "diary" or folder: a page that feels like the counsellor's own notebook for that client, warm and easy. Research, a phased feature list and a design prompt are on branch `docs/client-diary-scope`:

- `business/research/2026-11-client-diary-research.md`
- `business/strategy/08-client-diary-scope.md`. **Start here.** Phase 1 is mostly a re-layout of `/dashboard/clients/[id]` with existing data. It adds jots, a private margin and some new client fields.
- `business/strategy/08b-client-diary-design-prompt.md`. Adi took this to Claude Design to get layouts. **He said he will come back with the designs. Wait for them before building.**

The open questions are in section 10 of the scope doc (the product name for it, private notes in exports, and others). None are answered.

---

## 5. Small things done

- **Write-offs already exist:** Payments → Record Payment / Adjustment → Method "Write-off (Discount)". Adi got a user-facing how-to, now in `usage_guide.md` section 4b on the payments branch. A separate "Write off" button was proposed (choose the invoice, cap the amount at what's owed, a reason field, no receipt number). **Not approved. Don't build it unless asked.**

---

## 6. Known problems, found and deliberately not fixed

Adi said "no" when offered fixes. Raise them; don't fix them uninvited.

1. **Hardcoded bank details.** `src/app/api/invoices/[id]/send/route.ts` prints one person's HSBC account (Noida branch, account number, IFSC) in every practice's invoice email. Most serious item.
2. **"Hosted in India" is false.** `src/app/home/page.tsx`, `privacy/page.tsx` and `terms/page.tsx` say data is hosted in India. The database is in us-east-1.
3. **Instrument item labels.** The note editor reproduces the eight ORS/SRS item labels word for word, and "PCOMS" appears in Settings. That is group A of `HANDOVER-measures-AB-2026-08-31.md`, still undone.
4. **Verdict colours and wording break the brand guide.** `client-progress-chart.tsx` uses red, "Behind similar clients — review", "At risk" and "Distress".
5. **Subscription webhook unreachable.** `src/middleware.ts` doesn't exclude `/api/webhooks/*`, so Razorpay's subscription webhook gets redirected to `/login`. The handler also skips signature checks when `RAZORPAY_WEBHOOK_SECRET` is unset. Fixing the middleware alone would open an unsigned endpoint. Fix both together.
6. **Receipt numbers shared across practices.** `nextReceiptNumber()` (`src/lib/receipts.ts`) reads the highest number across all tenants, not per tenant. Receipt numbers will have gaps per practice. No error, because the unique index is per tenant.
7. **The audit log is unused.** `audit_log` exists but nothing writes to it.
8. **README licence.** It says MIT, but there is no LICENSE file and the package is private. Adi hasn't decided.

---

## 7. How Adi likes to work

- **Short, plain updates.** Outcome first. No jargon he'd have to decode.
- **Ask before anything irreversible:** database writes, schema pushes, pushes and merges, external messages.
- **He decides.** Give one recommendation, not a menu. He answers quickly ("go with A", "commit to the payments branch").
- **Keep verified and inferred separate.** The previous agent wrongly claimed the chart colours already followed the brand, and had to correct it. Check the code before stating a fact about it.
- **Docs matter to him.** Update `CHANGELOG.md` for anything user-visible. He asks for doc sweeps.
- **Writing rules** from the brand and business docs: no exclamation marks, no em-dashes in business docs, "counsellor", and "flag" rather than "alert".

---

**Coordination:** the cloud agent plans to fix item 1 next, with per-practice bank fields. The payments branch also edits that invoice email (the Pay online line sits just above the bank details). Whoever merges second resolves one small conflict. Details are in the reply file, section 4.

## 8. Suggested next steps

1. Ask Adi which comes first:
   - **(a)** Razorpay partner setup, so payments can be tested.
   - **(b)** The diary designs, if he has them.
   - **(c)** The known problems in section 6, with items 1 and 2 recommended first.
2. Remind him once about resetting the database password.
3. Before any payments testing, get his explicit go-ahead to apply the SQL in `drizzle/manual/`.
