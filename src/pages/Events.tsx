import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSupabaseQuery } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { MetaTags } from "@/components/MetaTags";
import { EventCard } from "@/components/events/EventCard";
import { EventChatAssistant } from "@/components/events/EventChatAssistant";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";

import { PublicSubmissionDialog } from "@/components/PublicSubmissionDialog";

export default function Events() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(10);
  
  const { data: results, loading: isLoading } = useSupabaseQuery('events', (q) => {
    let base = q.order('date', { ascending: false }).limit(limit);
    if (locationFilter !== "all") base = base.eq('location', locationFilter);
    return base;
  }, [limit, locationFilter, refreshKey]);

  const { data: featuredEvents } = useSupabaseQuery('events', (q) => q.eq('is_featured', true).limit(10));

  // Extract unique locations from events
  const uniqueLocations = useMemo(() => {
    if (!results) return [];
    const locations = new Set<string>();
    results.forEach((event: any) => {
      if (event.location) {
        locations.add(event.location);
      }
    });
    return Array.from(locations).sort();
  }, [results]);

  // Extract unique months from events
  const uniqueMonths = useMemo(() => {
    if (!results) return [];
    const months = new Set<string>();
    results.forEach((event: any) => {
      if (event.date) {
        const date = new Date(event.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthYear);
      }
    });
    return Array.from(months).sort();
  }, [results]);

  // Helper function to format month
  const formatMonth = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Filter events based on location, month, and search
  const filteredResults = (results || []).filter((event: any) => {
    // Location filter
    if (locationFilter !== "all" && event.location !== locationFilter) {
      return false;
    }

    // Month filter
    if (monthFilter !== "all" && event.date) {
      const eventDate = new Date(event.date);
      const eventMonthYear = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
      if (eventMonthYear !== monthFilter) {
        return false;
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const title = event.title?.toLowerCase() || "";
      const description = event.description?.toLowerCase() || "";
      const location = event.location?.toLowerCase() || "";
      const type = event.type?.toLowerCase() || "";

      if (!title.includes(query) && !description.includes(query) && !location.includes(query) && !type.includes(query)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <MetaTags
        title="Tech Events | Apna Coding"
        description="Discover and share tech events, meetups, and conferences. Paste any event link and share it with the community instantly."
        image={`${window.location.origin}/logo_bg.png`}
        url={`${window.location.origin}/events`}
      />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 cyber-glitch" data-text="Events">Events</h1>
            <p className="text-muted-foreground mb-6">Discover tech events, meetups, and conferences</p>
            <div className="flex justify-center">
              <PublicSubmissionDialog type="event" onSuccess={() => setRefreshKey(prev => prev + 1)} />
            </div>
          </div>
        </div>

        {/* Featured Events Carousel */}
        {featuredEvents && featuredEvents.length > 0 && (
          <FeaturedCarousel
            items={featuredEvents}
            title="⭐ Featured Events"
            renderCard={(event: any, index: number) => (
              <EventCard event={event} index={index} showDelete={false} />
            )}
          />
        )}

        <div className="mb-8">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold">Published Events</h2>

              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                {/* Month Filter */}
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {uniqueMonths.map((month) => (
                      <SelectItem key={month} value={month}>
                        {formatMonth(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Location Filter */}
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Search Bar */}
            <Input
              type="text"
              placeholder="Search events by title, description, location, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {isLoading && !results ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-lg bg-card/30 animate-pulse border border-primary/10" />
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-primary/20 rounded-lg bg-card/10">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredResults.map((event: any, i: number) => (
              <EventCard key={event.id} event={event} index={i} showDelete={false} />
            ))}
          </div>
        )}
        
        {results && results.length >= limit && (
          <div className="flex justify-center mt-12">
            <Button onClick={() => setLimit(limit + 10)} variant="outline" className="border-primary/50">
              Load More Events
            </Button>
          </div>
        )}
      </main>

      <EventChatAssistant />

      <Footer />
    </div>
  );
}