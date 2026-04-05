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
  LogOut,
  ShieldCheck
} from "lucide-react";
import { signOut } from "next-auth/react";

const routes = [
  {
    label: "Dashboard",
    icon: BarChart3,
    href: "/",
    color: "text-lime-400",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/clients",
    color: "text-lime-400",
  },
  {
    label: "Sessions",
    icon: Calendar,
    href: "/sessions",
    color: "text-lime-400",
  },
  {
    label: "Invoices",
    icon: FileText,
    href: "/invoices",
    color: "text-lime-400",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-lime-400",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="px-6 py-2 flex items-center gap-2">
        <div className="h-8 w-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">Aman</h1>
      </div>
      <div className="flex-1 px-3">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-sidebar-accent/50 rounded-lg transition",
              pathname === route.href ? "text-sidebar-primary bg-sidebar-accent" : "text-slate-300",
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
          className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-red-950/30 text-slate-400 hover:text-red-400 rounded-lg transition"
        >
          <LogOut className="h-5 w-5 mr-3 text-red-500" />
          Logout
        </button>
      </div>
    </div>
  );
}
