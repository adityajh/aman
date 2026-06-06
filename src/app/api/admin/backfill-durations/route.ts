import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatIST } from "@/lib/tz";

// ────────────────────────────────────────────────────────────────────────────
// One-time backfill: recompute invoiced duration + fee for already-completed
// sessions under the new pro-rata pricing rule (sessions ≤45 min bill less than
// a full hour). Mirrors the formula in /api/sessions/[id]/note exactly.
//
// SAFETY:
//   - Only touches status='completed' sessions with NO invoice attached, so it
//     can never alter a bill that has already been generated or sent.
//   - GET (default) is a DRY RUN — it changes nothing and returns the full list
//     of proposed old→new values. Add ?apply=1 to actually write the changes.
//   - Login-protected: only the authenticated counselor can run it.
// ────────────────────────────────────────────────────────────────────────────

function newInvoicedDuration(actualMin: number): number {
  const rounded = Math.max(15, Math.round(actualMin / 15) * 15);
  return actualMin <= 70 ? Math.min(rounded, 60) : rounded;
}

export async function GET(req: Request) {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  const apply = new URL(req.url).searchParams.get("apply") === "1";

  try {
    const candidates = await db.query.sessions.findMany({
      where: and(eq(sessions.status, "completed"), isNull(sessions.invoiceId)),
      with: { client: true, feeScheme: true },
    });

    const changes: any[] = [];

    for (const s of candidates) {
      // Need both actual times to recompute a duration; otherwise there's
      // nothing new to derive — skip.
      if (!s.actualStartTime || !s.actualEndTime) continue;

      const actualMin = Math.abs(
        Math.round((new Date(s.actualEndTime).getTime() - new Date(s.actualStartTime).getTime()) / 60000)
      );
      const oldBilled = s.invoicedDurationMin ?? s.durationMin;
      const newBilled = newInvoicedDuration(actualMin);

      // Fee is only auto-derived when a scheme is attached and the fee wasn't
      // manually overridden — same condition as the note-save path.
      const oldFee = s.feeCharged;
      let newFee = oldFee;
      if (s.feeScheme && !s.feeOverride) {
        newFee = ((newBilled / 60) * Number(s.feeScheme.amount)).toFixed(2);
      }

      const durationChanged = newBilled !== oldBilled;
      const feeChanged = (newFee ?? null) !== (oldFee ?? null);
      if (!durationChanged && !feeChanged) continue;

      changes.push({
        id: s.id,
        client: s.client?.name,
        date: formatIST(s.scheduledAt, "d MMM yyyy"),
        actualMin,
        oldBilledMin: oldBilled,
        newBilledMin: newBilled,
        oldFee,
        newFee,
        currency: s.feeScheme?.currency ?? "INR",
        feeOverride: s.feeOverride,
      });

      if (apply) {
        await db
          .update(sessions)
          .set({ invoicedDurationMin: newBilled, feeCharged: newFee, updatedAt: new Date() })
          .where(eq(sessions.id, s.id));
      }
    }

    return NextResponse.json({
      mode: apply ? "APPLIED" : "DRY_RUN",
      completedUnbilledScanned: candidates.length,
      sessionsAffected: changes.length,
      changes,
      hint: apply
        ? "Changes have been written."
        : "This was a dry run — nothing changed. Re-open this URL with ?apply=1 to commit.",
    });
  } catch (error: any) {
    console.error("[backfill-durations]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
