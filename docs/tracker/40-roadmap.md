# Roadmap

Ordered by what is blocking what, not by size. The product build order comes
from `PROJECT-INSTRUCTIONS.md`; the safety work in *Now* comes first because
each item is a live exposure, not a feature.

## Now: close the live exposures

1. **Reset the database password.** Adi, in the Neon account that owns the database (probably reached from Vercel, project `aman`, Storage). Then update `DATABASE_URL` in Vercel and `AMAN_DATABASE_URL` in the cloud environment.
2. **Stop the password reaching the logs.** Add an `error` handler to the WebSocket pool in `src/lib/db/index.ts`, and delete `scratch/direct-migrate.js`. Ships right after step 1.
3. **Correct "Hosted in India".** Home, privacy and terms pages. The database is in AWS us-east-1.
4. **Move app email off the personal Gmail.** Send through Resend from `deepen.health`, which now has working mail. Every practice's invoices currently pass through one counsellor's mailbox.
5. **Make the subscription webhook reachable and signed.** Exclude `/api/webhooks` in the middleware and refuse unsigned calls, in one change. Fixing only the first opens an unsigned endpoint.

## Next: the product build order

1. **Strip instrument names from public copy, and the measures fix.** Group A of `HANDOVER-measures-AB-2026-08-31.md` after lawyer review of the A1 wording; group B alongside.
2. **Onboarding under five minutes.** Practice's only real moat.
3. **Automated measure delivery**, on PHQ-9 and GAD-7. The highest-value unbuilt thing; without it the counsellor types every score by hand.
4. **The Outcome Report.** The artefact a counsellor can use as evidence of their own effectiveness.
5. **Benchmark pool**, with opt-in consent. The only compounding moat.

## Alongside: work streams waiting on a person

- **Online payments.** Razorpay partner and test OAuth app (Adi), then the schema change in `drizzle/manual/2026-11-razorpay-connect.sql`, then an end-to-end test in Test Mode.
- **Client diary.** Build Phase 1 of `business/strategy/08-client-diary-scope.md` once Adi's designs arrive.

## Later: costed but not scheduled

- Rename `middleware.ts` to `proxy.ts` per the Next 16 deprecation.
- Turn `ignoreBuildErrors` off so a type error fails the deploy.
- Write to the audit log, or remove it.
- Bring the Drizzle journal back in line with the live schema, so migrations can run through the tool again.

:::note
Nothing in *Later* is scheduled. The never-build list in
`business/strategy/03-business-strategy.md` section 3 is not a roadmap and
nothing on it belongs here.
:::
