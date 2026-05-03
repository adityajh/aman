"use client";

import { useEffect, useState } from "react";
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
  Plus, 
  User, 
  IndianRupee, 
  Wallet, 
  CreditCard, 
  Banknote, 
  ArrowUpRight, 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Loader2,
  TrendingUp,
  History,
  AlertCircle,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalOutstanding: 0,
    totalReceivedThisMonth: 0,
    totalReceivedAllTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [feeSchemes, setFeeSchemes] = useState<any[]>([]);

  // Filters
  const [clientFilter, setClientFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const handleDeletePayment = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/payments/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Payment deleted and invoice balance recalculated.");
        setConfirmDeleteId(null);
        fetchData();
      } else {
        toast.error("Failed to delete payment.");
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setDeletingId(null);
    }
  };

  // Form State
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedClientName, setSelectedClientName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentCurrency, setPaymentCurrency] = useState("INR");

  const fetchData = async () => {
    try {
      const [payRes, summaryRes, clientsRes, feeRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/payments/outstanding-summary"),
        fetch("/api/clients"),
        fetch("/api/fee-schemes")
      ]);
      const [payData, summaryData, clientsData, feeData] = await Promise.all([
        payRes.json(),
        summaryRes.json(),
        clientsRes.json(),
        feeRes.json()
      ]);
      setPayments(payData);
      setSummary(summaryData);
      setClients(clientsData);
      setFeeSchemes(feeData);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      const res = await fetch("/api/payments", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`Payment recorded! Distributed across ${result.allocated} invoice(s).`);
        setOpen(false);
        setSelectedClientId("");
        setSelectedClientName("");
        fetchData();
      } else {
        let errMsg = "Unknown error";
        try {
          const errJson = await res.json();
          errMsg = errJson.error || JSON.stringify(errJson);
        } catch {
          errMsg = await res.text();
        }
        toast.error(`Failed to record payment: ${errMsg}`);
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodBadge = (method: string) => {
    const styles: any = {
      upi: "bg-blue-100 text-blue-900 border-blue-200",
      cash: "bg-lime-100 text-lime-900 border-lime-200",
      bank_transfer: "bg-slate-100 text-slate-900 border-slate-200",
      card: "bg-purple-100 text-purple-900 border-purple-200",
      online: "bg-teal-100 text-teal-900 border-teal-200",
      other: "bg-amber-100 text-amber-900 border-amber-200",
    };
    return (
      <Badge variant="outline" className={cn("font-bold uppercase text-[10px] tracking-wider", styles[method] || styles.other)}>
        {method.replace("_", " ")}
      </Badge>
    );
  };

  const filteredPayments = payments.filter((pay) => {
    if (clientFilter !== "all" && pay.clientId !== clientFilter) return false;
    
    if (periodFilter !== "all") {
      const d = new Date(pay.paymentDate);
      const now = new Date();
      if (periodFilter === "this_month") {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
      } else if (periodFilter === "last_month") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (d.getMonth() !== lastMonth.getMonth() || d.getFullYear() !== lastMonth.getFullYear()) return false;
      } else if (periodFilter === "this_year") {
        if (d.getFullYear() !== now.getFullYear()) return false;
      }
    }
    
    return true;
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payments Ledger</h1>
          <p className="text-slate-500">Track collections, receipting, and pending dues.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Client Filter */}
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <User className="h-4 w-4 text-slate-400 ml-2" />
            <Select value={clientFilter} onValueChange={(v) => setClientFilter(v || "all")}>
              <SelectTrigger className="w-[180px] border-0 h-8 bg-transparent shadow-none font-semibold focus:ring-0">
                <SelectValue>
                  {clientFilter === "all" ? "All Clients" : clients.find(c => c.id === clientFilter)?.name || "All Clients"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 max-h-[200px]">
                <SelectItem value="all" label="All Clients">All Clients</SelectItem>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id} label={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <Clock className="h-4 w-4 text-slate-400 ml-2" />
            <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v || "all")}>
              <SelectTrigger className="w-[180px] border-0 h-8 bg-transparent shadow-none font-semibold focus:ring-0">
                <SelectValue>
                  {periodFilter === "all" ? "All Time" :
                   periodFilter === "this_month" ? "This Month" :
                   periodFilter === "last_month" ? "Last Month" :
                   periodFilter === "this_year" ? "This Year" : "All Time"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all" label="All Time">All Time</SelectItem>
                <SelectItem value="this_month" label="This Month">This Month</SelectItem>
                <SelectItem value="last_month" label="Last Month">Last Month</SelectItem>
                <SelectItem value="this_year" label="This Year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button className="gap-2 bg-lime-400 text-slate-950 hover:bg-lime-500 font-bold shadow-sm">
                  <Plus className="h-4 w-4" /> Record Payment
                </Button>
              }
            />
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRecordPayment} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Client Name</Label>
                    <Select 
                      value={selectedClientId} 
                      onValueChange={(id) => {
                        const cleanId = id || "";
                        setSelectedClientId(cleanId);
                        const client = clients.find(c => c.id === cleanId);
                        setSelectedClientName(client ? client.name : "");
                        
                        // Auto-set currency based on client's default fee scheme
                        if (client?.defaultFeeSchemeId) {
                          const scheme = feeSchemes.find(f => f.id === client.defaultFeeSchemeId);
                          if (scheme) setPaymentCurrency(scheme.currency);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full border-slate-200 h-10 text-slate-900 shadow-sm bg-white">
                        <SelectValue>
                          {selectedClientId ? (clients.find(c => c.id === selectedClientId)?.name || "Pick a client...") : "Pick a client..."}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 max-h-[250px] overflow-y-auto shadow-2xl">
                        {clients.map(c => (
                          <SelectItem key={c.id} value={c.id} label={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={paymentCurrency} onValueChange={(v) => setPaymentCurrency(v || "INR")}>
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue>
                        {paymentCurrency === "INR" ? "INR (₹)" : "USD ($)"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="INR" label="INR (₹)">INR (₹)</SelectItem>
                      <SelectItem value="USD" label="USD ($)">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount Received</Label>
                  <div className="relative">
                    <Input id="amount" name="amount" type="number" step="0.01" className="pr-10 border-slate-200" placeholder="0.00" required />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input id="paymentDate" name="paymentDate" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} className="border-slate-200" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v || "upi")}>
                    <SelectTrigger className="border-slate-200 h-10 bg-white shadow-sm">
                      <SelectValue>
                        {paymentMethod === "upi" ? "UPI" :
                         paymentMethod === "cash" ? "Cash" :
                         paymentMethod === "bank_transfer" ? "Bank Transfer" :
                         paymentMethod === "card" ? "Card" :
                         paymentMethod === "online" ? "Online" :
                         paymentMethod === "other" ? "Other" : "UPI"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="upi" label="UPI">UPI</SelectItem>
                      <SelectItem value="cash" label="Cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer" label="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="card" label="Card">Card</SelectItem>
                      <SelectItem value="online" label="Online">Online</SelectItem>
                      <SelectItem value="other" label="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referenceId">Reference ID (Optional)</Label>
                  <Input id="referenceId" name="referenceId" className="border-slate-200" placeholder="UPI Ref / Cheque #" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes (Optional)</Label>
                <Input id="notes" name="notes" className="border-slate-200" placeholder="Any additional context..." />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setOpen(false)} className="text-slate-600">Cancel</Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting || !selectedClientId}
                  className="bg-lime-400 text-slate-950 hover:bg-lime-500 font-bold px-8 shadow-md"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Confirm Receipt
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:border-lime-400 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-lime-50 rounded-lg group-hover:bg-lime-100 transition-colors">
                <TrendingUp className="h-5 w-5 text-lime-600" />
              </div>
              <Badge className="bg-lime-100 text-lime-700 hover:bg-lime-100 border-0 font-bold">{format(new Date(), "MMMM")}</Badge>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Received This Month</p>
            <div className="flex flex-col gap-3">
              {summary.receivedMonth?.length > 0 ? summary.receivedMonth.map((r: any) => (
                <div key={r.currency} className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{r.currency}</span>
                  <div className="flex items-baseline gap-1 text-slate-900">
                    <span className="text-sm font-semibold opacity-50">{r.currency === 'USD' ? '$' : '₹'}</span>
                    <span className="text-3xl font-bold">{parseFloat(r.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">—</span>
                  <h3 className="text-3xl font-bold text-slate-900">0.00</h3>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:border-blue-400 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <History className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Received YTD (FY)</p>
            <div className="flex flex-col gap-3">
              {summary.receivedYTD?.length > 0 ? summary.receivedYTD.map((r: any) => (
                <div key={r.currency} className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{r.currency}</span>
                  <div className="flex items-baseline gap-1 text-slate-900">
                    <span className="text-sm font-semibold opacity-50">{r.currency === 'USD' ? '$' : '₹'}</span>
                    <span className="text-3xl font-bold">{parseFloat(r.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">—</span>
                  <h3 className="text-3xl font-bold text-slate-900">0.00</h3>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:border-red-400 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Current Outstanding</p>
            <div className="flex flex-col gap-3">
              {summary.outstanding?.length > 0 ? summary.outstanding.map((r: any) => (
                <div key={r.currency} className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{r.currency}</span>
                  <div className="flex items-baseline gap-1 text-slate-900">
                    <span className="text-sm font-semibold opacity-50">{r.currency === 'USD' ? '$' : '₹'}</span>
                    <span className="text-3xl font-bold">{parseFloat(r.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">—</span>
                  <h3 className="text-3xl font-bold text-slate-900">0.00</h3>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference / Notes</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <p className="text-sm font-medium">Loading ledger...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-slate-400">
                    No payment records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((pay) => (
                  <TableRow key={pay.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <span className="text-sm font-medium text-slate-600">
                        {format(new Date(pay.paymentDate), "d MMM yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-slate-400" />
                        <span className="text-sm font-bold text-slate-900">{pay.client?.name}</span>
                        {pay.client?.isActive === false && (
                          <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 uppercase text-[10px] py-0 px-1">Terminated</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {pay.invoice ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{pay.invoice.invoiceNumber}</span>
                          <span className="text-[10px] text-slate-500 uppercase">{format(new Date(pay.invoice.billingMonth), "MMM yyyy")}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">Unlinked / Credit</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getMethodBadge(pay.method)}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700 truncate">{pay.referenceId || "—"}</span>
                        {pay.notes && <span className="text-[10px] text-slate-500 truncate">{pay.notes}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 font-semibold text-slate-900">
                        <span className="text-xs opacity-50">{pay.currency === 'USD' ? '$' : '₹'}</span>
                        {pay.amount}
                      </div>
                    </TableCell>
                    <TableCell>
                      {confirmDeleteId === pay.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-slate-500 hover:text-slate-700"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold"
                            disabled={deletingId === pay.id}
                            onClick={() => handleDeletePayment(pay.id)}
                          >
                            {deletingId === pay.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm"}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setConfirmDeleteId(pay.id)}
                          title="Delete payment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
