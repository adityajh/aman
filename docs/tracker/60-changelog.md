# Changelog

Most recent first. Product changes are logged in full in `CHANGELOG.md`; this
tab adds the operational events around them (accounts, DNS, infrastructure)
that never reach that file.

## 23 November 2026

- This page created, generated from `docs/tracker/` by a copy of the Outreach Orchestrator's generator.

## 22 November 2026

- **Mail for `deepen.health` and `outreach.deepen.health`.** Hostinger mailboxes on Let's Enterprise's hosting at no cost: `hello@`, `adi@` and `shardul@` on the outreach subdomain; `adi@` and `shardul@` on the main domain; `support@deepen.health` as an alias. SPF, DKIM and DMARC records added in Vercel; all three pass at Gmail for both domains.
- **Account `shardul-gupta` created by hand**, billing-exempt, after the signup form appeared to ask him for payment. The `FREEBIE` path was tested and works; the cause on his side was not established.
- **Cold outreach adopted** (DD-06). The outreach board itself is run by a separate agent.

## 17 November 2026

- **5.0.9: bank details per practice.** Every practice's invoices had printed one hardcoded account. Five settings columns added by hand-applied SQL; the original practice's details moved into its own settings.
- **5.0.8: billing read the wrong practice.** Four unscoped `tenants` lookups fixed.
- Branches from the previous agent pushed to GitHub. `docs/sync-project-docs` and `docs/client-diary-scope` merged to `main`; `feat/razorpay-connect-payment-links` remains open.
- Vercel connected to the cloud session. Found: the database password printed in Vercel runtime logs, and app email sending as one personal Gmail account.

## Earlier

See `CHANGELOG.md`, from 1.0.0 on 5 Apr 2026 to 5.0.7 on 28 Oct 2026, and the
handover of 17 Nov 2026 (`HANDOVER-2026-11-17-project.md`).
