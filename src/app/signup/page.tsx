"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "pro">("pro");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      practiceName: formData.get("practiceName"),
      password: formData.get("password"),
      planTier: selectedPlan,
    };

    try {
      // 1. Create Subscription Order
      const subRes = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: selectedPlan }),
      });

      if (!subRes.ok) {
        const errorMsg = await subRes.json();
        throw new Error(errorMsg.error || "Failed to initialize subscription");
      }

      const { subscription_id } = await subRes.json();

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription_id,
        name: "Deepen",
        description: `Deepen ${selectedPlan === "pro" ? "Pro" : "Basic"} Monthly Subscription`,
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
            <CardDescription>Join Deepen to streamline your clinical practice.</CardDescription>
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

              <div className="space-y-3">
                <Label>Select a Plan</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setSelectedPlan("basic")}
                    className={`cursor-pointer border rounded-lg p-4 transition-all ${
                      selectedPlan === "basic" ? "border-teal-action ring-1 ring-teal-action bg-teal-action/5" : "hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-sm text-ink">Practice Tier</h3>
                      {selectedPlan === "basic" && <Check className="h-4 w-4 text-teal-action" />}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">₹999/mo</p>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                      <li>• Client Management</li>
                      <li>• Invoicing & Billing</li>
                      <li>• Standard Session Notes</li>
                    </ul>
                  </div>

                  <div 
                    onClick={() => setSelectedPlan("pro")}
                    className={`cursor-pointer border rounded-lg p-4 transition-all ${
                      selectedPlan === "pro" ? "border-teal-action ring-1 ring-teal-action bg-teal-action/5" : "hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-sm text-teal-action">Pro Tier</h3>
                      {selectedPlan === "pro" && <Check className="h-4 w-4 text-teal-action" />}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">₹1,999/mo</p>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                      <li>• Everything in Basic</li>
                      <li>• Clinical Measurements (ORS/SRS)</li>
                      <li>• Progress Charts & Trends</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-teal-action hover:bg-teal-ink text-paper" disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating practice…</>
                ) : (
                  "Get Started"
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
