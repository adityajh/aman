"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AlertTriangle, ArrowRight, TrendingUp, Users, Clock, Activity, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type ReportData = {
  totalClosed: number;
  pctInitialLowOrs: number | null;
  medianTenureWeeks: number | null;
  medianSessions: number | null;
  outcomeCohortSize: number;
  pctRci: number | null;
  pctDeterioration: number | null;
  pctNoChange: number | null;
  pctCsc: number | null;
  ptrIRate: number | null;
  ptrICount: number;
  ptrIIManualCount: number;
  highOrsUnflagged: number;
  finalPtrRate: number | null;
  avgSrs: number | null;
  effectSize: number | null;
  atRiskClients: number;
};

function fmt(n: number | null, decimals = 1): string {
  if (n == null) return "—";
  return n.toFixed(decimals);
}

function fmtPct(n: number | null): string {
  if (n == null) return "—";
  return `${n.toFixed(1)}%`;
}

function effectSizeLabel(es: number): string {
  const abs = Math.abs(es);
  if (abs < 0.2) return "Negligible";
  if (abs < 0.5) return "Small";
  if (abs < 0.8) return "Medium";
  return "Large";
}

function MetricCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon?: React.ElementType;
}) {
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
          {Icon && <Icon className={cn("h-4 w-4 shrink-0", color ?? "text-slate-400")} />}
        </div>
        <p className={cn("text-2xl font-bold mt-1", color ?? "text-slate-900")}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading report...</div>;
  if (!data) return <div className="p-8 text-red-500">Failed to load report.</div>;

  const noData = data.totalClosed === 0;
  const hasOutcomeData = data.outcomeCohortSize > 0;

  // Outcome ratio bar segments
  const rci = data.pctRci ?? 0;
  const det = data.pctDeterioration ?? 0;
  const noChg = data.pctNoChange ?? 0;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reports</h1>
        <p className="text-slate-500">
          Clinical outcomes across all closed clients.
          {data.outcomeCohortSize > 0 && (
            <span className="ml-2 text-xs text-slate-400">
              Outcome ratios based on {data.outcomeCohortSize} clients (initial ORS ≤ 25 with complete data).
            </span>
          )}
        </p>
      </div>

      {/* PTR-II pending assessment warning */}
      {data.highOrsUnflagged > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <span>
            <strong>{data.highOrsUnflagged}</strong> terminated client
            {data.highOrsUnflagged !== 1 ? "s" : ""} with initial ORS &gt; 25 need
            {data.highOrsUnflagged === 1 ? "s" : ""} a PTR-II assessment.{" "}
            <Link href="/clients?status=terminated" className="underline font-semibold">
              Review in Clients →
            </Link>
          </span>
        </div>
      )}

      {noData && (
        <Card className="border-dashed border-slate-200">
          <CardContent className="p-10 text-center text-slate-400">
            No closed clients yet. Reports will populate once clients are terminated.
          </CardContent>
        </Card>
      )}

      {!noData && (
        <>
          {/* ── Overview ── */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Closed Clients"
                value={String(data.totalClosed)}
                icon={Users}
                color="text-slate-900"
              />
              <MetricCard
                label="% Initial ORS ≤ 25"
                value={fmtPct(data.pctInitialLowOrs)}
                sub="entered in distress range"
                icon={TrendingUp}
                color="text-violet-600"
              />
              <MetricCard
                label="Median Tenure"
                value={data.medianTenureWeeks != null ? `${fmt(data.medianTenureWeeks)} wks` : "—"}
                sub="first → last session"
                icon={Clock}
                color="text-blue-600"
              />
              <MetricCard
                label="Median Sessions"
                value={data.medianSessions != null ? fmt(data.medianSessions, 0) : "—"}
                sub="completed sessions per client"
                icon={Activity}
                color="text-blue-600"
              />
            </div>
          </section>

          {/* ── Outcome Ratios ── */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Outcome Ratios
              <span className="ml-2 font-normal normal-case text-slate-400">
                (initial ORS ≤ 25 cohort — must sum to 100%)
              </span>
            </h2>

            {!hasOutcomeData ? (
              <p className="text-sm text-slate-400">
                No clients in this cohort have ORS data recorded for both first and last session.
              </p>
            ) : (
              <>
                {/* Stacked bar */}
                <div className="flex h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{ width: `${rci}%` }}
                    title={`RCI ${rci.toFixed(1)}%`}
                  />
                  <div
                    className="bg-rose-400 transition-all"
                    style={{ width: `${det}%` }}
                    title={`Deterioration ${det.toFixed(1)}%`}
                  />
                  <div
                    className="bg-slate-300 transition-all"
                    style={{ width: `${noChg}%` }}
                    title={`No Change ${noChg.toFixed(1)}%`}
                  />
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-emerald-500" /> RCI</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-rose-400" /> Deterioration</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-slate-300" /> No Change</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard
                    label="Reliable Change (RCI)"
                    value={fmtPct(data.pctRci)}
                    sub={`improved ≥ ${5} ORS points`}
                    color="text-emerald-600"
                  />
                  <MetricCard
                    label="Reliable Deterioration"
                    value={fmtPct(data.pctDeterioration)}
                    sub="declined ≥ 5 ORS points"
                    color="text-rose-500"
                  />
                  <MetricCard
                    label="No Reliable Change"
                    value={fmtPct(data.pctNoChange)}
                    sub="within ±5 ORS points"
                    color="text-slate-600"
                  />
                  <MetricCard
                    label="Clinically Significant (CSC)"
                    value={fmtPct(data.pctCsc)}
                    sub="RCI + crossed into functional range"
                    color="text-teal-600"
                  />
                </div>
              </>
            )}
          </section>

          {/* ── Effect & Alliance ── */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Effectiveness
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Effect Size
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p
                      className={cn(
                        "text-3xl font-bold",
                        data.effectSize == null
                          ? "text-slate-400"
                          : data.effectSize >= 0.8
                          ? "text-emerald-600"
                          : data.effectSize >= 0.5
                          ? "text-lime-600"
                          : data.effectSize >= 0.2
                          ? "text-amber-500"
                          : "text-slate-500"
                      )}
                    >
                      {data.effectSize != null ? fmt(data.effectSize, 2) : "—"}
                    </p>
                    {data.effectSize != null && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] uppercase font-bold",
                          data.effectSize >= 0.8
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : data.effectSize >= 0.5
                            ? "bg-lime-50 text-lime-700 border-lime-200"
                            : data.effectSize >= 0.2
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        )}
                      >
                        {effectSizeLabel(data.effectSize)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    (avg final ORS − avg initial ORS) ÷ SD of initial ORS
                  </p>
                </CardContent>
              </Card>
              <MetricCard
                label="Average SRS"
                value={data.avgSrs != null ? fmt(data.avgSrs, 1) : "—"}
                sub="mean alliance score across all closed-client sessions"
                color="text-indigo-600"
              />
            </div>
          </section>

          {/* ── Termination ── */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Pre-mature Termination
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    PTR-I (auto)
                  </p>
                  <p className="text-2xl font-bold mt-1 text-orange-600">
                    {fmtPct(data.ptrIRate)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {data.ptrICount} of {data.outcomeCohortSize} low-ORS clients
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    No CSC outcome (diff &lt; 5 or final ≤ 25)
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    PTR-II (manual)
                  </p>
                  <p className="text-2xl font-bold mt-1 text-orange-600">
                    {data.ptrIIManualCount}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    flagged for high-ORS clients
                  </p>
                  {data.highOrsUnflagged > 0 && (
                    <p className="text-[10px] text-amber-600 mt-1 font-semibold">
                      {data.highOrsUnflagged} not yet assessed
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="border-slate-100 shadow-sm md:col-span-1 col-span-2">
                <CardContent className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Final PTR
                  </p>
                  <p className="text-2xl font-bold mt-1 text-rose-600">
                    {fmtPct(data.finalPtrRate)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    (PTR-I + PTR-II) ÷ all closed clients
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {data.ptrICount + data.ptrIIManualCount} of {data.totalClosed} total
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ── Live: At Risk ── */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Live — Active Clients
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card
                className={cn(
                  "border shadow-sm",
                  data.atRiskClients > 0 ? "border-rose-200 bg-rose-50/30" : "border-slate-100"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      At-Risk Clients
                    </p>
                    <ShieldAlert
                      className={cn(
                        "h-4 w-4 shrink-0",
                        data.atRiskClients > 0 ? "text-rose-500" : "text-slate-300"
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      "text-2xl font-bold mt-1",
                      data.atRiskClients > 0 ? "text-rose-600" : "text-slate-900"
                    )}
                  >
                    {data.atRiskClients}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    active clients with medium or high risk flag
                  </p>
                  {data.atRiskClients > 0 && (
                    <Link
                      href="/clients"
                      className="mt-3 inline-flex items-center text-xs font-semibold text-rose-600 hover:underline"
                    >
                      View Clients <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
