"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, Activity, Loader2, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { ClientProgressChart } from "@/components/client-progress-chart";
import { formatIST } from "@/lib/tz";
import { cn } from "@/lib/utils";

// ── Note field config — labels match the clinical-note-editor form exactly ──
const NOTE_FIELDS: { key: string; label: string; color: string; bgColor: string; borderColor: string }[] = [
  { key: "updates",       label: "Updates (from last week)",  color: "text-sky-700",    bgColor: "bg-sky-50",    borderColor: "border-sky-300" },
  { key: "subjective",    label: "Session Notes",             color: "text-indigo-700", bgColor: "bg-indigo-50", borderColor: "border-indigo-300" },
  { key: "clientActions", label: "Client Actions",            color: "text-amber-700",  bgColor: "bg-amber-50",  borderColor: "border-amber-300" },
  { key: "myActions",     label: "My Actions",                color: "text-teal-700",   bgColor: "bg-teal-50",   borderColor: "border-teal-300" },
  { key: "agenda",        label: "Next Session Agenda",       color: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-300" },
  { key: "feedback",      label: "Feedback on Session",       color: "text-rose-700",   bgColor: "bg-rose-50",   borderColor: "border-rose-300" },
];

function SessionNoteCard({ session, defaultExpanded }: { session: any; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const note = session.note;

  const firstField = NOTE_FIELDS.find((f) => note[f.key]?.trim());
  const previewText = firstField ? note[firstField.key].trim().split("\n")[0].slice(0, 120) : null;
  const filledFields = NOTE_FIELDS.filter((f) => note[f.key]?.trim());

  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div className="absolute left-0 top-4 w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-300 shadow-sm" />

      <Card
        className={cn(
          "border-slate-200 shadow-sm transition-all duration-200",
          !expanded && "hover:border-slate-300 cursor-pointer"
        )}
        onClick={!expanded ? () => setExpanded(true) : undefined}
      >
        <CardContent className="p-4">
          {/* Header — always visible */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setExpanded((v) => !v)}
          >
            <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-900 text-sm">
              {formatIST(new Date(session.scheduledAt), "EEEE, d MMM yyyy 'at' h:mm a")}
            </span>
            {note.riskFlag && note.riskFlag !== "none" && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] shrink-0",
                  note.riskFlag === "high"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                )}
              >
                {note.riskFlag.toUpperCase()} RISK
              </Badge>
            )}
            <div className="ml-auto text-slate-400 shrink-0">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>

          {/* Collapsed one-line preview */}
          {!expanded && previewText && (
            <p className="mt-2 ml-7 text-sm text-slate-500 line-clamp-1">{previewText}</p>
          )}

          {/* Expanded: colour-coded note fields */}
          {expanded && (
            <div className="mt-4 space-y-3">
              {filledFields.map((f) => (
                <div key={f.key} className={cn("rounded-lg border-l-4 pl-3 pr-3 py-2.5", f.bgColor, f.borderColor)}>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", f.color)}>
                    {f.label}
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{note[f.key]}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [feeSchemes, setFeeSchemes] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allExpanded, setAllExpanded] = useState(false);
  const [expandKey, setExpandKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/clients/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/clients/${id}/stats`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/fee-schemes`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/sessions?clientId=${id}`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([c, s, f, sess]) => {
        setClient(c);
        setStats(s);
        setFeeSchemes(Array.isArray(f) ? f : []);
        setSessions(Array.isArray(sess) ? sess : (sess.sessions || []));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const notedSessions = sessions
    .filter((s) => s.status === "completed" && s.note)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const handleToggleAll = () => {
    setAllExpanded((v) => !v);
    setExpandKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8">
        <Link href="/dashboard/clients" className="text-sm text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Clients
        </Link>
        <p className="mt-8 text-center text-slate-400">Client not found.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <Link href="/dashboard/clients" className="text-sm text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Clients
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{client.name}</h1>
          {client.isActive === false ? (
            <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200">Terminated</Badge>
          ) : (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
          )}
        </div>
        <p className="text-slate-500">{[client.email, client.phone].filter(Boolean).join(" · ") || "No contact details"}</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2"><Activity className="h-5 w-5 text-blue-500" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Completed Sessions</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{stats?.total ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-violet-50 p-2"><CalendarDays className="h-5 w-5 text-violet-500" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Last Session</p>
              <p className="text-lg font-bold text-slate-900">{stats?.lastDate ? formatIST(new Date(stats.lastDate), "d MMM yyyy") : "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2"><CalendarDays className="h-5 w-5 text-emerald-500" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">First Session</p>
              <p className="text-lg font-bold text-slate-900">
                {stats?.firstDate ? formatIST(new Date(stats.firstDate), "d MMM yyyy") : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress dashboard */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <ClientProgressChart clientId={id} clientName={client.name} variant="page" />
        </CardContent>
      </Card>

      {/* Historical Notes — vertical timeline */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Historical Session Notes</h2>
          {notedSessions.length > 0 && (
            <button
              onClick={handleToggleAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white shadow-sm"
            >
              <ChevronsUpDown className="h-3.5 w-3.5" />
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          )}
        </div>

        {notedSessions.length === 0 ? (
          <p className="text-sm text-slate-500">No session notes found.</p>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[6px] top-5 bottom-5 w-[2px] bg-slate-200 rounded-full" />
            <div className="space-y-4">
              {notedSessions.map((s) => (
                <SessionNoteCard
                  key={s.id + "-" + expandKey}
                  session={s}
                  defaultExpanded={allExpanded}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


