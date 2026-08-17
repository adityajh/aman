import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { getTenantContext, withTenantContext } from "@/lib/tenant";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase() || "";
  const envAdmins = (process.env.ADMIN_EMAILS || "vijay10gopal@gmail.com").split(",");
  const adminEmails = [...envAdmins, "adityaj@adipa.com"].map(e => e.trim().toLowerCase());
  const isAdmin = adminEmails.includes(email);
  let context;
  try {
    context = await getTenantContext();
  } catch (e) {
    // If tenant context fails (e.g. stale JWT without tenantId), force a signout
    redirect("/api/auth/signout?callbackUrl=/login");
  }
  const { tenantId, planTier, tenantSlug } = context;

  // Get current pathname from headers set in middleware
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Fetch the practice name and active status from settings
  let practiceName = "";
  let isActive = true;
  try {
    const data = await withTenantContext(tenantId, async (tx) => {
      const settings = await tx.query.practiceSettings.findFirst();
      const tenant = await tx.query.tenants.findFirst();
      return { settings, tenant };
    });
    if (data.settings?.practiceName) {
      practiceName = data.settings.practiceName;
    }
    if (data.tenant) {
      isActive = data.tenant.isActive;
    }
  } catch (e) {
    console.error("Failed to fetch practice settings and tenant status in DashboardLayout:", e);
  }

  // Redirect logic for subscription/trial status
  const isBlocked = !isActive;
  if (isBlocked) {
    if (pathname !== "/dashboard/inactive" && pathname !== "/dashboard/settings") {
      redirect("/dashboard/inactive");
    }
  } else {
    if (pathname === "/dashboard/inactive") {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex h-screen bg-paper text-ink">
      <Sidebar planTier={planTier} tenantSlug={tenantSlug} practiceName={practiceName} isBlocked={isBlocked} isAdmin={isAdmin} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
