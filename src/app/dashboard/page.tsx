"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ClipboardCheck, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      value: "split-view",
      description: "From sent and draft invoices",
      icon: Wallet,
      color: "text-green-600",
      href: "/invoices",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Practice Overview</h1>
        <p className="text-muted-foreground">Welcome back. Here's your practice at a glance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">—</span>
                      <div className="text-2xl font-bold">0.00</div>
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
            <Link href="/dashboard/clients" className={cn(buttonVariants({ variant: "default" }))}>
              Add New Client
            </Link>
            <Link href="/dashboard/sessions" className={cn(buttonVariants({ variant: "outline" }))}>
              Schedule Session
            </Link>
            <Link href="/dashboard/invoices" className={cn(buttonVariants({ variant: "secondary" }))}>
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
    </div>
  );
}
