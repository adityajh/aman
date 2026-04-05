"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, Calendar, ClipboardCheck, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      value: `₹${stats.outstandingAmount}`,
      description: "From sent and partial invoices",
      icon: IndianRupee,
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
        <p className="text-muted-foreground">Welcome back, Counselor. Here's your practice at a glance.</p>
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
              <div className="text-2xl font-bold">{card.value}</div>
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
            <Button asChild>
              <Link href="/clients">Add New Client</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sessions">Schedule Session</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/invoices">Run Monthly Billing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
