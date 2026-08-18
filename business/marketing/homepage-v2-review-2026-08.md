# Deepen home page · review of the preview build against the live page

*18 August 2026, v1.2. Preview: `aman-git-preview…vercel.app/home`. Live: `deepen.health/home`. Reviewed in Chrome at 1456px. Written for the agent making the changes. Numbered so we can refer to items by number.*

**Verdict.** Ship the preview's structure. It is shorter, decides faster, and puts the product above the fold. Fix the rendering bugs, correct three copy misses, and bring back three things the live page did better. Do not bring back the rest.

**Two rules that apply to every item below.**
- No competitor is named anywhere on the page. Not in the FAQ, not in a caption.
- The Founding 50 offer does not appear on the page. It is applied at checkout and said in the welcome email, not sold on the home page.

---

## A · Bugs (fix before anything else)

| # | What | Where | Fix |
|---|---|---|---|
| A1 | Several text blocks render at ~5% opacity: the line under the hero CTAs, the line under the pricing heading, the Pro line under the price card, the session-note card label, the whole footer | Whole page | Reveal-on-scroll animation not firing, or a muted token set too light. Whichever it is, the trust microcopy and the footer are currently invisible |
| A2 | Third layer card is mislabelled "Total Privacy" over body copy about caseload and the Outcome Report | Layers row | Title should be the third question, see C4 |
| A3 | Depth bars missing on cards one and two; only card three shows one | Layers row | Show all three at increasing thickness (6 / 10 / 14px), or remove the bar from all three |
| A4 | Nav mark is three equal bars (reads as a hamburger). Brand rule: never equal bars | Nav | Use `marketing/logo/lockup.svg`, or wordmark alone |
| A5 | "counselor" (US) in the layers heading; rest of page says "counsellor" | Layers heading | Heading is replaced anyway, see C3 |
| A6 | Two CTA labels: nav "Start free trial", hero "Start your 14-day trial" | Nav, hero | One label everywhere: "Start your 14-day trial" |
| A7 | Nav link says "Features"; section is "How it works". "See how it works" ghost button has no visible target | Nav, hero | Rename link; anchor both to the layers row |

---

## B · Bring back from the live page

These are the three things the live page did better. Everything else on the live page stays retired (see E).

