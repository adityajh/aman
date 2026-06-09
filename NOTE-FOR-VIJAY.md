# Note for Vijay — Reports page

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

## One thing to run on the DB

This added a column for the manual PTR-II flag. Migration: `drizzle/0002_add_ptr_manual.sql` (adds `premature_termination_manual` to the clients table). Make sure it's applied to prod.

Also bundled in this deploy: a **predicted-progress** chart on the client detail view that compares a client's trajectory against a cohort of similar-starting clients.

Shout if anything looks off.
