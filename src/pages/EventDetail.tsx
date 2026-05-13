import { useParams, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { useSupabaseMutation } from "@/hooks/useSupabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Users, ExternalLink, Trash2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ShareButtons } from "@/components/ShareButtons";
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

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const address = user?.wallet_address;
  const [event, setEvent] = useState<any>(undefined);
  const { mutate: deleteEventMutate } = useSupabaseMutation('events');

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching event:", error);
        setEvent(null);
      } else {
        setEvent(data);
      }
    }
    fetchEvent();
  }, [id]);

  if (event === undefined) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
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
      <div className="min-h-screen flex flex-col bg-background text-foreground">
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
    if (event.organizer_wallet && event.organizer_wallet.toLowerCase() === address.toLowerCase()) return true;
    return false;
  };

  const handleDelete = async () => {
    if (!address || !id) return;
    try {
      await deleteEventMutate('delete', null, { id });
      toast.success("Event deleted successfully");
      navigate("/events");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete event");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        title={event.title}
        description={event.description}
        image={event.image || undefined}
        url={`/events/${event.id}`}
        type="article"
        publishedTime={new Date(event.date).toISOString()}
      />
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant={isUpcoming ? "default" : "secondary"}>
                      {isUpcoming ? "Upcoming" : "Past Event"}
                    </Badge>
                    <Badge variant="outline">{event.type}</Badge>
                    {event.isAIGenerated && (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        AI Generated
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-3 cyber-glitch" data-text={event.title}>
                    {event.title}
                  </h1>
                  {event.organizer_name && (
                    <p className="text-lg text-muted-foreground">
                      Organized by <span className="text-primary font-semibold">{event.organizer_name}</span>
                    </p>
                  )}
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

            {/* Event Image */}
            {event.image && (
              <div className="mb-8 rounded-lg overflow-hidden border border-primary/20">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-[400px] object-cover"
                />
              </div>
            )}

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="border-primary/20 bg-card/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Date & Time</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {eventDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {eventDate.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-5 w-5 text-accent" />
                    <h3 className="font-semibold">Location</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-secondary" />
                    <h3 className="font-semibold">Event Type</h3>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">{event.type}</p>
                </CardContent>
              </Card>
            </div>

            {/* Description Section */}
            <Card className="border-primary/20 bg-card/50 mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Registration Button */}
            {event.registrationLink && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-8">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,255,0.4)] text-lg px-8 py-6"
                  onClick={() => window.open(event.registrationLink, "_blank")}
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Register for This Event
                </Button>
                <ShareButtons
                  url={`/events/${id}`}
                  title={event.title}
                  description={event.description}
                  hashtags={['web3', 'event', 'blockchain', 'apnacoding']}
                />
              </div>
            )}

            {/* Source Link */}
            {event.source_url && event.is_ai_generated && (
              <Card className="border-primary/20 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      This event was automatically scraped from an external source
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(event.source_url, "_blank")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Original
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
