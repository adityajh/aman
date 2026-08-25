"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, User, CheckCircle2, Loader2, TrendingUp, History, AlertCircle,
  Trash2, ArrowLeft, ChevronRight, Search, FileText, Receipt as ReceiptIcon, MailCheck, ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIST, istTodayStr } from "@/lib/tz";

type CurrencyMap = Record<string, number>;
const curSym = (c: string) => (c === "USD" ? "$" : "₹");
const addCur = (m: CurrencyMap, c: string | null | undefined, amt: number) => {
  const k = c || "INR"; m[k] = (m[k] || 0) + amt; return m;
};
const fmt = (n: number) => Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function Money({ map, tone }: { map: CurrencyMap; tone?: "owed" | "credit" | "plain" }) {
  const entries = Object.entries(map).filter(([, v]) => Math.abs(v) > 0.005);
  if (entries.length === 0) return <span className="text-slate-400">—</span>;
  return (
    <div className="flex flex-col items-end tabular-nums">
      {entries.map(([c, v]) => (
        <span key={c} className={cn(tone === "owed" ? "text-rose-600" : tone === "credit" ? "text-emerald-600" : "text-slate-900")}>
          {v < 0 ? "-" : ""}{curSym(c)}{fmt(v)}
        </span>
      ))}
    </div>
  );
}

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentsPageInner() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [feeSchemes, setFeeSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(searchParams.get("newPayment") === "true");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [view, setView] = useState<"clients" | "invoices">((searchParams.get("view") as any) || "clients");
  const [drillClientId, setDrillClientId] = useState<string | null>(searchParams.get("drillClientId") || null);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [invoiceSortKey, setInvoiceSortKey] = useState<"date" | "number">((searchParams.get("sort") as any) || "date");
  const [invoiceSortDir, setInvoiceSortDir] = useState<"asc" | "desc">((searchParams.get("dir") as any) || "desc");

  const [selectedClientId, setSelectedClientId] = useState(searchParams.get("clientId") || "");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentCurrency, setPaymentCurrency] = useState("INR");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams();
    if (view !== "clients") params.set("view", view);
    if (drillClientId) params.set("drillClientId", drillClientId);
    if (search) params.set("q", search);
    if (invoiceSortKey !== "date") params.set("sort", invoiceSortKey);
    if (invoiceSortDir !== "desc") params.set("dir", invoiceSortDir);
    const qs = params.toString();
    router.replace(`/dashboard/payments${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [view, drillClientId, search, invoiceSortKey, invoiceSortDir, router]);

  const fetchData = async () => {
    try {
      const [recRes, invRes, summaryRes, clientsRes, feeRes] = await Promise.all([
        fetch("/api/receipts"),
        fetch("/api/invoices"),
        fetch("/api/payments/outstanding-summary"),
        fetch("/api/clients"),
        fetch("/api/fee-schemes"),
      ]);
      const [recData, invData, summaryData, clientsData, feeData] = await Promise.all([
        recRes.json(), invRes.json(), summaryRes.json(), clientsRes.json(), feeRes.json(),
      ]);
      setReceipts(recData);
      setInvoices(invData);
      setSummary(summaryData);
      setClients(clientsData);
      setFeeSchemes(feeData);
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  const handleDeleteReceipt = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/receipts/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Receipt deleted; invoice balances recalculated."); setConfirmDeleteId(null); fetchData(); }
      else toast.error("Failed to delete receipt.");
    } catch { toast.error("An error occurred."); }
    finally { setDeletingId(null); }
  };

  const handleRecordPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      clientId: selectedClientId,
      amount: formData.get("amount"),
      currency: paymentCurrency,
      paymentDate: formData.get("paymentDate"),
      method: paymentMethod,
      referenceId: formData.get("referenceId"),
      notes: formData.get("notes"),
    };
    try {
      const res = await fetch("/api/payments", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
      if (res.ok) {
        const result = await res.json();
        toast.success(`Payment recorded — ${result.receiptNumber} (across ${result.allocated} invoice(s)).`);
        setOpen(false); setSelectedClientId(""); fetchData();
      } else {
        let errMsg = "Unknown error";
        try { const j = await res.json(); errMsg = j.error || JSON.stringify(j); } catch { errMsg = await res.text(); }
        toast.error(`Failed to record payment: ${errMsg}`);
      }
    } catch { toast.error("An error occurred"); }
    finally { setIsSubmitting(false); }
  };

  const methodBadge = (method: string) => {
    const styles: any = {
      upi: "bg-blue-50 text-blue-700 ring-blue-200", cash: "bg-lime-50 text-lime-700 ring-lime-200",
      bank_transfer: "bg-slate-50 text-slate-700 ring-slate-200", card: "bg-purple-50 text-purple-700 ring-purple-200",
      online: "bg-teal-50 text-teal-700 ring-teal-200", other: "bg-amber-50 text-amber-700 ring-amber-200",
    };
    return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset", styles[method] || styles.other)}>{(method || "other").replace("_", " ")}</span>;
  };

  const StatusPill = ({ status }: { status: string }) => {
    const m: Record<string, string> = {
      draft: "bg-slate-100 text-slate-600 ring-slate-200", sent: "bg-sky-50 text-sky-700 ring-sky-200",
      paid: "bg-emerald-50 text-emerald-700 ring-emerald-200", partial: "bg-amber-50 text-amber-700 ring-amber-200",
      overdue: "bg-rose-50 text-rose-700 ring-rose-200",
    };
    return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", m[status] ?? m.draft)}>{status === "draft" ? "Generated" : status[0].toUpperCase() + status.slice(1)}</span>;
  };

  // ── Per-client ledger (Invoiced from invoices, Received from receipts) ──
  const ledger = useMemo(() => {
    const map: Record<string, { id: string; name: string; isActive: boolean; invoiced: CurrencyMap; received: CurrencyMap }> = {};
    const ensure = (id: string, name: string, isActive: boolean) => (map[id] ??= { id, name: name || "—", isActive, invoiced: {}, received: {} });
    for (const inv of invoices) {
      if (inv.status === "void") continue;
      const c = ensure(inv.clientId, inv.client?.name, inv.client?.isActive !== false);
      addCur(c.invoiced, inv.currency, parseFloat(inv.total || "0"));
    }
    for (const r of receipts) {
      const c = ensure(r.clientId, r.client?.name, r.client?.isActive !== false);
      addCur(c.received, r.currency, parseFloat(r.amount || "0"));
    }
    const rows = Object.values(map).map((c) => {
      const balance: CurrencyMap = {};
      for (const cur of new Set([...Object.keys(c.invoiced), ...Object.keys(c.received)])) balance[cur] = (c.invoiced[cur] || 0) - (c.received[cur] || 0);
      return { ...c, balance };
    });
    const q = search.trim().toLowerCase();
    return rows.filter((r) => !q || r.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
  }, [invoices, receipts, search]);

  const invoiceRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices
      .filter((i) => i.status !== "void")
      .filter((i) => !q || i.invoiceNumber?.toLowerCase().includes(q) || i.client?.name?.toLowerCase().includes(q))
      .sort((a, b) => {
        if (invoiceSortKey === "date") {
          const dA = new Date(a.issuedDate || a.createdAt).getTime();
          const dB = new Date(b.issuedDate || b.createdAt).getTime();
          return invoiceSortDir === "asc" ? dA - dB : dB - dA;
        } else {
          return invoiceSortDir === "asc"
            ? (a.invoiceNumber || "").localeCompare(b.invoiceNumber || "")
            : (b.invoiceNumber || "").localeCompare(a.invoiceNumber || "");
        }
      });
  }, [invoices, search, invoiceSortKey, invoiceSortDir]);

  const drillClient = drillClientId ? ledger.find((l) => l.id === drillClientId) : null;

  // Unified statement (oldest first, running balance per currency).
  const statement = useMemo(() => {
    if (!drillClientId) return [];
    type Row = { date: string; created: string; ref: string; kind: "invoice" | "receipt"; desc: string; currency: string; invoiced: number; received: number; id?: string; sentAt?: string | null; balance?: number };
    const rows: Row[] = [];
    for (const i of invoices.filter((x) => x.clientId === drillClientId && x.status !== "void")) {
      rows.push({ date: i.issuedDate || i.billingMonth, created: i.createdAt, ref: i.invoiceNumber, kind: "invoice", desc: `Invoice · ${formatIST(new Date(i.billingMonth), "MMM yyyy")}`, currency: i.currency, invoiced: parseFloat(i.total || "0"), received: 0 });
    }
    for (const r of receipts.filter((x) => x.clientId === drillClientId)) {
      rows.push({ date: r.paymentDate, created: r.createdAt, ref: r.receiptNumber, kind: "receipt", desc: `Payment · ${(r.method || "").replace("_", " ")}`, currency: r.currency, invoiced: 0, received: parseFloat(r.amount || "0"), id: r.id, sentAt: r.sentAt });
    }
    rows.sort((a, b) => a.date.localeCompare(b.date) || new Date(a.created).getTime() - new Date(b.created).getTime());
    const running: CurrencyMap = {};
    for (const r of rows) { running[r.currency] = (running[r.currency] || 0) + r.invoiced - r.received; r.balance = running[r.currency]; }
    return rows;
  }, [drillClientId, invoices, receipts]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payments Ledger</h1>
          <p className="text-slate-500">Client balances, invoice receivables, and receipts.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-lime-400 text-slate-950 hover:bg-lime-500 font-bold shadow-sm"><Plus className="h-4 w-4" /> Record Payment</Button>} />
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Record New Payment</DialogTitle></DialogHeader>
            <form onSubmit={handleRecordPayment} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Client Name</Label>
                  <Select value={selectedClientId} onValueChange={(id) => {
                    const cid = id || ""; setSelectedClientId(cid);
                    const client = clients.find(c => c.id === cid);
                    if (client?.defaultFeeSchemeId) { const s = feeSchemes.find(f => f.id === client.defaultFeeSchemeId); if (s) setPaymentCurrency(s.currency); }
                  }}>
                    <SelectTrigger className="w-full border-slate-200 h-10 bg-white shadow-sm"><SelectValue>{selectedClientId ? (clients.find(c => c.id === selectedClientId)?.name || "Pick a client...") : "Pick a client..."}</SelectValue></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 max-h-[250px] overflow-y-auto shadow-2xl">
                      {[...clients].sort((a,b)=>a.name.localeCompare(b.name)).map(c => <SelectItem key={c.id} value={c.id} label={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={paymentCurrency} onValueChange={(v) => setPaymentCurrency(v || "INR")}>
                    <SelectTrigger className="bg-white border-slate-200"><SelectValue>{paymentCurrency === "INR" ? "INR (₹)" : "USD ($)"}</SelectValue></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200"><SelectItem value="INR" label="INR (₹)">INR (₹)</SelectItem><SelectItem value="USD" label="USD ($)">USD ($)</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="amount">Amount Received</Label><Input id="amount" name="amount" type="number" step="0.01" className="border-slate-200" placeholder="0.00" required /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="paymentDate">Payment Date</Label><Input id="paymentDate" name="paymentDate" type="date" defaultValue={istTodayStr()} className="border-slate-200" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v || "upi")}>
                    <SelectTrigger className="border-slate-200 h-10 bg-white shadow-sm"><SelectValue>{({upi:"UPI",cash:"Cash",bank_transfer:"Bank Transfer",card:"Card",online:"Online",other:"Other"} as any)[paymentMethod] || "UPI"}</SelectValue></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="upi" label="UPI">UPI</SelectItem><SelectItem value="cash" label="Cash">Cash</SelectItem><SelectItem value="bank_transfer" label="Bank Transfer">Bank Transfer</SelectItem><SelectItem value="card" label="Card">Card</SelectItem><SelectItem value="online" label="Online">Online</SelectItem><SelectItem value="other" label="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="referenceId">Reference ID (Optional)</Label><Input id="referenceId" name="referenceId" className="border-slate-200" placeholder="UPI Ref / Cheque #" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="notes">Internal Notes (Optional)</Label><Input id="notes" name="notes" className="border-slate-200" placeholder="Any additional context..." /></div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setOpen(false)} className="text-slate-600">Cancel</Button>
                <Button type="submit" disabled={isSubmitting || !selectedClientId} className="bg-lime-400 text-slate-950 hover:bg-lime-500 font-bold px-8 shadow-md">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}Confirm Receipt
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Received This Month", icon: TrendingUp, data: summary.receivedMonth, cls: "text-lime-600 bg-lime-50" },
          { label: "Received YTD (FY)", icon: History, data: summary.receivedYTD, cls: "text-blue-600 bg-blue-50" },
          { label: "Current Outstanding", icon: AlertCircle, data: summary.outstanding, cls: "text-rose-600 bg-rose-50" },
        ].map((card) => (
          <Card key={card.label} className="border-slate-200">
            <CardContent className="p-5">
              <div className={cn("inline-flex p-2 rounded-lg mb-3", card.cls)}><card.icon className="h-5 w-5" /></div>
              <p className="text-sm font-medium text-slate-500 mb-1">{card.label}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                {card.data?.length > 0 ? card.data.map((r: any) => (
                  <span key={r.currency} className="text-2xl font-bold text-slate-900 tabular-nums">{curSym(r.currency)}{parseFloat(r.total).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                )) : <span className="text-2xl font-bold text-slate-300">—</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client statement (drill-in) */}
      {drillClient ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setDrillClientId(null)} className="gap-1 text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back</Button>
              <h2 className="text-xl font-bold text-slate-900">{drillClient.name}</h2>
              {!drillClient.isActive && <Badge variant="outline" className="bg-rose-50 text-rose-500 border-rose-100 text-[10px]">Terminated</Badge>}
              <div className="ml-auto flex gap-6 text-sm">
                <div className="text-right"><p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Invoiced</p><Money map={drillClient.invoiced} /></div>
                <div className="text-right"><p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Received</p><Money map={drillClient.received} /></div>
                <div className="text-right"><p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Balance</p>
                  <Money map={drillClient.balance} tone={Object.values(drillClient.balance).some(v => v > 0.005) ? "owed" : Object.values(drillClient.balance).some(v => v < -0.005) ? "credit" : "plain"} />
                </div>
              </div>
            </div>

            <Table>
              <TableHeader className="bg-slate-50/70"><TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead><TableHead>Reference</TableHead><TableHead>Description</TableHead>
                <TableHead className="text-right">Invoiced</TableHead><TableHead className="text-right">Received</TableHead><TableHead className="text-right">Balance</TableHead><TableHead className="w-10"></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {statement.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">No activity.</TableCell></TableRow> :
                statement.map((r, idx) => (
                  <TableRow key={r.kind + (r.id || r.ref) + idx} className="group hover:bg-slate-50/50">
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">{formatIST(new Date(r.date), "d MMM yyyy")}</TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", r.kind === "invoice" ? "text-slate-900" : "text-emerald-700")}>
                        {r.kind === "invoice" ? <FileText className="h-3.5 w-3.5 text-slate-400" /> : <ReceiptIcon className="h-3.5 w-3.5 text-emerald-500" />}
                        {r.ref}
                        {r.kind === "receipt" && r.sentAt && <MailCheck className="h-3.5 w-3.5 text-emerald-400" aria-label="Receipt emailed" />}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 capitalize">{r.desc}</TableCell>
                    <TableCell className="text-right tabular-nums text-slate-700">{r.invoiced ? `${curSym(r.currency)}${fmt(r.invoiced)}` : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums text-emerald-600">{r.received ? `${curSym(r.currency)}${fmt(r.received)}` : "—"}</TableCell>
                    <TableCell className={cn("text-right tabular-nums font-semibold", (r.balance ?? 0) > 0.005 ? "text-rose-600" : (r.balance ?? 0) < -0.005 ? "text-emerald-600" : "text-slate-400")}>
                      {(r.balance ?? 0) < 0 ? "-" : ""}{curSym(r.currency)}{fmt(r.balance ?? 0)}
                    </TableCell>
                    <TableCell>
                      {r.kind === "receipt" && (confirmDeleteId === r.id ? (
                        <div className="flex gap-1"><Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setConfirmDeleteId(null)}>Cancel</Button><Button size="sm" className="h-7 px-2 text-xs bg-rose-500 text-white" disabled={deletingId === r.id} onClick={() => handleDeleteReceipt(r.id!)}>{deletingId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm"}</Button></div>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-500 transition-opacity" onClick={() => setConfirmDeleteId(r.id!)} title="Delete receipt"><Trash2 className="h-4 w-4" /></Button>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex bg-slate-100/80 p-1 rounded-lg gap-1 border border-slate-200 shadow-sm">
              {(["clients", "invoices"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={cn("px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all", view === v ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                  {v === "clients" ? "By Client" : "By Invoice"}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={view === "clients" ? "Search client…" : "Search invoice # or client…"} className="pl-9 w-[260px] bg-slate-50 border-slate-200 h-10" />
            </div>
          </div>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {view === "clients" ? (
                <Table>
                  <TableHeader className="bg-slate-50/70"><TableRow className="hover:bg-transparent border-slate-200">
                    <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">Client</TableHead>
                    <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest text-right">Invoiced</TableHead>
                    <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest text-right">Received</TableHead>
                    <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest text-right">Balance</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {loading ? <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-200" /></TableCell></TableRow> :
                    ledger.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-400">No clients found.</TableCell></TableRow> :
                    ledger.map((c) => {
                      const owes = Object.values(c.balance).some(v => v > 0.005);
                      const credit = !owes && Object.values(c.balance).some(v => v < -0.005);
                      return (
                        <TableRow key={c.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => { setConfirmDeleteId(null); setDrillClientId(c.id); }}>
                          <TableCell className="py-3"><div className="flex items-center gap-2"><User className="h-4 w-4 text-slate-300 shrink-0" /><span className="font-medium text-slate-800">{c.name}</span>{!c.isActive && <Badge variant="outline" className="bg-rose-50 text-rose-500 border-rose-100 text-[8px]">Terminated</Badge>}</div></TableCell>
                          <TableCell className="text-right"><Money map={c.invoiced} /></TableCell>
                          <TableCell className="text-right"><Money map={c.received} /></TableCell>
                          <TableCell className="text-right"><Money map={c.balance} tone={owes ? "owed" : credit ? "credit" : "plain"} /></TableCell>
                          <TableCell><ChevronRight className="h-4 w-4 text-slate-300" /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/70"><TableRow className="hover:bg-transparent border-slate-200">
                    <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest cursor-pointer hover:text-slate-700 transition-colors" onClick={() => { if (invoiceSortKey === "date") setInvoiceSortDir(invoiceSortDir === "asc" ? "desc" : "asc"); else { setInvoiceSortKey("date"); setInvoiceSortDir("desc"); }}}>
                      <div className="flex items-center gap-1">Date {invoiceSortKey === "date" ? (invoiceSortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                    </TableHead>
                    <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest cursor-pointer hover:text-slate-700 transition-colors" onClick={() => { if (invoiceSortKey === "number") setInvoiceSortDir(invoiceSortDir === "asc" ? "desc" : "asc"); else { setInvoiceSortKey("number"); setInvoiceSortDir("desc"); }}}>
                      <div className="flex items-center gap-1">Invoice # {invoiceSortKey === "number" ? (invoiceSortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                    </TableHead>
                    <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">Client</TableHead>
                    <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest text-right">Invoiced</TableHead>
                    <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest text-right">Received</TableHead>
                    <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest text-right">Balance</TableHead>
                    <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">Status</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {loading ? <TableRow><TableCell colSpan={7} className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-200" /></TableCell></TableRow> :
                    invoiceRows.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-20 text-slate-400">No invoices found.</TableCell></TableRow> :
                    invoiceRows.map((i) => {
                      const bal = parseFloat(i.total) - parseFloat(i.amountPaid || "0");
                      return (
                        <TableRow key={i.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => setDrillClientId(i.clientId)}>
                          <TableCell className="py-3 whitespace-nowrap text-slate-600">{formatIST(new Date(i.issuedDate || i.createdAt), "d MMM yyyy")}</TableCell>
                          <TableCell className="font-semibold text-slate-900">{i.invoiceNumber}</TableCell>
                          <TableCell className="text-slate-700">{i.client?.name}</TableCell>
                          <TableCell className="text-right tabular-nums">{curSym(i.currency)}{fmt(parseFloat(i.total))}</TableCell>
                          <TableCell className="text-right tabular-nums text-slate-500">{curSym(i.currency)}{fmt(parseFloat(i.amountPaid || "0"))}</TableCell>
                          <TableCell className={cn("text-right tabular-nums font-semibold", bal > 0.005 ? "text-rose-600" : "text-slate-400")}>{curSym(i.currency)}{fmt(bal)}</TableCell>
                          <TableCell><StatusPill status={i.status} /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>}>
      <PaymentsPageInner />
    </Suspense>
  );
}
