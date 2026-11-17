Design the client diary screen for Deepen, a web app for independent counsellors in India.

## The product

Deepen is outcome tracking for counsellors. It's used by one counsellor working alone in private practice. She logs sessions, writes session notes, tracks two short wellbeing scales each session (ORS: client wellbeing, 0–40; SRS: how the session felt, 0–40), and sends monthly invoices. She often writes notes late in the evening, after her last client.

## What I need

Each client gets a **diary**: one page that feels like the counsellor's own notebook for that person. It brings together who the client is, where they left off last time, and every session written down in date order.

The feeling to aim for: warm, calm, private, easy. Like opening a well-kept notebook, not a medical record or an admin dashboard. The brand calls this "a field instrument, not an app". It should look like paper and ink, with very little colour. The only thing that should draw the eye is what she wrote and the data.

Carry the diary feel through **structure and language**: a cover, divider-like page tabs, dated entries, a margin for private notes, warm wording. **Do not** use paper textures, leather, torn edges, page curls, handwriting fonts, stitching or page-turn effects.

## Brand

**Colour (light):**
- Page `#FBFAF7` (unbleached paper), card `#FFFFFF`, hairline `#E4E1DA`
- Primary ink `#14181C`, secondary ink `#4A5157`, muted `#878D93`
- Teal ink `#0B4F43` for headings, teal action `#0F8A72` for buttons, links and data
- Terracotta `#C2632A` for **warmth only**: the client monogram, empty states, welcome moments. Never on a button, a flag or anything that judges.
- Flag ("worth a closer look"): brick `#B4472F`, always with an icon and label, never colour alone. Never use bright red.

**Colour (dark):** page `#16181A`, card `#1E2124`, ink `#F5F4F1`, secondary `#B9BDC2`, hairline `#2B2F33`, teal ink `#5FC3AE`, teal action `#2AA890`, terracotta `#CE7440`.

**Proportion:** roughly 70% paper, 20% ink, 8% teal, 2% terracotta. If the screen looks colourful, it's wrong.

**Type:**
- **Newsreader** (serif, 400–600) for headings and for the counsellor's own writing: entry text, the story, "where we left off". Sentence case, never all caps.
- **Inter** for interface, labels, dates, numbers and controls. Small labels may be 11–13px uppercase with .06em tracking.
- Reading text 15–16px, line height about 1.55, max width about 680px.
- Tabular figures for numbers.

**Voice:** plain, specific, unhurried. No exclamation marks. Say "flag" or "worth a closer look", never "alert", "warning" or "at risk". No streaks, scores, badges, progress bars or "profile 60% complete".

## Layout

Desktop at 1440px wide, inside the existing app shell (a left sidebar about 240px wide, already built; show it simply).

**1. Cover (top of page)**
- Back link "← Clients"
- Initials monogram in a circle (terracotta tint), client name in Newsreader
- One line: pronouns · age · city · "with you since March 2026"
- One line: "18 sessions · next: Thu 12 Nov, 6:00 pm · video"
- Status: Active / Paused / Closed (quiet chip)
- Primary button "+ Write", top right

**2. "Where we left off" card (directly under the cover, the most important element)**
Built from the last session. It should read like a short note to herself:
- Date of last session
- One or two lines of what they talked about
- "She agreed to: …" / "You were going to: …" / "Pick up next time: …"
- One quiet line: ORS 24 → 27 · SRS 37
- If the last note had a flag, show it gently with an icon and label

**3. Main column: page tabs + content**
Tabs that read like notebook dividers: **Sessions · Story · Goals · Measures · Papers · Accounts**. Sessions is the default.

The Sessions page is a feed of dated diary entries, newest first:
- Session entries: serif date heading ("Thursday, 5 November"), small meta line ("Session 18 · 52 min · video"), then her note text in reading type. Note sections (Updates, Session notes, Client actions, My actions, Next agenda, Feedback) appear as quiet small captions above each paragraph, not coloured boxes.
- **Jots**: short entries not tied to a session (a phone call, a WhatsApp message, a thought). Lighter and smaller than session entries.
- **Private margin**: the counsellor's private impressions on an entry. Visually distinct (a soft tinted margin or side column with a small lock icon and "Only you see this"). It must feel clearly separate from the main note.
- A small list / full-text toggle and a search field above the feed.
- Pin icon on hover for any entry.

**4. Right rail (about 320px)**
Stacked quiet sections, each with an "Edit" link:
- **About**: phone, email, emergency contact (name, relation, phone), language, occupation, referred by, presenting concern
- **Pinned**: links to Formulation, Safety plan, and any pinned entries
- **Money**: "₹3,000 due · October invoice", link to Accounts
- **Consent**: "Research data: yes, 2 Mar 2026"

## Screens to produce

1. **Diary, Sessions page**: desktop, light mode, filled with the demo data below
2. **Same screen in dark mode**
3. **Story page**: long-form sections with gentle prompts, some filled and some empty: "What brought them here", "History", "Family and relationships", "Health", "Work and study", "Strengths", "Cultural context"
4. **The "+ Write" sheet**: a side panel or modal with three choices (Session note / Jot / Story section). Show the Jot form open, with the main text area, a private-margin field and a date/time.
5. **A brand-new client's diary**: no sessions yet. Warm empty states (terracotta is allowed here), e.g. "After your first session, this is where you'll pick up from."
6. **Mobile (390px)**: the cover and "where we left off" on top, the rail folded into collapsible sections under them, then the feed.

## Demo data (made up; never use a real person)

- Client: **Priya Sharma**, she/her, 34, Bengaluru, product designer, referred by Dr. Mehta, with you since March 2026, 18 sessions. Presenting concern: "Anxiety around a job change and her relationship with her mother."
- Emergency contact: Rohan Sharma (brother), +91 98450 12345
- Last session, Thu 5 Nov, 52 min, video:
  - Updates: "Slept better most nights. Had a hard call with her mother on Sunday."
  - Session notes: "Talked about the move to Pune and what staying near her mother would mean. Noticed she speaks faster when the job comes up."
  - Client actions: "Keep the sleep log. Write down three things she'd miss about Bengaluru."
  - My actions: "Send the article on decision-making under uncertainty."
  - Next agenda: "The job decision. Check in on the sleep log."
  - ORS 27 (up from 24), SRS 37
  - Private margin: "I felt protective of her today. Watch for rescuing."
- Jot, Mon 2 Nov: "WhatsApp: asked to move Thursday's session to 6 pm. Moved."
- Session, Thu 29 Oct, 50 min, in person: a short note, ORS 24, SRS 36, with a gentle flag: "Worth a closer look: ORS dropped 4 points since last session."
- Money: ₹3,000 due, October invoice

## Output

- Mark up the main spacing, type sizes and colours on the desktop light screen so a developer can build it.
- The build target is Next.js with Tailwind CSS and shadcn/ui components (Card, Tabs, Badge, Button, Dialog, Sheet, Textarea) and lucide icons. Prefer layouts that map cleanly to these.
- Check contrast: every text colour must reach 4.5:1 against its background in both modes.
- If you have to make a design choice I haven't covered, pick the calmer, simpler option and note it.
