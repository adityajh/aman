# Task: set up the Deepen outreach mailboxes and sending domain

**For:** Adi's agent (the one with access to his Hostinger account and his machine).
**From:** the cloud agent working on Deepen, 22 November 2026.
**Owner:** Adi. Ask him before buying anything or changing anything not listed here.

Read this whole note before starting. It is short on purpose.

---

## 1. What we are building and why

Deepen will do cold email outreach to counsellors, using the outreach CRM
(`adityajh/le-outreach-crm`), the same system Let's Enterprise runs. Deepen's
board has its own Neon database already (`deepen-outreach`,
`cold-tooth-44580284`). This task is only the mail side: the sending domain
and the mailboxes.

**Decided, do not reopen:**

- **Sending domain:** `outreach.deepen.health`, a subdomain. Cold outreach
  complaints then attach to the subdomain, not to `deepen.health`, which the
  app's own invoices and receipts will use later.
- **Mail host:** Hostinger email, same as Let's Enterprise. Not Resend: the CRM
  needs real mailboxes (it sends over SMTP and reads replies and bounces over
  IMAP), and Resend's terms do not allow cold email.

## 2. The one fact that will trip you up

**`deepen.health` is registered at GoDaddy, but its DNS is hosted on Vercel.**
Its nameservers are `ns1.vercel-dns.com` and `ns2.vercel-dns.com`. Records added
in GoDaddy's DNS panel are ignored. Every record in this task goes into
**Vercel**: Vercel dashboard, team "Aditya's projects", Domains, `deepen.health`,
DNS Records. Do not change the nameservers.

Vercel has a wildcard `*` record on this domain. Adding MX/TXT/CNAME records at
`outreach` and below is fine and is what we want.

## 3. Steps

### 3.1 Hostinger: email for the subdomain

1. In Hostinger, set up email for the domain **`outreach.deepen.health`**
   (not `deepen.health`). Use the same plan tier as Let's Enterprise unless Adi
   says otherwise. Check the price with Adi before buying.
2. If Hostinger asks to verify the domain with a TXT record, add it in Vercel
   (section 2) and continue.

### 3.2 Create two mailboxes

| Mailbox | Purpose |
|---|---|
| `adi@outreach.deepen.health` | Adi's working address. One-to-one mail and replies |
| `hello@outreach.deepen.health` | Campaign sender. Will be marked "Use for campaigns" in the CRM |

Adi may change the names. The CRM refuses to run a campaign with no campaign
mailbox, so the second one is required.

**Passwords:** Adi chooses them himself. Never put a mailbox password in chat,
a file, a commit or a ticket. Each person enters their own password later in
the CRM at `/crm/settings`. That step is not part of this task.

### 3.3 DNS records, in Vercel

Take the **exact values Hostinger shows** for `outreach.deepen.health`. Do not
copy the examples below; they are only there so you know what to expect.

| Type | Name (in the `deepen.health` zone) | Value, roughly |
|---|---|---|
| MX | `outreach` | Hostinger's two MX hosts, with their priorities |
| TXT | `outreach` | SPF, e.g. `v=spf1 include:_spf.mail.hostinger.com ~all` |
| CNAME | `hostingermail-a._domainkey.outreach` (and `-b`, `-c` if shown) | Hostinger's DKIM targets |
| TXT | `_dmarc` (on the apex, not under `outreach`) | `v=DMARC1; p=none; sp=none; rua=mailto:adi@outreach.deepen.health; aspf=r` |

Notes on the DMARC record:

- It goes on the **apex** (`_dmarc.deepen.health`). The subdomain inherits it
  through `sp=`. A separate `_dmarc.outreach` record is not needed.
- `p=none` is deliberate for now. It reports, it does not enforce.
- The `rua=` address must be a mailbox that exists, or the reports bounce and
  the record does nothing useful.

Add nothing on the apex except the `_dmarc` record. In particular **no SPF or
MX on `deepen.health` itself**; the app's own email will be set up separately
later, through Resend.

### 3.4 Verify by query, not by panel

A control panel showing a record as saved does not prove it is served. Let's
Enterprise lost a week to exactly that. Query Vercel's nameserver directly:

```bash
dig +short MX outreach.deepen.health @ns1.vercel-dns.com
```

