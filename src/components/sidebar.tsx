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
    color: "text-sky-500",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/clients",
    color: "text-violet-500",
  },
  {
    label: "Sessions",
    icon: Calendar,
    href: "/sessions",
    color: "text-pink-700",
  },
  {
    label: "Invoices",
    icon: FileText,
    href: "/invoices",
    color: "text-orange-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white border-r text-slate-800">
      <div className="px-6 py-2 flex items-center gap-2">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Aman</h1>
      </div>
      <div className="flex-1 px-3">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-slate-100 rounded-lg transition",
              pathname === route.href ? "text-primary bg-slate-100" : "text-slate-500",
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
          className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition"
        >
          <LogOut className="h-5 w-5 mr-3 text-red-500" />
          Logout
        </button>
      </div>
    </div>
  );
}
