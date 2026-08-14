"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CreditCard, Download } from "lucide-react";
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
