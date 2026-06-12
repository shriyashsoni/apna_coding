import { useParams, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { useSupabaseMutation } from "@/hooks/useSupabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, MapPin, Clock, Users, ExternalLink, Trash2, AlertCircle, Laptop, CheckCircle2, QrCode, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ShareButtons } from "@/components/ShareButtons";
import { RegisterEventDialog } from "@/components/events/RegisterEventDialog";
import { TicketViewer } from "@/components/events/TicketViewer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function EventDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, signIn } = useAuth();
  const address = user?.wallet_address;
  const [event, setEvent] = useState<any>(undefined);
  const [userRegistration, setUserRegistration] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoadingReg, setIsLoadingReg] = useState(false);
  const { mutate: deleteEventMutate } = useSupabaseMutation('events');

  const fetchEventAndRegistrations = async () => {
    if (!slug) return;
    
    // Try fetching by slug first, then ID if it's a UUID
    let query = supabase.from('events').select('*');
    
    if (slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      query = query.eq('id', slug);
    } else {
      query = query.eq('slug', slug);
    }

    const { data, error } = await query.single();
    
    if (error) {
      console.error("Error fetching event:", error);
      setEvent(null);
    } else {
      setEvent(data);

      // Fetch attendees for social proof
      const { data: regList } = await supabase
        .from('registrations')
        .select('wallet_address, name, status')
        .eq('event_id', data.id)
        .in('status', ['registered', 'approved', 'checked_in'])
        .limit(20);
      setAttendees(regList || []);

      // If user is authenticated, check their registration status
      if (address) {
        setIsLoadingReg(true);
        const { data: userReg } = await supabase
          .from('registrations')
          .select('*')
          .eq('event_id', data.id)
          .eq('wallet_address', address)
          .maybeSingle();
        setUserRegistration(userReg || null);
        setIsLoadingReg(false);
      }
    }
  };

  useEffect(() => {
    fetchEventAndRegistrations();
  }, [slug, address]);

  if (event === undefined) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading event details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
            <p className="text-muted-foreground mb-6">This event doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/events")}>Back to Events</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();

  const canDelete = () => {
    if (!user || !address) return false;
    if (user.role === "admin") return true;
    if (event.wallet_address && event.wallet_address.toLowerCase() === address.toLowerCase()) return true;
    return false;
  };

  const handleDelete = async () => {
    if (!address || !event?.id) return;
    try {
      await deleteEventMutate('delete', null, { id: event.id });
      toast.success("Event deleted successfully");
      navigate("/events");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete event");
    }
  };

  const isApprovedGuest = userRegistration && ['registered', 'approved', 'checked_in'].includes(userRegistration.status);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <SEO
        title={event.title}
        description={event.description}
        image={event.image || event.image_url || undefined}
        url={`/events/${event.slug || event.id}`}
        type="event"
        publishedTime={new Date(event.created_at || Date.now()).toISOString()}
        startDate={event.date}
        location={event.location}
        organization={event.organizer_name}
      />
      <Navbar />

      <main className="flex-1 pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Badge variant={isUpcoming ? "default" : "secondary"}>
                      {isUpcoming ? "Upcoming" : "Past Event"}
                    </Badge>
                    <Badge variant="outline">{event.type}</Badge>
                    <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 capitalize">
                      {event.conducting_type || 'external'} Flow
                    </Badge>
                    {event.isAIGenerated && (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        AI Generated
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight text-white">
                    {event.title}
                  </h1>
                </div>

                {canDelete() && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this event? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                          Delete Event
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            {/* Event Banner */}
            {(event.image || event.image_url) && (
              <div className="mb-8 rounded-xl overflow-hidden border border-cyan-500/10 relative group">
                <img
                  src={event.image || event.image_url}
                  alt={event.title}
                  className="w-full h-[350px] md:h-[450px] object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              </div>
            )}

            {/* Main Content & Registration Widget Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              
              {/* Left Details Info */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-slate-800 bg-slate-900/50">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-200 text-sm">Date & Time</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {eventDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {eventDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} ({event.timezone || 'UTC'})
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-800 bg-slate-900/50">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-200 text-sm">Location</h4>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {event.location}
                        </p>
                        {event.location_type && (
                          <span className="inline-block px-1.5 py-0.5 text-[9px] uppercase tracking-wider bg-cyan-500/10 text-cyan-400 rounded mt-1 border border-cyan-500/20">
                            {event.location_type}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* About Section */}
                <Card className="border-slate-800 bg-slate-900/40">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-white">About This Event</h3>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Virtual details (visible only to approved RSVPs) */}
                {event.conducting_type === 'hosted' && (event.location_type === 'virtual' || event.location_type === 'hybrid') && (
                  <Card className="border-cyan-500/20 bg-cyan-950/10">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Laptop className="h-5 w-5 text-cyan-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-white text-sm">Virtual Access Link</h4>
                          {isApprovedGuest ? (
                            <div className="mt-2">
                              <p className="text-xs text-cyan-300 mb-3">You have access to this event! Click below to join:</p>
                              <Button
                                size="sm"
                                onClick={() => window.open(event.virtual_url, "_blank")}
                                className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-semibold"
                              >
                                Join Virtual Room <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">
                              🔒 The virtual meeting link will be visible here once your registration is approved.
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Social Proof Attendees list */}
                {event.conducting_type === 'hosted' && attendees.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-slate-300 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-cyan-400" />
                      Approved Attendees ({attendees.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {attendees.map((att, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-300">
                          <div className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span className="font-medium">{att.name}</span>
                          <span className="text-[10px] text-muted-foreground">({att.wallet_address.slice(0,4)}...{att.wallet_address.slice(-3)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side RSVP widget */}
              <div className="space-y-6">
                
                {/* RSVP Status / Action Card */}
                <Card className="border-slate-800 bg-slate-900/60 sticky top-24">
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center pb-2 border-b border-slate-800">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Registration Status</span>
                      <h4 className="text-lg font-bold text-white mt-1">
                        {event.conducting_type === 'hosted' ? 'Hosted RSVP' : 'External Registration'}
                      </h4>
                    </div>

                    {event.conducting_type === 'hosted' ? (
                      // Hosted Registration Flow states
                      isLoadingReg ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                        </div>
                      ) : !isAuthenticated ? (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground text-center">Connect your wallet to sign up for this event.</p>
                          <Button className="w-full bg-primary hover:bg-primary/95 text-white" onClick={signIn}>
                            Connect Wallet to Register
                          </Button>
                        </div>
                      ) : userRegistration ? (
                        <div className="space-y-4">
                          {userRegistration.status === 'pending' && (
                            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-center text-xs">
                              ⏳ Your RSVP request is pending approval by the host. We will notify you once approved.
                            </div>
                          )}

                          {userRegistration.status === 'declined' && (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center text-xs">
                              ❌ Your registration was declined by the organizer.
                            </div>
                          )}

                          {userRegistration.status === 'waitlist' && (
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-center text-xs">
                              ⏳ The event is currently at full capacity. You are on the waitlist.
                            </div>
                          )}

                          {isApprovedGuest && (
                            <div className="space-y-3">
                              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center gap-2 text-xs font-semibold">
                                <CheckCircle2 className="h-4 w-4" />
                                Registration Confirmed!
                              </div>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold">
                                    <QrCode className="h-4 w-4 mr-2" /> View Digital Ticket
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-sm p-0 bg-transparent border-0">
                                  <TicketViewer
                                    registrationId={userRegistration.id}
                                    eventTitle={event.title}
                                    eventDate={event.date}
                                    eventLocation={event.location}
                                    guestName={userRegistration.name}
                                    guestWallet={userRegistration.wallet_address}
                                    status={userRegistration.status}
                                  />
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </div>
                      ) : (
                        // If no registration exists yet
                        <div className="space-y-3">
                          {event.capacity && (
                            <div className="flex justify-between text-xs text-muted-foreground px-1">
                              <span>Capacity</span>
                              <span>{attendees.length} / {event.capacity} registered</span>
                            </div>
                          )}
                          <RegisterEventDialog
                            eventId={event.id}
                            requireApproval={event.require_approval}
                            capacity={event.capacity}
                            walletAddress={address!}
                            userEmail={user?.email || ""}
                            userName={user?.name || ""}
                            onSuccess={fetchEventAndRegistrations}
                          />
                        </div>
                      )
                    ) : (
                      // External Link Registration Flow
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground text-center">Registration is handled externally by the host.</p>
                        <Button
                          className="w-full bg-primary hover:bg-primary/95 text-white"
                          onClick={() => {
                            if (!isAuthenticated && signIn) {
                              toast.error("Please connect your wallet first");
                              signIn();
                              return;
                            }
                            if (event.registration_link) {
                              window.open(event.registration_link, "_blank");
                            } else {
                              toast.error("No registration link provided");
                            }
                          }}
                        >
                          Register on Host Website <ExternalLink className="ml-1.5 h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-800 flex justify-center">
                      <ShareButtons
                        url={`/events/${event.slug || event.id}`}
                        title={event.title}
                        description={event.description}
                        date={event.date}
                        location={event.location}
                        type="event"
                        hashtags={['web3', 'event', 'blockchain', 'apnacoding']}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Back Button */}
            <div className="mt-8">
              <Button variant="outline" onClick={() => navigate("/events")}>
                ← Back to All Events
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
