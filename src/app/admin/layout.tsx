import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "vijay10gopal@gmail.com,adityaj@adipa.com").split(",").map(e => e.trim().toLowerCase());
  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-teal-800 rounded flex items-center justify-center text-white font-bold font-serif">D</div>
          <span className="font-semibold text-lg tracking-tight">Deepen Admin</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>{session.user.email}</span>
        </div>
      </header>
      <main className="p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
