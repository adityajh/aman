"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
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
  AlertCircle
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

  // Form State
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedClientName, setSelectedClientName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const fetchData = async () => {
    try {
      const [payRes, summaryRes, clientsRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/payments/outstanding-summary"),
        fetch("/api/clients")
      ]);
      const [payData, summaryData, clientsData] = await Promise.all([
        payRes.json(),
        summaryRes.json(),
        clientsRes.json()
      ]);
      setPayments(payData);
      setSummary(summaryData);
      setClients(clientsData);
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
        const errorText = await res.text();
        toast.error(`Failed to record payment: ${errorText}`);
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

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payments Ledger</h1>
          <p className="text-slate-500">Track collections, receipting, and pending dues.</p>
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
            <form onSubmit={handleRecordPayment} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Select Client</Label>
                <Select 
                  value={selectedClientId} 
                  onValueChange={(id) => {
                    const cleanId = id || "";
                    setSelectedClientId(cleanId);
                    setSelectedClientName(clients.find(c => c.id === cleanId)?.name || "");
                  }}
                  required
                >
                  <SelectTrigger className="border-slate-200 h-10 text-slate-900">
                    <span className={selectedClientName ? "text-slate-900" : "text-slate-400"}>
                      {selectedClientName || "Pick a client..."}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 max-h-[250px] overflow-y-auto">
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id} label={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-500 italic">Payments will be automatically allocated to the oldest invoices first (FIFO).</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (INR)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input id="amount" name="amount" type="number" step="0.01" className="pl-9 border-slate-200" placeholder="0.00" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input id="paymentDate" name="paymentDate" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} className="border-slate-200" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v || "upi")}>
                    <SelectTrigger className="border-slate-200 h-10">
                      <span className="capitalize">{paymentMethod.replace("_", " ")}</span>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
            <h3 className="text-3xl font-bold text-slate-900 truncate">₹{summary.totalReceivedThisMonth.toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:border-blue-400 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <History className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">All-Time Total Received</p>
            <h3 className="text-3xl font-bold text-slate-900 truncate">₹{summary.totalReceivedAllTime.toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:border-amber-400 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <Badge variant="outline" className="text-amber-600 border-amber-200">Pending</Badge>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Current Outstanding</p>
            <h3 className="text-3xl font-bold text-slate-900 truncate">₹{summary.totalOutstanding.toLocaleString()}</h3>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <p className="text-sm font-medium">Loading ledger...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-400">
                    No payment records found.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((pay) => (
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
                      <div className="flex items-center justify-end gap-1 font-bold text-slate-900">
                        <IndianRupee className="h-3 w-3 text-lime-600" />
                        {pay.amount}
                      </div>
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
