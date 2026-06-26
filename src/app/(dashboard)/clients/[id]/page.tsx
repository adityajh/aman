"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, Wallet, Activity, Loader2 } from "lucide-react";
import { ClientProgressChart } from "@/components/client-progress-chart";
import { formatIST } from "@/lib/tz";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [feeSchemes, setFeeSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/clients/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/clients/${id}/stats`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/fee-schemes`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([c, s, f]) => {
        setClient(c);
        setStats(s);
        setFeeSchemes(Array.isArray(f) ? f : []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const currency = feeSchemes.find((f) => f.id === client?.defaultFeeSchemeId)?.currency ?? "INR";
  const sym = currency === "USD" ? "$" : "₹";

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
        <Link href="/clients" className="text-sm text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Clients
        </Link>
        <p className="mt-8 text-center text-slate-400">Client not found.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <Link href="/clients" className="text-sm text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-3">
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
            <div className="rounded-lg bg-emerald-50 p-2"><Wallet className="h-5 w-5 text-emerald-500" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Billed</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {sym}{Number(stats?.totalBilled ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
    </div>
  );
}
