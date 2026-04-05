"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Loader2, User, Building, MapPin, Phone, Mail, Quote } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    counselorName: "",
    practiceName: "",
    address: "",
    phone: "",
    email: "",
    monthlyQuote: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setSettings({
            counselorName: data.counselorName || "",
            practiceName: data.practiceName || "",
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
            monthlyQuote: data.monthlyQuote || "",
          });
        }
        setLoading(false);
      })
      .catch(() => {
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
      } else {
        toast.error("Failed to save settings");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
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
                  placeholder="Aman Counseling"
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
                  placeholder="counselor@aman.com"
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
        </div>

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

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={saving} size="lg" className="min-w-[200px] gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
