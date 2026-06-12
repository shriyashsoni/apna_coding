import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MapPin, Globe, Share2, Plus, Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function CalendarDetail() {
  const { hostAddress } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, signIn } = useAuth();
  const address = user?.wallet_address;

  const [calendar, setCalendar] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowMutating, setIsFollowMutating] = useState(false);

  useEffect(() => {
    if (hostAddress) {
      fetchCalendarData();
    }
  }, [hostAddress, address]);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch calendar metadata (or fallback mock branding if table hasn't been created yet)
      const { data: cal, error } = await supabase
        .from("calendars")
        .select("*")
        .eq("wallet_address", hostAddress)
        .maybeSingle();

      if (error) throw error;

      if (cal) {
        setCalendar(cal);
        
        // Fetch follower count
        const { count } = await supabase
          .from("calendar_follows")
          .select("id", { count: "exact", head: true })
          .eq("calendar_id", cal.id);
        
        setFollowerCount(count || 0);

        // Check if current user is following
        if (address) {
          const { data: followRecord } = await supabase
            .from("calendar_follows")
            .select("*")
            .eq("calendar_id", cal.id)
            .eq("follower_wallet", address)
            .maybeSingle();
          setIsFollowing(!!followRecord);
        }
      } else {
        // Build fallback display using host's details
        setCalendar({
          id: hostAddress,
          wallet_address: hostAddress,
          name: `Host: ${hostAddress?.slice(0, 6)}...${hostAddress?.slice(-4)}`,
          description: "Welcome to our official host profile. Check out our scheduled hackathons and events below.",
          logo_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${hostAddress}`,
          banner_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"
        });
      }

      // 2. Fetch all events created by this host
      const { data: evList } = await supabase
        .from("events")
        .select("*")
        .eq("wallet_address", hostAddress)
        .eq("is_approved", true)
        .order("date", { ascending: true });
      setEvents(evList || []);

      // 3. Fetch all hackathons created by this host
      const { data: hkList } = await supabase
        .from("hackathons")
        .select("*")
        .eq("wallet_address", hostAddress)
        .eq("is_approved", true)
        .order("start_date", { ascending: true });
      setHackathons(hkList || []);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load organizer calendar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please connect your wallet first");
      signIn();
      return;
    }

    if (!calendar?.id || isFollowMutating) return;

    setIsFollowMutating(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("calendar_follows")
          .delete()
          .eq("calendar_id", calendar.id)
          .eq("follower_wallet", address);

        if (error) throw error;
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        toast.success("Stopped following calendar");
      } else {
        // Follow
        const { error } = await supabase
          .from("calendar_follows")
          .insert({
            calendar_id: calendar.id,
            follower_wallet: address
          });

        if (error) throw error;
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast.success("Following calendar! You will get notifications for new events.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle follow status");
    } finally {
      setIsFollowMutating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pt-24">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
        <Footer />
      </div>
    );
  }

  const allItems = [
    ...events.map(e => ({ ...e, typeLabel: "Event", sortDate: e.date, link: `/events/${e.slug || e.id}` })),
    ...hackathons.map(h => ({ ...h, typeLabel: "Hackathon", title: h.name, sortDate: h.start_date, link: `/hackathons/${h.slug || h.id}` }))
  ].sort((a, b) => a.sortDate - b.sortDate);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Banner header */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img
            src={calendar.banner_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"}
            alt="Calendar Banner"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>

        {/* Profile Card */}
        <div className="container mx-auto px-4 -mt-24 relative z-10 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-6 items-end pb-8 border-b border-slate-800">
            <img
              src={calendar.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${hostAddress}`}
              alt={calendar.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-slate-950 bg-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.2)] object-cover"
            />
            
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{calendar.name}</h1>
              <p className="text-xs text-slate-300 max-w-xl">{calendar.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-wider text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-cyan-400" /> {followerCount} Followers</span>
                <span className="flex items-center gap-1 font-mono text-[9px]"><Globe className="h-3.5 w-3.5 text-cyan-400" /> {hostAddress?.slice(0, 10)}...</span>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
              <Button
                onClick={handleFollowToggle}
                disabled={isFollowMutating}
                className={`flex-1 md:flex-initial font-bold ${
                  isFollowing 
                    ? "bg-slate-900 border border-red-500/20 text-red-400 hover:bg-red-500/10" 
                    : "bg-cyan-500 text-slate-950 hover:bg-cyan-600 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                }`}
              >
                {isFollowing ? (
                  <><BellOff className="mr-1.5 h-4 w-4" /> Unfollow</>
                ) : (
                  <><Bell className="mr-1.5 h-4 w-4" /> Follow Calendar</>
                )}
              </Button>
              <Button variant="outline" size="icon" className="border-slate-800 text-slate-300 hover:bg-slate-900">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Schedule Listings */}
          <div className="pt-12 pb-16">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-400" />
              Hosted Schedule ({allItems.length})
            </h2>

            {allItems.length === 0 ? (
              <Card className="border-slate-800 bg-slate-900/20 py-16 text-center">
                <p className="text-xs text-muted-foreground">This host has no active events or hackathons scheduled.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      onClick={() => navigate(item.link)}
                      className="border-slate-800 bg-slate-900/30 hover:border-cyan-500/30 hover:bg-slate-900/60 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between"
                    >
                      <CardContent className="p-5 space-y-4">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                            {item.typeLabel}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(item.sortDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-cyan-400">
                            {item.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-2 border-t border-slate-800/40">
                          <MapPin className="h-3 w-3 text-cyan-400 flex-shrink-0" />
                          <span className="truncate">{item.location || "Virtual"}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
