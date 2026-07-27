"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Activity, Users, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation Bar */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Aman</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
              Log in
            </Link>
            <Link href="/signup" className={buttonVariants({ variant: "default" })}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 text-center px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Streamline Your <span className="text-primary">Clinical Practice</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform for modern therapists. Manage clients, automate billing, 
            and track clinical outcomes with built-in ORS and SRS measurements.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup" className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full sm:w-auto text-base h-12 px-8")}>
              Start your practice <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto text-base h-12 px-8")}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to succeed</h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
              Aman is built with secure multi-tenant architecture, ensuring your data is isolated 
              and your practice runs smoothly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-slate-100 shadow-sm hover:shadow-md transition">
              <CardHeader>
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>
                  Keep all your client records organized. Track sessions, intake notes, and essential contact details securely.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-100 shadow-sm hover:shadow-md transition">
              <CardHeader>
                <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle>Clinical Outcomes</CardTitle>
                <CardDescription>
                  Built-in Outcome Rating Scale (ORS) and Session Rating Scale (SRS) tracking to monitor client progress effectively.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-100 shadow-sm hover:shadow-md transition">
              <CardHeader>
                <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle>Automated Billing</CardTitle>
                <CardDescription>
                  Generate beautiful invoices, track payments, and manage your practice's finances without the spreadsheet headache.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Simple, transparent pricing</h2>
            <p className="text-slate-500 mt-4">Start for a flat rate. Upgrade when you need clinical measurement tools.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Tier */}
            <Card className="relative overflow-hidden border-slate-200">
              <CardHeader className="pb-8">
                <CardTitle className="text-xl">Basic Tier</CardTitle>
                <CardDescription className="text-base mt-2">Essential tools for independent therapists.</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-slate-900">
                  ₹999
                  <span className="ml-1 text-xl font-medium text-slate-500">/mo</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3" />
                    <span className="text-slate-600">Client Management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3" />
                    <span className="text-slate-600">Invoicing & Billing</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3" />
                    <span className="text-slate-600">Standard Session Notes</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3" />
                    <span className="text-slate-600">Multi-tenant Security</span>
                  </li>
                </ul>
                <Link href="/signup" className={cn(buttonVariants({ variant: "outline" }), "w-full mt-8")}>
                  Get Started
                </Link>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="relative overflow-hidden border-primary shadow-md ring-1 ring-primary/20">
              <div className="absolute top-0 right-0 -mr-1 -mt-1 w-24 h-24 overflow-hidden">
                <div className="absolute transform rotate-45 bg-primary text-white text-xs font-bold py-1 right-[-35px] top-[32px] w-[170px] text-center">
                  RECOMMENDED
                </div>
              </div>
              <CardHeader className="pb-8">
                <CardTitle className="text-xl text-primary">Pro Tier</CardTitle>
                <CardDescription className="text-base mt-2">Advanced tools to measure therapeutic progress.</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-slate-900">
                  ₹1,999
                  <span className="ml-1 text-xl font-medium text-slate-500">/mo</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3" />
                    <span className="text-slate-600 font-medium">Everything in Basic</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3" />
                    <span className="text-slate-600">Clinical Measurements (ORS/SRS)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3" />
                    <span className="text-slate-600">Progress Charts & Trends</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3" />
                    <span className="text-slate-600">Clinical Flags & Alerts</span>
                  </li>
                </ul>
                <Link href="/signup" className={cn(buttonVariants({ variant: "default" }), "w-full mt-8")}>
                  Start Free Trial
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-semibold text-slate-900">Aman</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Aman Counseling Software. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
