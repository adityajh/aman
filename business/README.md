# Aman — Business Workspace

Everything commercial lives here. Code stays in `src/`. Technical docs stay at repo root (`aman_architecture.md`, `CHANGELOG.md`, `usage_guide.md`).

## The thesis, in one sentence

> **In India there is no way to tell a good counsellor from a bad one — including for the counsellor themselves. Aman gives counsellors evidence of their own effectiveness, privately, so they can improve. Business is a byproduct.**

## The document set

Compiled 31 July 2026. These seven cross-reference each other by filename — keep them together in this folder.

| # | File | What it is | Read it when |
|---|---|---|---|
| **01** | `01-icp-research.md` | Voice of the Indian counsellor: pains, needs, gains, willingness to pay | Deciding who this is for or what they'll pay |
| **02** | `02-market-analysis.md` | Competitive landscape — 3 Indian, 2 global measurement specialists, plus Zoho | Making competitor claims, or pricing |
| **03** | `03-business-strategy.md` | **The core document.** Thesis, ICP, the two things we do, the never-build list, the medicine/poison line | Start here. Everything derives from it |
| **04** | `04-pricing-plan.md` | Plans, anchoring logic, revenue model, what must be validated first | Before printing a price anywhere |
| **05** | `05-homepage-content.md` | Ready-to-paste home page copy, section by section | Handing to a build agent |
| **06** | `06-homepage-build-spec.md` | Structure, comparison tables, copy rules, build order | Alongside 05 |
| **07** | `07-operating-plan.md` | GTM, 3-user beta, discipline rules, milestones, risk register | Weekly |

**Reading order for someone new:** 03 → 01 → 04 → 07.
**For a build agent:** 05 + 06, with the copy rules in 06 §2 treated as hard constraints.

*Superseded and deleted: `aman-business-plan-v2.md` — its content lives in 03, 04 and 07.*

## Working folders

New work accumulates here rather than in the numbered set above.

| Folder | What goes in it |
|---|---|
| `research/` | Follow-up market research, competitor re-verification, DPDP and IP review notes, supervision-rate findings |
| `commercial/` | Financial models, revenue tracking, launch plans, anything downstream of 03/04/07 |
| `marketing/` | Website copy iterations, webinar materials, SEO posts, the 6-minute Loom script, campaign briefs |
| `customers/` | Beta interview notes, support log, objections, testimonials |

When a working doc supersedes part of the numbered set, update the numbered doc and note it — don't leave two live versions.

## Conventions

- **Filenames:** `YYYY-MM-DD-slug.md` for dated material (interviews, research runs, campaigns). Plain `slug.md` for living documents.
- **Every doc opens with a date line and a status:** `draft` / `active` / `superseded`.
- **Mark estimates as estimates.** The set above is scrupulous about separating verified from inferred — maintain that. See `README` § "verified vs assumed" in `07` and the blocking items list.
- **Superseded docs go to `_archive/` inside their folder**, not the bin. The reasoning history matters.

## Before committing

Confirm `github.com/adityajh/aman` is private. If it's public, add `/business/` to `.gitignore` and keep this tree local until the repo is locked down.
