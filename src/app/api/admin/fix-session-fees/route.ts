import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// One-time targeted fix for 5 sessions with missing scheme links / wrong billed duration.
// DELETE this file after running.

const FIXES = [
  {
    id: "889b4290-4748-4619-9c7b-388f458a12b9",
    label: "Krithika Balaji 9 May — 90m, attach Disc-INR-I",
    feeSchemeId: "a6c3b7d1-e0ea-48dd-8b2a-fa8b3ec805ca",
    invoicedDurationMin: 90,
    feeCharged: "5250.00",
  },
  {
    id: "a4c3740d-d40b-4c2e-97f8-690beb8304fd",
    label: "Krithika Balaji 17 May — 60m, attach Disc-INR-I",
    feeSchemeId: "a6c3b7d1-e0ea-48dd-8b2a-fa8b3ec805ca",
    invoicedDurationMin: 60,
    feeCharged: "3500.00",
  },
  {
    id: "e43629cc-211a-4e85-a9dd-5fcab1051c58",
    label: "Salima Hooda 7 May — 45m, attach Disc-INR-I",
    feeSchemeId: "a6c3b7d1-e0ea-48dd-8b2a-fa8b3ec805ca",
    invoicedDurationMin: 45,
    feeCharged: "2625.00",
  },
  {
    id: "cce0046e-6547-457e-abe3-48c6315905eb",
    label: "Ayushi Walia 7 May — 45m, attach Disc-INR-II",
    feeSchemeId: "4e829463-ee9f-42e9-8fd9-dedf9ccf7134",
    invoicedDurationMin: 45,
    feeCharged: "2250.00",
  },
  {
    id: "1f4b68aa-e3b2-482c-a0ef-5dfccf2de686",
    label: "Purnima Chaudhry 6 Jun — correct 60m→45m billed, $72→$54",
    feeSchemeId: "2f59c1fa-633e-424b-b40c-ecf597d3d5f1", // already set
    invoicedDurationMin: 45,
    feeCharged: "54.00",
  },
];

export async function GET(req: Request) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) return new NextResponse("Unauthorized", { status: 401 });

  const apply = new URL(req.url).searchParams.get("apply") === "1";
  const results = [];

  for (const fix of FIXES) {
    const existing = await db.query.sessions.findFirst({
      where: eq(sessions.id, fix.id),
      columns: { id: true, status: true, invoiceId: true, feeCharged: true, feeSchemeId: true, invoicedDurationMin: true },
    });

    if (!existing) {
      results.push({ ...fix, error: "NOT FOUND" });
      continue;
    }
    if (existing.invoiceId) {
      results.push({ ...fix, error: "ALREADY INVOICED — skipped" });
      continue;
    }

    const before = {
      feeCharged: existing.feeCharged,
      feeSchemeId: existing.feeSchemeId,
      invoicedDurationMin: existing.invoicedDurationMin,
    };

    if (apply) {
      await db.update(sessions)
        .set({
          feeSchemeId: fix.feeSchemeId,
          invoicedDurationMin: fix.invoicedDurationMin,
          feeCharged: fix.feeCharged,
        })
        .where(eq(sessions.id, fix.id));
    }

    results.push({
      label: fix.label,
      id: fix.id,
      mode: apply ? "APPLIED" : "DRY_RUN",
      before,
      after: { feeCharged: fix.feeCharged, feeSchemeId: fix.feeSchemeId, invoicedDurationMin: fix.invoicedDurationMin },
    });
  }

  return NextResponse.json({ mode: apply ? "APPLIED" : "DRY_RUN", results });
}
