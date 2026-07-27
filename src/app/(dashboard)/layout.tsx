import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { getTenantContext } from "@/lib/tenant";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { planTier, tenantSlug } = await getTenantContext();

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