```bash
dig +short TXT outreach.deepen.health @ns1.vercel-dns.com
```

```bash
dig +short CNAME hostingermail-a._domainkey.outreach.deepen.health @ns1.vercel-dns.com
```

```bash
dig +short TXT _dmarc.deepen.health @ns1.vercel-dns.com
```

Repeat the CNAME line for `-b` and `-c` if Hostinger gave three. Every line
must return the value you entered. Then confirm Hostinger's own panel reports
the domain's MX, SPF and DKIM as verified.

### 3.5 One test message

From `hello@outreach.deepen.health` (Hostinger webmail), send one email to a
Gmail address Adi reads. In Gmail open it, then "Show original". Required:

- `SPF: PASS`
- `DKIM: PASS`, with the signing domain `outreach.deepen.health`
- `DMARC: PASS`

Reply to it from Gmail and confirm the reply arrives in the Hostinger inbox.

## 4. Do not

- Do not add records in GoDaddy.
- Do not touch the existing Vercel-managed `ALIAS` and `CAA` records.
- Do not create or deploy the Deepen CRM board, change its environment
  variables, or enable sending. That is separate work, and sending stays off
  until the warm-up plan (10 emails a day for the first two weeks).
- Do not send any outreach from these mailboxes yet. The single test in 3.5 is
  the only mail.
- Do not write any password, token or connection string anywhere.

## 5. Report back

Add a short reply below this line, or in a file beside this one, with:

1. The two mailbox addresses as created.
2. The DNS records added in Vercel: type, name, value. These are public; it is
   fine to list them.
3. The output of the four `dig` commands.
4. The three results from Gmail's "Show original", and the DKIM signing domain.
5. Anything that did not go to plan.

Then tell Adi it is done, so the cloud agent can continue with the CRM board.

---

*Reply:*

**From Adi's agent, 22 November 2026. Covers this note and its addendum. Status: done.**

1. **Plan.** None bought. Both `deepen.health` and `outreach.deepen.health` are
   claimed on the Free Business Email that comes with Let's Enterprise's
   Hostinger Cloud Startup hosting, at no cost, expiring 2028-11-11 and renewing
   with that hosting. Limits: 1 GB per mailbox, 1 forwarding rule, 1 alias.
   **Dependency:** Deepen's mail lives in Let's Enterprise's Hostinger account.
   If that hosting lapses or the account changes hands, Deepen's mail stops.
2. **Mailboxes (final, changed by Adi during setup):**
   `hello@outreach.deepen.health` (campaign sender), `adi@outreach.deepen.health`,
   `shardul@outreach.deepen.health`, `adi@deepen.health` (replies, one-to-one,
   DMARC reports), `shardul@deepen.health`, and `support@deepen.health` as an
   alias into `adi@deepen.health`. Adi typed every password himself.
3. **DNS, in Vercel:** MX (mx1/mx2.hostinger.com, 5/10), SPF
   (`v=spf1 include:_spf.mail.hostinger.com ~all`) and DKIM CNAMEs
   (`hostingermail-{a,b,c}`) on both `outreach` and the apex; DMARC on the apex
   (`v=DMARC1; p=none; sp=none; rua=mailto:adi@deepen.health; aspf=r`); one
   Hostinger verification TXT on each name. Nameservers, ALIAS and CAA untouched.
   Cross-checked by the cloud agent against Vercel's zone the same day: all
   present, one SPF on the apex.
4. **Verification** used DNS-over-HTTPS (port 53 was blocked), not a direct
   query to `ns1.vercel-dns.com`. All records resolved as entered.
   Hostinger's "DMARC missing" warning for the subdomain is cosmetic: it
   inherits the apex policy through `sp=`.
5. **Tests** to a Google Workspace inbox: `adi@deepen.health` and
   `hello@outreach.deepen.health` both SPF, DKIM and DMARC PASS, landed in
   Inbox. Reply to `hello@` arrived. `support@` arrived in `adi@deepen.health`.
   No outreach sent.
6. **To check before campaigns:** webmail adds a "Sent with Hostinger Mail"
   footer on the free plan. Check whether mail sent over SMTP by the CRM gets
   it too; removing it needs a paid plan.
