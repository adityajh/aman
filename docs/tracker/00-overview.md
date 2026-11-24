# Overview

Deepen is practice software for counsellors in India who work alone. It handles
the admin (sessions, notes, monthly invoices, payments) and, more importantly,
tells a counsellor privately whether their clients are getting better. The
product works and is in daily use by one practice. The work now is turning it
into a business.

This page keeps the live status, the architecture, the decisions, the roadmap,
the backlog and the changelog in one place, so that the next person or agent to
pick Deepen up does not have to rebuild it from commit messages and chat.

## The three jobs this page does

- **What to do next.** The roadmap and backlog, with what is blocked and on what.
- **Where things stand.** Live status of production, the practices on it and the open risks, read from the systems, not estimated.
- **Context for somebody new.** Enough architecture to make a safe change on day one, including the traps that have already caught people.

## The rules that matter most

There is **one database, and it is production.** Local development and every
Vercel preview deployment point at the same live Neon database as the real
site. Anything you run that writes, writes to real practices' data.

**Every tenant-scoped query goes through `withTenantContext()`**
(`src/lib/tenant.ts`), which switches to a restricted role and sets the tenant
for row-level security. A leak here is a clinical-data breach. The `tenants`,
`users` and `promo_codes` tables have no row-level security, so any query on
them must filter by tenant ID itself (see Architecture).

**Ask Adi before anything irreversible:** a schema change, a data write, a
push or merge to `main`, a message to a real person.

## Where things live

| What | Where |
|---|---|
| Code | `adityajh/aman`, branch `main`, deployed by Vercel on every push |
| Live site | `www.deepen.health` (Vercel project `aman`, team "Aditya's projects") |
| Database | Neon, host `ep-proud-wildflower-amwa5kz2`, AWS us-east-1. Not in the Neon account the connector can see |
| DNS | Vercel (`ns1/ns2.vercel-dns.com`). The domain is registered at GoDaddy, but records added there are ignored |
| Email | Hostinger mailboxes on `deepen.health` and `outreach.deepen.health`, on Let's Enterprise's hosting account |
| Business thinking | `business/`, start with `business/strategy/03-business-strategy.md` |
| Outreach CRM | A separate system and a separate agent. See the Outreach Orchestrator page |

## If you are new, read in this order

1. `AGENTS.md`. This Next.js is version 16 and differs from what you know. Read `node_modules/next/dist/docs/` before writing framework code.
2. `PROJECT-INSTRUCTIONS.md`. The thesis, hard rules, never-build list and guardrails.
3. The **Status** and **Architecture** tabs here.
4. `business/marketing/brand-guide.md` before writing any copy a counsellor will read.

## How this page stays true

The markdown in `docs/tracker/` is the source. The page is generated from it by
`npm run build:tracker`, and `npm run check:tracker` fails if the two have
drifted. Edit the markdown, run the build, commit both. Never hand-edit
`index.html`.

The **Changelog** tab is not a copy: it is `CHANGELOG.md` from the repository
root, read at build time. So any commit that edits `CHANGELOG.md` must also run
`npm run build:tracker`, or `npm run check:tracker` fails. One nested bullet
level (`  - `) is allowed there; anything deeper fails the build.

The generator is copied from the Outreach Orchestrator page so the two behave
the same. The page is also published at
[claude.ai/artifact/9NbbELEvkoykr1EUz1KKxp](https://claude.ai/artifact/9NbbELEvkoykr1EUz1KKxp),
private to Adi, for reading outside the repository; republishing is a manual step, so if the published page and
`docs/tracker/index.html` disagree, the repository is right.

:::note
Every figure on the Status tab says when it was read and from where. A figure
with no date is a figure nobody can check, so do not add one.
:::
