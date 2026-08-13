import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

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
  const { tenantId, planTier, tenantSlug } = context;

  // Fetch the practice name from settings
  let practiceName = "";
  try {
    const settings = await withTenantContext(tenantId, async (tx) => {
      return await tx.query.practiceSettings.findFirst();
    });
    if (settings?.practiceName) {
      practiceName = settings.practiceName;
    }
  } catch (e) {
    console.error("Failed to fetch practice settings in DashboardLayout:", e);
  }

  return (
    <div className="flex h-screen bg-paper text-ink">
      <Sidebar planTier={planTier} tenantSlug={tenantSlug} practiceName={practiceName} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
