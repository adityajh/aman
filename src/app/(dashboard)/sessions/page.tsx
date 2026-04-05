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
import { Plus, Calendar as CalendarIcon, Clock, User, Video, MapPin, Phone, FileText } from "lucide-react";
import { format } from "date-fns";
import { SoapNoteEditor } from "@/components/soap-note-editor";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [feeSchemes, setFeeSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [clientFilter, setClientFilter] = useState<string>("all");

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
      case "scheduled": return <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-800 uppercase text-[10px]">Scheduled</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-800 uppercase text-[10px]">Completed</Badge>;
      case "cancelled": return <Badge variant="outline" className="bg-red-900/30 text-red-400 border-red-800 uppercase text-[10px]">Cancelled</Badge>;
      default: return <Badge variant="outline" className="uppercase text-[10px]">{status}</Badge>;
    }
  };

  const filteredSessions = clientFilter === "all" 
    ? sessions 
    : sessions.filter(s => s.clientId === clientFilter);

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case "video": return <Video className="h-3 w-3" />;
      case "in_person": return <MapPin className="h-3 w-3" />;
      case "phone": return <Phone className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sessions</h1>
          <p className="text-slate-500">Schedule and track clinical sessions.</p>
        </div>
        <div className="flex gap-4">
          <Select value={clientFilter} onValueChange={(v) => setClientFilter(v || "all")}>
            <SelectTrigger className="w-[200px] border-slate-200">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button className="gap-2 bg-lime-500 text-slate-950 hover:bg-lime-600 font-semibold shadow-sm">
                  <Plus className="h-4 w-4" /> New Session
                </Button>
              }
            />
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>New Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Client</Label>
                  <Select name="clientId" required>
                    <SelectTrigger className="border-slate-200 h-12 text-slate-900 hover:border-lime-500/50 transition-colors">
                      <SelectValue placeholder="Select a client..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-2xl">
                      {clients.map((c) => (
                        <SelectItem 
                          key={c.id} 
                          value={c.id} 
                          className="focus:bg-lime-100 focus:text-slate-950 cursor-pointer py-2 px-4 border-b border-slate-100 last:border-0"
                        >
                          <span className="font-semibold block text-slate-900">{c.name}</span>
                          {c.email && <span className="text-[10px] block text-slate-500">{c.email}</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt" className="text-slate-700">Date & Time</Label>
                    <Input id="scheduledAt" name="scheduledAt" type="datetime-local" className="border-slate-200" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="durationMin" className="text-slate-700">Duration (min)</Label>
                    <Input id="durationMin" name="durationMin" type="number" defaultValue="60" className="border-slate-200" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Modality</Label>
                    <Select name="modality" defaultValue="video">
                      <SelectTrigger className="border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="in_person">In Person</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Session Type</Label>
                    <Select name="sessionType" defaultValue="individual">
                      <SelectTrigger className="border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="couples">Couples</SelectItem>
                        <SelectItem value="group">Group</SelectItem>
                        <SelectItem value="intake">Intake</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Fee Scheme</Label>
                    <Select name="feeSchemeId">
                      <SelectTrigger className="border-slate-200 text-slate-900 hover:border-lime-500/50 transition-colors">
                        <SelectValue placeholder="Client Default" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 shadow-2xl">
                        {feeSchemes.map((s) => (
                          <SelectItem 
                            key={s.id} 
                            value={s.id}
                            className="focus:bg-lime-100 focus:text-slate-950 cursor-pointer py-2 px-4 border-b border-slate-100 last:border-0"
                          >
                            <span className="font-medium text-slate-900">{s.name}</span>
                            <span className="ml-2 text-xs text-slate-500 font-normal">₹{s.amount}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feeCharged" className="text-slate-700 font-medium">Override Fee (INR)</Label>
                    <Input id="feeCharged" name="feeCharged" type="number" className="border-slate-200" placeholder="Optional" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-lime-400 text-slate-950 hover:bg-lime-500 font-semibold h-12">Schedule</Button>
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
                  <TableRow key={session.id}>
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
                          {session.modality.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.invoiceId ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">Invoiced</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">Unbilled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(session.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger
                          render={
                            <Button variant="ghost" size="sm" className="gap-2 text-lime-400 hover:text-lime-500 hover:bg-lime-900/20">
                              {session.status === 'completed' ? 'View Note' : 'Write Note'}
                            </Button>
                          }
                        />
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-white">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-white">
                              <FileText className="h-5 w-5 text-lime-400" />
                              Clinical Note: {session.client?.name}
                              <span className="text-sm font-normal text-slate-400 ml-2">
                                {format(new Date(session.scheduledAt), "d MMM yyyy")}
                              </span>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="py-2">
                            <SoapNoteEditor 
                              sessionId={session.id} 
                              onSave={() => fetchData()} 
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
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
