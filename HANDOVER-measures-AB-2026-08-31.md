# Handover: measures compliance work, groups A and B

**Date:** 31 August 2026
**For:** the agent implementing this. You have not seen the conversation that produced it.
**Authority:** `business/commercial/2026-08-31-measures-position.md`. Read section 3 before
you start. Do not re-derive the reasoning and do not re-open the decisions.
**Evidence, if you need it:** `business/commercial/2026-08-31-measures-licence-review.md`.

---

## 0. Why this exists, in one paragraph

Deepen records ORS and SRS scores. Those instruments are copyright Scott D. Miller and
others. A licence was offered and **we are not signing it**. Our legal position is that
Deepen records scores a counsellor collected on paper under their own free licence, and
never reproduces or administers the instruments. That position is sound except for one
thing: **the session note currently reproduces eight of his item labels word for word.**
Group A fixes that. Group B adds the good-faith layer around it.

**The sentence the whole product position rests on:** *Deepen records scores you have
collected. It does not supply or administer these instruments.*

---

## 1. Hard rules for this task

1. **Read `node_modules/next/dist/docs/` before writing code.** Per `AGENTS.md`, this is not
   the Next.js in your training data. Next 16, React 19, Drizzle, NextAuth v4.
2. **Naming is lawful. Reproducing is not.** Keep every "ORS" and "SRS" that is a label,
   heading, chart series, stat tile or CSV header. Remove only his sentences. If you find
   yourself deleting the string "ORS" from a heading, stop, you have misread this.
3. **Do not rename internal identifiers.** `orsTotal`, `srsCutoff`, DB columns, API routes,
   type names all stay. Code is not publication.
4. **Do not touch public marketing copy** (`src/app/home`, `src/app/signup` landing copy).
   Instrument names must not appear there and this task does not add any.
5. **Everything in B goes behind login.** Never in the footer, never on the marketing site.
6. **A1 and B1 wording is lawyer-gated.** Implement exactly what is specified below. Do not
   improve the wording, do not invent alternatives. If something reads awkwardly, note it in
   your report and leave it.

---

## 2. Group A. The legal fix

### A1. Replace the eight reproduced item labels

**File:** `src/components/clinical-note-editor.tsx`
**Lines:** 433 to 436 (ORS) and 460 to 463 (SRS). Only the `label=` prop on each
`ScoreSelector`. Change nothing else on those lines.

**ORS, lines 433 to 436:**

| Current (his, verbatim) | Replace with |
|---|---|
| `Individually (Personal well-being)` | `Personal` |
| `Interpersonally (Family, close relationships)` | `Relationships` |
| `Socially (Work, school, friendships)` | `Work and social` |
| `Overall (General sense of well-being)` | `Overall` |

**SRS, lines 460 to 463.** Note these are in screen order Goals, Approach, Relationship,
Overall, which is not the order on the paper form. **Leave the order as it is.**

| Current | Replace with |
|---|---|
| `Goals and Topics (We worked on what I wanted)` | `Goals` |
| `Approach or Method (Fit with therapist's approach)` | `Approach` |
| `Relationship (I felt heard, understood, and respected)` | `Relationship` |
| `Overall (Today's session was right for me)` | `Overall` |

**Keep unchanged**, these are lawful naming and the counsellor needs them to know which form
they are transcribing:

- Line 418: `<h3 ...>ORS (Outcome Rating Scale)</h3>`
- Line 441: `<h3 ...>SRS (Session Rating Scale)</h3>`
- The `Total: {note.orsTotal}/40` badges
- The "Not recorded" checkboxes and their `title` attributes

**Do not** touch `ScoreSelector` itself (lines 24 to 44). The 0 to 10 slider stays.

### A2. Remove the PCOMS reference

**File:** `src/app/dashboard/settings/page.tsx`, line 369.

Current: `Reliable Change Index: min ORS improvement from first session to count as statistically significant (PCOMS default: 5).`

Replace with: `Reliable Change Index: the minimum ORS improvement from the first session that counts as a real change. Use the value your instrument's manual specifies.`

PCOMS is Barry Duncan's brand and the line presents his number as ours. Also delete the
`placeholder="5"` on that input (see A3).

### A3. Stop shipping his numbers as our defaults

