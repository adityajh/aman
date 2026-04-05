"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Mail, FileText, User, IndianRupee, Send, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [unbilled, setUnbilled] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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

  const handleCreateBatch = async (clientId: string) => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/invoices/batch", {
        method: "POST",
        body: JSON.stringify({ clientId }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Invoice generated");
        fetchData();
        setOpen(false);
      } else {
        toast.error("Failed to generate invoice");
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
      case "draft": return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Draft</Badge>;
      case "sent": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sent</Badge>;
      case "paid": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage client billing and monthly invoices.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> New Batch
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Batch Invoices</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">The clients below have unbilled completed sessions from the previous month(s).</p>
              
              {unbilled.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground border rounded-lg bg-slate-50/50">
                  No unbilled sessions found.
                </div>
              ) : (
                unbilled.map((client) => (
                  <div key={client.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50 transition">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{client.name}</span>
                      <span className="text-xs text-muted-foreground">{client.sessionCount} sessions • ₹{client.totalAmount}</span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleCreateBatch(client.id)}
                      disabled={isCreating}
                    >
                      {isCreating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <FileText className="h-3 w-3 mr-2" />}
                      Generate
                    </Button>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">Loading invoices...</TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No invoices yet. Use 'New Batch' to generate some.</TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{invoice.invoiceNumber}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{format(new Date(invoice.billingMonth), "MMM yyyy")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{invoice.client?.name}</span>
                        {!invoice.client?.email && <Badge variant="outline" className="text-[8px] bg-red-50 text-red-600 border-red-100">MISSING EMAIL</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium">
                        <IndianRupee className="h-3 w-3" />
                        {invoice.total}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.status === 'draft' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
                          onClick={() => handleSendInvoice(invoice.id)}
                          disabled={!!isSending || !invoice.client?.email}
                        >
                          {isSending === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          Email Invoice
                        </Button>
                      ) : (
                        <div className="flex justify-end items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Sent on {format(new Date(invoice.sentAt), "d MMM")}
                        </div>
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
