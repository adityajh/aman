"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Plus, 
  FileText, 
  User, 
  IndianRupee, 
  DollarSign, 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle2,
  CalendarDays,
  Filter,
  Loader2,
  XCircle,
  Trash2
} from "lucide-react";
import { startOfHour, addHours, differenceInMinutes } from "date-fns";
import { ClinicalNoteEditor } from "@/components/clinical-note-editor";
import { cn } from "@/lib/utils";
import { formatIST, formatTz, IST, tzShortLabel, istToUTC, istStartOfMonthUTC, istStartOfFYUTC } from "@/lib/tz";

function SessionsPageInner() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [feeSchemes, setFeeSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  // Selection / Form State
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedClientName, setSelectedClientName] = useState<string>("");
  const [selectedFeeSchemeId, setSelectedFeeSchemeId] = useState<string>("");
  const [selectedFeeSchemeLabel, setSelectedFeeSchemeLabel] = useState<string>("Pick a scheme...");
  const [feeCharged, setFeeCharged] = useState<string>("");
  
  // Date/Time Form State — defaults expressed as IST wall-clock so the form is
  // stable across browser timezones.
  const [startDate, setStartDate] = useState(formatIST(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState(formatIST(startOfHour(new Date()), "HH:mm"));
  const [endTime, setEndTime] = useState(formatIST(addHours(startOfHour(new Date()), 1), "HH:mm"));

  // Filters — initialised from URL params if present
  const searchParams = useSearchParams();
  const [timeFilter, setTimeFilter] = useState<string>(searchParams.get("timeFilter") ?? "ytd");
  const [clientFilter, setClientFilter] = useState<string>(searchParams.get("clientId") ?? "active");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchData = async () => {
    try {
      const [sessionsRes, clientsRes, feesRes] = await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/clients"),
        fetch("/api/fee-schemes"),
      ]);
      const [sessionsPayload, clientsData, feesData] = await Promise.all([
        sessionsRes.json(),
        clientsRes.json(),
        feesRes.json(),
      ]);
      // New API wraps sessions in { sessions, orsCutoff, srsCutoff }
      setSessions(Array.isArray(sessionsPayload) ? sessionsPayload : (sessionsPayload.sessions ?? []));
      setClients(clientsData);
      setFeeSchemes(feesData);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Handle deep-linking to "New Session" dialog
    if (searchParams.get("openNew") === "true") {
      setOpen(true);
      const cid = searchParams.get("clientId");
      if (cid) setSelectedClientId(cid);
    }
  }, []);

  // Auto-fill client name and fee scheme when selectedClientId changes (e.g. from deep-link or manual selection)
  useEffect(() => {
    if (selectedClientId && clients.length > 0 && !selectedClientName) {
      const c = clients.find(cl => cl.id === selectedClientId);
      if (c) {
        setSelectedClientName(c.name);
        // Only auto-populate fee if none selected yet
        if (!selectedFeeSchemeId && c.defaultFeeSchemeId && feeSchemes.length > 0) {
          const scheme = feeSchemes.find(f => f.id === c.defaultFeeSchemeId);
          if (scheme) {
            setSelectedFeeSchemeId(scheme.id);
            setFeeCharged(scheme.amount);
            setSelectedFeeSchemeLabel(`${scheme.name} (${scheme.currency === 'USD' ? '$' : '₹'}${scheme.amount})`);
          }
        }
      }
    }
  }, [selectedClientId, clients, feeSchemes, selectedClientName, selectedFeeSchemeId]);

  // Duration Logic
  const calculatedDuration = useMemo(() => {
    try {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${startDate}T${endTime}`);
      if (end <= start) return 0;
      const diff = differenceInMinutes(end, start);
      // Round to nearest 15, min 15
      return Math.max(15, Math.round(diff / 15) * 15);
    } catch {
      return 0;
    }
  }, [startDate, startTime, endTime]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedClientId) {
      toast.error("Please select a client.");
      return;
    }

    // Form times are entered as IST wall-clock — convert to absolute UTC
    // instants so the server stores the correct moment regardless of where it
    // runs.
    const payload = {
      clientId: selectedClientId,
      scheduledAt: istToUTC(startDate, startTime).toISOString(),
      endedAt: istToUTC(startDate, endTime).toISOString(),
      sessionType: "individual", // Default or add back to form if needed
      modality: "video", // Default or add back to form if needed
      feeSchemeId: selectedFeeSchemeId && selectedFeeSchemeId !== "custom" ? selectedFeeSchemeId : undefined,
      feeCharged: feeCharged || undefined,
    };

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Session scheduled");
        setOpen(false);
        resetForm();
        fetchData();
      } else {
        const errText = await res.text();
        toast.error(`Failed to schedule session: ${errText}`);
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const resetForm = () => {
    setSelectedClientId("");
    setSelectedClientName("");
    setSelectedFeeSchemeId("");
    setSelectedFeeSchemeLabel("Pick a scheme...");
    setFeeCharged("");
    setStartDate(formatIST(new Date(), "yyyy-MM-dd"));
    setStartTime(formatIST(startOfHour(new Date()), "HH:mm"));
    setEndTime(formatIST(addHours(startOfHour(new Date()), 1), "HH:mm"));
  };

  const getStatusBadge = (session: any) => {
    const { status, invoiceId, invoice } = session;
    
    if (status === "cancelled" || status === "no_show") return <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200">{status === "no_show" ? "No Show" : "Cancelled"}</Badge>;
    
    if (status === "scheduled") return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Scheduled</Badge>;
    
    // Billing aware statuses
    if (invoiceId) {
      const isPaid = invoice && parseFloat(invoice.amountPaid || "0") >= parseFloat(invoice.total || "0");
      if (isPaid) return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Received</Badge>;
      return <Badge variant="outline" className="bg-slate-800 text-slate-100 border-slate-700">Invoiced</Badge>;
    }
    
    if (status === "completed") return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;

    
    return null;
  };

  function SessionRow({ session, onRefresh }: { session: any, onRefresh: () => void }) {
    const [noteOpen, setNoteOpen] = useState(false);
    const start = new Date(session.scheduledAt);
    const end = session.endedAt ? new Date(session.endedAt) : null;
    const actualStart = session.actualStartTime ? new Date(session.actualStartTime) : null;
    const actualEnd = session.actualEndTime ? new Date(session.actualEndTime) : null;
    const [cancelling, setCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelOpen, setCancelOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleCancel = async () => {
      setCancelling(true);
      try {
        const res = await fetch(`/api/sessions/${session.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "cancelled", cancellationReason: cancelReason }),
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          toast.success("Session cancelled");
          setCancelOpen(false);
          onRefresh();
        } else {
          toast.error("Failed to cancel session");
        }
      } catch (err) {
        toast.error("Error cancelling session");
      } finally {
        setCancelling(false);
      }
    };

    const handleDelete = async () => {
      setDeleting(true);
      try {
        const res = await fetch(`/api/sessions/${session.id}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("Session deleted");
          setDeleteOpen(false);
          onRefresh();
        } else {
          const msg = await res.text();
          toast.error(msg || "Failed to delete session");
        }
      } catch (err) {
        toast.error("Error deleting session");
      } finally {
        setDeleting(false);
      }
    };

    const clientTz = session.client?.timezone || IST;
    const showClientTz = clientTz && clientTz !== IST;
    const clientTzLabel = tzShortLabel(clientTz);

    return (
      <TableRow className="hover:bg-slate-50/50 transition-colors">
        <TableCell className="font-medium text-slate-900">
          {formatIST(start, "EEE, d MMM yyyy")}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-700">
              {session.client?.name}
              {!session.client?.isActive && <Badge variant="outline" className="ml-2 text-[8px] bg-rose-50 text-rose-500 border-rose-100">Terminated</Badge>}
            </span>
          </div>
        </TableCell>
        <TableCell className="text-slate-600 font-medium">
          <div className="flex flex-col">
            <span>{formatIST(start, "h:mm a")} <span className="text-[9px] text-slate-400 font-bold">IST</span></span>
            {showClientTz && (
              <span className="text-[10px] text-slate-400">{formatTz(start, clientTz, "h:mm a")} {clientTzLabel}</span>
            )}
          </div>
        </TableCell>
        <TableCell className="text-slate-600 font-medium">
          {end ? (
            <div className="flex flex-col">
              <span>{formatIST(end, "h:mm a")} <span className="text-[9px] text-slate-400 font-bold">IST</span></span>
              {showClientTz && (
                <span className="text-[10px] text-slate-400">{formatTz(end, clientTz, "h:mm a")} {clientTzLabel}</span>
              )}
            </div>
          ) : "—"}
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 font-bold">
            {session.durationMin}m
          </Badge>
        </TableCell>
        <TableCell className="text-slate-600 font-medium">
          {actualStart && actualEnd ? (
            <div className="flex flex-col">
              <span className="font-bold text-slate-700">{Math.round((actualEnd.getTime() - actualStart.getTime()) / 60000)}m</span>
              <span className="text-[10px] text-slate-400">{formatIST(actualStart, "h:mm a")} - {formatIST(actualEnd, "h:mm a")} IST</span>
              {showClientTz && (
                <span className="text-[10px] text-slate-400">{formatTz(actualStart, clientTz, "h:mm a")} - {formatTz(actualEnd, clientTz, "h:mm a")} {clientTzLabel}</span>
              )}
            </div>
          ) : "—"}
        </TableCell>
        <TableCell className="text-slate-600 font-medium">
          {session.invoicedDurationMin ? <span className="font-bold text-slate-700">{session.invoicedDurationMin}m</span> : "—"}
        </TableCell>
        <TableCell className="font-semibold text-slate-700">
          {(() => {
            let cur = session.feeScheme?.currency;
            if (!cur && session.client?.defaultFeeSchemeId) {
              const fallbackScheme = feeSchemes.find(f => f.id === session.client.defaultFeeSchemeId);
              if (fallbackScheme) cur = fallbackScheme.currency;
            }
            return cur === 'USD' ? '$' : '₹';
          })()}{parseFloat(session.feeCharged || "0").toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </TableCell>
        <TableCell>
          {getStatusBadge(session)}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            {session.status === "scheduled" && (
              <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogTrigger
                  render={
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 gap-1"
                    >
                      <XCircle className="h-4 w-4" /> Cancel
                    </Button>
                  }
                />
                <DialogContent className="bg-white border-slate-200 max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-rose-600">Cancel Session</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-slate-600">Are you sure you want to cancel this session for <strong>{session.client?.name}</strong>?</p>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-400">Cancellation Reason (Optional)</Label>
                      <Input 
                        placeholder="e.g. Client requested, Emergency..." 
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="bg-slate-50"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button variant="outline" onClick={() => setCancelOpen(false)}>Back</Button>
                      <Button 
                        onClick={handleCancel} 
                        disabled={cancelling}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold"
                      >
                        {cancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Cancel Session
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            {!session.invoiceId && (
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
                <DialogContent className="bg-white border-slate-200 max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-rose-600">Delete Session</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-slate-600">
                      Permanently delete this session for <strong>{session.client?.name}</strong>?
                      {session.status === 'completed' && (
                        <span className="block mt-2 text-rose-600 font-medium">
                          This will also remove the clinical note attached to this session.
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">This cannot be undone.</p>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button variant="outline" onClick={() => setDeleteOpen(false)}>Back</Button>
                      <Button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold gap-2"
                      >
                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Delete
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
              <DialogTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-lime-600 hover:text-lime-700 font-bold"
                  >
                    {session.status === 'completed' ? 'View Note' : 'Write Note'}
                  </Button>
                }
              />
              <DialogContent className="max-w-[95vw] lg:max-w-4xl max-h-[95vh] overflow-y-auto bg-white p-0 shadow-2xl">
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md p-6 border-b border-slate-100 shadow-sm">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-900 text-xl font-bold">
                      <FileText className="h-6 w-6 text-lime-500" />
                      Clinical Note: {session.client?.name}
                      <span className="text-sm font-normal text-slate-400 ml-2">
                        {formatIST(start, "d MMM yyyy")}
                      </span>
                    </DialogTitle>
                  </DialogHeader>
                </div>
                <div className="p-8">
                  <ClinicalNoteEditor 
                    session={session} 
                    onSave={onRefresh} 
                    onClose={() => setNoteOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      // Client Filter
      if (clientFilter === "active") {
        if (!s.client?.isActive) return false;
      } else if (clientFilter !== "all" && s.clientId !== clientFilter) {
        return false;
      }
      
      // Time Filter — anchored to IST so the boundary is the same regardless
      // of where the browser thinks "now" is.
      const sessionDate = new Date(s.scheduledAt);

      if (timeFilter === "month") {
        if (sessionDate < istStartOfMonthUTC()) return false;
      } else if (timeFilter === "ytd") {
        if (sessionDate < istStartOfFYUTC()) return false;
      }
      
      // Status Filter logic
      if (statusFilter !== "all") {
        if (statusFilter === "exceptions") {
          if (s.status !== "cancelled" && s.status !== "no_show") return false;
        } else if (statusFilter === "scheduled") {
          if (s.status !== "scheduled") return false;
        } else if (statusFilter === "completed") {
          if (s.status !== "completed" || s.invoiceId) return false;
        } else if (statusFilter === "invoiced") {
          if (s.status !== "completed" || !s.invoiceId) return false;
          // check if NOT fully paid
          const isPaid = s.invoice && parseFloat(s.invoice.amountPaid || "0") >= parseFloat(s.invoice.total || "0");
          if (isPaid) return false;
        } else if (statusFilter === "received") {
          if (s.status !== "completed" || !s.invoiceId) return false;
          const isPaid = s.invoice && parseFloat(s.invoice.amountPaid || "0") >= parseFloat(s.invoice.total || "0");
          if (!isPaid) return false;
        }
      }
      
      return true;
    });
  }, [sessions, clientFilter, timeFilter, statusFilter]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sessions</h1>
          <p className="text-slate-500">Log and track professional therapy consultations.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Filter */}
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <CalendarDays className="h-4 w-4 text-slate-400 ml-2" />
            <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v || "ytd")}>
              <SelectTrigger className="w-[180px] border-0 h-8 bg-transparent shadow-none font-semibold focus:ring-0">
                <SelectValue>
                  {timeFilter === "all" ? "All Time" : 
                   timeFilter === "ytd" ? "YTD (Apr-Mar)" : 
                   timeFilter === "month" ? "This Month" : "All Time"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all" label="All Time">All Time</SelectItem>
                <SelectItem value="ytd" label="YTD (Apr-Mar)">YTD (Apr-Mar)</SelectItem>
                <SelectItem value="month" label="This Month">This Month</SelectItem>
                <SelectItem value="custom" disabled label="Custom Range">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client Filter */}
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <Filter className="h-4 w-4 text-slate-400 ml-2" />
            <Select value={clientFilter} onValueChange={(v) => setClientFilter(v || "active")}>
              <SelectTrigger className="w-[180px] border-0 h-8 bg-transparent shadow-none font-semibold focus:ring-0">
                <SelectValue>
                  {clientFilter === "active" ? "Active Clients" : 
                   clientFilter === "all" ? "All Clients" :
                   clients.find(c => c.id === clientFilter)?.name || "Active Clients"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="active" label="Active Clients">Active Clients</SelectItem>
                <SelectItem value="all" label="All Clients">All Clients</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id} label={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger
              render={
                <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-md h-10 px-6 font-bold">
                  <Plus className="h-4 w-4" /> New Session
                </Button>
              }
            />
            <DialogContent className="sm:max-w-xl bg-white border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">Schedule New Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-bold">Client</Label>
                  <Select 
                    value={selectedClientId} 
                    onValueChange={(id) => {
                      const val = id || "";
                      setSelectedClientId(val);
                      const c = clients.find(cl => cl.id === val);
                      setSelectedClientName(c?.name || "");
                      
                      // Auto-populate default fee scheme
                      if (c?.defaultFeeSchemeId) {
                        const scheme = feeSchemes.find(f => f.id === c.defaultFeeSchemeId);
                        if (scheme) {
                          setSelectedFeeSchemeId(scheme.id);
                          setFeeCharged(scheme.amount);
                          setSelectedFeeSchemeLabel(`${scheme.name} (${scheme.currency === 'USD' ? '$' : '₹'}${scheme.amount})`);
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-12">
                      <SelectValue>
                        {selectedClientId ? (clients.find(c => c.id === selectedClientId)?.name || "Pick a client...") : "Pick a client..."}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 max-h-[300px] overflow-y-auto shadow-2xl">
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.id} label={c.name}>
                          <div className="flex flex-col items-start gap-1 py-1">
                            <span className="font-bold text-slate-900">{c.name}</span>
                            {c.email && <span className="text-[10px] text-slate-400 uppercase tracking-wider">{c.email}</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-bold">Session Date</Label>
                      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="h-10 bg-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-bold">Start Time</Label>
                      <Input type="time" value={startTime} onChange={(e) => {
                        setStartTime(e.target.value);
                        if (e.target.value) {
                          const [h, m] = e.target.value.split(':');
                          const d = new Date();
                          d.setHours(parseInt(h) + 1, parseInt(m));
                          setEndTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
                        }
                      }} required className="h-10 bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-bold">Finish Time</Label>
                      <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="h-10 bg-white" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-2 py-1 bg-white rounded-lg border border-slate-200 shadow-inner">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Duration</span>
                    <span className="text-lg font-black text-lime-600">{calculatedDuration} mins <span className="text-[10px] font-normal text-slate-400">(Rounded)</span></span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-bold">Fee Scheme</Label>
                    <Select 
                      value={selectedFeeSchemeId} 
                      onValueChange={(id) => {
                        const sid = id || "custom";
                        setSelectedFeeSchemeId(sid);
                        const scheme = feeSchemes.find(f => f.id === sid);
                        if (scheme) {
                          setFeeCharged(scheme.amount);
                          setSelectedFeeSchemeLabel(`${scheme.name} (${scheme.currency === 'USD' ? '$' : '₹'}${scheme.amount})`);
                        } else {
                          setSelectedFeeSchemeLabel("Custom / No Scheme");
                        }
                      }}
                    >
                      <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-10">
                        <SelectValue>
                          {selectedFeeSchemeId === "custom" ? "Custom / No Scheme" : 
                           selectedFeeSchemeId ? (
                             (() => {
                               const f = feeSchemes.find(f => f.id === selectedFeeSchemeId);
                               return f ? `${f.name} (${f.currency === 'USD' ? '$' : '₹'}${f.amount})` : "Pick a scheme...";
                             })()
                           ) : "Pick a scheme..."}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="custom" label="Custom / No Scheme">Custom / No Scheme</SelectItem>
                        {feeSchemes.map(f => (
                          <SelectItem 
                            key={f.id} 
                            value={f.id} 
                            label={`${f.name} (${f.currency === 'USD' ? '$' : '₹'}${f.amount})`}
                          >
                            {f.name} ({f.currency === 'USD' ? '$' : '₹'}{f.amount})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-bold text-right w-full block">Override Fee</Label>
                    <Input 
                      type="number" 
                      placeholder="Optional"
                      value={feeCharged}
                      onChange={(e) => {
                        setFeeCharged(e.target.value);
                        setSelectedFeeSchemeId("custom");
                        setSelectedFeeSchemeLabel("Custom / No Scheme");
                      }}
                      className="bg-slate-50 border-slate-200 h-10 text-right font-bold"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-lime-400 text-slate-950 hover:bg-lime-500 font-bold h-14 text-lg shadow-lg active:scale-95 transition-all">
                  Schedule Session
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")} className={statusFilter === "all" ? "bg-slate-800" : "text-slate-600"}>All Statuses</Button>
        <Button size="sm" variant={statusFilter === "scheduled" ? "default" : "outline"} onClick={() => setStatusFilter("scheduled")} className={statusFilter === "scheduled" ? "bg-yellow-600 hover:bg-yellow-700" : "text-slate-600"}>Scheduled</Button>
        <Button size="sm" variant={statusFilter === "completed" ? "default" : "outline"} onClick={() => setStatusFilter("completed")} className={statusFilter === "completed" ? "bg-blue-600 hover:bg-blue-700" : "text-slate-600"}>Completed</Button>
        <Button size="sm" variant={statusFilter === "invoiced" ? "default" : "outline"} onClick={() => setStatusFilter("invoiced")} className={statusFilter === "invoiced" ? "bg-slate-800 hover:bg-slate-900" : "text-slate-600"}>Invoiced</Button>
        <Button size="sm" variant={statusFilter === "received" ? "default" : "outline"} onClick={() => setStatusFilter("received")} className={statusFilter === "received" ? "bg-green-600 hover:bg-green-700" : "text-slate-600"}>Received</Button>
        <Button size="sm" variant={statusFilter === "exceptions" ? "default" : "outline"} onClick={() => setStatusFilter("exceptions")} className={statusFilter === "exceptions" ? "bg-slate-500 hover:bg-slate-600" : "text-slate-600"}>Cancelled / No Show</Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 items-center">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest w-32">Date</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest w-48">Client</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest w-20">Start</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest w-20">End</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest w-20">Sch.</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest w-20">Act.</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest w-20">Inv.</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest w-28">Fees</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest w-28">Status</TableHead>
                <TableHead className="text-right py-4 font-bold text-slate-400 uppercase text-xs tracking-widest px-6 w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" />
                    <p className="mt-4 text-slate-400 font-medium">Loading session history...</p>
                  </TableCell>
                </TableRow>
              ) : filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-20 text-slate-400">
                    No sessions found matching your current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
                  <SessionRow 
                    key={session.id} 
                    session={session} 
                    onRefresh={fetchData} 
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading sessions...</div>}>
      <SessionsPageInner />
    </Suspense>
  );
}
