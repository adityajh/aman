"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, User, Mail, Phone, IndianRupee, Pencil, X, Check, Loader2, UserMinus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [feeSchemes, setFeeSchemes] = useState<any[]>([]);
  const [selectedFeeSchemeId, setSelectedFeeSchemeId] = useState("");
  const [selectedFeeSchemeLabel, setSelectedFeeSchemeLabel] = useState("");
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");
  const [terminationType, setTerminationType] = useState("planned");

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetch("/api/fee-schemes").then(r => r.json()).then(setFeeSchemes).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Client added successfully");
        setOpen(false);
        fetchClients();
      } else {
        toast.error("Failed to add client");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditSaving(true);
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData);

    try {
      const res = await fetch(`/api/clients/${selectedClient.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedClient(updated);
        setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
        setEditMode(false);
        toast.success("Client profile updated");
      } else {
        const err = await res.text();
        toast.error(`Failed to update: ${err}`);
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setEditSaving(false);
    }
  };

  const handleTerminateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/clients/${selectedClient.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          isActive: false,
          terminationReason,
          terminationType,
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        toast.success("Client terminated successfully");
        setTerminateOpen(false);
        setDetailsOpen(false);
        fetchClients();
      } else {
        toast.error("Failed to terminate client");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your counselling practice clients here.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Client
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" placeholder="+91 9876543210" />
              </div>
              <div className="space-y-2">
                <Label>Default Fee Scheme</Label>
                <Select
                  value={selectedFeeSchemeId}
                  onValueChange={(id) => {
                    const val = id || "";
                    setSelectedFeeSchemeId(val);
                    const scheme = feeSchemes.find(f => f.id === val);
                    if (scheme) {
                      setSelectedFeeSchemeLabel(`${scheme.name} (${scheme.currency === 'USD' ? '$' : '₹'}${scheme.amount})`);
                    } else {
                      setSelectedFeeSchemeLabel("");
                    }
                  }}
                >
                  <SelectTrigger className="border-slate-200 bg-white h-10">
                    <span className={selectedFeeSchemeLabel ? "text-slate-900" : "text-slate-400"}>
                      {selectedFeeSchemeLabel || "Pick a fee scheme..."}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-2xl">
                    {feeSchemes.length === 0 && (
                      <SelectItem value="none" label="No schemes yet">No fee schemes yet — add one in Fees</SelectItem>
                    )}
                    {feeSchemes.map(f => (
                      <SelectItem key={f.id} value={f.id} label={f.name}>
                        {f.name} ({f.currency === 'USD' ? '$' : '₹'}{f.amount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Hidden fields for form submission */}
                <input type="hidden" name="defaultFeeSchemeId" value={selectedFeeSchemeId} />
                <input type="hidden" name="defaultFee" value={feeSchemes.find(f => f.id === selectedFeeSchemeId)?.amount || ""} />
              </div>
              <Button type="submit" className="w-full">Save Client</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Default Fee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Loading clients...</TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No clients found. Add your first client to get started.</TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium text-slate-900 flex items-center gap-2">
                          {client.name}
                          {!client.isActive && <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 uppercase text-[10px]">Terminated</Badge>}
                        </div>
                        <span className="text-xs text-slate-500">Since {new Date(client.createdAt).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" /> {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" /> {client.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        {client.defaultFee || "0.00"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setEditMode(false);
                          setDetailsOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={(v) => { setDetailsOpen(v); setEditMode(false); }}>
        <DialogContent className="max-w-2xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-950">
              <User className="h-5 w-5 text-primary" />
              {editMode ? "Edit Profile: " : "Client Details: "}{selectedClient?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            editMode ? (
              /* ── Edit Form ── */
              <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input id="edit-name" name="name" defaultValue={selectedClient.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input id="edit-email" name="email" type="email" defaultValue={selectedClient.email || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input id="edit-phone" name="phone" defaultValue={selectedClient.phone || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-defaultFee">Default Fee (INR)</Label>
                    <Input id="edit-defaultFee" name="defaultFee" type="number" defaultValue={selectedClient.defaultFee || ""} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="edit-notes">Notes / Background</Label>
                    <Input id="edit-notes" name="intakeNotes" defaultValue={selectedClient.intakeNotes || ""} placeholder="Any relevant background..." />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditMode(false)} className="gap-2">
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                  <Button type="submit" disabled={editSaving} className="gap-2 bg-lime-400 text-slate-950 hover:bg-lime-500 font-bold">
                    {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              /* ── View Mode ── */
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-8 border-b border-slate-100 pb-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Full Name</Label>
                      <p className="text-sm font-semibold text-slate-900">{selectedClient.name}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Email Address</Label>
                      <p className="text-sm text-slate-600">{selectedClient.email || "No email provided"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Phone Number</Label>
                      <p className="text-sm text-slate-600">{selectedClient.phone || "No phone provided"}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Default Fee (INR)</Label>
                      <p className="text-sm font-semibold text-slate-900">₹{selectedClient.defaultFee || "0"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Practice Summary</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-slate-50 border-slate-100 shadow-none">
                      <CardContent className="p-4">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Total sessions</p>
                        <p className="text-xl font-bold text-slate-900">-</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-slate-100 shadow-none">
                      <CardContent className="p-4">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Last Session</p>
                        <p className="text-xl font-bold text-slate-900">-</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-slate-100 shadow-none">
                      <CardContent className="p-4">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Total Billed</p>
                        <p className="text-xl font-bold text-slate-900">₹0</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-3 flex-wrap">
                  {selectedClient.isActive && (
                    <Button variant="outline" onClick={() => setTerminateOpen(true)} className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 mr-auto">
                      <UserMinus className="h-4 w-4" /> Terminate Client
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setEditMode(true)} className="gap-2 text-slate-600 border-slate-200">
                    <Pencil className="h-4 w-4" /> Edit Profile
                  </Button>
                  {selectedClient.isActive && <Button className="bg-primary text-primary-foreground">Schedule Session</Button>}
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Termination Dialog */}
      <Dialog open={terminateOpen} onOpenChange={(v) => {
        setTerminateOpen(v);
        if (!v) { setTerminationReason(""); setTerminationType("planned"); }
      }}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <UserMinus className="h-5 w-5" /> Terminate Service
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTerminateSubmit} className="space-y-4 pt-4">
            <p className="text-sm text-slate-600">
              You are resolving active services for <span className="font-bold">{selectedClient?.name}</span>. Data will be preserved.
            </p>
            <div className="space-y-2">
              <Label>Termination Type</Label>
              <Select value={terminationType} onValueChange={(v) => setTerminationType(v ?? "planned")}>
                <SelectTrigger className="border-slate-200 bg-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="planned">Planned (Graduation / Successful)</SelectItem>
                  <SelectItem value="unplanned">Unplanned (Dropout / Referred)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Termination Reason & Details</Label>
              <Input 
                value={terminationReason} 
                onChange={(e) => setTerminationReason(e.target.value)} 
                placeholder="e.g. Completed goals..." 
                required 
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setTerminateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={editSaving} className="bg-rose-500 hover:bg-rose-600 text-white font-bold gap-2">
                {editSaving && <Loader2 className="h-4 w-4 animate-spin" />} Terminate 
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

