# Status

Live status as of 23 November 2026. Practice figures were read from the
production database that day; deploy and settings figures from Vercel.

## Production

| | |
|---|---|
| Latest app release | CHANGELOG 5.0.9, per-practice bank details (`33c2bf3`, 17 Nov 2026) |
| Production deploys | [[done]] every push to `main` since has built and gone live |
| Runtime errors | One cluster: 35 "terminating connection" errors since July. Each log entry prints the full database URL, password included (see Backlog) |
| Database password | [[blocked]] exposed, not yet reset. `DATABASE_URL` in Vercel unchanged since April |
| Row-level security | [[done]] on and enforced on all 10 clinical and money tables |

## Practices

Six accounts.

| Practice | Plan | Billing | Clients | Sessions | Last completed session |
|---|---|---|---|---|---|
| `aman-counseling` | Pro | Exempt | 80 | 717 | 22 Nov 2026 |
| `aj-test` | Pro | Exempt | 12 | 48 | 7 Sep 2026 |
| `test-account` | Deepen | Founding, subscribed | 0 | 0 | none |
| `ishwari` | Deepen | Founding, subscribed | 1 | 1 | none |
| `private-practice` | Deepen | Founding, subscribed | 25 | 1 | none |
| `shardul-gupta` | Deepen | Exempt, free | 0 | 0 | none |

`shardul-gupta` was created by hand on 22 Nov 2026 with a temporary password.
Its terms-accepted date is empty, because nobody ticked the box on his behalf.

## North star

> Counsellors who have recorded outcome scores for four consecutive weeks.

**One.** In the 28 days to 23 Nov 2026, 56 session notes with an outcome score
were recorded, all by one practice. No paying practice has recorded a score
yet.

## Open risks

| Risk | Status |
|---|---|
| Database password exposed in Vercel runtime logs, the repo (`scratch/direct-migrate.js`) and chat logs | [[blocked]] reset needed by Adi |
| Every practice's app email sends from one counsellor's personal Gmail | [[open]] |
| "Hosted in India" claimed on home, privacy and terms pages; the database is in us-east-1 | [[open]] |
| Eight instrument item labels reproduced word for word in the note editor | [[wait]] lawyer review |
| Razorpay subscription webhook redirected to `/login`, and unsigned when its secret is unset | [[open]] |

## Work streams

| Stream | Where it stands |
|---|---|
| Online payments (Razorpay Connect) | [[wait]] branch `feat/razorpay-connect-payment-links`, behind `main`, never run against Razorpay. Blocked on Razorpay partner setup |
| Client diary | [[wait]] scope on `main` (`business/strategy/08-client-diary-scope.md`). Waiting on Adi's designs |
| Outreach | [[now]] separate agent. Blocked on mailbox passwords at the outreach board |
| Measures compliance | [[wait]] groups A and B of `HANDOVER-measures-AB-2026-08-31.md`, not started. A1 wording is lawyer-gated |
