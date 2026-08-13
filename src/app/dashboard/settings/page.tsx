"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Loader2, User, Building, MapPin, Phone, Mail, Quote, Activity, Lock, CreditCard, Download } from "lucide-react";
import { formatIST } from "@/lib/tz";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [billingInfo, setBillingInfo] = useState<any>(null);
  const [settings, setSettings] = useState({
    counselorName: "",
    practiceName: "",
    address: "",
    phone: "",
    email: "",
    monthlyQuote: "",
    upiId: "",
    orsCutoff: 25,
    srsCutoff: 36,
    orsDeteriorationThreshold: 5,
    srsDeclineThreshold: 2,
    orsRciThreshold: 5,
    orsAmberLow: 26,
    orsGreenLow: 32,
    invoiceDueDays: 15,
    emailOverride: false,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then(res => res.json()),
      fetch("/api/settings/billing").then(res => res.json()).catch(() => null)
    ]).then(([settingsData, billingData]) => {
      if (settingsData) {
        setSettings({
          counselorName: settingsData.counselorName || "",
          practiceName: settingsData.practiceName || "",
          address: settingsData.address || "",
          phone: settingsData.phone || "",
          email: settingsData.email || "",
          monthlyQuote: settingsData.monthlyQuote || "",
          upiId: settingsData.upiId || "",
          orsCutoff: settingsData.orsCutoff ?? 25,
          srsCutoff: settingsData.srsCutoff ?? 36,
          orsDeteriorationThreshold: settingsData.orsDeteriorationThreshold ?? 5,
          srsDeclineThreshold: settingsData.srsDeclineThreshold ?? 2,
          orsRciThreshold: settingsData.orsRciThreshold ?? 5,
          orsAmberLow: settingsData.orsAmberLow ?? 26,
          orsGreenLow: settingsData.orsGreenLow ?? 32,
          invoiceDueDays: settingsData.invoiceDueDays ?? 15,
          emailOverride: settingsData.emailOverride ?? false,
        });
      }
      if (billingData && !billingData.error) {
        setBillingInfo(billingData);
      }
      setLoading(false);
    }).catch(() => {
      toast.error("Failed to load settings");
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        body: JSON.stringify(settings),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Settings saved successfully");
        router.refresh();
      } else {
        toast.error("Failed to save settings");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        body: JSON.stringify({ newPassword: passwordForm.newPassword }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Password updated successfully");
        setPasswordForm({ newPassword: "", confirmPassword: "" });
      } else {
        const error = await res.text();
        toast.error(error || "Failed to update password");
      }
    } catch (err) {
      toast.error("An error occurred while updating password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing cycle.")) {
      return;
    }
    
    setCancellingSubscription(true);
    try {
      const res = await fetch("/api/settings/billing/cancel", { method: "POST" });
      if (!res.ok) throw new Error("Failed to cancel subscription");
      
      toast.success("Subscription cancelled successfully. It will remain active until the end of the billing cycle.");
      
      // Refresh billing info
      const updatedBilling = await fetch("/api/settings/billing").then(r => r.json());
      setBillingInfo(updatedBilling);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setCancellingSubscription(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practice Settings</h1>
          <p className="text-muted-foreground">Manage your clinical profile and invoice branding.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Profile Details
              </CardTitle>
              <CardDescription>Your personal and professional identification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="counselorName">Counselor Name</Label>
                <Input
                  id="counselorName"
                  value={settings.counselorName}
                  onChange={(e) => setSettings({ ...settings, counselorName: e.target.value })}
                  placeholder="Vijay Gopal Sreenivasan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="practiceName">Practice Name</Label>
                <Input
                  id="practiceName"
                  value={settings.practiceName}
                  onChange={(e) => setSettings({ ...settings, practiceName: e.target.value })}
                  placeholder="Deepen Counseling"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> Contact Information
              </CardTitle>
              <CardDescription>How clients can reach you on invoices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="counselor@deepen.health"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+91-0000000000"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" /> Payment Details
              </CardTitle>
              <CardDescription>Specify your primary UPI ID for collections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  value={settings.upiId}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  placeholder="name@bank / mobile@upi"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Invoice Billing
            </CardTitle>
            <CardDescription>
              Default payment term for new invoice batches. This pre-selects the &ldquo;Payment Due&rdquo; option in the New Batch dialog (you can still override per batch). An invoice becomes <strong>overdue</strong> once this many days pass after its issue date without full payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 max-w-xs">
              <Label htmlFor="invoiceDueDays" className="whitespace-nowrap">Payment due (days)</Label>
              <Input
                id="invoiceDueDays"
                type="number"
                min={0}
                value={settings.invoiceDueDays}
                onChange={(e) => setSettings({ ...settings, invoiceDueDays: parseInt(e.target.value) || 0 })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={settings.emailOverride ? "border-amber-300 bg-amber-50" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Invoice Test Mode
              {settings.emailOverride && (
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest bg-amber-200 text-amber-900 px-2 py-0.5 rounded">On</span>
              )}
            </CardTitle>
            <CardDescription>
              When ON, every invoice email is rerouted to <strong>{settings.email || "your address above"}</strong> instead of the client. The subject line and a banner inside the email mark it as a test, and the invoice stays in <code>draft</code> so you can re-send it for real once you turn this off.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.emailOverride}
                onChange={(e) => setSettings({ ...settings, emailOverride: e.target.checked })}
                className="h-5 w-5 accent-amber-500"
              />
              <span className="text-sm font-medium">
                {settings.emailOverride
                  ? "Test mode is ON — invoices will NOT reach clients."
                  : "Test mode is OFF — invoices go to clients."}
              </span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Clinical Flags
            </CardTitle>
            <CardDescription>System threshold criteria for flagging "dissatisfied" or "at risk" clients via session feedback metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="orsCutoff">ORS Cut-off (Max 40)</Label>
                <div className="text-xs text-muted-foreground mb-1">Standard clinical baseline for initial alerts.</div>
                <Input
                  id="orsCutoff"
                  type="number"
                  value={settings.orsCutoff}
                  onChange={(e) => setSettings({ ...settings, orsCutoff: parseInt(e.target.value) || 0 })}
                  placeholder="25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="srsCutoff">SRS Cut-off (Max 40)</Label>
                <div className="text-xs text-muted-foreground mb-1">Scores strictly below this trigger &apos;Dissatisfied&apos; alerts.</div>
                <Input
                  id="srsCutoff"
                  type="number"
                  value={settings.srsCutoff}
                  onChange={(e) => setSettings({ ...settings, srsCutoff: parseInt(e.target.value) || 0 })}
                  placeholder="36"
                />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="orsDeterioration">ORS Deterioration Threshold</Label>
                <div className="text-xs text-muted-foreground mb-1">Identifies &apos;Deteriorating&apos; client if Latest ORS is below Initial ORS by this amount.</div>
                <Input
                  id="orsDeterioration"
                  type="number"
                  value={settings.orsDeteriorationThreshold}
                  onChange={(e) => setSettings({ ...settings, orsDeteriorationThreshold: parseInt(e.target.value) || 0 })}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="srsDecline">SRS Decline Threshold</Label>
                <div className="text-xs text-muted-foreground mb-1">Identifies &apos;Dissatisfied&apos; client if Latest SRS drops below Previous SRS by this amount.</div>
                <Input
                  id="srsDecline"
                  type="number"
                  value={settings.srsDeclineThreshold}
                  onChange={(e) => setSettings({ ...settings, srsDeclineThreshold: parseInt(e.target.value) || 0 })}
                  placeholder="2"
                />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="orsRci">ORS RCI Threshold</Label>
                <div className="text-xs text-muted-foreground mb-1">Reliable Change Index: min ORS improvement from first session to count as statistically significant (PCOMS default: 5).</div>
                <Input
                  id="orsRci"
                  type="number"
                  value={settings.orsRciThreshold}
                  onChange={(e) => setSettings({ ...settings, orsRciThreshold: parseInt(e.target.value) || 0 })}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orsAmber">ORS Amber Band Start</Label>
                <div className="text-xs text-muted-foreground mb-1">ORS ≤ this = Red (Distress). Above this = Amber (At Risk).</div>
                <Input
                  id="orsAmber"
                  type="number"
                  value={settings.orsAmberLow}
                  onChange={(e) => setSettings({ ...settings, orsAmberLow: parseInt(e.target.value) || 0 })}
                  placeholder="26"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orsGreen">ORS Green Band Start</Label>
                <div className="text-xs text-muted-foreground mb-1">ORS ≥ this = Green (Functional). Also the CSC threshold.</div>
                <Input
                  id="orsGreen"
                  type="number"
                  value={settings.orsGreenLow}
                  onChange={(e) => setSettings({ ...settings, orsGreenLow: parseInt(e.target.value) || 0 })}
                  placeholder="32"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Practice Address
            </CardTitle>
            <CardDescription>The physical or business address appearing on invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="123 Harmony Street, Sector 18, Noida..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Quote className="h-5 w-5" /> Invoice Monthly Quote
            </CardTitle>
            <CardDescription>A one-line inspirational quote at the bottom of each invoice.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              id="monthlyQuote"
              value={settings.monthlyQuote}
              onChange={(e) => setSettings({ ...settings, monthlyQuote: e.target.value })}
              placeholder="Progress is not a straight line."
              className="border-primary/20 bg-white"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4 pb-12">
          <Button type="submit" disabled={saving} size="lg" className="min-w-[200px] gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </Button>
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="space-y-6 pt-8 border-t border-slate-200">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> Security
            </CardTitle>
            <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div className="flex justify-start pt-2">
              <Button type="submit" disabled={updatingPassword} variant="secondary" className="gap-2">
                {updatingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Billing Section */}
      <div className="space-y-6 pt-8 border-t border-slate-200">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" /> Deepen Billing
            </CardTitle>
            <CardDescription>Manage your SaaS subscription.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!billingInfo ? (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading billing details...
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Current Plan</h4>
                  <p className="text-lg font-semibold text-ink capitalize">
                    Deepen {billingInfo.planTier}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Status</h4>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      billingInfo.status === 'active' || billingInfo.status === 'authenticated' ? 'bg-emerald-100 text-emerald-800' :
                      billingInfo.status === 'cancelled' ? 'bg-slate-100 text-slate-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {billingInfo.status || "Unknown"}
                    </span>
                    {billingInfo.cancelAtCycleEnd && (
                      <span className="text-xs text-rose-600 font-medium">(Cancels at end of cycle)</span>
                    )}
                  </div>
                </div>
                {billingInfo.nextBillingDate && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Next Billing Date</h4>
                    <p className="text-ink">
                      {formatIST(new Date(billingInfo.nextBillingDate), "d MMM yyyy")}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className={`flex items-center gap-3 ${billingInfo && (billingInfo.status === 'active' || billingInfo.status === 'authenticated') && !billingInfo.cancelAtCycleEnd ? '' : 'pt-6 border-t border-slate-100 mt-6'}`}>
              {billingInfo && (billingInfo.status === 'active' || billingInfo.status === 'authenticated') && !billingInfo.cancelAtCycleEnd && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleCancelSubscription}
                  disabled={cancellingSubscription}
                  className="gap-2"
                >
                  {cancellingSubscription ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Cancel Subscription
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={exporting}
                onClick={async () => {
                  setExporting(true);
                  try {
                    const res = await fetch("/api/settings/export");
                    if (!res.ok) throw new Error("Export failed");
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
                Export Practice Data (.zip)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
