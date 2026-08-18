# Deepen · home page v3 and launch terms · orchestration plan

*18 August 2026. Orchestrator: Claude (this session). Executors and checkers: cheaper agents, one per workstream. Adi pushes; nothing merges to `main` without his eyes.*

## How this runs

- Every workstream = one **executor** agent (Sonnet) + one **checker** agent (Haiku for mechanical checks, Sonnet for visual/copy review). Executor never marks its own work done.
- Executors work in an isolated clone in the sandbox. When a workstream passes its checker, I copy the final files to Adi's local folder and post the one-line git command. Adi pushes to `preview`. One push per batch, not per file.
- Checkers run the same gate every time: `tsc --noEmit` on touched files · banned-word grep · Playwright screenshots at 1280 and 390 · every link resolves · no instrument names, no competitor names, no "empower", no "only", no "alert", no "annual", no "founding", no "on their phone", no "you do nothing".
- I review each checker report, resolve conflicts between workstreams, and keep the copy rules and brand guide as the standard.
- Sequence: WS0 and WS1 first (same push), WS2 and WS4 next, WS3 in parallel with everything, WS5 when its question is answered.

## WS0 · Fix the build (small, first)

- `src/app/signup/page.tsx` line 69 references `selectedPlan`, which was removed. Type error is being ignored at build. Fix.
- Executor: Sonnet. Checker: Haiku runs tsc.

## WS1 · Home page copy and sections

Copy changes (all decided):
- Check-in language everywhere: **"A short check-in before the session, and a check-out after."** Remove "on their phone" and "you do nothing" until automated delivery ships. Layer two card, hero sub-line, session-ends block, price card bullet.
- Sub-line under *Three layers*: **Built for one counsellor, working alone. Every layer is yours and nobody else's.**
- Bring back **"And your month closes in ten minutes."** as a dark teal band after the layers: heading, one sentence, invoice batch card and outstanding ledger card side by side. Fabricated data.
- **"Session ends. You hope it helped."** gets a visual: the check-in on a phone, one question visible, "90 seconds". Ninety-seconds copy stays; phrasing becomes "before the session, and a check-out after".
- New block **"Things we will never build."** Five items, one line each: scheduling and booking pages · seats or a second login · a supervisor or employer view · a directory or public profile · badges, streaks or scores. Positioned after session-three, before privacy.
- Section order: Hero → Three layers → Month closes → Session ends → Session three → Never build → Nobody else sees this → Pricing → Questions → Stop guessing.
- CTA copy to first person everywhere: **Start my 14-day trial**. (One published study, +90%; cheap to adopt, easy to revert.)
- "See how it works" opens the walkthrough video in a modal (WS5). Until the video exists, it scrolls to the layers.
- Hero line break after "practice." (already on disk, uncommitted).
- Executor: Sonnet. Checker: Sonnet with screenshots against this list.

## WS2 · Mobile pass

- Playwright at 390 and 768: hero chart stacks under text; buttons full width on mobile; three layer cards stack; invoice band cards stack; phone visual not cropped; sticky bottom "Start my 14-day trial" bar on mobile after the hero scrolls out.
- Executor: Sonnet. Checker: Haiku runs the screenshot script and compares against a fixed checklist.

## WS3 · Terms, privacy, refunds, and the consent points in the flow

Pages to create (Razorpay requires Terms, Privacy, Refund/Cancellation and Contact to be public): `/terms`, `/privacy`, `/refunds`, `/contact`. Footer links to all four. Signup gets a required checkbox: "I've read the terms and the privacy note" linking to both.

What the terms must contain, sourced from our own documents (03, 06, 07, pricing-and-build-plan, brand guide):
1. **Who it is for.** One counsellor per account. One login. Not for groups, clinics, platforms or organisations; we do not sell to them.
2. **Your data is yours.** No employer, platform, investor or Deepen staff view. Export everything in one click at any time, including after cancellation. Deletion on request. Hosted in India. Never used to train anything.
3. **Clinical responsibility.** Deepen records and charts what the counsellor and client enter. It does not diagnose, does not replace clinical judgement, and is not for emergencies. Flags describe a client's readings, not the counsellor. The counsellor chooses thresholds and instruments and is responsible for using measures they are licensed to use.
4. **Client data.** The counsellor is responsible for telling clients that check-ins are recorded and for obtaining any consent their practice requires. Under DPDP the counsellor is the fiduciary for their clients' data; Deepen processes it on their instruction. Plain-English version of that.
5. **The fence.** Up to 30 active clients. Terminated clients keep their record forever and don't count. Terminate-and-reactivate is allowed. If we believe an account is being shared by more than one counsellor we will write to you first.
6. **Benchmark pool** (when it ships). Off by default. Three numbers per reading, de-identified. Switch off any time. Consent wording written for DPDP.
7. **Billing.** ₹999 a month. 14-day trial, card at signup, no charge until day 14. Cancel any time from settings; access continues to the end of the paid month. Refunds per the refund page (see question 3). Founding 50: ₹699 a month for at least three years from first payment, for the first fifty paying accounts, stated in the welcome email. Price changes with 30 days' notice; founding accounts exempt for the lock period.
8. **After cancellation.** Data available for export for N days (see question 4), then deleted. Written confirmation on deletion.
9. **Security and breach.** Encryption at rest, India residency, a documented breach process, notification within 72 hours of confirming a breach affecting your data. Understated, no certifications claimed.
10. **Support.** Email only, 48-hour response on working days. No phone, no WhatsApp.
11. **Changes to these terms.** 30 days' notice by email.
12. **Governing law and entity.** See question 2.

Deliverables: four pages in the brand voice (plain, short sentences, no legalese where a plain sentence does the job), a one-paragraph client-facing notice for the check-in page (for when delivery ships), the signup checkbox, footer links. **A lawyer reads all of it before launch.** Executor: Sonnet drafts from the source docs. Checker: Sonnet cross-checks every clause against 03/06/07 and the pricing plan and flags any promise the product can't keep today.

## WS4 · Speed

- Confirm fonts load through `next/font` (self-hosted at build), not a runtime Google Fonts link. Hero and all graphics stay inline SVG. Lighthouse on the preview at mobile: target LCP under 2.5s.
- Executor: Sonnet. Checker: Haiku runs Lighthouse and reports numbers.

## WS5 · The 60 to 90 second walkthrough

Shot list (silent, captions on, brand cover 0.3s, ends on the wordmark):
1. Log a session, three seconds.
2. Month end: one click, every invoice generated, "Sent". Eight seconds.
3. Check-in before, check-out after: the two short forms. Eight seconds.
4. One client's chart filling in over six sessions. Ten seconds.
5. The flag appearing on a note, with its reason. Six seconds.
6. "Nobody else ever sees this." Three seconds. Wordmark.
Depends on question 1. Executor: depends. Checker: Sonnet watches the render, checks every frame is fabricated data and no instrument name is visible.

## Not in this plan (later)

Testimonials and founder note (Adi: later) · automated delivery · Outcome Report · benchmark pool · comparison table.

## Open questions (answered by Adi before the relevant workstream starts)

1. Video: record the real product yourself from my shot list and I edit it, or I build a scripted demonstration from fabricated data and render it?
2. Legal entity name, registered address (work), and contact email for the terms and footer.
3. Refund policy: no refunds after a charge but cancel any time (simplest, common), or pro-rata refund on request within 7 days of a charge?
4. Data retention after cancellation before deletion: 30 or 90 days?
