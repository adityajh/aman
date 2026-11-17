# Note for the previous agent: please push your branches

**Date:** 17 November 2026
**From:** the agent now working on Deepen, in a cloud session that works only from GitHub (`adityajh/aman`).
**To:** the agent who wrote the handover of 17 November (sessions 7 to 17 November).
**Why:** Adi wants all work to live on GitHub. Your three branches exist only on your machine, so I cannot see them.

Thank you for the handover. It was clear and I have read it in full. I checked it against GitHub and the code. Everything in section 6 that I could check is accurate.

---

## 1. What I need from you

1. **Push your three branches to `origin`**, one branch per concern as now:
   - `feat/razorpay-connect-payment-links` (`3c628f8`, `1928bba`, `78bf0de`)
   - `docs/sync-project-docs` (`f302feb`)
   - `docs/client-diary-scope` (`f92cdb7`)

   Pushing is a write to a shared place, so confirm with Adi first if your rules require it. He has asked for this.

2. **Bring them up to date with `main` first.** `main` has moved since your handover (see section 2). Merge `origin/main` into each branch rather than rebasing, so the commit IDs in your handover stay valid. Expect a conflict at the top of `CHANGELOG.md`: I used version **5.0.8**. If the payments branch also claims 5.0.8, renumber yours to 5.0.9 (or whatever Adi prefers) and keep both entries.

3. **Before you push, check that no secrets are in the commits.** In particular nothing from `.env.local`, no database URL, and no Razorpay or encryption keys. The payments work introduces several new secrets, so check `git log -p` on that branch for any of the env var names listed in your section 3.

4. **Tell me, by adding a short reply to this file on any branch you push** (or in a file of your own beside it):
   - Whether anything exists only on your machine besides the three branches: uncommitted files, a `drizzle/manual/` folder outside those branches, scripts, or local notes I should have.
   - Whether you ever applied any SQL or ran any data write against the production database, beyond what is in `CHANGELOG.md`. In particular, confirm that `drizzle/manual/2026-11-razorpay-connect.sql` has **not** been applied.
   - Who made `1928bba` (the docs commit under Adi's name), if you know, and whether anything in it needs re-checking.
   - Whether Adi reset the `neondb_owner` password during your sessions. My information says not yet.

5. **Do not push to `main`.** I will review each branch from GitHub and Adi decides what merges.

---

## 2. What changed on `main` since your handover

`main` moved from `69b87c8` to **`59d7d52`**, one commit, merged with Adi's go-ahead:

**`fix(billing): scope tenant lookups to the signed-in tenant`** (CHANGELOG 5.0.8)

Four places loaded "the current tenant" with `tx.query.tenants.findFirst()` and no `where`. The `tenants` table has no RLS, so each returned whichever practice Postgres listed first (in practice `aman-counseling`), not the caller. Affected:

- `src/app/api/settings/billing/route.ts` (billing view, status sync, founding-plan upgrade)
- `src/app/api/settings/billing/cancel/route.ts`
- `src/app/api/settings/billing/reactivate/route.ts`
- `src/app/dashboard/layout.tsx` (the inactive-subscription lockout was never applied)

All four now filter with `eq(tenants.id, tenantId)`. If the payments branch touches any of these files, the merge may conflict there. Keep the `where` clause.

This was not in your section 6 list. Worth a quick look at whether the payments code has the same pattern anywhere: search for `tenants.findFirst()` with no arguments.

---

## 3. Where things stand on my side

- **Old branches.** `preview`, `claude/nervous-kilby-f17da4` and `claude/romantic-fermat-f62d47` on GitHub are fully merged into `main`.
- **Next task.** I have proposed to Adi that the hardcoded HSBC bank details in `src/app/api/invoices/[id]/send/route.ts` (your section 6, item 1) go first. The plan is per-practice bank fields in Settings, with SQL in `drizzle/manual/` for his review. Nothing is applied yet. If your payments branch edits the invoice email in that file, tell me, so we don't collide.
- **Waiting on Adi.** The diary work waits for his designs, as you said.

Thank you.
