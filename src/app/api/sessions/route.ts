import { db } from "@/lib/db";
import { sessions, practiceSettings } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    // Fetch settings for RCI threshold
    const settingsRows = await db.select().from(practiceSettings).limit(1);
    const settings = settingsRows[0];
    const orsCutoff = settings?.orsCutoff ?? 25;
    const srsCutoff = settings?.srsCutoff ?? 36;

    const allSessions = await db.query.sessions.findMany({
      where: clientId ? eq(sessions.clientId, clientId) : undefined,
      orderBy: [desc(sessions.scheduledAt)],
      with: {
        client: true,
        feeScheme: true,
        invoice: true,
        note: true,
      },
    });

    // Build a per-client ordered session list (oldest first = chronological)
    const clientSessionMap = new Map<string, typeof allSessions>();
    for (const s of allSessions) {
      if (!clientSessionMap.has(s.clientId)) clientSessionMap.set(s.clientId, []);
      clientSessionMap.get(s.clientId)!.push(s);
    }
    // allSessions is desc order, so reverse per-client gives asc (oldest→newest)
    for (const [cid, arr] of clientSessionMap) {
      clientSessionMap.set(cid, [...arr].reverse());
    }

    // ORS RCI threshold (PCOMS validated): 5 points
    const ORS_RCI = 5;

    // Enrich each session with prior ORS/SRS and clinical status
    const enriched = allSessions.map(s => {
      const clientHistory = clientSessionMap.get(s.clientId) ?? [];
      const idx = clientHistory.findIndex(h => h.id === s.id);

      const currentOrs = s.note?.orsTotal ?? null;
      const currentSrs = s.note?.srsTotal ?? null;

      // Initial ORS = first session in history with an ORS score
      const firstWithOrs = clientHistory.find(h => h.note?.orsTotal != null);
      const initialOrs = firstWithOrs?.note?.orsTotal ?? null;

      // Previous session (chronologically one before this one)
      const prevSession = idx > 0 ? clientHistory[idx - 1] : null;
      const prevOrs = prevSession?.note?.orsTotal ?? null;
      const prevSrs = prevSession?.note?.srsTotal ?? null;

      // ORS Clinical Status
      let orsStatus: string | null = null;
      if (currentOrs !== null) {
        const sessionChange = initialOrs !== null ? currentOrs - initialOrs : null;
        const isAboveCutoff = currentOrs > orsCutoff;
        const isRCI = sessionChange !== null && sessionChange >= ORS_RCI;
        
        if (isAboveCutoff && isRCI) {
          orsStatus = "CSC Achieved";
        } else if (isRCI) {
          orsStatus = "RCI Achieved";
        } else if (initialOrs !== null && (initialOrs - currentOrs) > (settings?.orsDeteriorationThreshold ?? 5)) {
          orsStatus = "Deteriorating";
        } else {
          orsStatus = "No Change";
        }
      }

      // SRS Clinical Status
      let srsStatus: string | null = null;
      if (currentSrs !== null) {
        const dropFromPrev = prevSrs !== null ? prevSrs - currentSrs : null;
        if (currentSrs < srsCutoff || (dropFromPrev !== null && dropFromPrev > (settings?.srsDeclineThreshold ?? 2))) {
          srsStatus = "Dissatisfied";
        } else {
          srsStatus = "Satisfied";
        }
      }

      return {
        ...s,
        _clinical: {
          initialOrs,
          prevOrs,
          prevSrs,
          currentOrs,
          currentSrs,
          orsStatus,
          srsStatus,
        }
      };
    });

    return NextResponse.json({ sessions: enriched, orsCutoff, srsCutoff });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { 
      clientId, 
      scheduledAt, 
      endedAt,
      sessionType, 
      modality, 
      feeCharged, 
      feeSchemeId 
    } = body;

    let durationMin = 60; // Default
    const start = new Date(scheduledAt);
    const end = endedAt ? new Date(endedAt) : null;

    if (end && end > start) {
      const diffMs = end.getTime() - start.getTime();
      const rawMin = diffMs / (1000 * 60);
      // Round to nearest 15 mins, min 15 mins
      durationMin = Math.max(15, Math.round(rawMin / 15) * 15);
    }

    const [newSession] = await db.insert(sessions).values({
      clientId,
      scheduledAt: start,
      endedAt: end,
      durationMin: durationMin,
      sessionType,
      modality,
      feeCharged: (feeCharged && feeCharged !== "") ? feeCharged.toString() : undefined,
      feeSchemeId: (feeSchemeId && feeSchemeId !== "") ? feeSchemeId : undefined,
    }).returning();

    return NextResponse.json(newSession);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
