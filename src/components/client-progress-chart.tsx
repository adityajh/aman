"use client";

import { useEffect, useState, useRef } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, TrendingDown, Frown, CheckCircle2, TrendingUp, Users, Mail, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ProgressChartProps {
  clientId: string;
  clientName: string;
  compact?: boolean;
  variant?: "modal" | "page";
}

interface PredictedProgressData {
  prognosis: "green" | "amber" | "red" | "insufficient_data";
  reason?: string;
  cohortSize: number;
  currentInitialOrs?: number | null;
  initialOrsBand?: [number, number];
  margin: number;
  evaluation?: { atSession: number; clientOrs: number; cohortAvg: number; delta: number };
  trajectory: {
    session: number;
    date: string;
    clientOrs: number;
    cohortAvg: number | null;
    lower: number | null;
    upper: number | null;
    cohortN: number;
  }[];
}

interface ProgressData {
  orsPoints: { date: string; ors: number; sessionId: string; note?: string | null; risk?: string }[];
  srsPoints: { date: string; srs: number; sessionId: string; note?: string | null; risk?: string }[];
  orsTrend: { date: string; trend: number }[];
  flags: { isDeterioriating: boolean; isDissatisfied: boolean; isRci: boolean; isCsc: boolean };
  thresholds: { orsCutoff: number; srsCutoff: number; orsRciThreshold: number; orsAmberLow: number; orsGreenLow: number };
}

// Merge ORS data + trend into single array for composed chart
function buildOrsChartData(
  orsPoints: ProgressData["orsPoints"],
  orsTrend: ProgressData["orsTrend"]
) {
  const all: Record<string, { date: string; ors?: number; trend?: number; note?: string | null; risk?: string }> = {};
  for (const p of orsPoints) {
    all[p.date] = { date: p.date, ors: p.ors, note: p.note, risk: p.risk };
  }
  for (const t of orsTrend) {
    all[t.date] = { ...(all[t.date] ?? { date: t.date }), trend: t.trend };
  }
  return Object.values(all);
}

// Shared rich tooltip — shows the score and date only.
function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload.find((p: any) => p.dataKey === "ors" || p.dataKey === "srs" || p.dataKey === "clientOrs") ?? payload[0];
  const datum = row?.payload ?? {};
  const score = datum.ors ?? datum.srs ?? datum.clientOrs;
  if (score == null) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm max-w-[240px]">
      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
      <p className="text-lg font-bold text-slate-900 leading-tight">{score}<span className="text-xs font-normal text-slate-400">/40 {unit}</span></p>
    </div>
  );
}

