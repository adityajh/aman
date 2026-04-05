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
          <h1 className="text-3xl font-bold tracking-tight text-white">Sessions</h1>
          <p className="text-slate-400">Schedule and track clinical sessions.</p>
        </div>
        <div className="flex gap-4">
          <Select value={clientFilter} onValueChange={(v) => setClientFilter(v || "all")}>
            <SelectTrigger className="w-[200px] bg-slate-900 border-slate-800 text-white">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800">
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button className="gap-2 bg-lime-400 text-slate-950 hover:bg-lime-500 font-semibold">
                  <Plus className="h-4 w-4" /> Schedule Session
                </Button>
              }
            />
            <DialogContent className="max-w-xl bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl">New Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Client</Label>
                  <Select name="clientId" required>
                    <SelectTrigger className="bg-slate-950 border-slate-800 h-12">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800">
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt" className="text-slate-300">Date & Time</Label>
                    <Input id="scheduledAt" name="scheduledAt" type="datetime-local" className="bg-slate-950 border-slate-800" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="durationMin" className="text-slate-300">Duration (min)</Label>
                    <Input id="durationMin" name="durationMin" type="number" defaultValue="60" className="bg-slate-950 border-slate-800" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Modality</Label>
                    <Select name="modality" defaultValue="video">
                      <SelectTrigger className="bg-slate-950 border-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-white">
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="in_person">In Person</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Session Type</Label>
                    <Select name="sessionType" defaultValue="individual">
                      <SelectTrigger className="bg-slate-950 border-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-white">
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
                    <Label className="text-slate-300">Fee Scheme</Label>
                    <Select name="feeSchemeId">
                      <SelectTrigger className="bg-slate-950 border-slate-800">
                        <SelectValue placeholder="Client Default" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-white">
                        {feeSchemes.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name} (₹{s.amount})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feeCharged" className="text-slate-300">Override Fee (INR)</Label>
                    <Input id="feeCharged" name="feeCharged" type="number" className="bg-slate-950 border-slate-800" placeholder="Optional" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-lime-400 text-slate-950 hover:bg-lime-500 font-semibold h-12">Schedule</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800 hover:bg-slate-950">
                <TableHead className="text-slate-300">Date & Time</TableHead>
                <TableHead className="text-slate-300">Client</TableHead>
                <TableHead className="text-slate-300">Modality</TableHead>
                <TableHead className="text-slate-300">Billing</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-right text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400 border-slate-800">Loading sessions...</TableCell>
                </TableRow>
              ) : filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground border-slate-800">No sessions match your filter.</TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
                  <TableRow key={session.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{format(new Date(session.scheduledAt), "EEE, d MMM")}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(session.scheduledAt), "h:mm a")} ({session.durationMin}m)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-slate-500" />
                        <span className="text-sm text-slate-300">{session.client?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase flex items-center gap-1 text-slate-500">
                          {getModalityIcon(session.modality)}
                          {session.modality.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.invoiceId ? (
                        <Badge variant="outline" className="bg-lime-900/40 text-lime-400 border-lime-800 uppercase text-[10px]">
                          Invoiced
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700 uppercase text-[10px]">
                          Unbilled
                        </Badge>
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