This is the change with real consequences. Read all of it before starting.

**The rule:** we may not ship his published cutoffs as values Deepen supplies. Counsellors
enter the values their own instrument specifies. Public-domain instruments (PHQ-9, GAD-7)
may carry defaults later, when the instrument picker exists. That is not this task.

**Columns affected**, `src/lib/db/schema.ts` lines 411 to 417, all on `practiceSettings`:
`orsCutoff` (25), `srsCutoff` (36), `orsDeteriorationThreshold` (5), `srsDeclineThreshold`
(2), `orsRciThreshold` (5), `orsAmberLow` (26), `orsGreenLow` (32).

**Steps:**

1. **Schema.** Drop `.notNull().default(n)` on all seven. They become nullable integers.
2. **Migration.** New file `drizzle/0010_measures_thresholds_nullable.sql`. Follow the
   existing hand-written style, next number in sequence. It must:
   - `ALTER COLUMN ... DROP DEFAULT` and `DROP NOT NULL` on all seven.
   - **Leave existing row values alone.** The live tenant has configured values and must not
     be disturbed. This migration changes the column definition, not the data.
   - Add a `NOTE-0010-*.md` beside it explaining why, following the `NOTE-0009-consent.md`
     precedent.
3. **Signup.** `src/app/api/signup/route.ts` line 149 already inserts without these columns,
   so new tenants will now get NULL. **No change needed.** Verify this rather than assuming.
4. **Settings API.** `src/app/api/settings/route.ts` around line 74. Make sure null passes
   through on both the insert and update paths and is not coerced to 0. Watch for
   `parseInt(...) || 0` patterns.
5. **Settings UI.** `src/app/dashboard/settings/page.tsx`, the Clinical Flags card, lines
   ~310 to 400. Remove every `placeholder=` that carries his number (25, 36, 5, 2, 5, 26,
   32). Empty inputs when null. Add to the `CardDescription`: `Deepen does not supply these
   values. Enter the thresholds your instrument's manual specifies.`
6. **Flag computation.** `src/lib/riskFlags.ts` takes these as numbers. When any needed
   threshold is null, **do not compute a flag, return null**, the same "unknown" state the
   code already models for a scale that was not recorded. Do not substitute a fallback
   number anywhere. Find every consumer before you change the signature: it is imported at
   `src/components/clinical-note-editor.tsx:4` and there may be server-side callers, grep
   for `computeNoteFlags`.
7. **Empty state.** Where flags would show, an unconfigured tenant sees a short prompt
   linking to settings: `Set your thresholds to enable flags.` Do not invent a modal or an
   onboarding wizard, that is out of scope.

**Open decision, needs Adi, do not guess.** A3 means a brand-new tenant has no flags until
they configure thresholds. That is correct legally and worse for first-run experience. Adi
must confirm this is acceptable before A3 ships. **Build A1, A2 and all of B first, raise
this, and hold A3 until he answers.**

---

## 3. Group B. Good faith and defence

### B1. In-app measures notice

**Placement:** a new block at the bottom of the Clinical Flags card in
`src/app/dashboard/settings/page.tsx`. Small, muted, not a banner. Behind login only.

**Exact text. Do not edit it.**

> The Outcome Rating Scale (ORS) and Session Rating Scale (SRS) are the copyright of their
> authors. ORS © 2000 Scott D. Miller and Barry L. Duncan. SRS © 2002 Scott D. Miller,
> Barry L. Duncan and Lynn Johnson. Deepen is not affiliated with, sponsored by, or endorsed
> by them. Deepen records scores you have collected. It does not supply or administer these
> instruments. You are responsible for holding any licence required for the measures you use.

Set the sentence "Deepen records scores you have collected. It does not supply or administer
these instruments." in medium weight. The rest is normal muted body.

**Do not** add a ® symbol. **Do not** write "trademark of". Copyright only, exactly as above.

### B2. Licence confirmation

One checkbox, stored per tenant, labelled:

`I hold any licence required for the measures I use.`

Place it in the Clinical Flags card directly above the B1 notice, with the B3 link beside
it. Persist it: new nullable `measuresLicenceAckAt` timestamp on `practiceSettings`, set on
first tick. Fold this column into the same `0010` migration.

