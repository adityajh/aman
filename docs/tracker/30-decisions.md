# Decisions

Decisions that are expensive to reverse, with who took them and when. A
decision is here because somebody will otherwise re-open it without knowing it
was ever closed. The business decisions have their full reasoning in
`business/`; this table points at it.

| ID | Decision | Taken | Status |
|---|---|---|---|
| DD-01 | Never sell to organisations, at any price | Strategy, Jul 2026 | [[done]] |
| DD-02 | A published never-build list | Strategy, Jul 2026 | [[done]] |
| DD-03 | One plan at ₹999, founding 50 at ₹699, Pro ₹1,999 later | Adi, 17 Aug 2026 | [[done]] |
| DD-04 | Do not sign the measures licence; record scores, never administer instruments | Adi, 31 Aug 2026 | [[done]] |
| DD-05 | Online payments through each counsellor's own Razorpay, by OAuth; Deepen never holds funds | Adi, Nov 2026 | [[done]] |
| DD-06 | Cold outreach is in; from `outreach.deepen.health`, replies to `adi@deepen.health` | Adi, 22 Nov 2026 | [[done]] |
| DD-07 | Bank details are per practice; no default account | Adi, 17 Nov 2026 | [[done]] |
| DD-08 | Free accounts are billing-exempt tenants, ended by hand from `/admin` | Standing | [[open]] |
| DD-09 | This page is repo markdown plus a generated page | Adi, 23 Nov 2026 | [[done]] |

---

## DD-01: Never sell to organisations

Not to platforms, employers or startups. The same outcome feature that helps a
counsellor who chose it harms one who has it imposed by an employer. No
supervisor view, no rankings, no badges. Reasoning in
`business/strategy/03-business-strategy.md` sections 3 and 3.5.

## DD-02: The never-build list

Scheduling, telehealth, booking pages, insurance, directories, AI note drafting,
GST, expense management, clinic management, badges, gamification. When someone
asks, the answer is a link to the list, not a roadmap conversation.

## DD-03: Pricing

One plan at ₹999 a month with a 40 monthly-active-client soft limit; the
founding 50 at ₹699 for 12 cycles, then ₹999; Pro at ₹1,999 later, gated by the
`PRACTICE_OUTCOMES` flag. Decision of 17 Aug 2026 in
`business/commercial/pricing-and-build-plan-2026-08.md`. The client limit was
broadened to monthly active clients on 28 Oct 2026 (CHANGELOG 5.0.7).

## DD-04: The measures position

Deepen records ORS and SRS scores a counsellor collected on paper under their own
licence. It does not supply or administer the instruments. The licence offered
was not signed, because it would cost the benchmark pool permanently. The one
real exposure is eight item labels copied into the note editor; fixing them is
lawyer-gated. Canonical statement:
`business/commercial/2026-08-31-measures-position.md`.

## DD-05: Online payments

Each counsellor connects their own Razorpay account by OAuth. Money goes from the
client to the counsellor's Razorpay to their bank. Deepen never holds funds,
which keeps it outside RBI payment-aggregator rules. Receipts go out
automatically by default; INR only for now. Built on
`feat/razorpay-connect-payment-links`, not yet run against Razorpay.

## DD-06: Cold outreach

The operating plan of July ruled cold outreach out. Adi reversed that on
22 Nov 2026. Campaigns send from Hostinger mailboxes on `outreach.deepen.health`
so complaints attach to the subdomain, not to the domain the app's invoices will
use. Replies and one-to-one mail go to `adi@deepen.health`. Never send a
campaign from an `@deepen.health` address. `business/strategy/07-operating-plan.md`
section 3.2 still lists cold outreach as ruled out and needs updating.

## DD-07: Bank details per practice

Until 17 Nov 2026 every practice's invoices printed one hardcoded bank account.
Now five optional settings columns hold each practice's own details, and the
original practice's details were moved into its own settings.

## DD-08: Free accounts

Two ways exist: the promo code `FREEBIE` at signup, and creating the account by
hand. Both make a billing-exempt tenant with no client limit and no expiry. There
is no automatic trial end. `FREEBIE` is hardcoded and reusable by anyone who
learns it. Open: whether to replace it with single-use codes from `/admin`.

## DD-09: How this page is kept

Repo markdown plus a generated page, the same arrangement as the Outreach
Orchestrator, so it is reviewed in diffs and checked for drift rather than
edited in a wiki nobody checks.
