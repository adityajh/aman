"use client";

import { useEffect, useState } from "react";
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
  Mail, 
  FileText, 
  User, 
  IndianRupee, 
  DollarSign, 
  Send, 
  Trash2, 
  Download, 
  Eye, 
  Search, 
  ExternalLink, 
  Calendar as CalendarIcon, 
  Check, 
  Clock, 
  AlertCircle,
  Loader2, 
  CheckCircle2 
} from "lucide-react";
import { format } from "date-fns";
import { ClinicalNoteEditor } from "@/components/clinical-note-editor";
import { cn } from "@/lib/utils";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [feeSchemes, setFeeSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedClientName, setSelectedClientName] = useState<string>("");
  const [selectedFeeSchemeId, setSelectedFeeSchemeId] = useState<string>("");
  const [selectedFeeSchemeLabel, setSelectedFeeSchemeLabel] = useState<string>("Pick a scheme...");
  const [feeCharged, setFeeCharged] = useState<string>("");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [clientFilterName, setClientFilterName] = useState<string>("All Clients");
  const [filterCompleted, setFilterCompleted] = useState(true);
  const [filterScheduled, setFilterScheduled] = useState(true);
  const [filterInvoiced, setFilterInvoiced] = useState(true);
  const [filterUninvoiced, setFilterUninvoiced] = useState(true);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Session scheduled");
        setOpen(false);
        fetchData();
      } else {
        toast.error("Failed to schedule session");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case "completed": return <Badge variant="outline" className="bg-lime-50 text-lime-700 border-lime-200">Completed</Badge>;
      case "no_show": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">No Show</Badge>;
      case "cancelled": return <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">Cancelled</Badge>;
      default: return null;
    }
  };

  function SessionRow({ session, onRefresh }: { session: any, onRefresh: () => void }) {
    const [noteOpen, setNoteOpen] = useState(false);

    return (
      <TableRow className="hover:bg-slate-50/50 transition-colors">
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{format(new Date(session.scheduledAt), "EEE, d MMM")}</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(session.scheduledAt), "h:mm a")} ({session.durationMin}m)
            </span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2 text-slate-700">
            <User className="h-3 w-3 text-slate-400" />
            <span className="text-sm font-medium">{session.client?.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {session.modality.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          </div>
        </TableCell>
        <TableCell>
          {session.invoiceId ? (
            <Badge variant="outline" className="bg-blue-100 text-blue-900 border-blue-200 font-bold uppercase text-[10px] tracking-wider">Invoiced</Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-200 font-bold uppercase text-[10px] tracking-wider">Unbilled</Badge>
          )}
        </TableCell>
        <TableCell>
          {getStatusBadge(session.status)}
        </TableCell>
        <TableCell className="text-right">
          <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
            <DialogTrigger
              render={
                <Button variant="ghost" size="sm" className="gap-2 text-lime-600 hover:text-lime-700 hover:bg-lime-50 font-bold">
                  {session.status === 'completed' ? 'View Note' : 'Write Note'}
                </Button>
              }
            />
            <DialogContent className="max-w-[95vw] lg:max-w-4xl max-h-[95vh] overflow-y-auto bg-white border-slate-200 text-slate-900 p-0 shadow-2xl">
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md p-6 border-b border-slate-100 shadow-sm">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-slate-900 text-xl font-bold">
                    <FileText className="h-6 w-6 text-lime-500" />
                    Clinical Note: {session.client?.name}
                    <span className="text-sm font-normal text-slate-400 ml-2">
                      {format(new Date(session.scheduledAt), "d MMM yyyy")}
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

  const filteredSessions = sessions.filter(s => {
    // Client Match
    if (clientFilter !== "all" && s.clientId !== clientFilter) return false;
    
    // Status Match
    if (!filterCompleted && s.status === "completed") return false;
    if (!filterScheduled && s.status === "scheduled") return false;
    
    // Billing Match
    if (!filterInvoiced && s.invoiceId) return false;
    if (!filterUninvoiced && !s.invoiceId) return false;

    return true;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sessions</h1>
          <p className="text-slate-500">Schedule and track clinical sessions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={clientFilter} 
            onValueChange={(v) => {
              const val = v || "all";
              setClientFilter(val);
              if (val === "all") {
                setClientFilterName("All Clients");
              } else {
                setClientFilterName(clients.find(c => c.id === val)?.name || val);
              }
            }}
          >
            <SelectTrigger className="w-[180px] border-slate-200 text-slate-900 font-medium h-10 shadow-sm bg-white">
              <span>{clientFilterName}</span>
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all" label="All Clients">All Clients</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id} label={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="h-6 w-px bg-slate-200 mx-1" />

          <div className="flex bg-slate-100/80 p-1 rounded-lg gap-1 border border-slate-200 shadow-sm">
            <button 
              onClick={() => setFilterScheduled(!filterScheduled)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all",
                filterScheduled ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Scheduled
            </button>
            <button 
              onClick={() => setFilterCompleted(!filterCompleted)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all",
                filterCompleted ? "bg-white text-lime-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Completed
            </button>
            <div className="w-px h-4 bg-slate-200 self-center" />
            <button 
              onClick={() => setFilterInvoiced(!filterInvoiced)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all",
                filterInvoiced ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Invoiced
            </button>
            <button 
              onClick={() => setFilterUninvoiced(!filterUninvoiced)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all",
                filterUninvoiced ? "bg-white text-amber-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Unbilled
            </button>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md">
                  <Plus className="h-4 w-4" /> New Session
                </Button>
              }
            />
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Schedule New Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client</Label>
                  <Select 
                    value={selectedClientId} 
                    onValueChange={(id) => {
                      const val = id || "";
                      setSelectedClientId(val);
                      setSelectedClientName(clients.find(c => c.id === val)?.name || "");
                    }}
                  >
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Pick a client..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 max-h-[300px] overflow-y-auto shadow-2xl">
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex flex-col items-start gap-1 py-1">
                            <span className="font-bold text-slate-900">{c.name}</span>
                            {c.email && (
                              <span className="text-[10px] text-slate-400 font-medium tracking-tight bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                {c.email.toLowerCase()}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date & Time</Label>
                    <Input id="date" name="date" type="datetime-local" defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")} className="bg-slate-50 border-slate-200" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input id="duration" name="duration" type="number" defaultValue="60" className="bg-slate-50 border-slate-200" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modality">Modality</Label>
                    <Select name="modality" defaultValue="video">
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="in_person">In Person</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionType">Session Type</Label>
                    <Select name="sessionType" defaultValue="individual">
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="couples">Couples</SelectItem>
                        <SelectItem value="group">Group / Family</SelectItem>
                        <SelectItem value="intake">Intake</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feeSchemeId">Fee Scheme</Label>
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
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-10 shadow-sm">
                      <span className={selectedFeeSchemeLabel === "Pick a scheme..." ? "text-slate-400" : "text-slate-900"}>
                        {selectedFeeSchemeLabel}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-2xl">
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
                  <Label htmlFor="feeCharged">Override Fee (Amount)</Label>
                  <Input 
                    id="feeCharged" 
                    name="feeCharged" 
                    type="number" 
                    placeholder="Optional"
                    value={feeCharged}
                    onChange={(e) => {
                      setFeeCharged(e.target.value);
                      setSelectedFeeSchemeId("custom");
                      setSelectedFeeSchemeLabel("Custom / No Scheme");
                    }}
                    className="bg-slate-50 border-slate-200 h-10"
                  />
                </div>

                <Button type="submit" className="w-full bg-lime-400 text-slate-950 hover:bg-lime-500 font-bold h-12 shadow-sm transition-all active:scale-[0.98]">
                  Schedule Session
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Date & Time</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Modality</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">Loading sessions...</TableCell>
                </TableRow>
              ) : filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No sessions match your filter.</TableCell>
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
