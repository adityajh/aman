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
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [sessionsRes, clientsRes] = await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/clients"),
      ]);
      const [sessionsData, clientsData] = await Promise.all([
        sessionsRes.json(),
        clientsRes.json(),
      ]);
      setSessions(sessionsData);
      setClients(clientsData);
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
      case "scheduled": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px]">Scheduled</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-[10px]">Completed</Badge>;
      case "cancelled": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase text-[10px]">Cancelled</Badge>;
      default: return <Badge variant="outline" className="uppercase text-[10px]">{status}</Badge>;
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">Schedule and track clinical sessions.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Schedule Session
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Session</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select name="clientId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Date & Time</Label>
                  <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationMin">Duration (min)</Label>
                  <Input id="durationMin" name="durationMin" type="number" defaultValue="60" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Modality</Label>
                  <Select name="modality" defaultValue="video">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select name="sessionType" defaultValue="individual">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="couples">Couples</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="intake">Intake</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeCharged">Fee for Session (INR)</Label>
                <Input id="feeCharged" name="feeCharged" type="number" placeholder="Leave empty for client default" />
              </div>
              <Button type="submit" className="w-full">Schedule</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">Loading sessions...</TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No sessions scheduled.</TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{format(new Date(session.scheduledAt), "EEE, d MMM")}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(session.scheduledAt), "h:mm a")} ({session.durationMin}m)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{session.client?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs capitalize flex items-center gap-1 text-slate-600">
                          {getModalityIcon(session.modality)}
                          {session.modality.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(session.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger
                          render={
                            <Button variant="ghost" size="sm" className="gap-2">
                              {session.status === 'completed' ? 'View Note' : 'Write Note'}
                            </Button>
                          }
                        />
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              Clinical Note: {session.client?.name}
                              <span className="text-sm font-normal text-muted-foreground ml-2">
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
