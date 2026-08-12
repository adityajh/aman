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
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "Signup failed");
      }

      toast.success("Account created! Please sign in.");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex items-center justify-center bg-paper py-12">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 bg-teal-ink rounded-xl flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-teal-action" />
              </div>
            </div>
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