**B1 · The hopeful hero chart.** The live hero chart shows a client line *rising* against a shaded band of clients who started in a similar place. The preview shows a client sliding, flagged. First impression matters: the headline promises "know your clients are getting better", and the picture under it should show exactly that. Move the sliding-client story down to the "You'll know by session three" card, where it belongs (it's already there). In the hero, use the rising line, the neutral band labelled *clients who started in a similar place*, and a quiet ink chip *Tracking* or *Ahead* (no colour, per brand). Keep the y-axis label *wellbeing, higher is better* and drop the floating 40/20 numbers.

**B2 · The problem statement and pull-quote.** The live page has *"Nobody can tell you if you're any good at this."* followed by the italic serif pull-quote *"You don't need a research department. You need a few numbers each session and something that reads them properly."* Nothing on the preview says why this exists. Bring the block back, but **reword the heading**: the live line is a verdict about the counsellor, and for someone who has met outcome numbers as shame, that is the wrong doorway. Name a moment she recognises instead.

Use: **Is it working? There's no one to ask.** Then the pull-quote, unchanged. Two lines, one hairline card, between the layers row and the "session three" section.

Provenance: 01-icp-research §1, theme 2, the interviewees' line as the researcher recorded it: *"There is no way to tell if I am any good, and no one to ask."* The heading keeps the two halves that are the pain (no way to tell, no one to ask) and drops the verdict word. Alternatives from the same paragraph: *No supervisor you can afford. No one who sees the whole of your work.* · *Everything in the room ends up feeling like it's about you. It doesn't have to.* Our research is paraphrase-only; in the beta ask each counsellor "Tell me about a client you weren't sure you were helping. Who did you talk to about it?" and replace this heading with what they say.

**B3 · The invoicing visual.** The live page shows the invoice UI (August invoices, 14 drafts, outstanding ledger). The preview has no picture of invoicing at all, and invoicing is the trigger. Bring back a compact version as a strip under the hero chart, or as the visual next to the first layer card: *August · 23 sessions · 11 clients · two currencies · generated in one click · Sent.* One row, not a full card. Also bring back the small-caps line *your practice, your thresholds* under the "session three" heading; it says the counsellor is in control, which is the medicine side of the line.


---

## C · Copy changes

| # | Now | Change to | Why |
|---|---|---|---|
| C1 | **Run your solo practice. Know your clients are getting better.** (wraps to four lines) | **Run your practice. Know it's working.** | Six words, two lines, both layers, an outcome. Alternatives if you want "clients" in it: *Less admin. More certainty your clients are getting better.* |
| C2 | Close your monthly billing in ten minutes. Use a quiet, 90-second check-in to catch sliding clients **before it's too late.** Built for one counsellor, in India. | Close your monthly billing in ten minutes. A quiet 90-second check-in tells you how each client is doing, **while there's still time to help.** Built for one counsellor, in India. | "Before it's too late" is fear language. The product points, it never alarms |
| C3 | Everything a solo counselor needs. | **Three layers. Each one goes a little deeper.** | The current line is every SaaS page. This one only Deepen can say |
| C4 | Seamless Admin · Quiet Insights · Total Privacy | **Run the practice** · **How is this client doing?** · **How am I doing?** | Questions the counsellor already asks. Instantly understood, they map to pricing, and the third explains "coming" by itself |
| C5 | (under hero CTAs, currently invisible) 14 days free. Cancel in one click. Export your data anytime. | **₹999 a month. No card charged until day 14. Export everything, any time.** | Puts the price above the fold so browsing becomes deciding. Fix A1 so it shows |
| C6 | Price card fence: Built exclusively for solo practitioners. Up to 30 active clients. Closed client records are kept forever and never count toward your limit. If you run a group clinic or agency, Deepen is not for you. | **For one counsellor. Up to 30 active clients, more than one person can see. Groups and organisations, this isn't for you.** | Shorter, no "limit", no "agency". Closed-record detail goes in the terms |
| C7 | FAQ: …PractiPal or PracFlow will serve you better… | **No, on purpose. Deepen does the two things a solo counsellor can't get anywhere else and leaves the rest to tools built for it.** | No competitor names on the page |
| C8 | Closing: See what a truly private, measurement-first practice feels like. | **If it tells you something uncomfortable, that's the product working.** | "Measurement-first" is jargon and contradicts the invoicing-first opening. The new line filters for the counsellor we want |
| C9 | (new, one sentence in the "session three" section) | **Your evenings stop going to invoices, and you stop guessing about the client who worries you.** | The one line on the page about *her* life, not the practice or the client |
| C10 | Layer three body: Your whole caseload on one page. Then the Outcome Report. | Keep, add the honesty beat as a second line: **When there isn't enough history to say something useful, it says so. It won't guess.** | From the live page. Disarms the informed reader in twelve words |

| C11 | **Add.** Pro line under the price card: Deepen Pro, ₹1,999, arrives with the Outcome Report. Nobody on Deepen loses anything when it does. | **Coming: Deepen Pro, ₹1,999. For when you're ready to ask "how am I doing, across all of them?" Nobody on Deepen loses anything when it arrives.** | Gives the line its question. Do **not** add a second price card for Pro: a card is a choice the visitor can't make, and it slows the one decision we want. The third layer card already plants Pro |

Keep as they are: the "You'll know by session three" body, the privacy band and its four chips, the price card bullets, the FAQ answer to "I don't measure outcomes at the moment".

---

## D · Graphic and layout changes

| # | Change |
|---|---|
| D1 | Hero chart per B1: rising client line, neutral band, ink verdict chip, axis label, no floating numbers |
| D2 | Invoice strip per B3 under the hero chart, one row |
| D3 | Depth bars on all three layer cards, 6 / 10 / 14px, teal ramp light to dark |
| D4 | Nav: lockup SVG or wordmark alone. Remove the equal-bars mark |
| D5 | Hero headline max-width so it breaks at two lines at 1280 and 1456px |
| D6 | Problem block per B2: new heading in Newsreader, pull-quote in italic Newsreader on a hairline card, styled as the live page styles it. It is the one piece of live styling worth keeping |
| D7 | Fix the invisible-text bug (A1) and re-check every muted token clears 4.5:1 on paper |
| D8 | Keep the preview's left-aligned two-column hero. Do not go back to the live page's centred hero; the chart beside the headline is what makes the page decide faster |

---

## E · Do not bring back from the live page

- The old headline ("Built for the solo practice. Deepen the work, automate the invoicing.") and the "clear mirror" sub-line
- The comparison table and every competitor column
- The three stat tiles (0.82 / 68% / 12%) and the uncited "industry average is 8–10%"
- The "thousands who started in a similar place" claim
- The two-plan pricing and annual prices
- The full "Are they on track?" section (its honesty line survives in C10)
- The WhatsApp support group bullet, and the free-training bullet
- A second price card of any kind
- The word "alert" anywhere

---

## Order of work

1. A1 (invisible text), then A2 to A7. Small, mechanical, and the page is broken without them.
2. C1 to C8 copy swaps. Text only.
3. B1 hero chart and D1 to D5.
4. B2, B3, C9, C10, C11. Additions.
5. Re-screenshot at 1280 and 390 wide. Check every muted line is readable and nothing names a competitor or the founding offer.
