"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CreditCard, Download, FileText, ExternalLink } from "lucide-react";
import Script from "next/script";
import { formatIST } from "@/lib/tz";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function BillingSettings() {
  const [billingInfo, setBillingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reactivating, setReactivating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [updatingCard, setUpdatingCard] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchBilling = async () => {
    try {
      const res = await fetch("/api/settings/billing");
      if (res.ok) setBillingInfo(await res.json());
    } catch {
      toast.error("Failed to load billing status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will retain access until the end of the billing cycle.")) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/settings/billing/cancel", { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Subscription cancelled");
      fetchBilling();
    } catch {
      toast.error("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    setReactivating(true);
    try {
      const subRes = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: billingInfo?.planTier || "pro" }),
      });
      if (!subRes.ok) throw new Error("Failed to initialize subscription");
      const { subscription_id } = await subRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TOkt8Pm5ycPsNz",
        subscription_id: subscription_id,
        name: "Deepen",
        description: "Subscription Reactivation",
        handler: async function (response: any) {
          try {
            const res = await fetch("/api/settings/billing/reactivate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            if (!res.ok) throw new Error();
            toast.success("Subscription Reactivated!");
            fetchBilling();
          } catch {
            toast.error("Failed to verify reactivation.");
          }
        },
        theme: { color: "#0B4F43" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      toast.error(e.message || "Failed to start reactivation");
    } finally {
      setReactivating(false);
    }
  };

  const handleUpdateCard = () => {
    if (!billingInfo?.subscriptionId) {
      toast.error("Cannot update card: missing subscription ID.");
      return;
    }
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TOkt8Pm5ycPsNz",
      subscription_id: billingInfo.subscriptionId,
      change_card: 1,
      name: "Deepen",
      description: "Update Payment Method",
      handler: function () {
        toast.success("Payment method updated!");
      },
      theme: { color: "#0B4F43" },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="space-y-6 pt-8 border-t border-slate-200">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" /> Deepen Billing
            </CardTitle>
            <CardDescription>Manage your SaaS subscription.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading billing details...
              </div>
            ) : billingInfo?.isExempt ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-800">Partner Access (Lifetime)</h4>
                <p className="text-sm text-emerald-700 mt-1">Your account is sponsored and exempt from subscription billing.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Current Plan</h4>
                  <p className="text-lg font-semibold text-ink capitalize">
                    Deepen {billingInfo?.planTier}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Status</h4>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      billingInfo?.status === 'active' || billingInfo?.status === 'authenticated' ? 'bg-emerald-100 text-emerald-800' :
                      billingInfo?.status === 'cancelled' ? 'bg-slate-100 text-slate-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {billingInfo?.status || "Unknown"}
                    </span>
                    {billingInfo?.cancelAtCycleEnd && (
                      <span className="text-xs text-rose-600 font-medium">(Cancels at end of cycle)</span>
                    )}
                  </div>
                </div>
                {billingInfo?.nextBillingDate && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Next Billing Date</h4>
                    <p className="text-ink">
                      {formatIST(new Date(billingInfo.nextBillingDate), "d MMM yyyy")}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* SaaS Invoices Table */}
            {billingInfo && !billingInfo.isExempt && (
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-teal-700" /> Subscription Billing History
                </h4>
                {billingInfo.invoices && billingInfo.invoices.length > 0 ? (
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="p-3">Invoice #</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {billingInfo.invoices.map((inv: any) => (
                          <tr key={inv.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono font-medium text-slate-800">{inv.invoiceNumber}</td>
                            <td className="p-3 text-slate-600">
                              {inv.date ? formatIST(new Date(inv.date), "d MMM yyyy") : "—"}
                            </td>
                            <td className="p-3 font-semibold text-slate-900">
                              {inv.currency === "USD" ? "$" : "₹"}{inv.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                                inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                inv.status === 'issued' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {inv.pdfUrl ? (
                                <a
                                  href={inv.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                                >
                                  Download <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                    No subscription invoices generated yet. Your monthly invoice will appear here after your first billing cycle.
                  </p>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-6 flex-wrap">
              {billingInfo?.isExempt ? null : (
                <>
                  {billingInfo?.status === 'active' || billingInfo?.status === 'authenticated' ? (
                    <>
                      {billingInfo.cancelAtCycleEnd ? (
                         <Button onClick={handleReactivate} disabled={reactivating} className="gap-2 bg-teal-action hover:bg-teal-ink">
                            {reactivating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Resume / Reactivate Subscription
                         </Button>
                      ) : (
                         <Button variant="destructive" onClick={handleCancel} disabled={cancelling} className="gap-2">
                            {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Cancel Subscription
                         </Button>
                      )}
                      {!billingInfo.cancelAtCycleEnd && (
                         <Button variant="outline" onClick={handleUpdateCard} className="gap-2">
                            Update Payment Method
                         </Button>
                      )}
                    </>
                  ) : (
                    <Button onClick={handleReactivate} disabled={reactivating} className="gap-2 bg-teal-action hover:bg-teal-ink">
                      {reactivating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Subscribe Now
                    </Button>
                  )}
                </>
              )}
              
              <Button
                type="button"
                variant="outline"
                className="gap-2 ml-auto"
                disabled={exporting}
                onClick={async () => {
                  setExporting(true);
                  try {
                    const res = await fetch("/api/settings/export");
                    if (!res.ok) throw new Error();
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "deepen-export.zip";
                    a.click();
                    window.URL.revokeObjectURL(url);
                    toast.success("Export downloaded!");
                  } catch {
                    toast.error("Failed to export data.");
                  } finally {
                    setExporting(false);
                  }
                }}
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Export Practice Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
