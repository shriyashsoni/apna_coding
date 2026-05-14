import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSupabaseQuery } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Trophy, MapPin } from "lucide-react";
import { HackathonChatAssistant } from "@/components/hackathons/HackathonChatAssistant";
import { HackathonCard } from "@/components/hackathons/HackathonCard";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { MetaTags } from "@/components/MetaTags";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { PublicSubmissionDialog } from "@/components/PublicSubmissionDialog";

export default function Hackathons() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "web2" | "web3">("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [limit, setLimit] = useState(10);
  
  const { data: results, loading: isLoading } = useSupabaseQuery('hackathons', (q) => {
    let base = q.order('start_date', { ascending: false }).limit(limit);
    if (locationFilter !== "all") base = base.eq('location', locationFilter);
    return base;
  }, [limit, locationFilter, refreshKey]);

  // Extract unique locations from hackathons
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    if (!results) return [];
    results.forEach((hackathon: any) => {
      if (hackathon.location) {
        locations.add(hackathon.location);
      }
    });
    return Array.from(locations).sort();
  }, [results]);

  // Filter hackathons based on category, location, and search
  const filteredResults = (results || []).filter((hackathon: any) => {
    // Category filter
    if (categoryFilter !== "all") {
      const category = hackathon.category?.toLowerCase() || "";
      const title = hackathon.title?.toLowerCase() || "";
      const description = hackathon.description?.toLowerCase() || "";
      const tags = hackathon.tags?.map((t: string) => t.toLowerCase()).join(" ") || "";
      const themes = hackathon.themes?.map((t: string) => t.toLowerCase()).join(" ") || "";
      
      const searchText = `${category} ${title} ${description} ${tags} ${themes}`;
      
      if (categoryFilter === "web3") {
        const hasWeb3Keywords = searchText.includes("web3") || 
               searchText.includes("blockchain") || 
               searchText.includes("crypto") ||
               searchText.includes("defi") ||
               searchText.includes("nft") ||
               searchText.includes("dao") ||
               searchText.includes("smart contract");
        if (!hasWeb3Keywords) return false;
      }
      
      if (categoryFilter === "web2") {
        const hasWeb3Keywords = searchText.includes("web3") || 
                                 searchText.includes("blockchain") || 
                                 searchText.includes("crypto") ||
                                 searchText.includes("defi") ||
                                 searchText.includes("nft") ||
                                 searchText.includes("dao");
        if (hasWeb3Keywords) return false;
      }
    }

    // Location filter
    if (locationFilter !== "all" && hackathon.location !== locationFilter) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const title = hackathon.title?.toLowerCase() || "";
      const description = hackathon.description?.toLowerCase() || "";
      const location = hackathon.location?.toLowerCase() || "";
      
      if (!title.includes(query) && !description.includes(query) && !location.includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <MetaTags
        title="Hackathons | Apna Coding"
        description="Discover Web3 hackathons, win prizes, and build the future. Submit any hackathon link and our AI will automatically publish all details."
        image={`${window.location.origin}/logo_bg.png`}
        url={`${window.location.origin}/hackathons`}
      />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 cyber-glitch" data-text="Hackathons">Hackathons</h1>
            <p className="text-muted-foreground mb-6">Discover Web3 hackathons, win prizes, and build the future</p>
            <div className="flex justify-center">
              <PublicSubmissionDialog type="hackathon" onSuccess={() => setRefreshKey(prev => prev + 1)} />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold">Published Hackathons</h2>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Category Filter */}
                <div className="flex gap-2 bg-muted/50 p-1 rounded-lg">
                  <Button
                    size="sm"
                    variant={categoryFilter === "all" ? "default" : "ghost"}
                    onClick={() => setCategoryFilter("all")}
                    className="flex-1 sm:flex-none"
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={categoryFilter === "web2" ? "default" : "ghost"}
                    onClick={() => setCategoryFilter("web2")}
                    className="flex-1 sm:flex-none"
                  >
                    Web2
                  </Button>
                  <Button
                    size="sm"
                    variant={categoryFilter === "web3" ? "default" : "ghost"}
                    onClick={() => setCategoryFilter("web3")}
                    className="flex-1 sm:flex-none"
                  >
                    Web3
                  </Button>
                </div>
                
                {/* Location Filter */}
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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
              placeholder="Search hackathons by title, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {isLoading && !results ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-lg bg-card/30 animate-pulse border border-primary/20" />
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-primary/30 rounded-lg bg-card/10">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">
              No hackathons found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredResults.map((hackathon: any, i: number) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} index={i} showDelete={false} />
            ))}
          </div>
        )}
        
        {results && results.length >= limit && (
          <div className="flex justify-center mt-12">
            <Button onClick={() => setLimit(limit + 10)} variant="outline">
              Load More Hackathons
            </Button>
          </div>
        )}
      </main>

      <HackathonChatAssistant />

      <Footer />
    </div>
  );
}