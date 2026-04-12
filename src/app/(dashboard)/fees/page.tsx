"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, IndianRupee, DollarSign, Globe } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FeesPage() {
  const [feeSchemes, setFeeSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<any>(null);

  const fetchFees = async () => {
    try {
      const res = await fetch("/api/fee-schemes");
      const data = await res.json();
      setFeeSchemes(data);
    } catch (err) {
      toast.error("Failed to fetch fee schemes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const url = editingScheme ? `/api/fee-schemes/${editingScheme.id}` : "/api/fee-schemes";
      const method = editingScheme ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success(editingScheme ? "Fee scheme updated" : "Fee scheme created");
        setOpen(false);
        setEditingScheme(null);
        fetchFees();
      } else {
        toast.error("Failed to save fee scheme");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fee scheme?")) return;

    try {
      const res = await fetch(`/api/fee-schemes/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Fee scheme deleted");
        fetchFees();
      } else {
        toast.error("Failed to delete fee scheme");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Fee Management</h1>
          <p className="text-slate-500">Manage your practice's standardized fee structures.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) setEditingScheme(null); }}>
          <DialogTrigger
            render={
              <Button className="gap-2 bg-lime-500 text-slate-950 hover:bg-lime-600 font-semibold shadow-sm">
                <Plus className="h-4 w-4" /> New Fee Scheme
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingScheme ? "Edit Fee Scheme" : "Create Fee Scheme"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Scheme Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="e.g., Standard Consultation" 
                  defaultValue={editingScheme?.name} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select name="currency" defaultValue={editingScheme?.currency || "INR"}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <Input 
                      id="amount" 
                      name="amount" 
                      type="number" 
                      placeholder="0.00" 
                      defaultValue={editingScheme?.amount} 
                      required 
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Details about this fee structure..." 
                  defaultValue={editingScheme?.description}
                />
              </div>
              <Button type="submit" className="w-full bg-lime-400 text-slate-950 hover:bg-lime-500">
                {editingScheme ? "Update Scheme" : "Create Scheme"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400 border-slate-800">Loading fee schemes...</TableCell>
                </TableRow>
              ) : feeSchemes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400 border-slate-800">No fee schemes defined.</TableCell>
                </TableRow>
              ) : (
                feeSchemes.map((scheme) => (
                  <TableRow key={scheme.id}>
                    <TableCell className="font-medium text-slate-900">{scheme.name}</TableCell>
                    <TableCell className="text-slate-500">{scheme.description || "-"}</TableCell>
                    <TableCell className="font-semibold tracking-tight text-slate-900">
                      <span className={scheme.currency === 'USD' ? 'text-blue-600' : 'text-lime-700'}>
                        {scheme.currency === 'USD' ? '$' : '₹'}{scheme.amount}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs">
                      {format(new Date(scheme.updatedAt), "d MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-400 hover:text-slate-900"
                        onClick={() => { setEditingScheme(scheme); setOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-400 hover:text-red-400"
                        onClick={() => handleDelete(scheme.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
