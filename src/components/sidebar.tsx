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
import { Logo } from "@/components/logo";
import { Brandmark } from "@/components/brandmark";

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

export function Sidebar({ 
  planTier = "basic", 
  tenantSlug = "deepen",
  practiceName,
  isBlocked = false,
  isAdmin = false
}: { 
  planTier?: string;
  tenantSlug?: string;
  practiceName?: string;
  isBlocked?: boolean;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();

  const displayName = practiceName || tenantSlug;

  return (
    <div className="w-64 shrink-0 space-y-4 py-4 flex flex-col h-full bg-ink border-r border-hairline/10 text-paper">
      <div className="px-6 py-4 flex items-center gap-2 border-b border-hairline/10">
        <div className="w-5 h-5 text-teal-action">
          <Brandmark />
        </div>
        <Logo variant="light" />
      </div>
      <div className="px-6 pt-2 pb-2">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-paper/50 uppercase tracking-wider mb-1">Practice</span>
          <h2 
            className={cn(
              "text-lg font-bold tracking-tight text-paper font-serif whitespace-normal leading-tight",
              !practiceName && "capitalize"
            )}
            title={displayName}
          >
            {displayName}
          </h2>
          {planTier === "pro" && (
            <span className="text-[10px] font-bold tracking-wider text-teal-action uppercase mt-1">Pro Tier</span>
          )}
        </div>
      </div>
      <div className="flex-1 px-3 mt-4">
        {routes.map((route) => {
          const isRouteDisabled = isBlocked && route.href !== "/dashboard/settings";

          if (isRouteDisabled) {
            return (
              <div
                key={route.href}
                className="text-sm group flex p-3 w-full justify-start font-medium opacity-40 cursor-not-allowed rounded-lg text-paper/40 select-none"
              >
                <div className="flex items-center flex-1">
                  <route.icon className="h-5 w-5 mr-3 text-paper/40" />
                  {route.label}
                </div>
              </div>
            );
          }

          return (
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
          );
        })}
        
        {isAdmin && (
          <Link
            href="/admin"
            className="text-sm group flex p-3 mt-4 w-full justify-start font-medium cursor-pointer hover:bg-emerald-500/10 rounded-lg transition text-emerald-400 border border-emerald-900/30"
          >
            <div className="flex items-center flex-1">
              <ShieldCheck className="h-5 w-5 mr-3 text-emerald-500" />
              Platform Admin
            </div>
          </Link>
        )}
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
