# Deepen · Business Workspace

**Go deeper than you could alone.**
Outcome tracking for counsellors. Mission: empowering mental health practitioners.

> In India there is no way to tell a good counsellor from a bad one, including for the counsellor themselves. We give counsellors evidence of their own effectiveness, privately, so they can improve. Business is a byproduct.

Everything commercial lives here. Code stays in `src/`. Technical docs stay at repo root.

---

## Where things are

```
business/
  README.md            this file
  INDEX.html           the same map, visual
  strategy/            01 to 07. The thinking everything else rests on
  commercial/          the plan and anything financial
  marketing/           brand, name, copy
    logo/              the five SVG assets
    _working/          explorations kept for their reasoning
    _archive/          superseded, dated
  research/            supporting research and decision records
  customers/           beta interviews, support log, objections
```

## Start here

| File | What it is |
|---|---|
| `strategy/03-business-strategy.md` | **Read first.** Thesis, who this is for, the two things we do, the never-build list |
| `commercial/one-page-plan.html` | **The plan, v1.1.** Show this to anyone who asks what the business is |
| `marketing/brand-guide.html` | **The brand, v1.0.** Standalone. Name, voice, logo, colour, charts, governance |

## strategy/

Seven numbered documents compiled 31 July 2026. They cross-reference each other by bare filename, so they stay together in this folder. Reading order for someone new: **03, then 01, 04, 07.**

| # | File | Read it when |
|---|---|---|
| 01 | `01-icp-research.md` | Deciding who this is for or what they will pay |
| 02 | `02-market-analysis.md` | Making competitor claims, or pricing |
| 03 | `03-business-strategy.md` | Start here. Thesis, ICP, never-build list |
| 04 | `04-pricing-plan.md` | Before printing a price anywhere |
| 05 | `05-homepage-content.md` | Handing copy to a build agent |
| 06 | `06-homepage-build-spec.md` | Alongside 05. The copy rules in section 2 are hard constraints |
| 07 | `07-operating-plan.md` | Weekly |

## commercial/

| File | |
|---|---|
| `one-page-plan.html` | **v1.1.** The living source. Mission, two value props, market, competition, pricing, costs at 10/100/1,000 users, path to 100,000 |
| `Deepen-business-plan.pdf` | **The one you send.** Three A4 pages, brand fonts embedded, searchable text. Rendered from the HTML |
| `_build-pdf.md` | How to regenerate the PDF after editing the HTML |
| `pricing-and-build-plan-2026-08.md` | **Pricing decision of 17 Aug 2026 and the code change plan for it.** Supersedes the pricing in 03 and 04 until those are rewritten. One plan at ₹999, founding 50 at ₹699, Pro ₹1,999 later, 30 active-client fence, no annual |
| `plans-chart-2026-08.html` | The plans as a one-page chart, with the honest competitor comparison |

## marketing/

| File | |
|---|---|
| `brand-guide.html` | v1.0, standalone. Twelve sections. The one to hand a designer |
| `brand-guide.md` | Same content as text. This is the one to grep |
| `logo/` | lockup, mark in teal, ink and reversed, favicon build, plus usage notes |
| `name-deepen.html` | Why the name is what it is. Background, not a rule |
| `homepage-copy-fixes.md` | **Open action.** Two claims on the current build must not ship |
| `_working/` | Logo explorations and the colour swatch sheet. Kept because they record why rejected options were rejected |
| `_working/home-mock-2026-08.html` | **Home page redesign v2**, ~530 words, three layers, one plan. The build reference for step 8 of the pricing-and-build plan |
| `_working/outcome-report-mock-2026-08.html` | The Outcome Report in plain language, one page. What Pro will sell. Demo data |
| `_archive/` | Superseded documents, dated in the filename |

## research/

| File | |
|---|---|
| `india-counselling-workforce-2036.html` | How many people in India actually do counselling for a living. Buyer-pool sizing |
| `domain-check.md` | Domain sweep, the naming decision, and what we registered |

## customers/

Empty until the beta starts. Beta interview notes, the support log, objections, and testimonials go here. One file per person, named `YYYY-MM-DD-firstname.md`.

---

## Decided

The name is **Deepen**. `deepen.health` and `deepen.co.in` are registered and set up. The colour system, the voice, the two value props, and the growth path are all settled. **Pricing was re-decided on 17 Aug 2026** after verifying PractiPal and PracFlow live: see `commercial/pricing-and-build-plan-2026-08.md`. Docs 02, 03, 04 and 05 still carry the July pricing and are to be updated after the code lands (step 11 of that plan). Do not reopen without a reason.

## Open, in order

1. **Fix the two homepage claims** before anyone sees the build. See `marketing/homepage-copy-fixes.md`.
2. **Swap the footer mark** for `marketing/logo/lockup.svg`.
3. **Point the domains at the build.** `deepen.health` is primary, `deepen.co.in` redirects to it. Set both in one pass so email and links never split.
4. India trademark search, classes 9 and 42. Fold into the IP review that already blocks launch.
5. Say the name cold to the clinical co-founder.
6. Execute the rename in code. `practiceSettings` still defaults to a real person's name and city.

---

## Conventions

- Dated material: `YYYY-MM-DD-slug.md`. Living documents: plain `slug.md`.
- Every document opens with a date and a status: draft, active, or superseded.
- **Keep verified and inferred separate.** The strategy set is strict about this. Match it.
- Superseded documents move to `_archive/` inside their folder with the date in the filename. They are not deleted, because the reasoning history matters.
- Explorations that informed a decision go to `_working/`, not the bin. They stop old options being re-proposed.
- **No em-dashes. Short sentences. Write it the way you would say it.**

## Before committing

Confirm the repository is private. If it is public, add `/business/` to `.gitignore` and keep this tree local until the repository is locked down.
