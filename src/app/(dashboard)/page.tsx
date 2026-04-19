"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, DollarSign, Wallet, Calendar, ClipboardCheck, AlertTriangle, ArrowRight, TrendingDown, Frown, UserX, Activity, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  const cards = [
    {
      title: "Unbilled Sessions",
      value: stats.unbilledSessions,
      description: "Completed sessions awaiting invoice",
      icon: ClipboardCheck,
      color: "text-blue-600",
      href: "/invoices",
    },
    {
      title: "Outstanding Revenue",
      value: "split-view", // marker for custom rendering
      description: "From sent and draft invoices",
      icon: Wallet,
      color: "text-green-600",
      href: "/invoices",
    },
    {
      title: "Upcoming (7 Days)",
      value: stats.upcomingSessions,
      description: "Scheduled intake/followup",
      icon: Calendar,
      color: "text-violet-600",
      href: "/sessions",
    },
    {
      title: "Risk Flags",
      value: stats.activeRiskFlags,
      description: "Clients needing close attention",
      icon: AlertTriangle,
      color: stats.activeRiskFlags > 0 ? "text-red-600" : "text-slate-400",
      href: "/sessions",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Practice Overview</h1>
        <p className="text-muted-foreground">Welcome back. Here's your practice at a glance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {card.title === "Outstanding Revenue" ? (
                <div className="flex flex-col gap-2 min-h-[40px] justify-center">
                  {stats.outstanding?.length > 0 ? stats.outstanding.map((r: any) => (
                    <div key={r.currency} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{r.currency}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-semibold opacity-60">{r.currency === 'USD' ? '$' : '₹'}</span>
                        <span className="text-2xl font-bold">{parseFloat(r.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">INR</span>
                      <div className="text-2xl font-bold">₹0.00</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
              <Link href={card.href} className="mt-4 inline-flex items-center text-xs font-semibold text-primary hover:underline">
                View Details <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href="/clients" className={cn(buttonVariants({ variant: "default" }))}>
              Add New Client
            </Link>
            <Link href="/sessions" className={cn(buttonVariants({ variant: "outline" }))}>
              Schedule Session
            </Link>
            <Link href="/invoices" className={cn(buttonVariants({ variant: "secondary" }))}>
              Run Monthly Billing
            </Link>
          </CardContent>
        </Card>
        <Card className="col-span-1 border-blue-100 shadow-sm">
          <CardHeader className="bg-blue-50/50 pb-4 border-b border-blue-50">
            <CardTitle className="text-blue-900 font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" /> Session Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div className="p-6">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">This Month</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Scheduled</span>
                    <span className="text-xl font-bold text-yellow-600">{stats.scheduledMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Completed</span>
                    <span className="text-xl font-bold text-blue-600">{stats.completedMonth}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">YTD</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Scheduled</span>
                    <span className="text-xl font-bold text-yellow-600">{stats.scheduledYtd}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Completed</span>
                    <span className="text-xl font-bold text-blue-600">{stats.completedYtd}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-rose-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingDown className="h-24 w-24" />
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col gap-2 relative z-10">
              <span className="text-sm font-bold text-rose-600 uppercase tracking-widest flex items-center gap-2">
                <TrendingDown className="h-4 w-4" /> Deteriorating
              </span>
              <span className="text-4xl font-black text-slate-900">{stats.deterioratingClients}</span>
              <p className="text-sm text-slate-500">Clients with decreasing ORS scores</p>
              {stats.deterioratingList?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-rose-100 flex flex-col gap-1">
                  {stats.deterioratingList.map((c: { id: string; name: string }) => (
                    <button
                      key={c.id}
                      onClick={() => router.push(`/clients`)}
                      className="text-left text-sm font-semibold text-rose-700 hover:text-rose-900 hover:underline flex items-center gap-1 truncate"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Frown className="h-24 w-24" />
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col gap-2 relative z-10">
              <span className="text-sm font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
                <Frown className="h-4 w-4" /> Dissatisfied
              </span>
              <span className="text-4xl font-black text-slate-900">{stats.dissatisfiedClients}</span>
              <p className="text-sm text-slate-500">Clients falling below SRS cutoff</p>
              {stats.dissatisfiedList?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-orange-100 flex flex-col gap-1">
                  {stats.dissatisfiedList.map((c: { id: string; name: string }) => (
                    <button
                      key={c.id}
                      onClick={() => router.push(`/clients`)}
                      className="text-left text-sm font-semibold text-orange-700 hover:text-orange-900 hover:underline flex items-center gap-1 truncate"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <UserX className="h-24 w-24" />
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col gap-2 relative z-10">
              <span className="text-sm font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <UserX className="h-4 w-4" /> No-Show Rate
              </span>
              <span className="text-4xl font-black text-slate-900">{stats.noShowRate}%</span>
              <p className="text-sm text-slate-500">Of all historical sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
