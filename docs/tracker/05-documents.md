# Documents

Every document in the repository, what it is for, and whether it can still be
trusted. This tab is a map, not a copy: each document stays where it is, and
the link opens it on GitHub. Checked 24 Nov 2026.

**Current** means maintained and true as far as it was last checked.
**Out of date** means parts are wrong; the note says which. **Historical**
means kept as the record of a moment, not maintained.

## Start here

| Document | What it is | State |
|---|---|---|
| [PROJECT-INSTRUCTIONS.md](https://github.com/adityajh/aman/blob/main/PROJECT-INSTRUCTIONS.md) | The thesis, hard rules, never-build list, guardrails and blockers. Read first | Current |
| [AGENTS.md](https://github.com/adityajh/aman/blob/main/AGENTS.md) | Loaded automatically by every agent session (`CLAUDE.md` points here). Next.js 16 warning, then: start at this tracker, one production database, keep the tracker true | Current |
| [CHANGELOG.md](https://github.com/adityajh/aman/blob/main/CHANGELOG.md) | Every product release since 1.0.0. Rendered as the Changelog tab | Current |
| [business/README.md](https://github.com/adityajh/aman/blob/main/business/README.md) | Map of the business workspace and the order to read it in | Current |

## Product and engineering

| Document | What it is | State |
|---|---|---|
| [usage_guide.md](https://github.com/adityajh/aman/blob/main/usage_guide.md) | How a counsellor uses the app, section by section | Out of date: last updated June 2026, missing later features. The payments branch rewrites it, but two of its new lines are wrong (Backlog) |
| [README.md](https://github.com/adityajh/aman/blob/main/README.md) | Setup steps, feature list, roadmap | Out of date: old roadmap, and it claims an MIT licence that does not exist. Rewritten on the payments branch |
| [aman_architecture.md](https://github.com/adityajh/aman/blob/main/aman_architecture.md) | Full technical architecture | Out of date on `main`: describes the April single-counsellor design. Rewritten on the payments branch; the Architecture tab is current meanwhile |
| [HANDOVER-measures-AB-2026-08-31.md](https://github.com/adityajh/aman/blob/main/HANDOVER-measures-AB-2026-08-31.md) | Work spec for the measures fix: item labels, defaults, notice, Measures page | Current, not started. A1 wording needs a lawyer |
| [drizzle/NOTE-0009-consent.md](https://github.com/adityajh/aman/blob/main/drizzle/NOTE-0009-consent.md) | The consent-columns database change | Historical. The columns exist in production (checked 17 Nov 2026) |

## Strategy

| Document | What it is | State |
|---|---|---|
| [01-icp-research.md](https://github.com/adityajh/aman/blob/main/business/strategy/01-icp-research.md) | Voice of the Indian counsellor: who this is for and what they will pay | Current, July 2026 |
| [02-market-analysis.md](https://github.com/adityajh/aman/blob/main/business/strategy/02-market-analysis.md) | Competitors and pricing, India and global. Re-verify before quoting | Current, July 2026 |
| [03-business-strategy.md](https://github.com/adityajh/aman/blob/main/business/strategy/03-business-strategy.md) | The thesis, who it is for, what it is not. The document everything rests on | Current |
| [04-pricing-plan.md](https://github.com/adityajh/aman/blob/main/business/strategy/04-pricing-plan.md) | The pricing decision of 17 Aug 2026. Part 1 of the commercial build plan | Current |
| [05-homepage-content.md](https://github.com/adityajh/aman/blob/main/business/strategy/05-homepage-content.md) | Home page copy, version 2 | Current, Aug 2026 |
| [06-homepage-build-spec.md](https://github.com/adityajh/aman/blob/main/business/strategy/06-homepage-build-spec.md) | Home page build spec. Its section 2 copy rules are hard constraints | Current |
| [07-operating-plan.md](https://github.com/adityajh/aman/blob/main/business/strategy/07-operating-plan.md) | Founder hours, channels, beta, milestones, north star | Out of date: section 3.2 still rules out cold outreach (reversed 22 Nov 2026, DD-06) |
| [08-client-diary-scope.md](https://github.com/adityajh/aman/blob/main/business/strategy/08-client-diary-scope.md) | Scope for the per-client diary. Start here for that work | Current, waiting on designs |
| [08b-client-diary-design-prompt.md](https://github.com/adityajh/aman/blob/main/business/strategy/08b-client-diary-design-prompt.md) | The brief given to Claude Design for the diary layouts | Current |

## Commercial

| Document | What it is | State |
|---|---|---|
| [pricing-and-build-plan-2026-08.md](https://github.com/adityajh/aman/blob/main/business/commercial/pricing-and-build-plan-2026-08.md) | The pricing decision plus the code changes it needed | Current; the code part has shipped |
| [product-comparison-table-2026-08.md](https://github.com/adityajh/aman/blob/main/business/commercial/product-comparison-table-2026-08.md) | Plans and features side by side | Out of date: still says 14-day trial and a 30-client limit |
| [2026-08-31-measures-position.md](https://github.com/adityajh/aman/blob/main/business/commercial/2026-08-31-measures-position.md) | The canonical measures position and change list (DD-04) | Current |
| [2026-08-31-measures-licence-review.md](https://github.com/adityajh/aman/blob/main/business/commercial/2026-08-31-measures-licence-review.md) | The evidence behind the measures position | Current, reference |
| [_build-pdf.md](https://github.com/adityajh/aman/blob/main/business/commercial/_build-pdf.md) | How to regenerate the business-plan PDF from its HTML | Current |

## Marketing and research

| Document | What it is | State |
|---|---|---|
| [brand-guide.md](https://github.com/adityajh/aman/blob/main/business/marketing/brand-guide.md) | Name, voice, colour, charts, copy rules. Read before writing anything a counsellor sees | Current |
| [logo/README.md](https://github.com/adityajh/aman/blob/main/business/marketing/logo/README.md) | The logo files and how to use them | Current |
| [homepage-copy-fixes.md](https://github.com/adityajh/aman/blob/main/business/marketing/homepage-copy-fixes.md) | Corrections to the home page FAQ, 12 Aug 2026 | Historical |
| [homepage-v2-review-2026-08.md](https://github.com/adityajh/aman/blob/main/business/marketing/homepage-v2-review-2026-08.md) | Review of the home page preview build, 18 Aug 2026 | Historical |
| [homepage-v3-plan-2026-08.md](https://github.com/adityajh/aman/blob/main/business/marketing/homepage-v3-plan-2026-08.md) | Plan for home page v3 and launch terms, 18 Aug 2026 | Historical |
| [india-counselling-workforce-2036.md](https://github.com/adityajh/aman/blob/main/business/research/india-counselling-workforce-2036.md) | India's counselling workforce, 2026 to 2036, with a model | Current, research |
| [domain-check.md](https://github.com/adityajh/aman/blob/main/business/research/domain-check.md) | How `deepen.health` was chosen | Historical, settled |
| [2026-11-client-diary-research.md](https://github.com/adityajh/aman/blob/main/business/research/2026-11-client-diary-research.md) | Background research for the client diary | Current |
| [customers/README.md](https://github.com/adityajh/aman/blob/main/business/customers/README.md) | Where beta interview notes go | Current, folder still empty |

## Archive

Notes written for one moment, moved to `docs/archive/` on 24 Nov 2026. Their
live facts are on the other tabs here.

| Document | What it was | State |
|---|---|---|
| [HANDOVER-2026-11-17-project.md](https://github.com/adityajh/aman/blob/main/docs/archive/HANDOVER-2026-11-17-project.md) | The previous agent's project handover | Historical |
| [NOTE-FOR-PREVIOUS-AGENT-2026-11-17.md](https://github.com/adityajh/aman/blob/main/docs/archive/NOTE-FOR-PREVIOUS-AGENT-2026-11-17.md) | Asking the previous agent to push its branches | Historical |
| [REPLY-TO-NOTE-FOR-PREVIOUS-AGENT-2026-11-17.md](https://github.com/adityajh/aman/blob/main/docs/archive/REPLY-TO-NOTE-FOR-PREVIOUS-AGENT-2026-11-17.md) | The previous agent's reply | Historical |
| [NOTE-FOR-VIJAY.md](https://github.com/adityajh/aman/blob/main/docs/archive/NOTE-FOR-VIJAY.md) | The Reports page explained for the clinical co-founder, Jun 2026 | Historical |

## Not on `main` yet

| Where | What | State |
|---|---|---|
| Branch `feat/razorpay-connect-payment-links` | Online payments, plus the rewritten README, architecture doc and usage guide | Waiting on Razorpay setup |
| Branch `docs/outreach-mailbox-setup` | The outreach mailbox instructions, addendum and the agent's report | Ready to merge |
