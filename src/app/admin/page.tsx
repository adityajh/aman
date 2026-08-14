"use client";

import { useEffect, useState } from "react";
import { formatIST } from "@/lib/tz";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ShieldCheck, CheckCircle2, XCircle, Search } from "lucide-react";

export default function AdminPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTenants = async () => {
    try {
      const res = await fetch("/api/admin/tenants");
      if (res.ok) {
        setTenants(await res.json());
      }
    } catch {
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleToggle = async (tenantId: string, action: "toggleActive" | "toggleExempt", currentValue: boolean) => {
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, action, value: !currentValue }),
      });
      if (res.ok) {
        toast.success(`Successfully updated tenant`);
        fetchTenants();
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center p-12 text-slate-500"><Loader2 className="animate-spin mr-2" /> Loading data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Registered Practices</h1>
          <p className="text-slate-500">Manage all {tenants.length} tenants on the platform.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="pl-9 pr-4 py-2 border rounded-md text-sm outline-none focus:border-teal-600 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4">Practice / User</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Signup Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((t) => (
              <tr key={t.id} className="border-b hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{t.name}</div>
                  <div className="text-slate-500">{t.email}</div>
                  <div className="text-xs text-slate-400 font-mono mt-1">{t.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="capitalize px-2 py-1 bg-slate-100 rounded text-slate-700 font-medium">
                    {t.planTier}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                  {formatIST(new Date(t.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    {t.isActive ? (
                      <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium w-fit">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-rose-700 bg-rose-50 px-2 py-1 rounded-full text-xs font-medium w-fit">
                        <XCircle className="w-3 h-3 mr-1" /> Blocked
                      </span>
                    )}
                    {t.isExempt && (
                      <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium w-fit">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Lifetime Exempt
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant={t.isActive ? "outline" : "default"} 
                      size="sm"
                      onClick={() => handleToggle(t.id, "toggleActive", t.isActive)}
                      className={t.isActive ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50" : ""}
                    >
                      {t.isActive ? "Block" : "Activate"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggle(t.id, "toggleExempt", t.isExempt)}
                    >
                      {t.isExempt ? "Remove Exemption" : "Make Exempt"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTenants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No practices found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
