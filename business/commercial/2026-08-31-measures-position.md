# The measures position, and what we are changing

**Date:** 31 August 2026
**Status:** active. This is the canonical statement.
**Detail behind it:** `2026-08-31-measures-licence-review.md`, six addenda, the working
document. Read this one first. Go there for the evidence.
**Trigger:** draft licence received from Scott D. Miller, PhD, Performance Metrics PLLC.

Not legal advice. Sections marked LAWYER need an Indian IP lawyer before they ship.

---

## 1. The position, in five lines

1. **We are not signing.** Nothing in the draft unlocks anything we can build this quarter,
   and signing costs us the benchmark pool permanently.
2. **We can keep using ORS and SRS**, as the counsellor's paper instrument that Deepen
   remembers. Not as an instrument Deepen delivers.
3. **The only real problem is eight lines of copied text** in one file. Everything else that
   says ORS or SRS is lawful naming.
4. **Automated delivery runs on PHQ-9 and GAD-7.** Permanently, not as an interim step.
5. **The benchmark pool is ours as long as we do not sign.**

## 2. What we verified

| Question | Answer | Where it came from |
|---|---|---|
| Is the licence a real offer? | No. Template. Every commercial term blank | the draft, sections 6, 7, 14 |
| Does 3.d kill the benchmark pool? | Yes. Perpetual, survives termination | the draft, section 3.d |
| Does he solely own the measures? | **No.** ORS © 2000 Miller and Duncan. SRS © 2002 Miller, Duncan and Johnson | printed on the forms |
| Does anyone else license them? | **Yes.** Duncan, via PCOMS International, licenses the same six | betteroutcomesnow.com |
| Does he warrant ownership? | **No.** Section 11 disclaims everything, and section 12 makes us indemnify him | the draft |
| Is trademark our problem? | Almost certainly not. Territorial, and his filed marks look to be FIT and FEEDBACK INFORMED TREATMENT | justia, USPTO serials 87955593 / 87955596 |
| Can we name ORS and SRS? | Yes. Nominative fair use. s.30(2), *Consim v Google*, *Hawkins v Murugan* | Indian case law |
| Is copyright our problem? | **Yes.** Berne, enforceable in India. It reaches the item wording | Berne, and the forms |
| Is the counsellor's paper use free? | Yes. Lifetime, $0, registration only | scottdmiller.com |
| Can counsellors translate it? | **No.** Clause 4 bars translation outright | Binding License Agreement |
| Does their licence bar aggregation? | **No. Checked. No clause about norms, statistics or data** | Binding License Agreement |
| Can we analyse the scores? | Yes. Facts are not copyrightable. *Eastern Book Company v D.B. Modak* (2008) | Indian law |
| Is OQ-45 a better option? | No. $250/yr per clinician, 45 items, owned by the competitor | oqmeasures.com |

## 3. Changes to implement

### A. Code, the legal fix. LAWYER reviews A1 before it ships

- [ ] **A1. Rewrite the eight item labels.** `src/components/clinical-note-editor.tsx`
      lines 433 to 436 (all four ORS, verbatim) and 460 to 463 (two SRS anchors verbatim).
      Either one total field per instrument, or four subscales in our own words. He owns his
      sentences, not the four constructs. **This is the only actual infringement.**
- [ ] **A2. Delete "PCOMS default: 5"** from `src/app/dashboard/settings/page.tsx` line 369.
      PCOMS is Duncan's brand and the line presents his benchmark as our default.
- [ ] **A3. De-default his numbers.** `src/lib/db/schema.ts` lines 411 to 417 preset
      `orsCutoff` 25, `srsCutoff` 36, `orsRciThreshold` 5, `orsAmberLow` 26, `orsGreenLow`
      32. Move to counsellor-entered at setup. No presets shipped.

### B. Code, good faith and defence

- [ ] **B1. In-app measures notice**, on the settings screen where thresholds are set.
      Wording in section 4 below. Behind login only.
- [ ] **B2. Licence confirmation at setup.** One checkbox: "I hold any licence required for
      the measures I use." Next to the link in B3.
- [ ] **B3. A Measures page**, in-app. Every supported instrument, its licensing status, and
      where to get it. PHQ-9 and GAD-7, free, no licence. PCL-5, public domain. ORS and SRS,
      free individual licence, **link to his registration page, never the PDF**. Say the
      solo boundary: individual use only, two or more clinicians needs the group licence.

