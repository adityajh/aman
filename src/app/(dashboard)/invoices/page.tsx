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
      case "draft": return <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700 uppercase text-[10px]">Draft</Badge>;
      case "sent": return <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-800 uppercase text-[10px]">Sent</Badge>;
      case "paid": return <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-800 uppercase text-[10px]">Paid</Badge>;
      default: return <Badge variant="outline" className="uppercase text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Invoices</h1>
          <p className="text-slate-400">Manage client billing and monthly invoices.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2 bg-lime-400 text-slate-950 hover:bg-lime-500 font-semibold">
                <Plus className="h-4 w-4" /> New Batch
              </Button>
            }
          />
          <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle>Generate Batch Invoices</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-slate-400">The clients below have unbilled completed sessions from previous months.</p>
              
              {unbilled.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500 border border-slate-800 rounded-lg bg-slate-950">
                  No unbilled sessions found.
                </div>
              ) : (
                unbilled.map((client) => (
                  <div key={client.id} className="flex justify-between items-center p-4 border border-slate-800 rounded-lg bg-slate-950/50 hover:border-lime-500/30 transition-all group">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-blue-50 group-hover:text-white transition-colors">{client.name}</span>
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
        <Card className="md:col-span-2 bg-slate-900 border-slate-800 h-full">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-950">
                <TableRow className="border-slate-800 hover:bg-slate-950">
                  <TableHead className="text-slate-300">Invoice #</TableHead>
                  <TableHead className="text-slate-300">Client</TableHead>
                  <TableHead className="text-slate-300">Amount</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-right text-slate-300">Actions</TableHead>
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
                    <TableRow key={invoice.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{invoice.invoiceNumber}</span>
                          <span className="text-[10px] text-slate-500 uppercase">{format(new Date(invoice.billingMonth), "MMM yyyy")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-slate-500" />
                          <span className="text-sm text-slate-300">{invoice.client?.name}</span>
                          {!invoice.client?.email && <Badge variant="outline" className="text-[8px] bg-red-900/20 text-red-400 border-red-900">MISSING EMAIL</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-medium text-white">
                          <IndianRupee className="h-3 w-3 text-lime-400" />
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
                            className="text-slate-400 hover:text-white"
                            onClick={() => setPreviewId(invoice.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'draft' ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2 text-lime-400 border-lime-800 hover:bg-lime-900/20"
                              onClick={() => handleSendInvoice(invoice.id)}
                              disabled={!!isSending || !invoice.client?.email}
                            >
                              {isSending === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                              Send
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-lime-500 font-medium whitespace-nowrap">
                              <CheckCircle2 className="h-4 w-4" />
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
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-lime-400" /> Pending Billing
              </h3>
              <div className="space-y-3">
                {unbilled.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">All sessions up to date.</p>
                ) : (
                  unbilled.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-md">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-white">{item.name}</span>
                        <span className="text-xs font-semibold text-lime-400">₹{item.totalAmount}</span>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-lime-400" /> Invoice Preview
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

