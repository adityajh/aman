# Database change required · consent columns (migration 0009)

*18 August 2026. For the agent that owns the database. Code is already deployed on `preview`; the database has not been changed. Until this runs, creating a client and signing up will fail with "column does not exist".*

## What to run

File: `drizzle/0009_consent.sql` on the `preview` branch. Five statements, all `ADD COLUMN IF NOT EXISTS`, safe to run more than once, no data rewritten, no downtime.

```sql
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "terms_accepted_at" timestamp with time zone;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "terms_version" text;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "pool_consent" text DEFAULT 'not_asked' NOT NULL;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "pool_consent_at" timestamp with time zone;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "pool_consent_method" text;
```

Run it against the database the `preview` deployment uses. When `preview` merges to `main`, run the same file against production. Order relative to earlier migrations does not matter; it only adds columns.

How: `drizzle-kit migrate` from the repo root with the right `DATABASE_URL`, or paste the SQL into the Neon SQL editor. Either is fine. `drizzle/meta` was deliberately not updated for 0009; if drizzle-kit complains about the journal, paste the SQL instead and add the journal entry afterwards.

## Why these columns exist

- `tenants.terms_accepted_at`, `tenants.terms_version`: the moment a counsellor ticked "I've read the terms and the privacy note" at signup, and which version she agreed to (currently `2026-08-18`). The signup API now refuses to create an account without it. Do not backfill existing tenants with a fake date; leave null and let them re-accept when we add that prompt.
- `clients.pool_consent` (`yes` | `no` | `not_asked`, default `not_asked`), `clients.pool_consent_at`, `clients.pool_consent_method` (`in_person` | `paper` | `message`): the client's answer to the intake consent for the comparison pool, captured on the client record. This is the consent the whole data strategy depends on: it binds us to the purpose named at collection, and only clients marked `yes` may ever feed the pool. Existing clients default to `not_asked`, which is correct; do not backfill `yes`.

## Verify after running

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'tenants' AND column_name IN ('terms_accepted_at','terms_version');
SELECT column_name, column_default FROM information_schema.columns
WHERE table_name = 'clients' AND column_name LIKE 'pool_consent%';
```

Expect two rows and three rows. Then in the app: add a client with consent "Yes, in person" and confirm `pool_consent = 'yes'` and `pool_consent_at` is set; sign up a test account and confirm `terms_accepted_at` is set.

## Related, not part of this migration

- The pool itself is not built. Nothing reads `pool_consent` yet except the client form and the client record.
- Terms and privacy pages were rewritten to the data strategy one-pager wording (never sell or licence client-level data; never insurer, employer or platform as customer; anonymous comparisons and published aggregate psychometrics are the only two uses of de-identified data). If you touch anything that exports or aggregates client data, those two pages are the contract.
