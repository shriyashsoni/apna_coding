import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { MetaTags } from "@/components/MetaTags";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EventGroups() {
  const [searchQuery, setSearchQuery] = useState("");
  const [eventGroups, setEventGroups] = useState<any[] | null>(null);

  const fetchEventGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('event_groups')
        .select('*')
        .eq('is_published', true)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      setEventGroups(data || []);
    } catch (error) {
      console.error("Error fetching event groups:", error);
      setEventGroups([]);
    }
  };

  useEffect(() => {
    fetchEventGroups();
  }, []);

  const filteredGroups = useMemo(() => {
    if (!eventGroups) return [];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return eventGroups.filter(
        (group) =>
          group.group_name?.toLowerCase().includes(query) ||
          group.description?.toLowerCase().includes(query) ||
          group.location?.toLowerCase().includes(query)
      );
    }

    return eventGroups;
  }, [eventGroups, searchQuery]);

  const formatDateRange = (startDate: string | number, endDate: string | number) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <MetaTags
        title="Event Groups | Apna Coding"
        description="Discover major tech event groups like Consensus Hong Kong, ETHIndia Week, and Token2049 Dubai with all their side events in one place."
        image={`${window.location.origin}/logo_bg.png`}
        url={`${window.location.origin}/event-groups`}
      />

      <Navbar />

      <main className="flex-1">
        <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Event Groups
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Discover major tech conferences and their side events. From Consensus Hong Kong to ETHIndia Week - find all related events in one place.
              </p>

              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search event groups by name, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-4 pr-4 py-6 text-lg"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {eventGroups === null ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading event groups...</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-2xl font-semibold mb-2">No event groups found</h3>
                <p className="text-muted-foreground mb-8">
                  {searchQuery ? "Try adjusting your search terms" : "Event groups will appear here once created"}
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link to={`/event-groups/${group.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 group cursor-pointer">
                        {group.banner_image ? (
                          <div className="relative h-48 overflow-hidden rounded-t-lg">
                            <img
                              src={group.banner_image}
                              alt={group.group_name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            {group.is_featured && (
                              <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                                Featured
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Users className="h-16 w-16 text-primary/50" />
                          </div>
                        )}

                        <CardHeader>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {group.group_name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {group.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{group.location}</span>
                          </div>

                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{formatDateRange(group.start_date, group.end_date)}</span>
                          </div>

                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="font-semibold text-primary">
                              {group.event_count || 0} {(group.event_count || 0) === 1 ? 'event' : 'events'}
                            </span>
                          </div>

                          <Button className="w-full mt-4 group-hover:bg-primary/90" variant="default">
                            View All Events
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Want to see all individual events?</h2>
              <p className="text-muted-foreground mb-8">
                Check out our complete events calendar with all tech meetups, conferences, and workshops.
              </p>
              <Link to="/events">
                <Button size="lg" variant="outline" className="gap-2">
                  View All Events
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
