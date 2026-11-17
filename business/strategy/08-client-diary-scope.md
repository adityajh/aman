# The Client Diary: feature list and scope

*November 2026. Research, feature list, and phased scope for giving each client a diary in Deepen.*

---

## 1. The idea in one line

Each client gets a diary that the counsellor keeps. You open it and see who this person is, where you left off, and every session written down in order. It should feel like her own notebook, not a database record.

## 2. What exists today

| Where | What it does | What's missing |
|---|---|---|
| `/dashboard/clients` list | Table of clients. Details open in a large **dialog** (name, email, phone, fee scheme, timezone, one-line "Notes / Background", research consent, terminate) | Client details are edited in a popup, away from the client's page |
| `/dashboard/clients/[id]` | Name and status, 3 stat cards, the ORS/SRS progress chart, session notes as a collapsible timeline | No profile, no history, no "where we left off", no next session, no money. Looks like an admin dashboard |
| Session notes (`session_notes`) | Updates, session notes, client actions, my actions, next agenda, feedback, ORS/SRS, risk flag | No private notes. Notes can only be attached to a session |
| `clients` table | name, email, phone, DOB, fee, tags, timezone, `intake_notes`, consent, termination fields | No preferred name, pronouns, emergency contact, referral source, presenting concern, background, goals |

The diary is mostly a **re-layout of data we already have**, plus a small set of new fields and pages. It answers "how is this client doing", so it belongs in the base Deepen plan, not Pro.

## 3. What the research says

Full notes and sources: [business/research/2026-11-client-diary-research.md](../research/2026-11-client-diary-research.md). The main points:

1. **Every serious tool uses the same skeleton.** SimplePractice, TherapyNotes, Owl, Quenza, Carepatron and Jane all pin identity and key facts (in a header or side rail), show a chronological feed of sessions and notes, and keep billing, measures and files in their own sections. Owl literally calls it the client's "file".
2. **Nobody does "where we left off" well.** Counsellors re-read the last note in the 5 minutes before a session. No tool hands them a ready summary. **This is Deepen's opening.**
3. **The top complaint is clicks.** Too many tabs to answer "is consent signed?" or "what did we agree last week?". Praise goes to easy flipping between past notes and to intake details that carry forward.
4. **Private notes are a real, separate thing.** Progress notes are the record. Process notes (impressions, hypotheses, countertransference) are kept apart, often in a paper notebook today. Clinical guidance says to store them separately.
5. **Standard clinical pages:** intake and background history, case formulation (the 5 Ps), goals with review dates, a safety plan (Stanley-Brown, 6 steps), consent records, and a closing summary.
6. **India:** the Mental Healthcare Act 2017 gives clients a right to confidentiality (s.23) and to see basic records (s.25). The DPDP Act 2023 rules were notified in November 2025, and penalties apply from about May 2027. Data consent must be separate from therapy consent, and erasure needs notice. **Get legal input before setting retention rules.**
7. **Design: diary through structure, not texture.** Day One (on-this-day resurfacing), Apple Journal (prompts on a new entry), Bear (warm off-white page, serif text) and Jane (pinned entries) all have patterns we can borrow. Leather, torn paper, handwriting fonts and stitching are widely mocked and hurt readability. Don't use them.

Evidence gaps: no direct Reddit or WhatsApp-group voice, and no Indian tool publicly shows its client-file layout. Test the layout with the beta counsellors before building phases 2 and 3.

## 4. Design principles

1. **One page, not ten tabs.** The cover and "where we left off" answer 80% of what she needs before a session, with no clicks.
2. **Reads like writing, works like software.** Newsreader serif for her words (entries, headings, the story). Inter for controls, dates, numbers and labels. Body text 15–16px, measure ≤ 680px.
3. **Paper and ink.** Page `#FBFAF7`, cards white, hairlines `#E4E1DA`. Teal for actions and data. Terracotta only for warmth: the monogram, empty states, the welcome on a new diary. Never on a flag or a button.
4. **Her words first.** Session entries show what she wrote, not coloured boxes labelled in uppercase. Field labels become quiet small captions.
5. **Private stays private.** The private margin is visually distinct (lock icon, tinted margin) and never appears in anything a client or anyone else could see.
6. **Gentle, never nagging.** Nudges point, they don't alarm: "Goals not looked at since August", not "OVERDUE". No streaks, scores or completion percentages. The brand guide already rules these out.
7. **Dark mode is first-class.** Notes get written late at night.

## 5. Structure of the diary

