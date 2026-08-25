"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Plus,
  Mail,
  FileText,
  User,
  IndianRupee,
  DollarSign,
  Send,
  Search,
  Trash2,
  Download,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  ExternalLink,
  Calendar as CalendarIcon,
  Check,
  BadgeCheck,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Wallet,
  TrendingUp,
  Hourglass,
  FileX
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatIST, istFirstOfMonthStr, istTodayStr } from "@/lib/tz";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Currency-aware money helpers — invoices mix INR and USD, so totals are kept
// per-currency and rendered as separate symbols rather than summed blindly.
type CurrencyMap = Record<string, number>;
const addCur = (m: CurrencyMap, cur: string | null | undefined, amt: number) => {
  const k = cur || "INR";
  m[k] = (m[k] || 0) + amt;
  return m;
};
const curSymbol = (cur: string) => (cur === "USD" ? "$" : "₹");
const renderMoney = (m: CurrencyMap, opts: { decimals?: boolean } = {}) => {
  const entries = Object.entries(m).filter(([, v]) => v !== 0);
  if (entries.length === 0) return "—";
  return entries
    .map(([cur, amt]) =>
      `${curSymbol(cur)}${amt.toLocaleString("en-IN", {
        minimumFractionDigits: opts.decimals ? 2 : 0,
        maximumFractionDigits: opts.decimals ? 2 : 0,
      })}`
    )
    .join("  ·  ");
};

// Softer, modern status pills.
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    draft: { label: "Generated", cls: "bg-slate-100 text-slate-600 ring-slate-200" },
    sent: { label: "Sent", cls: "bg-sky-50 text-sky-700 ring-sky-200" },
    paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    partial: { label: "Partial", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
    overdue: { label: "Overdue", cls: "bg-rose-50 text-rose-700 ring-rose-200" },
    void: { label: "Void", cls: "bg-slate-50 text-slate-400 ring-slate-200 line-through" },
  };
  const m = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-600 ring-slate-200" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset", m.cls)}>
      {m.label}
    </span>
  );
}

