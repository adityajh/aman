# Backlog

Open items, with the status each is actually in. An item leaves this list by
being done or by being decided against, not by going quiet.

## Security and data

| Item | Status |
|---|---|
| Reset the database password; update Vercel and the cloud environment | [[blocked]] needs Adi |
| Pool `error` handler so connection drops stop logging the password | [[todo]] after the reset |
| Delete `scratch/direct-migrate.js` (holds the old password) | [[todo]] after the reset |
| Mark `DATABASE_URL`, `RESEND_API_KEY`, `NEXTAUTH_SECRET`, `ADMIN_PASSWORD` as Sensitive in Vercel | [[todo]] needs Adi |
| Subscription webhook: reachable through the middleware, and refuses unsigned calls | [[open]] |
| `FREEBIE` is hardcoded and reusable; replace with single-use codes | [[open]] decision |
| Audit log table exists, nothing writes to it | [[open]] |

## Correctness

| Item | Status |
|---|---|
| "Hosted in India" on home, privacy and terms pages; database is us-east-1 | [[now]] |
| App email sends as one counsellor's personal Gmail for every practice | [[open]] |
| Receipt numbers computed across all practices, not per practice | [[open]] |
| 10 session notes whose ORS total does not equal the sum of its four items | [[open]] check with the clinical co-founder |
| Signup shows ₹999 even when a free code is entered | [[todo]] |

## Product and copy

| Item | Status |
|---|---|
| Eight instrument item labels reproduced in the note editor (measures A1) | [[wait]] lawyer review |
| "PCOMS default" in Settings (measures A2) | [[todo]] |
| De-default the instrument thresholds (measures A3) | [[wait]] Adi's decision on first-run flags |
| Measures notice, licence checkbox and Measures page (measures B) | [[todo]] |
| Progress chart uses red and "At risk", "Distress", "Behind similar clients"; the brand guide asks otherwise | [[open]] |
| Rename to Deepen not finished in code (`package.json`, seed data) | [[open]] |

## Documentation

| Item | Status |
|---|---|
| `07-operating-plan.md` section 3.2 still rules out cold outreach | [[todo]] |
| `usage_guide.md`: reminders are not automatic; invoices are emails, not PDFs | [[todo]] lands with the payments branch |
| `aman_architecture.md` describes the April single-counsellor design | [[open]] |
| README says MIT; there is no LICENSE file and the package is private | [[open]] Adi's call |
| Merge `docs/outreach-mailbox-setup` (mailbox notes and the agent's report) | [[todo]] |
