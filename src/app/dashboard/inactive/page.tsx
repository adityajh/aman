"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function InactivePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-paper p-6">
      <Card className="w-full max-w-md shadow-lg border-rose-100 bg-white">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-rose-50 rounded-full text-rose-600">
              <ShieldAlert className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif font-bold text-slate-800">
            Subscription Inactive
          </CardTitle>
          <CardDescription className="text-slate-500">
            Your trial has ended or your subscription payment could not be processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-slate-600 text-center leading-relaxed">
            Please update your billing details or verify your subscription status to reactivate your clinical dashboard. You can still export your practice data anytime.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/dashboard/settings" className="w-full">
              <Button className="w-full bg-teal-action hover:bg-teal-ink text-paper flex items-center justify-center gap-2">
                <Settings className="h-4 w-4" /> Go to Billing Settings
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={() => signOut()} 
              className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Log out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