```
┌───────────────────────────────────────────────────────────────────────────┐
│  ← Clients                                                                │
│                                                                           │
│  (PS)  Priya Sharma                                       [ + Write ]     │
│        she/her · 34 · Bengaluru · with you since March 2026               │
│        18 sessions · next: Thu 12 Nov, 6:00 pm · video                    │
├───────────────────────────────────────────┬───────────────────────────────┤
│  WHERE WE LEFT OFF · Thu 5 Nov            │  ABOUT                        │
│  ───────────────────────────────          │  Phone, email, emergency      │
│  Talked about the move and her mother.    │  contact, referred by...      │
│  She agreed to: try the sleep log         │                    Edit       │
│  You were going to: send the article      │                               │
│  Pick up next time: the job decision      │  PINNED                       │
│                                           │  ▸ Formulation                │
│  ORS 24 → 27   SRS 37                     │  ▸ Safety plan                │
│                                           │  ▸ "Her words at intake..."   │
├───────────────────────────────────────────┤                               │
│  Story · Goals · Sessions · Measures ·    │  MONEY                        │
│  Papers · Accounts                        │  ₹3,000 due · Oct invoice     │
│                                           │                               │
│  Thursday, 5 November                     │  CONSENT                      │
│  Session 18 · 52 min · video              │  Research: yes, 2 Mar         │
│                                           │                               │
│  Talked about the move and her mother…    │                               │
│  (serif body text, reads like a page)     │                               │
│   🔒 private margin                        │                               │
│                                           │                               │
│  Monday, 2 November · Jot                 │                               │
│  She texted to ask about moving Thursday. │                               │
│  ...                                      │                               │
└───────────────────────────────────────────┴───────────────────────────────┘
```

On mobile the right rail folds under the cover as collapsible sections.

### The pages ("divider tabs")

| Page | What's on it |
|---|---|
| **Cover** (always on top) | Monogram, name, preferred name, pronouns, age, city, "with you since", session count, next session, status (active / paused / closed) |
| **Where we left off** (always on top) | Last session's main points, client actions, my actions, next agenda, ORS/SRS change since last time, any open flag. Comes straight from the last note |
| **Sessions** (default page) | Every session and jot as dated diary entries, newest first. A list / full-text toggle. Search |
| **Story** | Background in her words: what brought them here, history, family and relationships, health, work and study, strengths, cultural context. Long-form sections with prompts, all optional |
| **Goals** | What the client wants from counselling, each goal with a "last looked at" date. Shown next to the ORS trend |
| **Measures** | The progress chart we already have, moved here |
| **Papers** | Consent records, uploaded files (forms, letters, referrals) |
| **Accounts** | This client's invoices, payments and balance (reuse the existing ledger drill-in) |
| **Formulation** *(pinned page)* | The 5 Ps: presenting, predisposing, precipitating, perpetuating, protective, plus a working hypothesis |
| **Safety plan** *(pinned page)* | The 6-step plan in the client's words, with Tele-MANAS 14416 pre-filled as a crisis line |
| **Closing** | When a client ends: reason, how things went, last ORS, referrals. Replaces today's terminate dialog |

## 6. Feature list

Priority: **P1** = needed for the diary to feel like a diary. **P2** = makes it complete. **P3** = later.

### Diary shell and navigation
| # | Feature | Pri | Notes |
|---|---|---|---|
| 1 | Client list rows open the diary (not a dialog) | P1 | Keep the dialog only for "Add client" |
| 2 | Cover header with monogram, key facts, next session | P1 | Monogram: initials on terracotta tint |
| 3 | "Where we left off" card | P1 | Built from the last completed note. Empty state: "After your first session, this is where you'll pick up from." |
| 4 | Right rail: About, Pinned, Money, Consent | P1 | Inline edit, replacing the details dialog |
| 5 | Page switcher (Sessions, Story, Goals, Measures, Papers, Accounts) | P1 | Sessions is the default. URL synced (`?page=story`) |
| 6 | Warm empty states for every page | P1 | Terracotta allowed here |
| 7 | Dark mode pass | P1 | |

### Writing in the diary
| # | Feature | Pri | Notes |
|---|---|---|---|
| 8 | Session entries restyled as diary pages | P1 | Serif date heading, her text in reading type, labels as small captions, ORS/SRS as one quiet line |
| 9 | "+ Write" button: new session note, jot, or Story section | P1 | Opens the existing note editor for sessions |
| 10 | **Jots**: free entries not tied to a session (a phone call, a message, a thought) | P1 | Most-asked-for workaround in the research |
| 11 | **Private margin** on each session and jot | P1 | Lock icon, tinted. Excluded from the progress email, client-facing exports and any summary |
| 12 | Pin any entry | P2 | Shows under Pinned in the rail |
| 13 | Search within a client's diary | P2 | |
| 14 | Prompts on a new note from last time ("Last week you planned to pick up: the job decision") | P2 | Pre-fills "Updates" with the previous agenda as a hint, not text |
| 15 | List / full-text density toggle | P2 | |

