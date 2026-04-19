"use client";

import { useEffect, useState, useMemo } from "react";
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
  Loader2
} from "lucide-react";
import { format, isWithinInterval, startOfMonth, startOfHour, addHours, differenceInMinutes } from "date-fns";
import { ClinicalNoteEditor } from "@/components/clinical-note-editor";
import { cn } from "@/lib/utils";

export default function SessionsPage() {
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
  
  // Date/Time Form State
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState(format(startOfHour(new Date()), "HH:mm"));
  const [endTime, setEndTime] = useState(format(addHours(startOfHour(new Date()), 1), "HH:mm"));

  // Filters
  const [timeFilter, setTimeFilter] = useState<string>("ytd"); // Default to YTD
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchData = async () => {
    try {
      const [sessionsRes, clientsRes, feesRes] = await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/clients"),
        fetch("/api/fee-schemes"),
      ]);
      const [sessionsData, clientsData, feesData] = await Promise.all([
        sessionsRes.json(),
        clientsRes.json(),
        feesRes.json(),
      ]);
      setSessions(sessionsData);
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
  }, []);

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

    const payload = {
      clientId: selectedClientId,
      scheduledAt: `${startDate}T${startTime}:00`,
      endedAt: `${startDate}T${endTime}:00`,
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
    setStartDate(format(new Date(), "yyyy-MM-dd"));
    setStartTime(format(startOfHour(new Date()), "HH:mm"));
    setEndTime(format(addHours(startOfHour(new Date()), 1), "HH:mm"));
  };

  const getStatusBadge = (session: any) => {
    const { status, invoiceId, invoice } = session;
    
    if (status === "cancelled" || status === "no_show") return <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200">{status === "no_show" ? "No Show" : "Cancelled"}</Badge>;
    
    if (status === "scheduled") return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Scheduled</Badge>;
    
    // Billing aware statuses
    if (invoiceId) {
      const isPaid = invoice && parseFloat(invoice.amountPaid || "0") >= parseFloat(invoice.total || "0");
      if (isPaid) return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Received</Badge>;
      // We will show standard 'invoiced' badge
    }
    
    if (status === "completed") return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;

    
    return null;
  };

  function SessionRow({ session, onRefresh }: { session: any, onRefresh: () => void }) {
    const [noteOpen, setNoteOpen] = useState(false);
    const start = new Date(session.scheduledAt);
    const end = session.endedAt ? new Date(session.endedAt) : null;

    return (
      <TableRow className="hover:bg-slate-50/50 transition-colors">
        <TableCell className="font-medium text-slate-900">
          {format(start, "EEE, d MMM yyyy")}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-700">{session.client?.name}</span>
          </div>
        </TableCell>
        <TableCell className="text-slate-600 font-medium">
          {format(start, "h:mm a")}
        </TableCell>
        <TableCell className="text-slate-600 font-medium">
          {end ? format(end, "h:mm a") : "—"}
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 font-bold">
            {session.durationMin}m
          </Badge>
        </TableCell>
        <TableCell className="font-semibold text-slate-700">
          {session.feeScheme?.currency === 'USD' ? '$' : '₹'}{parseFloat(session.feeCharged || "0").toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </TableCell>
        <TableCell>
          {getStatusBadge(session)}
        </TableCell>
        <TableCell className="text-right">
          <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
            <DialogTrigger
              render={
                <Button variant="ghost" size="sm" className="gap-2 text-lime-600 hover:text-lime-700 font-bold">
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
                      {format(start, "d MMM yyyy")}
                    </span>
                  </DialogTitle>
                </DialogHeader>
              </div>
              <div className="p-8">
                <ClinicalNoteEditor 
                  sessionId={session.id} 
                  onSave={onRefresh} 
                  onClose={() => setNoteOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </TableCell>
      </TableRow>
    );
  }

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      // Client Filter
      if (clientFilter !== "all" && s.clientId !== clientFilter) return false;
      
      // Time Filter (Financial Year logic included)
      const now = new Date();
      const sessionDate = new Date(s.scheduledAt);
      
      if (timeFilter === "month") {
        const start = startOfMonth(now);
        if (sessionDate < start) return false;
      } else if (timeFilter === "ytd") {
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed, 3 is April
        const fyStart = new Date(currentMonth >= 3 ? currentYear : currentYear - 1, 3, 1);
        if (sessionDate < fyStart) return false;
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="ytd">YTD (Apr-Mar)</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom" disabled>Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client Filter */}
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <Filter className="h-4 w-4 text-slate-400 ml-2" />
            <Select value={clientFilter} onValueChange={(v) => setClientFilter(v || "all")}>
              <SelectTrigger className="w-[180px] border-0 h-8 bg-transparent shadow-none font-semibold focus:ring-0">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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
                      setSelectedClientName(clients.find(c => c.id === val)?.name || "");
                    }}
                  >
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-12">
                      <span className={selectedClientId ? "text-slate-900 font-semibold" : "text-slate-400"}>
                        {selectedClientName || "Pick a client..."}
                      </span>
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
                        <span className={selectedFeeSchemeLabel === "Pick a scheme..." ? "text-slate-400" : "text-slate-900"}>
                          {selectedFeeSchemeLabel}
                        </span>
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="custom">Custom / No Scheme</SelectItem>
                        {feeSchemes.map(f => (
                          <SelectItem key={f.id} value={f.id}>
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
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">Date</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">Client</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">Start</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">End</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">Duration</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">Fees</TableHead>
                <TableHead className="py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">Status</TableHead>
                <TableHead className="text-right py-4 font-bold text-slate-400 uppercase text-xs tracking-widest px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" />
                    <p className="mt-4 text-slate-400 font-medium">Loading session history...</p>
                  </TableCell>
                </TableRow>
              ) : filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20 text-slate-400">
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
