import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { getTenantContext } from "@/lib/tenant";

import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let context;
  try {
    context = await getTenantContext();
  } catch (e) {
    // If tenant context fails (e.g. stale JWT without tenantId), force a signout
    redirect("/api/auth/signout?callbackUrl=/login");
  }
  const { planTier, tenantSlug } = context;

  return (
    <div className="flex h-screen bg-slate-50/50">
      <Sidebar planTier={planTier} tenantSlug={tenantSlug} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
