"use client";

import { useEffect, useState } from "react";
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
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, TrendingDown, Frown, CheckCircle2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProgressChartProps {
  clientId: string;
  clientName: string;
  compact?: boolean;
}

interface ProgressData {
  orsPoints: { date: string; ors: number; sessionId: string }[];
  srsPoints: { date: string; srs: number; sessionId: string }[];
  orsTrend: { date: string; trend: number }[];
  flags: { isDeterioriating: boolean; isDissatisfied: boolean; isRci: boolean; isCsc: boolean };
  thresholds: { orsCutoff: number; srsCutoff: number; orsRciThreshold: number; orsAmberLow: number; orsGreenLow: number };
}

// Merge ORS data + trend into single array for composed chart
function buildOrsChartData(
  orsPoints: ProgressData["orsPoints"],
  orsTrend: ProgressData["orsTrend"]
) {
  const all: Record<string, { date: string; ors?: number; trend?: number }> = {};
  for (const p of orsPoints) {
    all[p.date] = { date: p.date, ors: p.ors };
  }
  for (const t of orsTrend) {
    all[t.date] = { ...(all[t.date] ?? { date: t.date }), trend: t.trend };
  }
  return Object.values(all);
}

function OrsSparkline({
  orsPoints,
  compact,
  thresholds,
  flags,
}: {
  orsPoints: ProgressData["orsPoints"];
  compact?: boolean;
  thresholds: ProgressData["thresholds"];
  flags: ProgressData["flags"];
}) {
  if (orsPoints.length === 0) {
    return <div className="text-slate-300 text-xs text-center">No ORS data</div>;
  }
  const h = compact ? 50 : 220;
  return (
    <ResponsiveContainer width="100%" height={h}>
      <ComposedChart data={orsPoints} margin={{ top: 4, right: 4, bottom: 0, left: compact ? -28 : 0 }}>
        {!compact && (
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        )}
        {/* Colour bands as reference areas */}
        <Area
          type="monotone"
          dataKey={() => thresholds.orsAmberLow - 1}
          fill="#fee2e2"
          stroke="transparent"
          fillOpacity={0.35}
          name="_red"
          legendType="none"
          isAnimationActive={false}
        />
        {!compact && (
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        )}
        <YAxis
          domain={[0, 40]}
          hide={compact}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          ticks={[0, 10, 20, 25, 30, 40]}
          width={28}
        />
        {/* Band lines */}
        <ReferenceLine y={thresholds.orsAmberLow - 1} stroke="#fca5a5" strokeDasharray="4 4" strokeWidth={1} />
        <ReferenceLine y={thresholds.orsGreenLow - 1} stroke="#86efac" strokeDasharray="4 4" strokeWidth={1} />
        {!compact && (
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
            formatter={(v: unknown) => [`${v ?? "-"}`, "ORS"]}
          />
        )}
        <Line
          type="monotone"
          dataKey="ors"
          stroke="#3b82f6"
          strokeWidth={compact ? 1.5 : 2.5}
          dot={compact ? false : { r: 4, fill: "#3b82f6" }}
          activeDot={compact ? false : { r: 6 }}
          name="ORS Score"
        />
        {/* Alarm dot */}
        {flags.isDeterioriating && !compact && (
          <ReferenceLine
            x={orsPoints.at(-1)?.date}
            stroke="#ef4444"
            strokeDasharray="4 4"
            label={{ value: "⚠ Deteriorating", position: "insideTopRight", fill: "#ef4444", fontSize: 11 }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function SrsChart({
  srsPoints,
  thresholds,
  flags,
}: {
  srsPoints: ProgressData["srsPoints"];
  thresholds: ProgressData["thresholds"];
  flags: ProgressData["flags"];
}) {
  if (srsPoints.length === 0) {
    return <div className="text-slate-300 text-xs text-center py-8">No SRS data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={srsPoints} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 40]} tick={{ fontSize: 11, fill: "#94a3b8" }} ticks={[0, 10, 20, 30, 36, 40]} width={28} />
        <ReferenceLine y={thresholds.srsCutoff} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2}
          label={{ value: `Cutoff ${thresholds.srsCutoff}`, position: "insideTopRight", fill: "#f59e0b", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          formatter={(v: unknown) => [`${v ?? "-"}`, "SRS"]}
        />
        <Line
          type="monotone"
          dataKey="srs"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#8b5cf6" }}
          activeDot={{ r: 6 }}
          name="SRS (Alliance)"
        />
        {flags.isDissatisfied && (
          <ReferenceLine
            x={srsPoints.at(-1)?.date}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{ value: "⚠ Dissatisfied", position: "insideTopRight", fill: "#f59e0b", fontSize: 11 }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function OrsFullChart({
  data,
  thresholds,
  flags,
}: {
  data: ReturnType<typeof buildOrsChartData>;
  thresholds: ProgressData["thresholds"];
  flags: ProgressData["flags"];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 40]} tick={{ fontSize: 11, fill: "#94a3b8" }} ticks={[0, 10, 20, 25, 30, 40]} width={28} />

        {/* Colour band reference areas using gradient-like stacked areas */}
        <ReferenceLine y={thresholds.orsAmberLow - 1} stroke="#fca5a5" strokeDasharray="4 3" strokeWidth={1} />
        <ReferenceLine y={thresholds.orsGreenLow - 1} stroke="#86efac" strokeDasharray="4 3" strokeWidth={1} />
        {/* Labels for bands */}
        <ReferenceLine
          y={Math.round((thresholds.orsAmberLow - 1) / 2)}
          stroke="transparent"
          label={{ value: "🔴 Distress", position: "insideLeft", fill: "#ef4444", fontSize: 10 }}
        />
        <ReferenceLine
          y={Math.round((thresholds.orsAmberLow + thresholds.orsGreenLow - 2) / 2)}
          stroke="transparent"
          label={{ value: "🟡 At Risk", position: "insideLeft", fill: "#d97706", fontSize: 10 }}
        />
        <ReferenceLine
          y={Math.round((thresholds.orsGreenLow - 1 + 40) / 2)}
          stroke="transparent"
          label={{ value: "🟢 Functional", position: "insideLeft", fill: "#16a34a", fontSize: 10 }}
        />

        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          labelStyle={{ fontWeight: "bold" }}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />

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

        {flags.isDeterioriating && (
          <ReferenceLine
            x={data.filter(d => d.ors != null).at(-1)?.date}
            stroke="#ef4444"
            strokeDasharray="4 4"
            label={{ value: "⚠ Deteriorating", position: "insideTopRight", fill: "#ef4444", fontSize: 11 }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function ClientProgressChart({ clientId, clientName, compact = false }: ProgressChartProps) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

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
    return (
      <div className="relative w-full">
        {(data.flags.isDeterioriating || data.flags.isDissatisfied) && (
          <span className="absolute -top-1 -right-1 z-10">
            <AlertTriangle className="h-3 w-3 text-rose-500 fill-rose-100" />
          </span>
        )}
        <OrsSparkline
          orsPoints={data.orsPoints}
          compact
          thresholds={data.thresholds}
          flags={data.flags}
        />
      </div>
    );
  }

  const orsChartData = buildOrsChartData(data.orsPoints, data.orsTrend);

  return (
    <div className="space-y-6">
      {/* Flags row */}
      <div className="flex flex-wrap gap-2">
        {data.flags.isCsc && (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
            <CheckCircle2 className="h-3 w-3" /> CSC Achieved
          </Badge>
        )}
        {data.flags.isRci && !data.flags.isCsc && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
            <TrendingUp className="h-3 w-3" /> RCI Achieved
          </Badge>
        )}
        {data.flags.isDeterioriating && (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1">
            <TrendingDown className="h-3 w-3" /> Deteriorating
          </Badge>
        )}
        {data.flags.isDissatisfied && (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1">
            <Frown className="h-3 w-3" /> Dissatisfied with Alliance
          </Badge>
        )}
        {!data.flags.isDeterioriating && !data.flags.isDissatisfied && data.orsPoints.length > 0 && (
          <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 gap-1">
            <CheckCircle2 className="h-3 w-3" /> On Track
          </Badge>
        )}
      </div>

      {/* ORS Chart */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          ORS — Outcome Rating Scale (Well-being / Progress)
        </p>
        {data.orsPoints.length > 0 ? (
          <OrsFullChart data={orsChartData} thresholds={data.thresholds} flags={data.flags} />
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
        <SrsChart srsPoints={data.srsPoints} thresholds={data.thresholds} flags={data.flags} />
      </div>
    </div>
  );
}
