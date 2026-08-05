# Aman — Pricing Plan

*July 2026. Derived from the market analysis and ICP research. Supersedes all earlier pricing.*

---

## 1. The plans

| | **Practice** | **Pro** |
|---|---|---|
| Monthly | **₹999** | **₹1,999** |
| Annual | **₹9,990** | **₹19,990** |
| Effective monthly on annual | ₹833 | ₹1,666 |
| Job in the business | Acquisition | Revenue |
| Feature flag | `basic` | `pro` |

**Founding member** (beta converts only): **₹11,990/year on Pro, locked for 3 years.**

**No free tier.** 14-day trial, card at signup, no charge until the trial ends.

**Annual is the default selection** on both plans.

### What's in each

**Practice** — clients · session logging · clinical notes · batch monthly invoicing · multi-currency batches · receipts, part-payments and credits · pro-rata and cancellation fee logic · full export

**Pro** — everything in Practice, plus: sessional outcome measurement · deterioration flags · per-client progress charts · Predicted Progress · practice outcomes dashboard · the Outcome Report · PDF export

---

## 2. The anchoring decision — this is the important part

### What Aman is *not* priced against

Practice-management software. That comparison loses before it starts:

| Competitor | Solo price/mo | Notes |
|---|---|---|
| **Zoho Invoice + Zoho Bookings** | **₹0** | Free forever. Invoicing, payment collection, expense tracking, client portal, reports, scheduling, reminders. Indian, GST-native |
| PracFlow | ₹1,199 annual / ₹1,499 monthly | Or 5% commission with no fixed fee |
| PractiPal | ₹1,499 | Free tier to 5 clients |
| Therasoft India | ₹699–999 floor | ₹79–129 per appointment above minimum |

**The admin layer in India is worth ₹0.** No pricing argument survives contact with that. Practice is not priced to win this comparison — it is priced to make assembling the free stack not worth a non-technical counsellor's afternoon.

### What Pro *is* priced against

**The things Indian counsellors already pay money for in order to get better at their work.**

The ICP research is clear that the client-facing fee ladder is sorted almost entirely by credential — trainee, independent counsellor, experienced psychotherapist, clinical psychologist, RCI registration, overseas training. Counsellors respond rationally: they buy credentials. CBT, DBT and EMDR certifications, TISS and institute programmes, supervision hours.

They demonstrably pay for **things that make them better and things that let them charge more.** They demonstrably do not pay for admin software.

Aman Pro belongs in the first category. It should be positioned, priced and marketed as professional development, not as practice management.

| Reference | Indian cost | Status |
|---|---|---|
| Certification course (CBT/DBT/EMDR) | Tens of thousands, one-off | Well evidenced |
| Clinical supervision | **Unknown — not found** | ⚠️ Must be established |
| Aman Pro | ₹1,999/mo · ₹19,990/yr | |

**⚠️ Open item: Indian supervision rates.** UK comparables run £100–160 for 1:1 and £40–80 for group per session, but no reliable Indian figure was found. This is now the primary pricing anchor and it is unverified. **Ask Vijay before any number goes on a public page.**

### Secondary anchor — the stacked alternative

For a counsellor who wants what Pro does today, the only route is stacking:

> Greenspace, for measurement alone: ~₹2,100/month
> Plus an Indian practice tool for the billing: ₹1,199–1,499
> **Aman Pro does both, plus trajectory prediction neither offers, for ₹1,999.**

Useful, but secondary. It frames Aman as software. The supervision-and-training frame is the one that supports the price.

---

## 3. Rationale, decision by decision

**Practice at ₹999, not ₹499.** Against free, the argument is never price — it's effort saved. ₹33/day versus an afternoon of Zoho setup plus permanent two-system friction is an easy case to make. Dropping to ₹499 wouldn't strengthen it and would turn the step up to Pro into a 4× jump. A 2× step is a decision; a 4× step is a re-evaluation.

**Pro at ₹1,999, not ₹1,499.** ₹1,499 puts Pro at parity with a scheduling tool, which frames Aman as a PractiPal alternative — a category it loses. ₹1,999 breaks the frame while sitting below every global measurement platform.

**Annual-first.** Indian recurring-mandate failures are a permanent admin tax. Annual means one payment and one renewal reminder per year.

**No free tier**, despite PractiPal's 5-client tier and PracFlow's commission plan. Free cohorts generate maximum support at zero revenue. A narrower, self-selecting, paying funnel is the correct trade for a low-time operator.

**Keep the `basic`/`pro` flags.** Already implemented in `tenant.ts`. No new gating architecture needed.

---

## 4. Revenue model

At a 60/40 Practice/Pro mix, blended ARPU ≈ ₹1,100/month.

| Paying users | MRR | Annualised |
|---|---|---|
| 25 | ₹27,500 | ₹3.3L |
| 50 | ₹55,000 | ₹6.6L |
| **100** | **₹1,10,000** | **₹13.2L** |
| 150 | ₹1,65,000 | ₹19.8L |

**Mix is the primary growth lever after the first 50 users.** Every 10 points shifted from Practice to Pro adds ~₹10,000/month at 100 users — cheaper than acquisition and entirely controlled by how well the free webinar and the in-app locked features convert.

**Costs at 100 users:** ~₹6,000/month infrastructure (Neon, Vercel, Resend, domain). Gross margin ~95%.

**Target: 100 paying users at ≥40% Pro mix within 18 months → ~₹1.1L/month.**

---

## 5. The fee-increase argument — and where it must not go

> Counsellors who can evidence their outcomes can defend their fees. A ₹100 increase per session across twenty sessions a month covers the subscription several times over.

This is true, and it is the strongest economic case for Pro.

**It does not go on the home page.** It belongs in the pricing FAQ, or in an email to someone already measuring at month three.

Leading with it recruits counsellors motivated by marketing rather than by curiosity — and per the ICP research, those are precisely the users whose self-reported data cannot be trusted, which degrades the benchmark pool every other user depends on. Honest users are the raw material of this business. The hook has to select for them.

---

## 6. What must be validated before committing

| # | Question | Why it matters | How |
|---|---|---|---|
| 1 | **What have you spent money on in the last year to become a better counsellor, and how much?** | The entire ₹1,999 thesis rests on this. If the answer is "nothing," the price is a fantasy | Beta interview |
| 2 | What do Indian counsellors pay for supervision? | It is now the primary pricing anchor and is unverified | Ask Vijay; ask beta users |
| 3 | Would you have assembled Zoho yourself? | Tests whether ease-of-setup is genuinely the Practice moat | Beta interview |
| 4 | Does ₹999→₹1,999 read as a step or a wall? | Tests the tier gap | Observe at conversion |

**Do not print prices publicly until questions 1 and 2 are answered.**

---

## 7. Grandfathering

Beta converts and the first 25 paying users keep their entry price for three years. Two reasons: it rewards early risk, and it preserves the option to raise prices later without punishing the people who validated the product.

State this explicitly at signup. It is also, quietly, a reason to buy now.
