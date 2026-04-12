"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, User, Mail, Phone, IndianRupee } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

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

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your pastoral practice clients here.</p>
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
                <Label htmlFor="defaultFee">Default Session Fee (INR)</Label>
                <Input id="defaultFee" name="defaultFee" type="number" placeholder="2000" />
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
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        {client.name}
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

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-950">
              <User className="h-5 w-5 text-primary" />
              Client Details: {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
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
              
              <div className="pt-4 flex justify-end gap-3">
                <Button variant="outline" className="text-slate-600 border-slate-200">Edit Profile</Button>
                <Button className="bg-primary text-primary-foreground">Schedule Session</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
