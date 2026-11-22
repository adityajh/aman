# Addendum: add a main-domain mailbox (`@deepen.health`)

**For:** Adi's agent, alongside `outreach-mailbox-setup-2026-11.md`.
**From:** the cloud agent working on Deepen, 22 November 2026.
**Status:** Adi has approved this change. Where this note and the first one
disagree, **this note wins.** Everything else in the first note still applies,
including section 2 (DNS is on Vercel, not GoDaddy) and section 4 (do not).

---

## 1. What changed

The first note set up two mailboxes on the outreach subdomain only. Adi wants
replies and one-to-one mail on the main domain instead, and Deepen needs a
support address anyway. The final setup:

| Address | Domain | What it is for |
|---|---|---|
| `hello@outreach.deepen.health` | `outreach.deepen.health` | Campaigns only. Unchanged from the first note |
| `adi@deepen.health` | `deepen.health` | Replies to campaigns, one-to-one mail, DMARC reports |
| `support@deepen.health` | `deepen.health` | An **alias** (forwarder) into `adi@deepen.health`, not a second mailbox |

**Dropped:** `adi@outreach.deepen.health` from the first note. Do not create it.
If it already exists, leave it and tell Adi; do not delete anything.

**Why this is safe:** only incoming mail and low-volume personal mail touch
`deepen.health`. Campaigns still go out from the subdomain, so complaints about
cold email never attach to the main domain. **No campaign is ever to be sent
from an `@deepen.health` address.**

## 2. Steps

### 2.1 Hostinger

1. Set up Hostinger email for **`deepen.health`** as well as
   `outreach.deepen.health`. This is likely a second email plan, since
   Hostinger usually prices per domain. **Confirm the price with Adi before
   buying.** Smallest plan is fine; this is one mailbox and one alias.
2. Create the mailbox `adi@deepen.health`. Adi chooses the password. It never
   goes into chat, a file, a commit or a ticket.
3. Create `support@deepen.health` as an alias or forwarder delivering into
   `adi@deepen.health`.

### 2.2 DNS records for the main domain, in Vercel

Same place as before: Vercel, team "Aditya's projects", Domains, `deepen.health`,
DNS Records. Take the **exact values Hostinger shows for `deepen.health`**; the
values below are only so you know what to expect.

| Type | Name | Value, roughly |
|---|---|---|
| MX | `@` (the apex) | Hostinger's two MX hosts, with their priorities |
| TXT | `@` | SPF, e.g. `v=spf1 include:_spf.mail.hostinger.com ~all` |
| CNAME | `hostingermail-a._domainkey` (and `-b`, `-c` if shown) | Hostinger's DKIM targets |

This **replaces** the instruction in the first note's section 3.3 that said
"no SPF or MX on `deepen.health` itself". Add exactly these, nothing else.

Rules:

- **One SPF record only** on the apex. If a `v=spf1` TXT already exists at `@`
  when you get there, stop and tell Adi rather than adding a second; two SPF
  records break both.
- Leave the existing Vercel `ALIAS` and `CAA` records exactly as they are. The
  website must keep working.
- Later, Deepen's app will also send invoices through Resend on this domain.
  Resend uses its own separate record names, so do not try to prepare for it
  now and do not add anything Resend-related.

### 2.3 DMARC: one small change

In the first note, the apex `_dmarc` record's report address was
`adi@outreach.deepen.health`. Since that mailbox is dropped, use:

```
v=DMARC1; p=none; sp=none; rua=mailto:adi@deepen.health; aspf=r
```

If you already added the old one, edit it to this. Do not add a second
`_dmarc` record.

### 2.4 Verify by query

In addition to the four checks in the first note:

```bash
dig +short MX deepen.health @ns1.vercel-dns.com
```

```bash
dig +short TXT deepen.health @ns1.vercel-dns.com
```

```bash
dig +short CNAME hostingermail-a._domainkey.deepen.health @ns1.vercel-dns.com
```

And confirm the website still loads at https://www.deepen.health after your
changes.

### 2.5 Tests

1. From `adi@deepen.health`, send one email to a Gmail address Adi reads.
   "Show original" must show `SPF: PASS`, `DKIM: PASS` signed by
   `deepen.health`, and `DMARC: PASS`.
2. From that Gmail, send one email to `support@deepen.health` and confirm it
   arrives in `adi@deepen.health`.
3. The test from `hello@outreach.deepen.health` in the first note still
   applies.

## 3. Not part of this task

Pointing campaign replies at `adi@deepen.health` (the Reply-To setting) and
connecting that inbox to the outreach CRM are done later, in the CRM's own
settings, once the Deepen board is deployed. Do not attempt them now.

## 4. Report back

Add to the reply section of the first note, or a reply file beside this one:

1. The mailboxes and alias as created, and the Hostinger plan or plans bought.
2. Every DNS record added or changed in Vercel: type, name, value.
3. Output of all seven `dig` commands (four from the first note, three here).
4. The Gmail "Show original" results for both sending addresses.
5. Whether the `support@` test arrived, and whether the website still loads.
6. Anything that did not go to plan.
