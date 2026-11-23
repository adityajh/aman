# Architecture

What the system is, and the mechanisms that are not obvious from reading the
code in file order.

## The stack

Next.js 16 App Router, React 19, TypeScript, Drizzle ORM on Neon Postgres,
NextAuth v4 with email and password, Tailwind and shadcn/ui, hosted on Vercel.
Three things differ from what you may expect:

- The middleware file is still `src/middleware.ts`. Next 16 warns that the convention is now `proxy.ts`; it has not been renamed.
- Route context params are async: `await params`, not `params`.
- `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so a type error does not fail the deploy. `npx tsc --noEmit` currently reports zero errors; keep it that way by running it yourself.

## Tenant isolation

Every practice is a row in `tenants`. Every clinical and money table carries
`tenant_id`, with row-level security enforced and one policy each:
`tenant_id = current_setting('app.current_tenant_id')`.

`withTenantContext(tenantId, fn)` opens a transaction, runs
`SET LOCAL ROLE authenticated` (a role without `BYPASSRLS`) and sets the tenant.
Inside it, a query that forgets its `WHERE tenant_id` is still scoped. That is
the point.

:::warn
`tenants`, `users` and `promo_codes` have **no** row-level security. A query on
them inside `withTenantContext` is not scoped. `tx.query.tenants.findFirst()`
with no `where` returned whichever practice Postgres listed first; four places
did exactly that until 17 Nov 2026 (CHANGELOG 5.0.8). Always filter these
tables by ID yourself.
:::

Login, signup, admin and the Razorpay webhook use a second connection (`db`,
the HTTP driver) with no tenant context at all. Code using `db` must scope by
hand.

## Two database drivers

| | `db` | `dbPool` |
|---|---|---|
| Driver | Neon HTTP | Neon WebSocket pool |
| Used by | login, signup, admin, webhooks, receipt numbering | everything inside `withTenantContext` |
| Tenant scoping | none | row-level security |

The pool has no `error` handler. When Neon closes an idle connection the error
is unhandled and logged with the whole client config, which is how the database
password reached Vercel's logs.

## Money

The rules that are load-bearing:

- **Pro-rata billing** by 15-minute quartile of actual time, with a 53 to 70 minute band billed as a standard hour. Manual fee overrides are never recalculated.
- **Invoice numbers** are `MAX(suffix) + 1` per tenant per year. Never `count + 1`; that once produced duplicates (CHANGELOG 3.5.1).
- **Receipts** are the client-facing payment record; `payments` rows are allocations of a receipt across invoices, oldest first. Receipt numbers are currently computed across all tenants, not per tenant (see Backlog).
- **INR and USD are never summed together**, anywhere.
- **Bank and UPI details** on invoices come from each practice's own settings (CHANGELOG 5.0.9). The block is left out if a practice has entered neither.

## Time

All wall-clock times are IST via `src/lib/tz.ts`, whatever the server's zone.
Every date range is closed-open, `[start, end)`.

## Email

All app email (invoices, receipts, reminders, progress charts) goes out over
Gmail SMTP as one personal Gmail account, set in Vercel as `SMTP_USER`. The
sender name shows the practice; the account is the same for every practice.
Resend is installed and keyed in Vercel but unused. `deepen.health` now has
working mail (Hostinger, SPF, DKIM, DMARC), so moving to it is unblocked.

Settings has a Test Mode (`practice_settings.email_override`) that redirects a
practice's client emails to the counsellor. Use it for any test of a send path.

## Schema changes

Drizzle's migration journal lists only `0000` to `0004`, and the live database's
`drizzle.__drizzle_migrations` table is empty. Everything since was applied by
hand. **Do not run `drizzle-kit push` or `migrate` against production.**

One-off SQL goes in `drizzle/manual/`, is reviewed by Adi, and runs once. Write
it additive and idempotent (`ADD COLUMN IF NOT EXISTS`). Apply it **before**
pushing code that needs it: Drizzle selects every column it knows about, so new
code against an old schema fails on that table.

## Deploys

Every push builds on Vercel, and **preview deployments use the production
database**. Never push a branch whose code needs a schema change that has not
been applied: the preview breaks, and anyone who opens it writes to live data.

## Running it from a cloud session

The cloud environment "Deepen" holds the connection string as
`AMAN_DATABASE_URL` and allows the database hosts. Two things are needed:

- `NODE_USE_ENV_PROXY=1`, for the HTTP driver.
- A preload shim that tunnels `tls.connect` to `*.neon.tech` through the HTTPS proxy, for the WebSocket pool, which ignores proxy settings. It lives in the session scratchpad and has to be recreated each session.
