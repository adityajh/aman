"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  Calendar,
  FileText,
  Settings,
  ShieldCheck,
  LogOut,
  CreditCard,
  Wallet,
  ClipboardList,
} from "lucide-react";
import { signOut } from "next-auth/react";

const routes = [
  {
    label: "Dashboard",
    icon: BarChart3,
    href: "/dashboard",
    color: "text-teal-action",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/dashboard/clients",
    color: "text-teal-action",
  },
  {
    label: "Sessions",
    icon: Calendar,
    href: "/dashboard/sessions",
    color: "text-teal-action",
  },
  {
    label: "Invoices",
    icon: FileText,
    href: "/dashboard/invoices",
    color: "text-teal-action",
  },
  {
    label: "Payments",
    icon: Wallet,
    href: "/dashboard/payments",
    color: "text-teal-action",
  },
  {
    label: "Fees",
    icon: CreditCard,
    href: "/dashboard/fees",
    color: "text-teal-action",
  },
  {
    label: "Reports",
    icon: ClipboardList,
    href: "/dashboard/reports",
    color: "text-teal-action",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-teal-action",
  },
];

export function Sidebar({ planTier = "basic", tenantSlug = "deepen" }: { planTier?: string, tenantSlug?: string }) {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-ink border-r border-hairline/10 text-paper">
      <div className="px-6 py-2 flex items-center gap-2">
        <div className="h-8 w-8 bg-teal-ink rounded-lg flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-teal-action" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-paper font-serif capitalize">{tenantSlug}</h1>
          {planTier === "pro" && (
            <span className="text-[10px] font-bold tracking-wider text-teal-action uppercase mt-[-2px]">Pro Tier</span>
          )}
        </div>
      </div>
      <div className="flex-1 px-3 mt-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/5 rounded-lg transition",
              pathname === route.href ? "text-teal-action bg-teal-ink/30" : "text-paper/80",
            )}
          >
            <div className="flex items-center flex-1">
              <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
              {route.label}
            </div>
          </Link>
        ))}
      </div>
      <div className="px-3">
        <button
          onClick={() => signOut()}
          className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-terracotta/10 text-paper/60 hover:text-terracotta rounded-lg transition"
        >
          <LogOut className="h-5 w-5 mr-3 text-terracotta/70" />
          Logout
        </button>
      </div>
    </div>
  );
}