There is existing consent handling from `drizzle/0009_consent.sql`. **Read it and follow that
pattern** rather than inventing a new one.

Not a blocking gate. Do not prevent app use if unticked.

### B3. The Measures page

**New route:** `src/app/dashboard/settings/measures/page.tsx`. Linked from the Clinical
Flags card. Behind login.

A plain table, one row per instrument. This is genuinely useful to counsellors, and it stops
us looking like a distribution channel for one author's product.

| Measure | Licence | Where to get it |
|---|---|---|
| PHQ-9 | Free. No licence needed. Released without copyright restriction | link to the official screener source |
| GAD-7 | Free. No licence needed. Released without copyright restriction | link to the official screener source |
| PCL-5 | Public domain | link to the US National Center for PTSD |
| ORS and SRS | Free individual licence for paper and pencil use. Registration required | **link to `https://www.scottdmiller.com/downloadmeasures.html`** |

**Rules for the ORS and SRS row, these matter:**

- **Link the registration page, never a PDF.** Counsellors must pass through the licence
  gate. Deep-linking past it defeats the point of the whole exercise.
- **Never host, mirror, embed or email the forms.** Link out only.
- **No endorsement language.** "Get your free licence from the authors", never "our partner"
  or "official".
- Add this line under the row: `The free licence is for individual use. A practice with two
  or more clinicians needs a group licence.`
- Add this line under the row: `The licence does not permit translating these measures into
  other languages.`

Add a footer line to the page: `Deepen does not supply or administer any of these
instruments. You are responsible for holding any licence your chosen measure requires.`

---

## 4. Do not touch

- Any `orsX` / `srsX` identifier, DB column name, API route or TypeScript type.
- `ORS` / `SRS` in: chart series names and axis labels
  (`src/components/client-progress-chart.tsx`), stat tile labels, the reports page
  (`src/app/dashboard/reports/page.tsx`), the CSV header "ORS Total" / "SRS Total"
  (`src/app/api/settings/export/route.ts:55`), the two `<h3>` headings in the note editor.
- `ScoreSelector` mechanics. The 0 to 10 one-decimal slider is a faithful digital equivalent
  and is deliberate.
- Anything under `src/app/home` or public signup copy.
- `counselorName` defaulting to a real person's name in `schema.ts:404`. It is a known
  problem, tracked as open item 6 in `business/README.md`, and **out of scope here.** Do not
  fix it in this pass. Flag it in your report.

---

## 5. Verification

Run all of these. The first three are the standing gate from
`business/marketing/homepage-v3-plan-2026-08.md`.

1. `npx tsc --noEmit` clean on touched files.
2. `npm run lint` clean.
3. Playwright screenshots at 1280 and 390 of: the session note editor, the settings Clinical
   Flags card, the new Measures page.
4. **The grep that matters.** Zero hits, whole repo excluding `node_modules`, `business/`
   and this file:
   ```
   grep -rniE "personal well-being|family, close relationships|work, school, friendships|general sense of well-being|felt heard, understood|worked on and talked|good fit for me|session was right for me|looking back over the last week|PCOMS" src/
   ```
5. Every link on the Measures page resolves, 200, and the ORS link lands on the registration
   page and not a PDF.
6. Existing tenant regression: confirm the live tenant's configured thresholds are unchanged
   after the migration and flags still compute exactly as before.

---

## 6. Order of work

1. A1, A2. Small, self-contained, highest value.
2. B1, B2, B3.
3. Run verification, report.
4. **Stop. Raise the A3 open decision with Adi.** Do not ship A3 until he confirms the
   first-run behaviour.

## 7. What "done" means

- The grep in 5.4 returns nothing.
- A counsellor can still tell which form they are transcribing, because the headings and the
  acronyms are all still there.
- The app states plainly, behind login, that Deepen does not supply or administer these
  instruments, and points counsellors to where they can get a proper licence.
- No internal identifier changed. No public copy changed.
- A3 is specified, migrated and tested, but **not merged**, pending Adi.

## 8. Report back

- What you changed, file by file.
- Verification output, including the grep.
- The A3 decision, stated as a question for Adi.
- Anything you found that this note did not anticipate. Do not fix it. Report it.