// Compact summary metric above a chart.
function StatTile({ label, value, sub, tone = "slate" }: { label: string; value: React.ReactNode; sub?: string; tone?: "slate" | "emerald" | "rose" | "amber" | "blue" }) {
  const toneCls: Record<string, string> = {
    slate: "text-slate-900", emerald: "text-emerald-600", rose: "text-rose-600", amber: "text-amber-600", blue: "text-blue-600",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${toneCls[tone]}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}



function SrsChart({
  srsPoints,
  thresholds,
  flags,
  height = 220,
}: {
  srsPoints: ProgressData["srsPoints"];
  thresholds: ProgressData["thresholds"];
  flags: ProgressData["flags"];
  height?: number;
}) {
  if (srsPoints.length === 0) {
    return <div className="text-slate-300 text-xs text-center py-8">No SRS data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={srsPoints} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="srsArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.65} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 40]} tick={{ fontSize: 11, fill: "#94a3b8" }} ticks={[0, 10, 20, 30, 36, 40]} width={28} />
        {/* Soft "below cutoff" zone */}
        <ReferenceArea y1={0} y2={thresholds.srsCutoff} fill="#f59e0b" fillOpacity={0.15} />
        <Tooltip content={<ChartTooltip unit="SRS" />} />
        <Area type="monotone" dataKey="srs" stroke="transparent" fill="url(#srsArea)" connectNulls isAnimationActive={false} legendType="none" />
        <Line
          type="monotone"
          dataKey="srs"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#8b5cf6" }}
          activeDot={{ r: 6 }}
          name="SRS (Alliance)"
        />

      </ComposedChart>
    </ResponsiveContainer>
  );
}

function OrsFullChart({
  data,
  thresholds,
  flags,
  height = 260,
}: {
  data: ReturnType<typeof buildOrsChartData>;
  thresholds: ProgressData["thresholds"];
  flags: ProgressData["flags"];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="orsArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.65} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 40]} tick={{ fontSize: 11, fill: "#94a3b8" }} ticks={[0, 10, 20, 25, 30, 40]} width={28} />

        {/* Soft background zones instead of hard dashed lines */}
        <ReferenceArea y1={0} y2={thresholds.orsAmberLow - 1} fill="#ef4444" fillOpacity={0.15} />
        <ReferenceArea y1={thresholds.orsAmberLow - 1} y2={thresholds.orsGreenLow - 1} fill="#f59e0b" fillOpacity={0.15} />
        <ReferenceArea y1={thresholds.orsGreenLow - 1} y2={40} fill="#22c55e" fillOpacity={0.15} />

        <Tooltip content={<ChartTooltip unit="ORS" />} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />

        <Area type="monotone" dataKey="ors" stroke="transparent" fill="url(#orsArea)" connectNulls isAnimationActive={false} legendType="none" />
        <Line
          type="monotone"
          dataKey="ors"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#3b82f6" }}
          activeDot={{ r: 6 }}
          name="ORS (Progress)"
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="trend"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
          name="Trend Line"
          connectNulls
        />


      </ComposedChart>
    </ResponsiveContainer>
  );
}

const PROGNOSIS_META = {
  green: { label: "Ahead of similar clients", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "#10b981" },
  amber: { label: "On track with similar clients", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "#f59e0b" },
  red: { label: "Behind similar clients — review", cls: "bg-rose-50 text-rose-700 border-rose-200", dot: "#ef4444" },
} as const;

function PredictedProgressChart({ clientId }: { clientId: string }) {
  const [data, setData] = useState<PredictedProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/clients/${clientId}/predicted-progress`)
      .then((r) => r.json())
      .then((d) => active && setData(d))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-violet-400" />
      </div>
    );
  }

  if (!data || data.prognosis === "insufficient_data") {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
        <Users className="h-5 w-5 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">
          {data?.reason ?? "Not enough data to compare with similar clients yet."}
        </p>
      </div>
    );
  }

  const meta = PROGNOSIS_META[data.prognosis];

  // Build chart data: attach the cohort band as a [lower, upper] tuple for the ranged Area.
  const chartData = data.trajectory.map((t) => ({
    date: t.date,
    clientOrs: t.clientOrs,
    cohortAvg: t.cohortAvg,
    band: t.lower != null && t.upper != null ? [t.lower, t.upper] : null,
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-[11px] text-slate-400">
          vs. {data.cohortSize} clients who started near ORS {data.currentInitialOrs}
          {data.initialOrsBand && ` (${data.initialOrsBand[0]}–${data.initialOrsBand[1]})`}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 40]} tick={{ fontSize: 11, fill: "#94a3b8" }} ticks={[0, 10, 20, 25, 30, 40]} width={28} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
            labelStyle={{ fontWeight: "bold" }}
            formatter={(v: unknown, name) => {
              const label = (name ?? "") as string;
              if (label === "Expected range") {
                const r = v as [number, number] | null;
                return r ? [`${r[0]} – ${r[1]}`, label] : ["—", label];
              }
              return [`${v ?? "—"}`, label];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />

          {/* Cohort expected band (lower–upper) */}
          <Area
            type="monotone"
            dataKey="band"
            stroke="transparent"
            fill="#a78bfa"
            fillOpacity={0.18}
            name="Expected range"
            connectNulls
            isAnimationActive={false}
          />
          {/* Cohort average trajectory */}
          <Line
            type="monotone"
            dataKey="cohortAvg"
            stroke="#a78bfa"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
            name="Similar clients (avg)"
            connectNulls
          />
          {/* This client */}
          <Line
            type="monotone"
            dataKey="clientOrs"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#3b82f6" }}
            activeDot={{ r: 6 }}
            name="This client"
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>

      {data.evaluation && (
        <p className="text-[11px] text-slate-400 text-right">
          At session {data.evaluation.atSession}: ORS {data.evaluation.clientOrs} vs. cohort avg{" "}
          {data.evaluation.cohortAvg} ({data.evaluation.delta >= 0 ? "+" : ""}
          {data.evaluation.delta})
        </p>
      )}
    </div>
  );
}

export function ClientProgressChart({ clientId, clientName, compact = false, variant = "modal" }: ProgressChartProps) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailingPdf, setEmailingPdf] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [ccEmail, setCcEmail] = useState("counselor@aman.com");
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/clients/${clientId}/progress`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${compact ? "h-12" : "h-40"}`}>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-400" />
      </div>
    );
  }

  if (!data || (data.orsPoints.length === 0 && data.srsPoints.length === 0)) {
    if (compact) return <span className="text-slate-300 text-[10px]">No data</span>;
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No clinical notes recorded yet. Complete a session note to see progress graphs.
      </div>
    );
  }

  if (compact) {
    return null;
  }

  const orsChartData = buildOrsChartData(data.orsPoints, data.orsTrend);

  const page = variant === "page";
  const latestOrs = data.orsPoints.at(-1)?.ors ?? null;
  const initialOrs = data.orsPoints[0]?.ors ?? null;
  const orsDelta = latestOrs != null && initialOrs != null ? Number(latestOrs) - Number(initialOrs) : null;
  const latestSrs = data.srsPoints.at(-1)?.srs ?? null;

  const handleEmailPdf = async () => {
    if (!chartRef.current) return;
    try {
      setEmailingPdf(true);
      toast.loading("Generating chart PDF...", { id: "pdf-toast" });
      
      const canvas = await html2canvas(chartRef.current, { scale: 1 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      
      toast.loading("Emailing PDF...", { id: "pdf-toast" });
      
      const res = await fetch(`/api/clients/${clientId}/progress/mail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64, ccEmail, clientName }),
      });
      
      if (!res.ok) throw new Error(await res.text());
      toast.success("Charts emailed successfully!", { id: "pdf-toast" });
      setEmailDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(`Failed to email PDF: ${error.message || "Unknown error"}`, { id: "pdf-toast" });
    } finally {
      setEmailingPdf(false);
    }
  };

  return (
    <div className="space-y-6" ref={chartRef}>
      {!compact && (
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={() => setEmailDialogOpen(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Email Chart as PDF
          </Button>
        </div>
      )}
      
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Chart as PDF</DialogTitle>
            <DialogDescription>
              This will send the progress charts to the client's registered email{(data as any).clientEmail ? ` (${(data as any).clientEmail})` : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>CC Email (Optional)</Label>
              <Input value={ccEmail} onChange={e => setCcEmail(e.target.value)} placeholder="Email to CC" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEmailPdf} disabled={emailingPdf}>
              {emailingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Summary stat tiles (page variant only) */}
      {page && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile
            label="Latest ORS"
            value={latestOrs != null ? String(latestOrs) : "—"}
            sub={latestOrs != null ? (Number(latestOrs) >= data.thresholds.orsGreenLow ? "Functional" : Number(latestOrs) >= data.thresholds.orsAmberLow ? "At risk" : "Distress") : "no data"}
            tone={latestOrs == null ? "slate" : Number(latestOrs) >= data.thresholds.orsGreenLow ? "emerald" : Number(latestOrs) >= data.thresholds.orsAmberLow ? "amber" : "rose"}
          />
          <StatTile
            label="ORS Change"
            value={orsDelta != null ? `${orsDelta >= 0 ? "+" : ""}${Math.round(orsDelta * 10) / 10}` : "—"}
            sub="from baseline"
            tone={orsDelta == null ? "slate" : orsDelta >= data.thresholds.orsRciThreshold ? "emerald" : orsDelta <= -1 ? "rose" : "slate"}
          />
          <StatTile
            label="Latest SRS"
            value={latestSrs != null ? String(latestSrs) : "—"}
            sub={latestSrs != null ? (Number(latestSrs) < data.thresholds.srsCutoff ? "Below cutoff" : "Healthy alliance") : "no data"}
            tone={latestSrs == null ? "slate" : Number(latestSrs) < data.thresholds.srsCutoff ? "amber" : "blue"}
          />
          <StatTile
            label="Sessions Scored"
            value={String(data.orsPoints.length)}
            sub="with ORS recorded"
          />
        </div>
      )}

      {/* ORS Chart */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          ORS — Outcome Rating Scale (Well-being / Progress)
        </p>
        {data.orsPoints.length > 0 ? (
          <OrsFullChart data={orsChartData} thresholds={data.thresholds} flags={data.flags} height={page ? 400 : 260} />
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">No ORS data recorded</div>
        )}
        <div className="flex gap-4 mt-2 text-[10px] text-slate-400 justify-end">
          <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-red-200 inline-block" /> ≤{data.thresholds.orsAmberLow - 1} Distress</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-amber-200 inline-block" /> {data.thresholds.orsAmberLow}–{data.thresholds.orsGreenLow - 1} At Risk</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-green-200 inline-block" /> ≥{data.thresholds.orsGreenLow} Functional</span>
        </div>
      </div>

      {/* SRS Chart */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          SRS — Session Rating Scale (Therapeutic Alliance / Satisfaction)
        </p>
        <SrsChart srsPoints={data.srsPoints} thresholds={data.thresholds} flags={data.flags} height={page ? 320 : 220} />
      </div>

      {/* Predicted Progress vs. similar clients */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          Predicted Progress (vs. clients with a similar starting ORS)
        </p>
        <PredictedProgressChart clientId={clientId} />
      </div>
    </div>
  );
}
