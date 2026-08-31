"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Check } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      practiceName: formData.get("practiceName"),
      password: formData.get("password"),
      promoCode: formData.get("promoCode")?.toString().trim() || "",
      planTier: "deepen",
      agreedToTerms,
      termsVersion: "2026-08-18",
    };

    try {
      const isBypass = data.promoCode.toUpperCase() === "FREEBIE";

      if (isBypass) {
        const signupData = {
          ...data,
          razorpay_payment_id: "bypass_payment",
          razorpay_subscription_id: "bypass_sub",
          razorpay_signature: "bypass_sig"
        };
        const responseSignup = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signupData),
        });

        if (!responseSignup.ok) {
          const errorMsg = await responseSignup.text();
          throw new Error(errorMsg || "Signup failed");
        }

        toast.success("Account created! Please sign in.");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      // 1. Create Subscription Order
      const subRes = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: data.planTier, promoCode: data.promoCode }),
      });

      const subResText = await subRes.text();
      let subResData;
      try {
        subResData = JSON.parse(subResText);
      } catch {
        throw new Error(`Server error: ${subResText.substring(0, 200)}`);
      }

      if (!subRes.ok) {
        throw new Error(subResData.error || "Failed to initialize subscription");
      }

      const { subscription_id } = subResData;

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TOkt8Pm5ycPsNz",
        subscription_id: subscription_id,
        name: "Deepen",
        description: "Deepen Monthly Subscription",
        handler: async function (response: any) {
          try {
            // 3. Complete Signup with Signature
            const signupData = {
              ...data,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature
            };

            const responseSignup = await fetch("/api/signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(signupData),
            });

            if (!responseSignup.ok) {
              const errorMsg = await responseSignup.text();
              throw new Error(errorMsg || "Signup failed");
            }

            toast.success("Account created! Please sign in.");
            setTimeout(() => router.push("/login"), 2000);
          } catch (signupErr: any) {
            toast.error(signupErr.message || "Failed to create account. Please try again.");
            setLoading(false);
          }
        },
        prefill: {
          name: data.name,
          email: data.email,
        },
        theme: {
          color: "#0B4F43" // teal-ink
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();

    } catch (error: any) {
      toast.error(error.message || "Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Toaster />
      <div className="min-h-screen flex items-center justify-center bg-paper py-12">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="text-center space-y-2">

            <CardTitle className="text-2xl font-serif font-bold text-teal-ink">Create your Practice</CardTitle>
            <CardDescription>Complete your monthly invoicing in ten minutes. Nobody else sees your data.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" name="name" placeholder="Dr. Jane Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="practiceName">Practice Name</Label>
                  <Input id="practiceName" name="practiceName" placeholder="Healing Minds" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="jane@healingminds.com" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="promoCode">Promo Code <span className="text-slate-400 font-normal">(Optional)</span></Label>
                <Input id="promoCode" name="promoCode" type="text" placeholder="e.g. BETA50" />
              </div>

              <div className="rounded-xl border border-teal-action/20 bg-teal-action/5 p-4 space-y-3">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-base text-ink font-serif">Deepen</h3>
                  <p className="text-lg font-bold text-teal-ink">₹999 <span className="text-xs font-normal text-slate-500">/ month</span></p>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                  <li>• Complete your monthly invoicing in ten minutes.</li>
                  <li>• It quietly keeps track of how each client is doing.</li>
                  <li>• For solo counselors. Nobody else can see your data, including us.</li>
                </ul>
                <p className="text-[11px] text-slate-400 font-medium border-t border-slate-200/60 pt-2">
                  7 days free. Cancel in one click. No long commitment.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="agreedToTerms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="agreedToTerms" className="text-sm font-normal text-slate-600 cursor-pointer select-none">
                  I&rsquo;ve read the <Link href="/terms" className="text-teal-action hover:underline">terms</Link> and the <Link href="/privacy" className="text-teal-action hover:underline">privacy note</Link>.
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-action hover:bg-teal-ink text-paper"
                disabled={loading || !agreedToTerms}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating practice…</>
                ) : (
                  "Start my 7-day trial"
                )}
              </Button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="text-teal-action hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
