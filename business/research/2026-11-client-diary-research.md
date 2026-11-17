# Research: the per-client diary

*November 2026. Background for [08-client-diary-scope.md](../strategy/08-client-diary-scope.md).*

**How reliable this is:** the vendor help-centre findings are solid. Evidence on what counsellors complain about is mostly indirect (Capterra reviews and vendor blogs, no direct Reddit threads). Indian competitor evidence is thin: Practo Ray, Halcyon, Mindstory and Ekincare returned nothing useful.

## 1. How leading tools structure the client record

| Tool | Structure |
|---|---|
| SimplePractice | Tabs: Overview / Billing / Measures / Files. Overview is a chronological feed of appointments and documents with three densities (List, Excerpt, Expanded). A right rail holds upcoming appointments, files, invoices. Psychotherapy notes are a separate field on each appointment. [help](https://support.simplepractice.com/hc/en-us/articles/48323197009677), [notes](https://support.simplepractice.com/hc/en-us/articles/41995733904397) |
| TherapyNotes | Chart reorganised into one-topic tabs, Patient Info first. Distinct "Process Note" type. Reviewers praise intake flowing into the treatment plan and then into progress notes. [v4.22](https://blog.therapynotes.com/version-4-22), [process note](https://therapynotes-dev.helpscoutdocs.com/article/216-how-to-complete-a-process-note), [Capterra](https://www.capterra.com/p/118981/TherapyNotes-com/reviews/?page=5) |
| Jane App | Chart on its own screen. Entries can be duplicated or pinned to the top. [guide](https://jane.app/guide/category/charting) |
| Owl Practice | Client account called the digital "file". Tabs: Sessions & Notes, Contact & Clinical, Documents, Logs, Measures, Forms, Messaging. [FAQ](https://faq.owlpractice.ca/the-client-account) |
| Quenza | Contact details in a left column. Main area is an activity timeline. [help](https://help.quenza.com/article/72-managing-clients) |
| Carepatron | Lands on Overview with inline editing per section. [help](https://help.carepatron.com/en/articles/9791850-getting-started-with-client-records) |
| TheraNest / Ensora | 2026 redesign highlights key client info at the top. [release notes](https://experience.ensorahealth.com/product-updates/release-notes-january-30-2026-7225) |
| India | ProTherapy, Aroha and Solh exist. None publicly document a client-file layout. [ProTherapy](https://www.capterra.co.uk/software/1109926/ProTherapy) |

**Common pattern:** identity pinned in a header or rail, a chronological feed in the body, billing, measures and files in their own tabs, private notes separate. No tool offers a true "where we left off" summary.

## 2. What counsellors complain about and praise

- Too many clicks to answer simple questions ("is consent signed?"). [Blaze](https://www.blaze.tech/post/ehr-for-therapists)
- Treatment plans are clunky to update, and there are no review-date reminders. [Capterra SP](https://www.capterra.com/p/130710/SimplePractice/reviews/?page=2), [Capterra TN](https://www.capterra.com/p/118981/TherapyNotes-com/reviews/?page=16)
- Praised: easy flipping between past notes, and reminders for incomplete notes. [Capterra](https://www.capterra.com/compare/130400-130710/TheraNest-Mental-Health-vs-SimplePractice)
- Workarounds: jotting during the session and writing up in the evening. This points to demand for quick capture.
- Many keep process notes in a paper notebook. [Mentalyc](https://www.mentalyc.com/blog/phi-psychotherapy-notes)

## 3. Clinical conventions

- **Progress notes vs process notes.** Progress notes are the record. Process notes (impressions, hypotheses, countertransference) are protected under HIPAA only when stored separately. [SimplePractice](https://www.simplepractice.com/blog/progress-note-or-psychotherapy-note-are-you-sure-you-know-the-difference)
- **Intake / biopsychosocial history:** presenting concern, history, family, medical, substance use, social and cultural context, strengths.
- **Case formulation (5 Ps):** presenting, predisposing, precipitating, perpetuating, protective, plus a working hypothesis and review date.
- **Safety plan (Stanley-Brown, 6 steps):** warning signs, internal coping, people and places that distract, people to ask for help, professionals and crisis lines (Tele-MANAS 14416 in India), making the environment safe. [Safer Society](https://safersociety.org/evidence-based-safety-planning-a-practical-approach-to-suicide-prevention/)
- **Also standard:** family map, consent records, closing summary.

### India

- **Mental Healthcare Act 2017:** s.23 confidentiality, s.25 right to access basic records. The professional may withhold information that would cause serious harm. [s.25](https://lawgist.in/mental-healthcare-act/25). Not verified: the Act's definition of "mental health professional" may exclude many counsellors.
- **DPDP Act 2023 and Rules (notified 14 Nov 2025):** penalties from about May 2027. Data consent must be specific, plain-language and separate from therapy consent. 48 hours' notice before erasure. [CMHLP](https://cmhlp.org/wp-content/uploads/2025/04/Delving-Into-Digital-Mental-Health-Part-2.pdf), [KPMG](https://assets.kpmg.com/content/dam/kpmgsites/in/pdf/2025/12/the-privacy-prescription-impact-of-dpdp-act-and-rules-in-healthcare-and-life-sciences-sector.pdf.coredownload.pdf)
- **RCI:** the standards require a register of client details and fees. No retention period found. Get legal input.

## 4. Diary design inspiration

- **Day One:** timeline, "On This Day" resurfacing, starring. [Day One](https://dayoneapp.com/guides/tips-and-tutorials/on-this-day)
- **Apple Journal:** "+" offers reflection prompts or a blank page. [Apple](https://www.apple.com/newsroom/2023/12/apple-launches-journal-app-a-new-app-for-reflecting-on-everyday-moments/)
- **Reflect:** backlinks gather every entry on a topic.
- **Bear:** off-white canvas, elegant type.
- **Jane:** pinned entries.
- **Pitfall:** skeuomorphic leather and torn paper were widely mocked. [Daring Fireball](https://daringfireball.net/2013/01/the_trend_against_skeuomorphism). Carry the diary through structure and language, not texture.
