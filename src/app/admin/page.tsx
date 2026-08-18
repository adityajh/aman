"use client";

import { useEffect, useState } from "react";
import { formatIST } from "@/lib/tz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ShieldCheck, CheckCircle2, XCircle, Search, Copy, Plus, Ticket } from "lucide-react";

export default function AdminPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [generating, setGenerating] = useState(false);
  const [customCodeInput, setCustomCodeInput] = useState("");

  const fetchTenants = async () => {
    try {
      const res = await fetch("/api/admin/tenants");
      if (res.ok) setTenants(await res.json());
    } catch {
      toast.error("Failed to load tenants");
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const res = await fetch("/api/admin/promo-codes");
      if (res.ok) setPromoCodes(await res.json());
    } catch {
      toast.error("Failed to load promo codes");
    }
  };

  useEffect(() => {
    Promise.all([fetchTenants(), fetchPromoCodes()]).finally(() => setLoading(false));
  }, []);

  const foundingCount = tenants.filter(t => t.isFounding).length;

  const handleToggle = async (tenantId: string, action: "toggleActive" | "toggleExempt" | "togglePro", currentValue: boolean) => {
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

  const handleGenerateCodes = async (count: number, customCode?: string) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, customCode }),
      });
      if (res.ok) {
        toast.success(customCode ? `Created custom code ${customCode}` : `Generated ${count} founding promo codes`);
        setCustomCodeInput("");
        fetchPromoCodes();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to generate codes");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied ${code} to clipboard!`);
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableCodes = promoCodes.filter(c => !c.isUsed);
  const usedCodes = promoCodes.filter(c => c.isUsed);

  if (loading) {
    return <div className="flex items-center justify-center p-12 text-slate-500"><Loader2 className="animate-spin mr-2" /> Loading data...</div>;
  }

  return (
    <div className="space-y-8 p-2">
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-teal-600" />
              Founding 50 Promo Codes
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Generate single-use promo codes for counselors. Each code grants the ₹699/month Founding rate.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => handleGenerateCodes(10)}
              disabled={generating}
              className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs gap-1.5"
            >
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Generate 10 Codes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGenerateCodes(50)}
              disabled={generating}
              className="text-xs font-semibold"
            >
              Generate 50 Codes
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 max-w-md">
          <Input
            value={customCodeInput}
            onChange={(e) => setCustomCodeInput(e.target.value)}
            placeholder="Create custom code (e.g. VIP-ANKIT)"
            className="h-9 text-xs"
          />
          <Button
            size="sm"
            variant="secondary"
            disabled={!customCodeInput.trim() || generating}
            onClick={() => handleGenerateCodes(1, customCodeInput)}
            className="h-9 text-xs shrink-0 font-semibold"
          >
            Add Custom
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Available Codes ({availableCodes.length})</span>
            <span>Click any code to copy</span>
          </div>

          {availableCodes.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">No available codes. Click "Generate 10 Codes" above to create some.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-lg border">
              {availableCodes.map((c) => (
                <div
                  key={c.id}
                  onClick={() => copyToClipboard(c.code)}
                  className="flex items-center justify-between bg-white border border-slate-200 hover:border-teal-400 rounded px-3 py-2 cursor-pointer transition shadow-xs group"
                >
                  <span className="text-xs font-mono font-bold text-slate-800">{c.code}</span>
                  <Copy className="h-3 w-3 text-slate-400 group-hover:text-teal-600 shrink-0 ml-1" />
                </div>
              ))}
            </div>
          )}
        </div>

        {usedCodes.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Redeemed Codes ({usedCodes.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {usedCodes.map((c) => (
                <div key={c.id} className="bg-slate-100/80 border border-slate-200 rounded p-2.5 text-xs text-slate-500 space-y-1 opacity-75">
                  <div className="flex justify-between items-center font-mono font-bold text-slate-600">
                    <span className="line-through">{c.code}</span>
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-sans font-semibold">REDEEMED</span>
                  </div>
                  <div className="text-[11px] text-slate-800 font-medium truncate">
                    {c.tenantName || "Practice"} ({c.tenantEmail})
                  </div>
                  {c.usedAt && (
                    <div className="text-[10px] text-slate-400">
                      Redeemed {formatIST(new Date(c.usedAt), "d MMM yyyy, h:mm a")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Registered Practices</h1>
            <p className="text-slate-500">
              Manage all {tenants.length} tenants on the platform. · <span className="font-semibold text-teal-700">Founding Seats Used: {foundingCount} / 50</span>
            </p>
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
                <th className="px-6 py-4">Plan & Price</th>
                <th className="px-6 py-4">Signup Date</th>
                <th className="px-6 py-4 text-center">Clients</th>
                <th className="px-6 py-4">Last Active</th>
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
                    <div className="flex flex-col gap-1">
                      <span className="capitalize px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium text-xs w-fit">
                        {t.planTier}
                      </span>
                      {t.isFounding && (
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 w-fit">
                          Founding Seat #{t.foundingSeat} (₹{t.priceInrMonthly ?? 699}/mo)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {formatIST(new Date(t.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-center font-medium">
                    {t.clientCount || 0}
                  </td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap text-sm">
                    {t.lastActive ? formatIST(new Date(t.lastActive), "MMM d, yyyy") : "Never"}
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
                    <div className="flex justify-end gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggle(t.id, "togglePro", t.planTier === "pro")}
                      >
                        {t.planTier === "pro" ? "Set to Deepen" : "Set to Pro"}
                      </Button>
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
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No practices found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
