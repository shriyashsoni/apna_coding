import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Trash2, Share2, Users } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { EventCard } from "@/components/events/EventCard";
import { HackathonCard } from "@/components/hackathons/HackathonCard";

export default function MyContent() {
  const { user: privyUser, authenticated, ready } = usePrivy();
  const address = privyUser?.wallet?.address;
  const navigate = useNavigate();
  const [myHackathons, setMyHackathons] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [
        { data: hackathons },
        { data: events }
      ] = await Promise.all([
        supabase.from('hackathons').select('*').eq('wallet_address', address).order('created_at', { ascending: false }),
        supabase.from('events').select('*').eq('wallet_address', address).order('created_at', { ascending: false })
      ]);

      setMyHackathons(hackathons || []);
      setMyEvents(events || []);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && !authenticated) {
      navigate("/");
      toast.error("Please connect your wallet");
    } else if (ready && authenticated) {
      fetchData();
    }
  }, [authenticated, address, navigate, ready]);

  const handleDeleteHackathon = async (id: any) => {
    try {
      const { error } = await supabase.from('hackathons').delete().eq('id', id);
      if (error) throw error;
      toast.success("Hackathon deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete hackathon");
      console.error(error);
    }
  };

  const handleDeleteEvent = async (id: any) => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      toast.success("Event deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete event");
      console.error(error);
    }
  };

  if (!authenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-32 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 cyber-glitch" data-text="My Content">My Content</h1>
          <p className="text-muted-foreground">Manage your hackathons and events</p>
        </div>

        <Tabs defaultValue="hackathons" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="hackathons" className="mt-6">
            {loading ? (
              <div className="animate-pulse text-muted-foreground">Loading hackathons...</div>
            ) : myHackathons.length === 0 ? (
              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">You haven't created any hackathons yet</p>
                  <Button onClick={() => navigate("/hackathons")} className="mt-4">
                    Create Hackathon
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {myHackathons.map((hackathon, i) => (
                  <HackathonCard 
                    key={hackathon.id} 
                    hackathon={hackathon} 
                    index={i} 
                    showDelete={true} 
                    onDelete={() => handleDeleteHackathon(hackathon.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            {loading ? (
              <div className="animate-pulse text-muted-foreground">Loading events...</div>
            ) : myEvents.length === 0 ? (
              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">You haven't created any events yet</p>
                  <Button onClick={() => navigate("/events")} className="mt-4">
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myEvents.map((event, i) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    index={i} 
                    showDelete={true} 
                    onDelete={() => handleDeleteEvent(event.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