### Client details (About and Story)
| # | Feature | Pri | Notes |
|---|---|---|---|
| 16 | New About fields: preferred name, pronouns, gender, language(s), city, occupation, emergency contact (name, relation, phone), referred by, first contact date | P1 | All optional |
| 17 | Presenting concern (short, shown on the cover) | P1 | |
| 18 | Story page: guided long-form sections | P2 | Migrate existing `intake_notes` into "Background" |
| 19 | Goals with "last looked at" dates and a gentle nudge after 8 weeks | P2 | |
| 20 | Formulation (5 Ps) page | P3 | |
| 21 | Safety plan page | P3 | Link from the risk flag on a note: "Open safety plan" |

### Papers, money, closing
| # | Feature | Pri | Notes |
|---|---|---|---|
| 22 | Accounts page using the existing payments ledger | P2 | |
| 23 | Consent records (research consent today, data consent later) | P2 | Lays the ground for DPDP |
| 24 | File uploads to Papers | P3 | Private Vercel Blob storage. Needs a storage decision |
| 25 | Closing summary replaces the terminate dialog | P3 | Keeps the existing termination fields and invoicing step |

### Later ideas (P3, validate first)
| # | Feature | Notes |
|---|---|---|
| 26 | Themes: tag a passage (#sleep, #mother) and see every session that mentions it | Needs a tagging UI. High delight, high effort |
| 27 | Resurfacing: "At intake, she said…" card near the 3- and 6-month marks | Cheap once Story exists |
| 28 | Client-shareable summary (MHCA s.25 style), never including the private margin | Needs legal review |
| 29 | Print or export the whole diary as a PDF | Counsellors like paper. Private margin is opt-in |
| 30 | AI "where we left off" summary across the last 3 sessions | Ties into the roadmap's AI phase. Must say when it can't summarise |

## 7. Suggested phases

**Phase 1: The diary page** (about 1–1.5 weeks)
Features 1–11, 16, 17. One new table and a handful of columns. Delivers the feel: cover, where we left off, rail, diary-style entries, jots, private margin, richer About.

**Phase 2: A complete file** (about 1–1.5 weeks)
Features 12–15, 18, 19, 22, 23. Story, Goals, pins, search, accounts, consent.

**Phase 3: Clinical depth** (scope after beta feedback)
Features 20, 21, 24–30.

Estimates assume one developer. Validate the Phase 1 layout with 2–3 beta counsellors (a clickable mock is enough) before building Phase 2.

## 8. Data changes

| Change | Phase | Detail |
|---|---|---|
| New columns on `clients` | 1 | `preferred_name`, `pronouns`, `gender`, `languages text[]`, `city`, `occupation`, `emergency_contact_name/relation/phone`, `referred_by`, `presenting_concern`, `first_contact_at`, `status` (active/paused/closed, derived from `is_active` at first) |
| `session_notes.private_note` | 1 | Text. Never read by the progress-mail route or any client-facing route |
| New table `diary_entries` | 1 | `id, tenant_id, client_id, entry_at, kind ('jot'), body, private_note, pinned, created_at, updated_at`. RLS on `tenant_id` like every other table |
| `session_notes.pinned` | 2 | Boolean |
| New table `client_pages` | 2 | `client_id, page ('story' / 'formulation' / 'safety' / 'closing'), content jsonb, reviewed_at`. One row per page |
| New table `client_goals` | 2 | `client_id, text, status, last_reviewed_at, sort` |
| New table `client_files` | 3 | Metadata only; files in private Blob |

**Migration caution:** schema reaches the production Neon database through a manual `drizzle-kit push`, and the local env and Vercel previews use that same database. Every change above is additive (new nullable columns, new tables), so it's safe to push ahead of the code. Enable RLS on each new table (see `enable_rls.js`).

## 9. Out of scope

- Anything a client logs into. The diary is the counsellor's alone.
- Sharing a diary with a supervisor or colleague (brand rule: no view for anyone above her).
- Handwriting fonts, paper textures, page-turn animations.
- Streaks, completion bars, or "profile 60% complete" prompts.
- Diagnosis codes, insurance, superbills. Not relevant to Indian solo practice yet.

## 10. Open questions for you

1. **Name in the product.** "Diary" is warm, but some counsellors may find it too casual for a clinical record. Alternatives: "File", "Notebook", "Case book". Recommendation: call the page the client's name, and use "diary" only in copy ("Write in Priya's diary").
2. **Private margin and exports.** Should the full data export in Settings include private notes? Recommendation: yes for the counsellor's own export (it's her data), never in anything client-facing.
3. **Jots and billing.** Should a phone call jot ever become billable? Recommendation: no in Phase 1. Jots are notes only.
4. **Retention and erasure.** When a client asks for deletion under DPDP, what do we keep? Needs legal input before Phase 2's consent work.
5. **Paused status.** Is "paused" (on a break, not terminated) useful to your counsellors? It would also help the monthly-active-client count.
