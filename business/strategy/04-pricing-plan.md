# Deepen — Pricing Plan and Code Change Plan

*17 August 2026, v1.1. Supersedes the pricing sections of 03 and 04. Written for the agent building this. Read the whole file before touching code. v1.1 adds the definition of "active", the 90-day nudge, and the home page v2 reference.*

---

## Part 1 · The pricing plan

### 1.1 The decision

One plan at launch. Everything switched on, including measurement. Pro arrives later, above it, when the Outcome Report exists.

| | **Deepen** | **Deepen Pro** |
|---|---|---|
| Price | **₹999 / month** | ₹1,999 / month |
| Status | Live at launch | Not sold until the Outcome Report ships |
| Billing | Monthly only. **No annual option for now.** | Monthly only |
| Feature flag | `deepen` | `pro` |
| Fence | One counsellor. **Up to 30 active clients.** | Same fence |

**Founding 50.** The first fifty paying counsellors pay **₹699 / month**, locked for 12 months, distributed via a manual coupon code.

**No free tier.** 14-day trial, card at signup, no charge until the trial ends.

### 1.2 What is in each

**Deepen (₹999)**, the whole product as it exists today:

- Clients, sessions, structured notes, clinical history, termination workflow
- Batch monthly invoicing, receipts, part-payments, credits, pro-rata and cancellation fee logic, multi-currency batches
- A short check-in recorded each session, a progress chart per client, an alert when a client is sliding
- Full export, any time

**Deepen Pro (₹1,999)**, the practice layer. Everything in Deepen, plus:

- Predicted progress (where a client is likely to end up)
- The practice outcomes dashboard (whole caseload on one screen; always carries the line "these numbers describe a caseload, not a clinician")
- The Outcome Report (PDF, generated on demand, counsellor decides who sees it) — *not built*
- Benchmark comparison, opt-in and anonymous — *not built*

The line between the two is the question being answered. **Deepen answers "how is this client doing." Pro answers "how am I doing."** Never describe the split as basic versus advanced, or admin versus clinical.

### 1.3 Why this shape

- Measurement sits in the cheapest plan because a counsellor who has never measured will not pay extra for it. They have to experience it first. A paywall means the sceptics never do.
- Two of Pro's four features do not exist. Nothing is sold that is not built.
- One plan is the easiest possible thing to explain to a non-technical buyer, and it removes a decision from signup.
- Admin is included and never charged for separately. In India the admin layer is worth ₹0 (PracFlow ₹0 + 5%, PractiPal free to five clients, Zoho free). We do not compete there and we say so.
- ₹999 keeps clear of PractiPal's ₹1,499, which is the price at which a buyer starts counting features. Deepen loses a feature count on purpose.
- Founding 50 at ₹699 is the low entry Adi wanted, without setting ₹699 as the permanent floor. It can become permanent later if the market says so; the reverse move is not available.

### 1.4 The fence, and what it is not

The 30-active-client cap exists for one reason: to stop a group or organisation running several counsellors through one account. **It is not an upgrade lever and must never read as one.** Copy above the line does not say "upgrade". It says Deepen is built for one counsellor.

**Definition of "active".** An active client is one the counsellor has not terminated. That is the whole definition. It is a count of open client records (`clients.isActive = true`), not a monthly activity meter. It has nothing to do with sessions this month or invoices this month. Terminated clients keep their full record forever and do not count.

Rules:

- Active clients only. Terminated clients never count.
- The counsellor moves a client between active and terminated. The system never does it for her. Termination is a clinical decision (it carries a reason and a planned/unplanned type that feed the outcome data), so it stays a human call.
- The system may **suggest**: a client with no session in 90 days gets a quiet note on the clients list with Terminate one click away. Suggest, never auto-close. A client on a planned break is still hers.
- Reactivating a terminated client is allowed and is checked against the fence exactly like a new client.
- Terminating a client to make room, then reactivating them later, is fine. It is their record. The fence is a fence, not a trap. Say this in the terms.
- One login per account. No seats, no invites, ever.
- Existing clients, sessions, notes, scores and invoices are **never** blocked by the fence. Only the creation or reactivation of a 31st active client is refused.
- Admin can exempt a tenant (existing `isExempt`).
