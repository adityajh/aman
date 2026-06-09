# Note for Vijay — Reports page + Predicted Progress graph

Hey Vijay,

We just shipped a new **Reports** page (live in the sidebar between Clients and Sessions). Quick rundown of what it does and how to read it.

## What it is

A clinical-outcomes dashboard. It answers: *across the clients we've closed, are people actually getting better?* It's built on the ORS (Outcome Rating Scale, 0–40) and SRS (Session Rating Scale, alliance) scores entered in session notes.

## Sections

- **Overview** — closed-client count, % who started in distress (initial ORS ≤ 25), median tenure (weeks), median sessions per client.
- **Outcome ratios** — for the distress cohort with both a first and last ORS: how many reliably improved (RCI), deteriorated, stayed flat, or hit clinically significant change (CSC).
- **Effectiveness** — effect size (Cohen's d) and average alliance (SRS).
- **Pre-mature termination** — PTR-I (auto, from low-ORS clients who didn't reach a good outcome), PTR-II (manual flag you can set on a closed client), and the combined Final PTR.
- **Live — At-risk clients** — the one forward-looking number: *active* clients whose latest session note is flagged medium/high risk.

## Important: where the numbers come from

Almost everything is computed from **closed clients only** (clients marked terminated / not active). The single exception is the **At-Risk** card, which looks at active clients.

A closed client only contributes to the outcome numbers if it has **completed sessions with ORS/SRS scores recorded in the session notes** — and outcome ratios specifically need at least two scored sessions (a first and a last). If a client was closed without scored sessions, it counts toward "Closed clients" but shows blank elsewhere. So early on, expect lots of "—" until we have closed clients with real score history.

## Predicted Progress graph (new)

There's also a new graph that answers a different question: *is this particular client on track compared to similar people?*

**Where to find it:** Clients → click **Charts** on a client's row. The dialog now has a third graph, **Predicted Progress**, below the ORS and SRS charts.

**How to read it:** we take everyone who *started* at a similar ORS (within ±5 of this client's first score) and plot their average path as a shaded band. The client's own ORS line is drawn over it, with a coloured verdict at the top:

- 🟢 **Green** — ahead of similar clients
- 🟡 **Amber** — tracking with them
- 🔴 **Red** — behind, worth a closer look

**When it stays blank:** it needs at least **5 other clients** who started near the same ORS, and the client needs at least **3 sessions with ORS scores**. Below that it just says "not enough similar clients yet" rather than guessing. So this one also gets more useful as the score history grows.

## DB migration (already applied)

This added a `premature_termination_manual` column to the clients table for the PTR-II flag (`drizzle/0002_add_ptr_manual.sql`). It's **already been applied to prod** — no action needed.

Shout if anything looks off.
