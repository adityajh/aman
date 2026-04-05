"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Mail, FileText, User, IndianRupee, Send, Loader2, CheckCircle2, Eye, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [unbilled, setUnbilled] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

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
      case "draft": return <Badge variant="outline" className="bg-slate-100 text-slate-900 border-slate-300 font-bold uppercase text-[10px] tracking-wider">Generated</Badge>;
      case "sent": return <Badge variant="outline" className="bg-blue-100 text-blue-900 border-blue-200 font-bold uppercase text-[10px] tracking-wider">Sent</Badge>;
      case "paid": return <Badge variant="outline" className="bg-lime-100 text-lime-900 border-lime-300 font-bold uppercase text-[10px] tracking-wider">Paid</Badge>;
      default: return <Badge variant="outline" className="font-bold uppercase text-[10px] tracking-wider">{status}</Badge>;
    }
  };

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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Batch Invoices</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-slate-500">The clients below have unbilled completed sessions from previous months.</p>
              
              {unbilled.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500 border border-slate-800 rounded-lg bg-slate-950">
                  No unbilled sessions found.
                </div>
              ) : (
                unbilled.map((client) => (
                  <div key={client.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-lg bg-slate-50/50 hover:border-lime-500/30 transition-all group">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">{client.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{client.sessionCount} sessions • ₹{client.totalAmount}</span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleCreateBatch(client.id)}
                      disabled={isCreating}
                      className="bg-lime-400 text-slate-950 hover:bg-lime-500 font-bold border-none"
                    >
                      {isCreating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Send className="h-3 w-3 mr-2" />}
                      Generate
                    </Button>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent">
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
                    <TableCell colSpan={5} className="text-center py-10 text-slate-400 border-slate-800">Loading invoices...</TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-400 border-slate-800">No invoices yet. Use 'New Batch' to generate some.</TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{invoice.invoiceNumber}</span>
                          <span className="text-[10px] text-slate-500 uppercase">{format(new Date(invoice.billingMonth), "MMM yyyy")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-slate-400" />
                          <span className="text-sm text-slate-700">{invoice.client?.name}</span>
                          {!invoice.client?.email && <Badge variant="outline" className="text-[8px] bg-red-50 text-red-600 border-red-200">MISSING EMAIL</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-medium text-slate-900">
                          <IndianRupee className="h-3 w-3 text-lime-600" />
                          {invoice.total}
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
                              Sent {format(new Date(invoice.sentAt), "d MMM")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
                        <span className="text-xs font-semibold text-lime-700">₹{item.totalAmount}</span>
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
    </div>
  );
}
import { Clock } from "lucide-react";

