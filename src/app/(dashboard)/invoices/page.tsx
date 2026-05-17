"use client";

import React, { useEffect, useState } from "react";
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
  BadgeCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatIST, istFirstOfMonthStr, istTodayStr } from "@/lib/tz";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [unbilled, setUnbilled] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Confirm-payment dialog state. Holds a snapshot of the invoice being paid
  // so the dialog can prefill amount / currency / client name.
  const [confirmInvoice, setConfirmInvoice] = useState<any | null>(null);
  const [confirmAmount, setConfirmAmount] = useState<string>("");
  const [confirmDate, setConfirmDate] = useState<string>(istTodayStr());
  const [confirmMethod, setConfirmMethod] = useState<string>("upi");
  const [confirmRef, setConfirmRef] = useState<string>("");
  const [confirmEmail, setConfirmEmail] = useState<boolean>(true);
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);

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

  const openConfirm = (inv: any) => {
    const total = parseFloat(inv.total || "0");
    const paid = parseFloat(inv.amountPaid || "0");
    const balance = Math.max(0, total - paid);
    setConfirmInvoice(inv);
    setConfirmAmount(balance.toFixed(2));
    setConfirmDate(istTodayStr());
    setConfirmMethod("upi");
    setConfirmRef("");
    setConfirmEmail(true);
  };

  const handleConfirmReceipt = async () => {
    if (!confirmInvoice) return;
    setConfirmSubmitting(true);
    try {
      const res = await fetch(`/api/invoices/${confirmInvoice.id}/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: confirmAmount,
          paymentDate: confirmDate,
          method: confirmMethod,
          referenceId: confirmRef || undefined,
          sendEmail: confirmEmail,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(
          data.emailedTo
            ? data.testMode
              ? `Payment recorded · receipt sent to YOU (test mode)`
              : `Payment recorded · receipt emailed to client`
            : `Payment recorded`,
        );
        setConfirmInvoice(null);
        fetchData();
      } else {
        const err = await res.text();
        toast.error(`Failed: ${err}`);
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setConfirmSubmitting(false);
    }
  };
  const [filterGenerated, setFilterGenerated] = useState(true);
  const [filterSent, setFilterSent] = useState(true);
  const [filterPaid, setFilterPaid] = useState(true);
  const [filterOverdue, setFilterOverdue] = useState(true);

  // Batch Selection State
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [billingMonth, setBillingMonth] = useState(istFirstOfMonthStr());

  const fetchData = async () => {
    try {
      const [invRes, unbRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/invoices/unbilled"),
      ]);
      const [invData, unbData] = await Promise.all([
        invRes.json(),
        unbRes.json(),
      ]);
      setInvoices(invData);
      setUnbilled(unbData);
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
          billingMonth 
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Generated ${data.count} invoices`);
        fetchData();
        setOpen(false);
        setSelectedClients(new Set());
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft": return <Badge variant="outline" className="bg-slate-100 text-slate-900 border-slate-300 font-bold uppercase text-[10px] tracking-wider">Generated</Badge>;
      case "sent": return <Badge variant="outline" className="bg-blue-100 text-blue-900 border-blue-200 font-bold uppercase text-[10px] tracking-wider">Sent</Badge>;
      case "paid": return <Badge variant="outline" className="bg-lime-100 text-lime-900 border-lime-300 font-bold uppercase text-[10px] tracking-wider">Paid</Badge>;
      case "partial": return <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold uppercase text-[10px] tracking-wider">Partial</Badge>;
      case "overdue": return <Badge variant="outline" className="bg-red-100 text-red-900 border-red-300 font-bold uppercase text-[10px] tracking-wider">Overdue</Badge>;
      case "void": return <Badge variant="outline" className="bg-slate-200 text-slate-500 border-slate-300 font-bold uppercase text-[10px] tracking-wider line-through">Void</Badge>;
      default: return <Badge variant="outline" className="font-bold uppercase text-[10px] tracking-wider">{status}</Badge>;
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (!filterGenerated && inv.status === 'draft') return false;
    if (!filterSent && inv.status === 'sent') return false;
    if (!filterPaid && inv.status === 'paid') return false;
    if (!filterOverdue && (inv.status === 'overdue' || inv.status === 'partial')) return false;
    return true;
  });

  const groupedInvoices = filteredInvoices.reduce((acc: any, inv) => {
    const clientId = inv.clientId;
    if (!acc[clientId]) {
      acc[clientId] = {
        client: inv.client,
        items: [],
        totalAmount: 0,
      };
    }
    acc[clientId].items.push(inv);
    acc[clientId].totalAmount += parseFloat(inv.total);
    return acc;
  }, {} as any);

  const sortedClientIds = Object.keys(groupedInvoices).sort((a, b) => 
    groupedInvoices[a].client?.name.localeCompare(groupedInvoices[b].client?.name)
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

      <div className="flex bg-slate-100/80 p-1 rounded-lg gap-1 border border-slate-200 shadow-sm mb-6 w-fit">
        <button 
          onClick={() => setFilterGenerated(!filterGenerated)}
          className={cn(
            "px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all",
            filterGenerated ? "bg-white text-slate-500 shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Generated
        </button>
        <button 
          onClick={() => setFilterSent(!filterSent)}
          className={cn(
            "px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all",
            filterSent ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Sent
        </button>
        <button 
          onClick={() => setFilterPaid(!filterPaid)}
          className={cn(
            "px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all",
            filterPaid ? "bg-white text-lime-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Paid
        </button>
        <button 
          onClick={() => setFilterOverdue(!filterOverdue)}
          className={cn(
            "px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all",
            filterOverdue ? "bg-white text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Overdue / Partial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-slate-400 border-slate-800">Loading invoices...</TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-slate-400 border-slate-800">No invoices match your filters.</TableCell>
                  </TableRow>
                ) : (
                  sortedClientIds.map((clientId) => {
                    const group = groupedInvoices[clientId];
                    return (
                      <React.Fragment key={clientId}>
                        <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                          <TableCell colSpan={7} className="py-2 px-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-400" />
                                <span className="font-bold text-slate-900">{group.client?.name}</span>
                                {group.client?.isActive === false && (
                                  <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 uppercase text-[10px] py-0">Terminated</Badge>
                                )}
                                <Badge variant="secondary" className="text-[10px] py-0">{group.items.length} Invoices</Badge>
                              </div>
                              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                Total Invoiced: 
                                <span className="text-lime-700 flex items-center">
                                  {group.items[0]?.currency === 'USD' ? <DollarSign className="h-3 w-3" /> : <IndianRupee className="h-3 w-3" />}
                                  {group.totalAmount.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                        {group.items.map((invoice: any) => (
                          <TableRow key={invoice.id} className="group">
                            <TableCell className="pl-6">
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900">{invoice.invoiceNumber}</span>
                                <span className="text-[10px] text-slate-500 uppercase">{formatIST(new Date(invoice.billingMonth), "MMM yyyy")}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-700 truncate max-w-[120px]">{group.client?.name}</span>
                                {!group.client?.email && <Badge variant="outline" className="text-[8px] bg-red-50 text-red-600 border-red-200">MISSING EMAIL</Badge>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-white text-slate-700 border-slate-200 font-medium">
                                {invoice.sessionCount || 0} sessions
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 font-medium text-slate-900">
                                {invoice.currency === 'USD' ? (
                                  <DollarSign className="h-3 w-3 text-blue-600" />
                                ) : (
                                  <IndianRupee className="h-3 w-3 text-lime-600" />
                                )}
                                {invoice.total}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 font-medium text-slate-500">
                                {invoice.currency === 'USD' ? (
                                  <DollarSign className="h-3 w-3" />
                                ) : (
                                  <IndianRupee className="h-3 w-3" />
                                )}
                                {invoice.amountPaid || "0.00"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(invoice.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-slate-400 hover:text-slate-900"
                                  onClick={() => setPreviewId(invoice.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {invoice.status === 'draft' ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-lime-900 border-lime-300 bg-lime-50 hover:bg-lime-100 font-bold shadow-sm"
                                    onClick={() => handleSendInvoice(invoice.id)}
                                    disabled={!!isSending || !invoice.client?.email}
                                  >
                                    {isSending === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    Send
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-2 text-xs text-lime-700 font-bold whitespace-nowrap">
                                    <CheckCircle2 className="h-4 w-4 text-lime-600" />
                                    {invoice.sentAt ? formatIST(new Date(invoice.sentAt), "d MMM") : 'Sent'}
                                  </div>
                                )}
                                {invoice.status !== 'draft' && invoice.status !== 'paid' && invoice.status !== 'void' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-emerald-900 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 font-bold shadow-sm"
                                    onClick={() => openConfirm(invoice)}
                                    title="Record payment and email receipt"
                                  >
                                    <BadgeCheck className="h-4 w-4" /> Confirm Payment
                                  </Button>
                                )}
                                {invoice.status !== 'paid' && invoice.status !== 'void' && parseFloat(invoice.amountPaid || '0') === 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                    onClick={() => setVoidInvoice(invoice)}
                                    title="Void this invoice (sessions return to unbilled)"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-lime-600" /> Pending Billing
              </h3>
              <div className="space-y-3">
                {unbilled.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">All sessions up to date.</p>
                ) : (
                  unbilled.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50/50 border border-slate-200 rounded-md">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-slate-900">{item.name}</span>
                        <span className="text-xs font-semibold text-lime-700">{item.currency === 'USD' ? '$' : '₹'}{item.totalAmount}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.sessionCount} Unbilled Sessions</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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

      <Dialog open={!!confirmInvoice} onOpenChange={(v) => !v && setConfirmInvoice(null)}>
        <DialogContent className="bg-white border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-700">
              <BadgeCheck className="h-5 w-5" /> Confirm Payment
            </DialogTitle>
          </DialogHeader>
          {confirmInvoice && (
            <div className="space-y-4 py-2">
              <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                <div>Invoice <strong>{confirmInvoice.invoiceNumber}</strong> for <strong>{confirmInvoice.client?.name}</strong></div>
                <div className="text-xs text-slate-500">
                  Outstanding: {confirmInvoice.currency === 'USD' ? '$' : '₹'}
                  {Math.max(0, parseFloat(confirmInvoice.total || '0') - parseFloat(confirmInvoice.amountPaid || '0')).toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Amount Received</Label>
                  <Input type="number" step="0.01" min={0} value={confirmAmount} onChange={(e) => setConfirmAmount(e.target.value)} className="h-10 bg-slate-50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Payment Date (IST)</Label>
                  <Input type="date" value={confirmDate} onChange={(e) => setConfirmDate(e.target.value)} className="h-10 bg-slate-50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Method</Label>
                  <select
                    value={confirmMethod}
                    onChange={(e) => setConfirmMethod(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                  >
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Reference (Optional)</Label>
                  <Input value={confirmRef} onChange={(e) => setConfirmRef(e.target.value)} placeholder="UPI ref / cheque no." className="h-10 bg-slate-50" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none border border-slate-200 rounded-lg p-3 bg-slate-50/60">
                <input type="checkbox" checked={confirmEmail} onChange={(e) => setConfirmEmail(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
                <span className="text-sm text-slate-700">
                  Email receipt to <strong>{confirmInvoice.client?.email || "(no email on file)"}</strong>
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setConfirmInvoice(null)}>Back</Button>
                <Button
                  onClick={handleConfirmReceipt}
                  disabled={confirmSubmitting || !confirmAmount || parseFloat(confirmAmount) <= 0}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2"
                >
                  {confirmSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                  Confirm Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
