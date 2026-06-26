"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, User, Mail, Phone, IndianRupee, DollarSign, Pencil, X, Check, Loader2, UserMinus, LineChart, ListFilter, Calendar, AlertTriangle, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ClientProgressChart } from "@/components/client-progress-chart";
import { useRouter } from "next/navigation";
import { TZ_OPTIONS, IST, formatIST } from "@/lib/tz";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [feeSchemes, setFeeSchemes] = useState<any[]>([]);
  const [defaultFeeSchemeId, setSelectedFeeSchemeId] = useState("");
  const [selectedFeeSchemeLabel, setSelectedFeeSchemeLabel] = useState("");
  const [timezone, setTimezone] = useState<string>(IST);
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");
  const [terminationType, setTerminationType] = useState("planned");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "terminated">("active");
  const [search, setSearch] = useState("");
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictClient, setConflictClient] = useState<any>(null);
  const [cancelSessionsOnTerminate, setCancelSessionsOnTerminate] = useState(false);
  const [clientStats, setClientStats] = useState<{ total: number; lastDate: string | null; billed: number; currency: string } | null>(null);
  const [ptrSaving, setPtrSaving] = useState(false);
  const router = useRouter();

  const handleSetPTR = async (clientId: string, value: boolean | null) => {
    setPtrSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        body: JSON.stringify({ prematureTerminationManual: value }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedClient(updated);
        setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
        toast.success("PTR-II assessment saved");
      } else {
        toast.error("Failed to save PTR-II");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setPtrSaving(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data);
    } catch {
      toast.error("Failed to fetch clients.");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => {
    if (statusFilter === "active" && !c.isActive) return false;
    if (statusFilter === "terminated" && c.isActive) return false;
    const q = search.trim().toLowerCase();
    if (q) {
      const haystack = `${c.name ?? ""} ${c.email ?? ""} ${c.phone ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  useEffect(() => {
    fetchClients();
    fetch("/api/fee-schemes").then(r => r.json()).then(setFeeSchemes).catch(() => {});
  }, []);

  // Re-seed fee scheme state whenever edit mode opens (handles race where feeSchemes loads after click)
  useEffect(() => {
    if (!editMode || !selectedClient || feeSchemes.length === 0) return;
    setSelectedFeeSchemeId(selectedClient.defaultFeeSchemeId || "");
    setTimezone(selectedClient.timezone || IST);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, feeSchemes.length]);

  // Fetch per-client stats whenever the details dialog opens
  useEffect(() => {
    if (!detailsOpen || !selectedClient) return;
    setClientStats(null);
    fetch(`/api/clients/${selectedClient.id}/stats`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: any) => {
        const scheme = feeSchemes.find((f: any) => f.id === selectedClient.defaultFeeSchemeId);
        setClientStats({
          total: data.total ?? 0,
          lastDate: data.lastDate ?? null,
          billed: Number(data.totalBilled ?? 0),
          currency: scheme?.currency || "INR",
        });
      })
      .catch(() => {
        const scheme = feeSchemes.find((f: any) => f.id === selectedClient.defaultFeeSchemeId);
        setClientStats({ total: 0, lastDate: null, billed: 0, currency: scheme?.currency || "INR" });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailsOpen, selectedClient?.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | null, force = false) => {
    if (e) e.preventDefault();
    const form = document.getElementById("add-client-form") as HTMLFormElement;
    const formData = new FormData(form);
    const payload: any = Object.fromEntries(formData);
    if (force) payload.forceCreate = true;

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
      } else if (res.status === 409) {
        const data = await res.json();
        setConflictClient(data.client);
        setConflictOpen(true);
      } else {
        toast.error("Failed to add client");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleRestart = async () => {
    if (!conflictClient) return;
    try {
      const res = await fetch(`/api/clients/${conflictClient.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: true }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const updated = await res.json();
        setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
        setSelectedClient(updated);
        setSelectedFeeSchemeId(updated.defaultFeeSchemeId || "");
        setTimezone(updated.timezone || IST);
        setEditMode(true);
        setDetailsOpen(true);
        setConflictOpen(false);
        setOpen(false);
        toast.success("Client reactivated. Please review profile.");
      }
    } catch {
      toast.error("Failed to reactivate client.");
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
          cancelPendingSessions: cancelSessionsOnTerminate,
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clients</h1>
          <p className="text-slate-500">Manage your client roster.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone…"
              className="pl-9 w-[260px] bg-slate-50 border-slate-200"
            />
          </div>
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <ListFilter className="h-4 w-4 text-slate-400 ml-2" />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter((v ?? "all") as "all" | "active" | "terminated")}>
              <SelectTrigger className="w-[160px] border-0 h-8 bg-transparent shadow-none font-semibold focus:ring-0">
                <SelectValue>
                  {statusFilter === "active" ? "Active" :
                   statusFilter === "terminated" ? "Terminated" : "All"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all" label="All">All</SelectItem>
                <SelectItem value="active" label="Active">Active</SelectItem>
                <SelectItem value="terminated" label="Terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Client
              </Button>
            }
          />
          <DialogContent className="sm:max-w-2xl bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">Add New Client</DialogTitle>
            </DialogHeader>
            <form id="add-client-form" onSubmit={(e) => handleSubmit(e)} className="space-y-4 py-4">
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
                  value={defaultFeeSchemeId}
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
                    <SelectValue placeholder="Pick a fee scheme...">
                      {defaultFeeSchemeId && defaultFeeSchemeId !== "none" ? selectedFeeSchemeLabel : "Pick a fee scheme..."}
                    </SelectValue>
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
                <input type="hidden" name="defaultFeeSchemeId" value={defaultFeeSchemeId} />
                <input type="hidden" name="defaultFee" value={feeSchemes.find(f => f.id === defaultFeeSchemeId)?.amount || ""} />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={(v) => setTimezone(v || IST)}>
                  <SelectTrigger className="border-slate-200 bg-white h-10">
                    <SelectValue>
                      {TZ_OPTIONS.find(o => o.value === timezone)?.label ?? "India (IST)"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-2xl">
                    {TZ_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value} label={o.label}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="timezone" value={timezone} />
                <p className="text-[11px] text-slate-400">
                  All scheduling stays in IST. The client&apos;s local time is shown alongside in the sessions list.
                </p>
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
                <TableHead className="w-[120px]">ORS Trend</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">Loading clients...</TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No clients found.</TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium text-slate-900 flex items-center gap-2">
                          {client.name}
                          {!client.isActive && <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 uppercase text-[10px]">Terminated</Badge>}
                        </div>
                        <span className="text-xs text-slate-500">Since {formatIST(client.createdAt, "d MMM yyyy")}</span>
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
                        {(() => {
                          const scheme = feeSchemes.find(f => f.id === client.defaultFeeSchemeId);
                          if (scheme) {
                            return scheme.currency === 'USD' ? <DollarSign className="h-3 w-3" /> : <IndianRupee className="h-3 w-3" />;
                          }
                          return "";
                        })()}
                        {client.defaultFee || "0.00"}
                      </div>
                    </TableCell>
                    <TableCell className="w-[120px] py-2">
                      <ClientProgressChart clientId={client.id} clientName={client.name} compact />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-blue-600 hover:text-blue-700"
                          onClick={() => router.push(`/sessions?clientId=${client.id}&timeFilter=ytd`)}
                        >
                          <Calendar className="h-3.5 w-3.5" /> Sessions
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-violet-600 hover:text-violet-700"
                          onClick={() => router.push(`/clients/${client.id}`)}
                        >
                          <LineChart className="h-3.5 w-3.5" /> Charts
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedClient(client);
                            setEditMode(false);
                            setSelectedFeeSchemeId(client.defaultFeeSchemeId || "");
                            setTimezone(client.timezone || IST);
                            setDetailsOpen(true);
                          }}
                        >
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={(v) => { setDetailsOpen(v); setEditMode(false); }}>
        <DialogContent className="sm:max-w-4xl bg-white border-slate-200">
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
                    <Label>Default Fee Scheme (INR/USD)</Label>
                    <Select
                      value={defaultFeeSchemeId}
                      onValueChange={(id) => {
                        setSelectedFeeSchemeId(id || "");
                      }}
                    >
                      <SelectTrigger className="border-slate-200 bg-white h-10">
                        <SelectValue>
                          {defaultFeeSchemeId
                            ? (() => {
                                const f = feeSchemes.find(f => f.id === defaultFeeSchemeId);
                                return f ? `${f.name} (${f.currency === 'USD' ? '$' : '₹'}${f.amount})` : "Select a default fee scheme";
                              })()
                            : "Select a default fee scheme"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 shadow-2xl">
                        {feeSchemes.map(f => (
                          <SelectItem key={f.id} value={f.id} label={f.name}>
                            {f.name} ({f.currency === 'USD' ? '$' : '₹'}{f.amount})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="defaultFeeSchemeId" value={defaultFeeSchemeId} />
                    <input type="hidden" name="defaultFee" value={feeSchemes.find(f => f.id === defaultFeeSchemeId)?.amount || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={timezone} onValueChange={(v) => setTimezone(v || IST)}>
                      <SelectTrigger className="border-slate-200 bg-white h-10">
                        <SelectValue>
                          {TZ_OPTIONS.find(o => o.value === timezone)?.label ?? "India (IST)"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 shadow-2xl">
                        {TZ_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value} label={o.label}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="timezone" value={timezone} />
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
                      <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Default Fee</Label>
                      <p className="text-sm font-semibold text-slate-900">
                        {(() => {
                          const scheme = feeSchemes.find(f => f.id === selectedClient.defaultFeeSchemeId);
                          if (scheme) return scheme.currency === 'USD' ? '$' : '₹';
                          return ""; // Neutral display if no scheme
                        })()}
                        {selectedClient.defaultFee || "0"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Timezone</Label>
                      <p className="text-sm text-slate-600">
                        {TZ_OPTIONS.find(o => o.value === (selectedClient.timezone || IST))?.label ?? selectedClient.timezone}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Practice Summary</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-slate-50 border-slate-100 shadow-none">
                      <CardContent className="p-4">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Total Sessions</p>
                        <p className="text-xl font-bold text-slate-900">
                          {clientStats == null ? <span className="text-slate-400 text-base">…</span> : clientStats.total}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-slate-100 shadow-none">
                      <CardContent className="p-4">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Last Session</p>
                        <p className="text-xl font-bold text-slate-900">
                          {clientStats == null
                            ? <span className="text-slate-400 text-base">…</span>
                            : clientStats.lastDate
                              ? formatIST(clientStats.lastDate, "d MMM yy")
                              : <span className="text-slate-400 text-sm">None</span>}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-slate-100 shadow-none">
                      <CardContent className="p-4">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Total Billed</p>
                        <p className="text-xl font-bold text-slate-900">
                          {clientStats == null
                            ? <span className="text-slate-400 text-base">…</span>
                            : `${clientStats.currency === "USD" ? "$" : "₹"}${clientStats.billed.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* PTR-II manual assessment — only for terminated clients */}
                {!selectedClient.isActive && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Premature Termination Assessment (PTR-II)
                    </h4>
                    <p className="text-xs text-slate-500">
                      For clients whose initial ORS was above 25, mark whether this was a premature termination. Used in practice Reports.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={ptrSaving}
                        onClick={() => handleSetPTR(selectedClient.id, true)}
                        className={selectedClient.prematureTerminationManual === true
                          ? "bg-rose-100 border-rose-300 text-rose-700 font-bold"
                          : "text-slate-600 border-slate-200"}
                      >
                        Yes — Premature
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={ptrSaving}
                        onClick={() => handleSetPTR(selectedClient.id, false)}
                        className={selectedClient.prematureTerminationManual === false
                          ? "bg-emerald-100 border-emerald-300 text-emerald-700 font-bold"
                          : "text-slate-600 border-slate-200"}
                      >
                        No — Natural End
                      </Button>
                      {selectedClient.prematureTerminationManual !== null && selectedClient.prematureTerminationManual !== undefined && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={ptrSaving}
                          onClick={() => handleSetPTR(selectedClient.id, null)}
                          className="text-slate-400 text-xs"
                        >
                          Clear
                        </Button>
                      )}
                      {selectedClient.prematureTerminationManual == null && (
                        <span className="text-xs text-slate-400 italic">Not yet assessed</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3 flex-wrap">
                  {selectedClient.isActive && (
                    <Button variant="outline" onClick={() => setTerminateOpen(true)} className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 mr-auto">
                      <UserMinus className="h-4 w-4" /> Terminate Client
                    </Button>
                  )}
                   <Button variant="outline" onClick={() => {
                    setEditMode(true);
                    setSelectedFeeSchemeId(selectedClient.defaultFeeSchemeId || "");
                    const scheme = feeSchemes.find(f => f.id === selectedClient.defaultFeeSchemeId);
                    setSelectedFeeSchemeLabel(scheme ? `${scheme.name} (${scheme.currency === 'USD' ? '$' : '₹'}${scheme.amount})` : "Pick a fee scheme...");
                    setTimezone(selectedClient.timezone || IST);
                  }} className="gap-2 text-slate-600 border-slate-200">
                    <Pencil className="h-4 w-4" /> Edit Profile
                  </Button>
                   {selectedClient.isActive && (
                    <Button 
                      className="bg-primary text-primary-foreground"
                      onClick={() => router.push(`/sessions?clientId=${selectedClient.id}&openNew=true`)}
                    >
                      Schedule Session
                    </Button>
                  )}
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
                  <SelectValue>
                    {terminationType === "planned" ? "Planned (Graduation / Successful)" :
                     terminationType === "unplanned" ? "Unplanned (Dropout / Referred)" : "Select reason..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="planned" label="Planned (Graduation / Successful)">Planned (Graduation / Successful)</SelectItem>
                  <SelectItem value="unplanned" label="Unplanned (Dropout / Referred)">Unplanned (Dropout / Referred)</SelectItem>
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
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <input 
                type="checkbox" 
                id="cancel-sessions" 
                checked={!cancelSessionsOnTerminate} 
                onChange={(e) => setCancelSessionsOnTerminate(!e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label htmlFor="cancel-sessions" className="text-sm cursor-pointer font-medium">
                Invoice pending sessions? <span className="text-slate-400 font-normal block text-xs">If unchecked, all unbilled sessions will be marked as cancelled.</span>
              </Label>
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
      {/* Conflict Dialog */}
      <Dialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-orange-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Client Already Exists
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-600">
              A client with this email already exists: <span className="font-bold text-slate-900">{conflictClient?.name}</span>
              {conflictClient?.isActive === false && <span className="ml-2 text-rose-500 font-bold">(Terminated)</span>}
            </p>
            <p className="text-xs text-slate-400 italic">
              You can reactivate the existing client or create a new profile if this is a different person sharing the same email.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleRestart} className="bg-lime-500 hover:bg-lime-600 text-slate-950 font-bold">
                Restart / Reactivate Existing Client
              </Button>
              <Button variant="outline" onClick={() => { handleSubmit(null, true); setConflictOpen(false); }}>
                Create New Client Anyway
              </Button>
              <Button variant="ghost" onClick={() => setConflictOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

