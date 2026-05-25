import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowLeft, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { MetaTags } from "@/components/MetaTags";
import { Link, useParams } from "react-router";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { EventCard } from "@/components/events/EventCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EventGroupDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [venueFilter, setVenueFilter] = useState<string>("");
  const [groupData, setGroupData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchGroupAndEvents = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      // 1. Fetch group details
      const { data: group, error: groupError } = await supabase
        .from('event_groups')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (groupError) throw groupError;

      // 2. Fetch events for this group
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('event_group_id', group.id)
        .eq('is_approved', true)
        .order('date', { ascending: true });
      
      if (eventsError) throw eventsError;

      setGroupData({
        ...group,
        events: events || []
      });
    } catch (error) {
      console.error("Error fetching event group detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupAndEvents();
  }, [slug]);

  const { uniqueCategories, uniqueVenues } = useMemo(() => {
    if (!groupData?.events) return { uniqueCategories: [], uniqueVenues: [] };

    const categories = new Set<string>();
    const venues = new Set<string>();

    groupData.events.forEach((event: any) => {
      if (event.type) categories.add(event.type);
      if (event.location) venues.add(event.location);
    });

    return {
      uniqueCategories: Array.from(categories).sort(),
      uniqueVenues: Array.from(venues).sort(),
    };
  }, [groupData]);

  const filteredEvents = useMemo(() => {
    if (!groupData?.events) return [];

    let events = [...groupData.events];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      events = events.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    if (categoryFilter && categoryFilter !== "all") {
      events = events.filter((event) => event.type === categoryFilter);
    }

    if (venueFilter.trim()) {
      events = events.filter((event) =>
        event.location.toLowerCase().includes(venueFilter.toLowerCase())
      );
    }

    return events;
  }, [groupData, searchQuery, categoryFilter, venueFilter]);

  const formatDateRange = (startDate: string | number, endDate: string | number) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  if (loading || !groupData) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading event group...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <MetaTags
        title={`${groupData.group_name} | Event Groups | Apna Coding`}
        description={groupData.description}
        image={groupData.banner_image || `${window.location.origin}/logo_bg.png`}
        url={`${window.location.origin}/event-groups/${slug}`}
      />

      <Navbar />

      <main className="flex-1">
        <section className="relative">
          {groupData.banner_image ? (
            <div className="relative h-80 overflow-hidden">
              <img
                src={groupData.banner_image}
                alt={groupData.group_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

              <div className="absolute inset-0 flex items-end">
                <div className="max-w-7xl mx-auto px-4 pb-8 w-full">
                  <Link to="/event-groups">
                    <Button variant="ghost" className="mb-4 text-white hover:text-white/90">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Event Groups
                    </Button>
                  </Link>

                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    {groupData.group_name}
                  </h1>

                  <div className="flex flex-wrap gap-4 text-white/90">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{groupData.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>{formatDateRange(groupData.start_date, groupData.end_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      <span className="font-semibold">{groupData.event_count || 0} Events</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 py-16">
              <div className="max-w-7xl mx-auto px-4">
                <Link to="/event-groups">
                  <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Event Groups
                  </Button>
                </Link>

                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {groupData.group_name}
                </h1>

                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{groupData.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{formatDateRange(groupData.start_date, groupData.end_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span className="font-semibold">{groupData.event_count || 0} Events</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="py-8 px-4 border-b">
          <div className="max-w-7xl mx-auto">
            <p className="text-lg text-muted-foreground max-w-4xl">
              {groupData.description}
            </p>
          </div>
        </section>

        <section className="py-8 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Filter Events</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="text"
                placeholder="Filter by venue..."
                value={venueFilter}
                onChange={(e) => setVenueFilter(e.target.value)}
              />
            </div>

            {(searchQuery || categoryFilter !== "all" || venueFilter) && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Card className="inline-block px-3 py-1">
                    <span className="text-sm">Search: "{searchQuery}"</span>
                  </Card>
                )}
                {categoryFilter !== "all" && (
                  <Card className="inline-block px-3 py-1">
                    <span className="text-sm">Category: {categoryFilter}</span>
                  </Card>
                )}
                {venueFilter && (
                  <Card className="inline-block px-3 py-1">
                    <span className="text-sm">Venue: {venueFilter}</span>
                  </Card>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setVenueFilter("");
                  }}
                  className="h-auto py-1 text-sm"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-2xl font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || categoryFilter !== "all" || venueFilter
                    ? "Try adjusting your filters"
                    : "Events will be added soon"}
                </p>
                {(searchQuery || categoryFilter !== "all" || venueFilter) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                      setVenueFilter("");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </motion.div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-muted-foreground">
                    Showing {filteredEvents.length} of {groupData.events?.length || 0} events
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <EventCard event={event} index={index} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