// Per-row "…" actions menu (controlled so it closes after an action fires).
function RowActions({
  invoice,
  onPreview,
  onVoid,
}: {
  invoice: any;
  onPreview: () => void;
  onVoid: () => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const close = () => setOpen(false);
  const canVoid = invoice.status !== "paid" && invoice.status !== "void" && parseFloat(invoice.amountPaid || "0") === 0;
  const item = "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors text-left";
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-900 h-8 w-8 p-0" title="More actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-44 p-1 gap-0">
        <button className={item} onClick={() => { onPreview(); close(); }}>
          <Eye className="h-4 w-4 text-slate-400" /> View
        </button>
        <button className={item} onClick={() => { router.push('/dashboard/payments'); close(); }}>
          <Wallet className="h-4 w-4 text-emerald-500" /> Open Ledger
        </button>
        {canVoid && (
          <button className={cn(item, "text-rose-600 hover:bg-rose-50")} onClick={() => { onVoid(); close(); }}>
            <Trash2 className="h-4 w-4" /> Void
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function InvoicesPageInner() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [unbilled, setUnbilled] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);


  // Void-invoice dialog state.
  const [voidInvoice, setVoidInvoice] = useState<any | null>(null);
  const [voidSubmitting, setVoidSubmitting] = useState(false);

  const handleVoid = async () => {
    if (!voidInvoice) return;
    setVoidSubmitting(true);
    try {
      const res = await fetch(`/api/invoices/${voidInvoice.id}/void`, { method: "POST" });
      if (res.ok) {
        toast.success("Invoice voided — its sessions are back to unbilled");
        setVoidInvoice(null);
        fetchData();
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to void invoice");
      }
    } catch (err) {
      toast.error("Error voiding invoice");
    } finally {
      setVoidSubmitting(false);
    }
  };

  const searchParams = useSearchParams();
  const st = searchParams.get("status") || "draft,sent,paid,overdue";
  const [filterGenerated, setFilterGenerated] = useState(st.includes("draft"));
  const [filterSent, setFilterSent] = useState(st.includes("sent"));
  const [filterPaid, setFilterPaid] = useState(st.includes("paid"));
  const [filterOverdue, setFilterOverdue] = useState(st.includes("overdue"));

  // Flat-list sorting + free-text search.
  const [sortKey, setSortKey] = useState<"date" | "client" | "total" | "status">((searchParams.get("sort") as any) || "date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">((searchParams.get("dir") as any) || "desc");
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams();
    const stArr = [];
    if (filterGenerated) stArr.push("draft");
    if (filterSent) stArr.push("sent");
    if (filterPaid) stArr.push("paid");
    if (filterOverdue) stArr.push("overdue");
    const stStr = stArr.join(",");
    if (stStr !== "draft,sent,paid,overdue") params.set("status", stStr);
    
    if (sortKey !== "date") params.set("sort", sortKey);
    if (sortDir !== "desc") params.set("dir", sortDir);
    if (search) params.set("q", search);
    
    const qs = params.toString();
    router.replace(`/dashboard/invoices${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [filterGenerated, filterSent, filterPaid, filterOverdue, sortKey, sortDir, search, router]);
  const toggleSort = (key: "date" | "client" | "total" | "status") => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "client" ? "asc" : "desc"); }
  };

  // Batch Selection State
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [billingMonth, setBillingMonth] = useState(istFirstOfMonthStr());

  // Payment-due selection for the New Batch dialog. "7" / "15" map directly;
  // "custom" reveals a free days input. Default comes from practice settings.
  const [dueOption, setDueOption] = useState<"7" | "15" | "custom">("15");
  const [customDueDays, setCustomDueDays] = useState<string>("30");
  const effectiveDueDays = dueOption === "custom" ? (parseInt(customDueDays, 10) || 0) : parseInt(dueOption, 10);

  const fetchData = async () => {
    try {
      const [invRes, unbRes, setRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/invoices/unbilled"),
        fetch("/api/settings"),
      ]);
      const [invData, unbData, setData] = await Promise.all([
        invRes.json(),
        unbRes.json(),
        setRes.ok ? setRes.json() : null,
      ]);
      setInvoices(invData);
      setUnbilled(unbData);
      // Seed the due-date default from practice settings.
      const d = setData?.invoiceDueDays;
      if (d != null) {
        if (d === 7 || d === 15) setDueOption(String(d) as "7" | "15");
        else { setDueOption("custom"); setCustomDueDays(String(d)); }
      }
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleClient = (clientId: string) => {
    const next = new Set(selectedClients);
    if (next.has(clientId)) {
      next.delete(clientId);
    } else {
      next.add(clientId);
    }
    setSelectedClients(next);
  };

  const toggleAll = () => {
    if (selectedClients.size === unbilled.length && unbilled.length > 0) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(unbilled.map(c => c.id)));
    }
  };

  const handleCreateBatch = async () => {
    if (selectedClients.size === 0) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/invoices/batch", {
        method: "POST",
        body: JSON.stringify({
          clientIds: Array.from(selectedClients),
          billingMonth,
          dueDays: effectiveDueDays,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        const errCount = data.errors?.length ?? 0;
        if (data.count > 0) {
          toast.success(
            errCount > 0
              ? `Generated ${data.count} · ${errCount} failed`
              : `Generated ${data.count} invoices`,
          );
          fetchData();
          setOpen(false);
          setSelectedClients(new Set());
        } else {
          // count 0 with errors means the generation threw (e.g. a duplicate
          // invoice number) — surface it instead of a silent "Generated 0".
          const first = data.errors?.[0]?.error;
          toast.error(first ? `Could not generate: ${first}` : "No billable sessions to invoice");
        }
      } else {
        toast.error("Failed to generate invoices");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    setIsSending(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Invoice sent to client");
        fetchData();
      } else {
        const errorData = await res.text();
        toast.error(`Failed to send: ${errorData}`);
      }
    } catch (err) {
      toast.error("An error occurred while sending");
    } finally {
      setIsSending(null);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (!filterGenerated && inv.status === 'draft') return false;
    if (!filterSent && inv.status === 'sent') return false;
    if (!filterPaid && inv.status === 'paid') return false;
    if (!filterOverdue && (inv.status === 'overdue' || inv.status === 'partial')) return false;
    const q = search.trim().toLowerCase();
    if (q) {
      const hay = `${inv.client?.name ?? ""} ${inv.client?.email ?? ""} ${inv.invoiceNumber ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Flat, sortable list (replaces the old client-grouped view).
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let r = 0;
    if (sortKey === "client") r = (a.client?.name || "").localeCompare(b.client?.name || "");
    else if (sortKey === "total") r = parseFloat(a.total || "0") - parseFloat(b.total || "0");
    else if (sortKey === "status") r = (a.status || "").localeCompare(b.status || "");
    else r = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortDir === "asc" ? r : -r;
  });

  // Status counts for the filter bar (from the full list, before filtering).
  const counts = {
    draft: invoices.filter(i => i.status === "draft").length,
    sent: invoices.filter(i => i.status === "sent").length,
    paid: invoices.filter(i => i.status === "paid").length,
    overdue: invoices.filter(i => i.status === "overdue" || i.status === "partial").length,
  };

  // Currency-aware summary metrics.
  const pending = unbilled.reduce((m, c) => addCur(m, c.currency, parseFloat(c.totalAmount || "0")), {} as CurrencyMap);
  const pendingSessions = unbilled.reduce((s, c) => s + (Number(c.sessionCount) || 0), 0);
  const liveInvoices = invoices.filter(i => i.status !== "void");
  const outstanding = liveInvoices
    .filter(i => i.status !== "paid")
    .reduce((m, i) => addCur(m, i.currency, Math.max(0, parseFloat(i.total || "0") - parseFloat(i.amountPaid || "0"))), {} as CurrencyMap);
  const outstandingCount = liveInvoices.filter(
    i => i.status !== "paid" && parseFloat(i.total || "0") - parseFloat(i.amountPaid || "0") > 0
  ).length;
  const collected = liveInvoices.reduce((m, i) => addCur(m, i.currency, parseFloat(i.amountPaid || "0")), {} as CurrencyMap);

  const SortHeader = ({ label, k, className }: { label: string; k: "date" | "client" | "total" | "status"; className?: string }) => (
    <button
      type="button"
      onClick={() => toggleSort(k)}
      className={cn("flex items-center gap-1 hover:text-slate-700 transition-colors", className)}
    >
      {label}
      {sortKey === k ? (
        sortDir === "asc" ? <ArrowUp className="h-3 w-3 text-slate-600" /> : <ArrowDown className="h-3 w-3 text-slate-600" />
      ) : (
        <ArrowUpDown className="h-3 w-3 text-slate-300" />
      )}
    </button>
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h1>
          <p className="text-slate-500">Manage client billing and monthly invoices.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2 bg-lime-400 text-slate-950 hover:bg-lime-500 font-semibold">
                <Plus className="h-4 w-4" /> New Batch
              </Button>
            }
          />
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate Batch Invoices</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Billing Month</Label>
                  <p className="text-sm font-medium text-slate-900">{formatIST(new Date(billingMonth), "MMMM yyyy")}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Total Selected Amount</p>
                  <div className="flex flex-col items-end gap-1">
                    {(() => {
                      const selectedData = unbilled.filter(c => selectedClients.has(c.id));
                      const totals = selectedData.reduce((acc, c) => {
                        const cur = c.currency || 'INR';
                        acc[cur] = (acc[cur] || 0) + parseFloat(c.totalAmount);
                        return acc;
                      }, {} as Record<string, number>);
                      
                      return Object.entries(totals).map(([cur, amt]) => (
                        <p key={cur} className="text-lg font-bold text-lime-600 flex items-center justify-end">
                          {cur === 'USD' ? <DollarSign className="h-4 w-4" /> : <IndianRupee className="h-4 w-4" />}
                          {(amt as number).toFixed(2)}
                        </p>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Payment due selector */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Payment Due</Label>
                  <p className="text-[11px] text-slate-400">Sets each invoice&apos;s due date from today.</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={dueOption}
                    onChange={(e) => setDueOption(e.target.value as "7" | "15" | "custom")}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium"
                  >
                    <option value="7">Net 7 days</option>
                    <option value="15">Net 15 days</option>
                    <option value="custom">Custom…</option>
                  </select>
                  {dueOption === "custom" && (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        value={customDueDays}
                        onChange={(e) => setCustomDueDays(e.target.value)}
                        className="h-10 w-20 bg-white text-right"
                      />
                      <span className="text-sm text-slate-500">days</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 text-right -mt-3">
                Due <strong>{formatIST(new Date(Date.now() + effectiveDueDays * 864e5), "d MMM yyyy")}</strong> ({effectiveDueDays} days)
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="selectAll" checked={selectedClients.size === unbilled.length && unbilled.length > 0} onChange={toggleAll} />
                    <Label htmlFor="selectAll" className="text-xs font-bold text-slate-700 uppercase cursor-pointer">Select All Clients</Label>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{selectedClients.size} of {unbilled.length} selected</span>
                </div>

                <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {unbilled.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500 bg-white">
                      No unbilled sessions found.
                    </div>
                  ) : (
                    unbilled.map((client) => (
                      <div 
                        key={client.id} 
                        className={cn(
                          "flex items-center gap-4 p-4 transition-colors cursor-pointer hover:bg-slate-50",
                          selectedClients.has(client.id) ? "bg-lime-50/20" : "bg-white"
                        )}
                        onClick={() => toggleClient(client.id)}
                      >
                        <Checkbox 
                          checked={selectedClients.has(client.id)} 
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleClient(client.id);
                          }} 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{client.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{client.sessionCount} sessions pending</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900 flex items-center justify-end gap-1">
                            {client.currency === 'USD' ? <DollarSign className="h-3 w-3" /> : <IndianRupee className="h-3 w-3" />}
                            {client.totalAmount}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)} className="text-slate-600">Cancel</Button>
                <Button 
                  onClick={handleCreateBatch}
                  disabled={isCreating || selectedClients.size === 0}
                  className="bg-lime-400 text-slate-950 hover:bg-lime-500 font-bold px-8"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Generate {selectedClients.size} Invoices
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary metric cards — "Pending Billing" now lives here as context. */}
      <div className="max-w-sm">
        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <Hourglass className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Billing</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{renderMoney(pending)}</p>
            <p className="text-[11px] text-slate-500">{unbilled.length} clients · {pendingSessions} sessions awaiting billing</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter bar (with counts) + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-slate-100/80 p-1 rounded-lg gap-1 border border-slate-200 shadow-sm">
          {([
            { label: "Generated", on: filterGenerated, set: setFilterGenerated, count: counts.draft, active: "bg-white text-slate-600 shadow-sm" },
            { label: "Sent", on: filterSent, set: setFilterSent, count: counts.sent, active: "bg-white text-sky-600 shadow-sm" },
            { label: "Paid", on: filterPaid, set: setFilterPaid, count: counts.paid, active: "bg-white text-emerald-600 shadow-sm" },
            { label: "Overdue / Partial", on: filterOverdue, set: setFilterOverdue, count: counts.overdue, active: "bg-white text-rose-600 shadow-sm" },
          ] as const).map((f) => (
            <button
              key={f.label}
              onClick={() => f.set(!f.on)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5",
                f.on ? f.active : "text-slate-400 hover:text-slate-600"
              )}
            >
              {f.label}
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] leading-none", f.on ? "bg-slate-100 text-slate-500" : "bg-slate-200/60 text-slate-400")}>{f.count}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice # or client…"
            className="pl-9 w-[260px] bg-slate-50 border-slate-200 h-10"
          />
        </div>
      </div>

      {/* Full-width, flat, sortable invoices table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest"><SortHeader label="Invoice #" k="date" /></TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest"><SortHeader label="Client" k="client" /></TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">Sessions</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest"><SortHeader label="Total" k="total" /></TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">Paid</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest"><SortHeader label="Status" k="status" /></TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" />
                    <p className="mt-4 text-slate-400 font-medium">Loading invoices…</p>
                  </TableCell>
                </TableRow>
              ) : sortedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20">
                    <FileX className="h-12 w-12 mx-auto text-slate-200" />
                    <p className="mt-4 text-slate-500 font-semibold">No invoices to show</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {invoices.length === 0
                        ? "Generate your first batch to get started."
                        : "No invoices match your current filters or search."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                sortedInvoices.map((invoice: any) => (
                  <TableRow key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{invoice.invoiceNumber}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{formatIST(new Date(invoice.billingMonth), "MMM yyyy")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-300 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[180px]">{invoice.client?.name}</span>
                        {invoice.client?.isActive === false && (
                          <Badge variant="outline" className="text-[8px] bg-rose-50 text-rose-500 border-rose-100">Terminated</Badge>
                        )}
                        {!invoice.client?.email && (
                          <Badge variant="outline" className="text-[8px] bg-amber-50 text-amber-600 border-amber-100">No email</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 tabular-nums">{invoice.sessionCount || 0}</TableCell>
                    <TableCell className="font-semibold text-slate-900 tabular-nums">
                      {curSymbol(invoice.currency)}{parseFloat(invoice.total || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-slate-500 tabular-nums">
                      {curSymbol(invoice.currency)}{parseFloat(invoice.amountPaid || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell><StatusPill status={invoice.status} /></TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end items-center gap-1.5">
                        {!invoice.sentAt && invoice.status !== "void" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold h-8"
                            onClick={() => handleSendInvoice(invoice.id)}
                            disabled={!!isSending || !invoice.client?.email}
                            title={!invoice.client?.email ? "Client has no email on file" : "Send invoice to client"}
                          >
                            {isSending === invoice.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            Send
                          </Button>
                        ) : invoice.status !== "void" && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium whitespace-nowrap">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            {invoice.sentAt ? formatIST(new Date(invoice.sentAt), "d MMM") : "Sent"}
                          </span>
                        )}
                        <RowActions
                          invoice={invoice}
                          onPreview={() => setPreviewId(invoice.id)}
                          
                          onVoid={() => setVoidInvoice(invoice)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!previewId} onOpenChange={() => setPreviewId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-lime-600" /> Invoice Preview
            </DialogTitle>
          </DialogHeader>
          <div className="bg-white rounded-lg p-1">
             {previewId && <iframe src={`/api/invoices/${previewId}/preview`} className="w-full h-[70vh] border-0" />}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!voidInvoice} onOpenChange={(v) => !v && setVoidInvoice(null)}>
        <DialogContent className="bg-white border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <Trash2 className="h-5 w-5" /> Void Invoice
            </DialogTitle>
          </DialogHeader>
          {voidInvoice && (
            <div className="space-y-4 py-2">
              <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                <div>Invoice <strong>{voidInvoice.invoiceNumber}</strong> for <strong>{voidInvoice.client?.name}</strong></div>
                <div className="text-xs text-slate-500">
                  Amount: {voidInvoice.currency === 'USD' ? '$' : '₹'}{parseFloat(voidInvoice.total || '0').toFixed(2)}
                </div>
              </div>
              <p className="text-sm text-slate-700">
                Voiding will:
              </p>
              <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>Set this invoice&apos;s status to <strong>Void</strong> (it stays visible for audit).</li>
                <li>Remove its line items.</li>
                <li>Release every linked session back to <strong>unbilled</strong>, so you can include them in a new batch.</li>
              </ul>
              <p className="text-xs text-slate-500">
                Blocked if any payment has been recorded against this invoice. Voids cannot be undone — but you can always re-generate a fresh batch from the freed sessions.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setVoidInvoice(null)}>Back</Button>
                <Button
                  onClick={handleVoid}
                  disabled={voidSubmitting}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold gap-2"
                >
                  {voidSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Void Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>}>
      <InvoicesPageInner />
    </Suspense>
  );
}
