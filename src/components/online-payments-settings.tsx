"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Link2, Loader2 } from "lucide-react";
import { formatIST } from "@/lib/tz";

type Connection = {
  available: boolean;
  connected: boolean;
  status: "active" | "revoked" | "error" | null;
  accountId: string | null;
  mode: "test" | "live" | null;
  connectedAt: string | null;
  lastError: string | null;
  autoSendReceipts: boolean;
};

const RETURN_MESSAGES: Record<string, { ok: boolean; text: string }> = {
  connected: { ok: true, text: "Razorpay is connected. New invoices will carry a Pay online button." },
  declined: { ok: false, text: "Razorpay wasn't connected. You declined on Razorpay's page." },
  expired: { ok: false, text: "That took too long and the request expired. Try connecting again." },
  error: { ok: false, text: "Razorpay didn't connect. Try again, and if it keeps happening, let us know." },
  unavailable: { ok: false, text: "Online payments aren't switched on for Deepen yet." },
};

export function OnlinePaymentsSettings() {
  const [conn, setConn] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/payments/connection");
      if (res.ok) setConn(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Message after coming back from Razorpay (?razorpay=connected etc.)
    const params = new URLSearchParams(window.location.search);
    const status = params.get("razorpay");
    if (status && RETURN_MESSAGES[status]) {
      const m = RETURN_MESSAGES[status];
      if (m.ok) toast.success(m.text);
      else toast.error(m.text);
      params.delete("razorpay");
      const qs = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
    }
  }, []);

  const disconnect = async () => {
    if (
      !confirm(
        "Disconnect Razorpay? Open payment links on your invoices will be cancelled. Payments already recorded stay as they are.",
      )
    )
      return;
    setBusy(true);
    try {
      const res = await fetch("/api/payments/connection", { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Razorpay disconnected.");
      await load();
    } catch {
      toast.error("Couldn't disconnect. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const setAutoReceipts = async (value: boolean) => {
    setConn((c) => (c ? { ...c, autoSendReceipts: value } : c));
    const res = await fetch("/api/payments/connection", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoSendReceipts: value }),
    });
    if (!res.ok) {
      toast.error("Couldn't save that setting.");
      load();
    }
  };

  return (
    <Card id="online-payments">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" /> Online payments
        </CardTitle>
        <CardDescription>
          Connect your own Razorpay account and each invoice gets a Pay online link. Clients pay by UPI, card or
          netbanking, the money goes straight to your bank, and Deepen records the payment for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
        ) : !conn?.available ? (
          <p className="text-sm text-slate-500">Online payments aren&apos;t switched on for Deepen yet.</p>
        ) : conn.connected ? (
          <>
            <div className="text-sm text-slate-700 space-y-1">
              <p>
                <span className="font-semibold">Connected</span>
                {conn.mode === "test" && (
                  <span className="ml-2 text-xs rounded bg-amber-50 text-amber-800 px-1.5 py-0.5 ring-1 ring-amber-200">
                    Test mode
                  </span>
                )}
              </p>
              <p className="text-slate-500">
                Razorpay account {conn.accountId}
                {conn.connectedAt ? ` · since ${formatIST(conn.connectedAt, "d MMM yyyy")}` : ""}
              </p>
            </div>
            <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
              <Checkbox
                checked={conn.autoSendReceipts}
                onCheckedChange={setAutoReceipts}
                className="mt-0.5"
              />
              <span>
                Email the client a receipt when they pay online
                <span className="block text-slate-500">Sent from your practice name, like your invoices.</span>
              </span>
            </label>
            <p className="text-xs text-slate-500">
              Razorpay charges its fee on each online payment. Your UPI details stay on the invoice for clients who
              prefer to pay directly.
            </p>
            <Button type="button" variant="outline" onClick={disconnect} disabled={busy} className="text-slate-600">
              {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Disconnect Razorpay
            </Button>
          </>
        ) : (
          <>
            {conn.status === "error" && (
              <p className="text-sm text-brick">
                Deepen lost access to your Razorpay account{conn.lastError ? `: ${conn.lastError}` : "."} Connect again
                to keep links working.
              </p>
            )}
            <p className="text-sm text-slate-500">
              You&apos;ll sign in on Razorpay&apos;s page and approve access. Deepen never sees your Razorpay password,
              and you can withdraw access from Razorpay at any time. No Razorpay account yet? You can create one there.
            </p>
            <Button
              type="button"
              onClick={() => {
                setBusy(true);
                window.location.href = "/api/payments/connect";
              }}
              disabled={busy}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Connect Razorpay
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
