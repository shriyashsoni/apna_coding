import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Award, ShieldCheck, Download, Search, Check, X, QrCode, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function HostDashboard() {
  const { user, isAuthenticated, signIn } = useAuth();
  const address = user?.wallet_address;

  const [hostedEvents, setHostedEvents] = useState<any[]>([]);
  const [hostedHackathons, setHostedHackathons] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: "event" | "hackathon"; title: string } | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isLoadingRegs, setIsLoadingRegs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // QR Check-in states
  const [qrInput, setQrInput] = useState("");
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);

  useEffect(() => {
    if (address) {
      fetchHostedItems();
    }
  }, [address]);

  useEffect(() => {
    if (selectedItem) {
      fetchRegistrations(selectedItem.id, selectedItem.type);
    }
  }, [selectedItem]);

  const fetchHostedItems = async () => {
    if (!address) return;
    setIsLoadingItems(true);
    try {
      // Fetch events hosted by this wallet
      const { data: events, error: ee } = await supabase
        .from("events")
        .select("id, title, date, location, type, conducting_type")
        .eq("wallet_address", address)
        .order("date", { ascending: false });

      if (ee) throw ee;
      setHostedEvents(events || []);

      // Fetch hackathons hosted by this wallet
      const { data: hackathons, error: he } = await supabase
        .from("hackathons")
        .select("id, name, start_date, location, category, conducting_type")
        .eq("wallet_address", address)
        .order("start_date", { ascending: false });

      if (he) throw he;
      setHostedHackathons(hackathons || []);

      // Auto-select first item if available
      if (events && events.length > 0) {
        setSelectedItem({ id: events[0].id, type: "event", title: events[0].title });
      } else if (hackathons && hackathons.length > 0) {
        setSelectedItem({ id: hackathons[0].id, type: "hackathon", title: hackathons[0].name });
      }
    } catch (err) {
      console.error("Error fetching hosted items:", err);
      toast.error("Failed to load your events");
    } finally {
      setIsLoadingItems(false);
    }
  };

  const fetchRegistrations = async (id: string, type: "event" | "hackathon") => {
    setIsLoadingRegs(true);
    try {
      let query = supabase.from("registrations").select("*");
      if (type === "event") {
        query = query.eq("event_id", id);
      } else {
        query = query.eq("hackathon_id", id);
      }
      
      const { data, error } = await query.order("registered_at", { ascending: false });
      if (error) throw error;
      setRegistrations(data || []);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      toast.error("Failed to load registration list");
    } finally {
      setIsLoadingRegs(false);
    }
  };

  const handleUpdateStatus = async (regId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === "checked_in") {
        updates.checked_in_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("registrations")
        .update(updates)
        .eq("id", regId);

      if (error) throw error;
      
      toast.success(`Registration status updated to: ${newStatus}`);
      // Refresh registrations
      if (selectedItem) {
        fetchRegistrations(selectedItem.id, selectedItem.type);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleQRCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;

    try {
      let registrationId = qrInput.trim();
      
      // If the input is a JSON string from the TicketViewer QR code, parse it
      if (qrInput.startsWith("{") && qrInput.endsWith("}")) {
        try {
          const parsed = JSON.parse(qrInput);
          if (parsed.registrationId) {
            registrationId = parsed.registrationId;
          }
        } catch (_) {}
      }

      // Check if registration exists for this event/hackathon
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("id", registrationId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("Invalid ticket: Registration not found");
        return;
      }

      if (!selectedItem) {
        toast.error("No active event selected");
        return;
      }

      // Verify the ticket belongs to the currently active event/hackathon
      const matchesItem = selectedItem.type === "event" 
        ? data.event_id === selectedItem.id 
        : data.hackathon_id === selectedItem.id;

      if (!matchesItem) {
        toast.error("Ticket mismatch: This ticket is for another event!");
        return;
      }

      if (data.status === "checked_in") {
        toast.info(`Attendee ${data.name} is already checked in.`);
        return;
      }

      // Update status to checked_in
      await handleUpdateStatus(registrationId, "checked_in");
      setQrInput("");
      setIsQrDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to process QR check-in");
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) {
      toast.info("No registrations to export");
      return;
    }

    const headers = ["Registration ID", "Name", "Email", "Wallet Address", "Status", "Registered At", "Answers"];
    const rows = registrations.map((reg) => [
      reg.id,
      reg.name,
      reg.email,
      reg.wallet_address,
      reg.status,
      new Date(reg.registered_at).toLocaleString(),
      JSON.stringify(reg.answers || {})
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedItem?.title.replace(/\s+/g, "_")}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegistrations = registrations.filter((reg) => 
    reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-cyan-400" />
                Organizers Dashboard
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Manage registrations, review RSVPs, and perform check-ins for your hosted events.
              </p>
            </div>

            {selectedItem && (
              <div className="flex gap-2 w-full md:w-auto">
                <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 flex-1 sm:flex-initial">
                      <QrCode className="mr-2 h-4 w-4" /> Scan/Input Ticket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Ticket Check-In</DialogTitle>
                      <DialogDescription>
                        Paste the Ticket Reference Code or scan payload below to check in the guest.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleQRCheckInSubmit} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="qrInput">Reference / QR Code Payload</Label>
                        <Input
                          id="qrInput"
                          placeholder="Paste reference ID or raw JSON"
                          value={qrInput}
                          onChange={(e) => setQrInput(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                      <Button type="submit" className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-600 font-semibold">
                        Confirm Check-In
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button onClick={exportToCSV} className="bg-primary hover:bg-primary/90 text-white flex-1 sm:flex-initial">
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </div>
            )}
          </div>

          {!isAuthenticated ? (
            <Card className="border-slate-800 bg-slate-900/50 p-12 text-center">
              <AlertCircle className="h-16 w-16 text-cyan-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You must connect your wallet to access the host dashboard and manage your events.
              </p>
              <Button onClick={signIn}>Connect Wallet</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Sidebar: Hosted events selector */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="font-semibold text-sm text-cyan-400 tracking-wider uppercase mb-2">Your Hosted Events</h3>
                
                {isLoadingItems ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                  </div>
                ) : hostedEvents.length === 0 && hostedHackathons.length === 0 ? (
                  <p className="text-xs text-muted-foreground">You haven't created any events or hackathons yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                    {hostedEvents.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => setSelectedItem({ id: ev.id, type: "event", title: ev.title })}
                        className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-1 ${
                          selectedItem?.id === ev.id 
                            ? "bg-cyan-500/10 border-cyan-500/40 text-white shadow-[0_0_12px_rgba(6,182,212,0.1)]" 
                            : "bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900/80"
                        }`}
                      >
                        <span className="font-semibold truncate w-full">{ev.title}</span>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(ev.date).toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-[9px] uppercase">{ev.type}</Badge>
                        </div>
                      </button>
                    ))}

                    {hostedHackathons.map((hk) => (
                      <button
                        key={hk.id}
                        onClick={() => setSelectedItem({ id: hk.id, type: "hackathon", title: hk.name })}
                        className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-1 ${
                          selectedItem?.id === hk.id 
                            ? "bg-purple-500/10 border-purple-500/40 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]" 
                            : "bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900/80"
                        }`}
                      >
                        <span className="font-semibold truncate w-full">{hk.name}</span>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {new Date(hk.start_date).toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-[9px] uppercase">Hackathon</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Pane: Guest List / Table */}
              <div className="lg:col-span-3 space-y-6">
                {selectedItem ? (
                  <Card className="border-slate-800 bg-slate-900/30">
                    <CardHeader className="border-b border-slate-800 pb-5">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <CardTitle className="text-xl font-bold text-white truncate max-w-lg">
                            {selectedItem.title}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Reviewing RSVPs for this {selectedItem.type}.
                          </CardDescription>
                        </div>
                        
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search attendee name/wallet..."
                            className="pl-9 bg-slate-900 border-slate-800 text-xs h-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      {isLoadingRegs ? (
                        <div className="flex justify-center py-16">
                          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                        </div>
                      ) : registrations.length === 0 ? (
                        <div className="p-16 text-center text-muted-foreground text-xs">
                          No registrations found for this event.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="text-slate-300">Name</TableHead>
                                <TableHead className="text-slate-300">Email</TableHead>
                                <TableHead className="text-slate-300">Wallet</TableHead>
                                <TableHead className="text-slate-300">Custom Answers</TableHead>
                                <TableHead className="text-slate-300">Status</TableHead>
                                <TableHead className="text-slate-300 text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredRegistrations.map((reg) => (
                                <TableRow key={reg.id} className="border-slate-800 hover:bg-slate-900/20">
                                  <TableCell className="font-semibold text-white text-xs">{reg.name}</TableCell>
                                  <TableCell className="text-xs">{reg.email}</TableCell>
                                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                                    {reg.wallet_address.slice(0, 6)}...{reg.wallet_address.slice(-4)}
                                  </TableCell>
                                  <TableCell className="max-w-[200px] truncate text-xs text-slate-300">
                                    {Object.entries(reg.answers || {}).map(([key, val]) => (
                                      <div key={key} className="text-[10px] leading-tight">
                                        <span className="text-muted-foreground">{key}:</span> {val as string}
                                      </div>
                                    ))}
                                    {Object.keys(reg.answers || {}).length === 0 && <span className="text-muted-foreground">-</span>}
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      className={`text-[9px] uppercase font-bold ${
                                        reg.status === "approved" || reg.status === "registered"
                                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                          : reg.status === "pending"
                                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                            : reg.status === "checked_in"
                                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                                      }`}
                                    >
                                      {reg.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-1.5">
                                      {reg.status === "pending" && (
                                        <>
                                          <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-7 w-7 border-green-500/30 text-green-400 hover:bg-green-500/10"
                                            onClick={() => handleUpdateStatus(reg.id, "approved")}
                                          >
                                            <Check className="h-3.5 w-3.5" />
                                          </Button>
                                          <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-7 w-7 border-red-500/30 text-red-400 hover:bg-red-500/10"
                                            onClick={() => handleUpdateStatus(reg.id, "declined")}
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </Button>
                                        </>
                                      )}
                                      
                                      {["approved", "registered"].includes(reg.status) && (
                                        <Button
                                          size="sm"
                                          className="bg-cyan-500 text-slate-950 hover:bg-cyan-600 text-[10px] px-2 py-1 h-7 font-semibold"
                                          onClick={() => handleUpdateStatus(reg.id, "checked_in")}
                                        >
                                          Check In
                                        </Button>
                                      )}
                                      
                                      {reg.status === "checked_in" && (
                                        <span className="text-[10px] text-green-400 flex items-center gap-1">
                                          <Check className="h-3 w-3" /> Checked-in
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-slate-800 bg-slate-900/30 p-12 text-center text-muted-foreground text-xs">
                    Select an event or hackathon from the sidebar to manage RSVPs.
                  </Card>
                )}
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