### C. Roadmap

- [ ] **C1. Automated measure delivery on PHQ-9 and GAD-7 only.** Build order item 3. Never
      ORS or SRS. **This is the bright line.** The moment we render his items to a client we
      are creating the electronic version.
- [ ] **C2. Resolve the alliance measure.** The SRS is the alliance half of the product and
      PHQ-9 and GAD-7 do not replace it. WAI-SR is the candidate. **Licence terms
      unverified.** Confirm with the authors before building on it.
- [ ] **C3. Benchmark pool stays on the roadmap.** Unblocked, because we are not signing.

### D. Documents and copy

- [ ] **D1. Add the translation finding to `strategy/02-market-analysis.md` section 5.**
      Counsellors may not lawfully translate the ORS into any Indian language. For our
      market that is a product constraint, and the strongest argument yet for the PHQ and
      GAD default. It is currently recorded nowhere.
- [ ] **D2. Fix the DPDP claim.** `marketing/homepage-copy-fixes.md` section 2 is still
      open. "Fully compliant with the DPDP Act" is a legal claim with no review behind it.
      This is the real gate on the benchmark pool, not the licence.
- [ ] **D3. Counsellor contract grant.** Our terms must say the counsellor owns their data
      and grants us opt-in rights to de-identified aggregates. Deepen to counsellor. Nothing
      to do with Miller.
- [ ] **D4. Fold his marks into the India trademark search.** Already open item 4 in
      `business/README.md`. Classes 9, 41, 42. One search, not two.

### E. The reply to Scott

- [ ] **E1. Reply warm, unhurried, no signature.** Ask three things, in this order:
      1. **Will you warrant that you own or control all rights necessary to grant this,
         including any co-owners' rights, and indemnify us for IP claims?** Ask this first,
         before price. Given Duncan, it is the question that decides everything.
      2. The missing non-compete and non-solicitation sections. Clauses 14.c, 16 and 17 all
         cross-reference provisions that are **not in the document.**
      3. What section 3.d is actually intended to prevent.
- [ ] **E2. Do not discuss price until 1 is answered.**

## 4. The in-app notice, as drafted

> The Outcome Rating Scale (ORS) and Session Rating Scale (SRS) are the copyright of their
> authors. ORS © 2000 Scott D. Miller and Barry L. Duncan. SRS © 2002 Scott D. Miller,
> Barry L. Duncan and Lynn Johnson. Deepen is not affiliated with, sponsored by, or
> endorsed by them. **Deepen records scores you have collected. It does not supply or
> administer these instruments.** You are responsible for holding any licence required for
> the measures you use.

The bolded sentence is the whole legal position in nine words.

**No trademark notice.** Do not write "ORS® is a trademark of Performance Metrics PLLC". It
may not be true, his filed marks appear to be different, and section 10 of the draft is the
only thing requiring a rights notice. We are not signing it, so do not adopt it.

## 5. What we are explicitly NOT doing

- **Not renaming internal identifiers.** `orsTotal`, `srsCutoff`, DB columns, API routes.
  Code is not publication.
- **Not stripping ORS and SRS from chart labels, stat tiles, settings fields, the CSV header
  or the note editor headings.** Naming is lawful. Removing it makes the product worse for
  no gain.
- **Not naming any instrument in public marketing copy.** Unchanged rule, brand guide
  section 2. It now has a second reason to exist.
- **Not pursuing OQ-45.** ₹21,000 per clinician per year against a ₹12,000 product, 45
  items, and owned by the competitor.
- **Not signing.**

## 6. The honest residue

- **Past use.** We reproduced his wording digitally, one practice, zero revenue. Fixing A1
  caps it. It does not erase it. LAWYER.
- **How different is different enough.** Whether the A1 rewrite clears his expression is a
  judgment call. LAWYER.
- **Miller's version of the individual licence.** We read Duncan's. A counsellor could
  register at either. Read both before relying on the no-aggregation-clause finding.
- **The alliance measure.** Genuinely open. C2.

## 7. The two sentences to remember

**Deepen records scores the counsellor collected. It does not supply or administer the
instrument.** That is the legal position and the product position at the same time.

**Signing forfeits the benchmark pool. Not signing keeps it.**
