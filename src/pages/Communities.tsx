import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Globe, Twitter, MessageCircle, Send, ExternalLink, Library, Sparkles, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { SEO } from "@/components/SEO";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export default function Communities() {
  const [communities, setCommunities] = useState<any[] | null>(null);
  const [featuredCommunities, setFeaturedCommunities] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCatalog, setActiveCatalog] = useState<string>("all");

  useEffect(() => {
    fetchCommunities();
    fetchFeaturedCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setCommunities(data);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setFeaturedCommunities(data);
    } catch (error) {
      console.error("Error fetching featured communities:", error);
    }
  };

  // Dynamically aggregate all unique Catalogs (Categories) from communities
  const catalogsList = useMemo(() => {
    if (!communities) return [];
    const set = new Set<string>();
    communities.forEach((c) => {
      if (c.category) set.add(c.category.trim());
    });
    return Array.from(set).sort();
  }, [communities]);

  // Group communities by catalog for structured display
  const groupedCommunities = useMemo(() => {
    if (!communities) return {};
    const groups: { [key: string]: any[] } = {};
    
    communities.forEach((c) => {
      const cat = c.category ? c.category.trim() : "Other Communities";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(c);
    });
    
    return groups;
  }, [communities]);

  // Filtered list when a specific catalog is selected
  const filteredCommunities = useMemo(() => {
    if (!communities) return [];
    if (activeCatalog === "all") return communities;
    return communities.filter(
      (c) => c.category && c.category.trim().toLowerCase() === activeCatalog.toLowerCase()
    );
  }, [communities, activeCatalog]);

  const getCatalogIcon = (catalogName: string) => {
    const name = catalogName.toLowerCase();
    if (name.includes('ethereum') || name.includes('eth')) return "🛡️";
    if (name.includes('blockchain') || name.includes('chain')) return "🌐";
    if (name.includes('gaming') || name.includes('game')) return "🎮";
    if (name.includes('defi') || name.includes('finance')) return "💰";
    if (name.includes('dao') || name.includes('govern')) return "🏛️";
    if (name.includes('dev') || name.includes('code') || name.includes('build')) return "💻";
    if (name.includes('ai') || name.includes('intel')) return "🤖";
    if (name.includes('nft') || name.includes('art')) return "🎨";
    return "💡";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Web3 Communities Catalog"
        description="Explore Web3 communities, Ethereum ecosystems, DAOs, and builder projects grouped in professional catalogs."
        keywords={["web3 communities", "ethereum communities", "blockchain catalogs", "dao directory"]}
        url="/communities"
      />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
            <Compass className="h-4 w-4 animate-spin-slow" />
            <span className="text-xs font-semibold uppercase tracking-wider">Dynamic Directory</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">Web3 Catalogs</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover curated ecosystems, developer networks, and decentralized hubs partitioned by technology catalog.
          </p>
        </motion.div>

        {/* Featured Communities Carousel */}
        {featuredCommunities && featuredCommunities.length > 0 && (
          <div className="mb-16">
            <FeaturedCarousel
              items={featuredCommunities}
              title="⭐ Highlighted Ecosystems"
              renderCard={(community) => (
                <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-primary/20 bg-card/60 backdrop-blur-md relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary" />
                  <CardHeader className="pb-2">
                    {community.logo && (
                      <div className="mb-4 text-center">
                        <img
                          src={community.logo}
                          alt={community.name}
                          className="w-20 h-20 rounded-full mx-auto border-2 border-primary/40 object-contain bg-background shadow-lg"
                        />
                      </div>
                    )}
                    <CardTitle className="text-center text-2xl font-extrabold">{community.name}</CardTitle>
                    {community.tagline && (
                      <CardDescription className="text-center text-sm font-medium text-primary mt-1 line-clamp-1">
                        {community.tagline}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground line-clamp-3 text-center leading-relaxed">
                      {community.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {community.category && (
                        <Badge variant="outline" className="bg-primary/5 border-primary/20">
                          {getCatalogIcon(community.category)} {community.category}
                        </Badge>
                      )}
                      {community.tags?.slice(0, 2).map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {community.member_count && (
                      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{community.member_count.toLocaleString()} members</span>
                      </div>
                    )}

                    <div className="flex gap-2 justify-center pt-2">
                      {community.website && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                          <a href={community.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {community.twitter && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                          <a href={community.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4 text-sky-400" />
                          </a>
                        </Button>
                      )}
                      {community.discord && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                          <a href={community.discord} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4 text-indigo-400" />
                          </a>
                        </Button>
                      )}
                      {community.telegram && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                          <a href={community.telegram} target="_blank" rel="noopener noreferrer">
                            <Send className="h-4 w-4 text-blue-400" />
                          </a>
                        </Button>
                      )}
                    </div>

                    <Link to={`/community/${community.slug}`}>
                      <Button className="w-full mt-2 hover:bg-primary/95 font-semibold" variant="default">
                        Explore Portal
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            />
          </div>
        )}

        {/* Premium Catalog Pill Selector Bar */}
        {!loading && communities && communities.length > 0 && (
          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
              <Library className="h-4 w-4 text-primary" />
              <span>Select Active Catalog Ecosystem</span>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center max-w-4xl p-1.5 bg-card/40 border rounded-full shadow-lg backdrop-blur-md overflow-x-auto py-2">
              <Button
                variant={activeCatalog === "all" ? "default" : "ghost"}
                onClick={() => setActiveCatalog("all")}
                className="rounded-full px-5 py-2 text-xs md:text-sm font-semibold transition-all duration-300"
              >
                🌐 All Catalogs ({communities.length})
              </Button>
              {catalogsList.map((catalog) => {
                const count = communities.filter(c => c.category === catalog).length;
                return (
                  <Button
                    key={catalog}
                    variant={activeCatalog === catalog ? "default" : "ghost"}
                    onClick={() => setActiveCatalog(catalog)}
                    className="rounded-full px-5 py-2 text-xs md:text-sm font-semibold transition-all duration-300 gap-1.5"
                  >
                    <span>{getCatalogIcon(catalog)}</span>
                    <span>{catalog}</span>
                    <Badge variant="outline" className="h-5 px-1 bg-background/50 border-none font-bold text-[10px]">
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4" />
            <div className="text-muted-foreground animate-pulse">Filtering catalog files...</div>
          </div>
        ) : !communities || communities.length === 0 ? (
          <Card className="max-w-md mx-auto border-dashed border-2 py-8">
            <CardContent className="text-center text-muted-foreground space-y-4">
              <Compass className="h-12 w-12 mx-auto text-primary opacity-40 animate-pulse" />
              <p className="text-lg">No communities listed in the catalog yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-16">
            <AnimatePresence mode="wait">
              {activeCatalog === "all" ? (
                // Grouped Display Layout
                Object.keys(groupedCommunities).map((catName) => (
                  <motion.div
                    key={catName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 border-b pb-3 border-primary/10">
                      <span className="text-3xl">{getCatalogIcon(catName)}</span>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                          {catName}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {groupedCommunities[catName].length} ecosystems registered in this catalog
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupedCommunities[catName].map((community, index) => (
                        <CommunityGridCard
                          key={community.id}
                          community={community}
                          index={index}
                          getCatalogIcon={getCatalogIcon}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                // Filtered List Display Layout
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 border-b pb-3 border-primary/10 mb-6">
                    <span className="text-3xl">{getCatalogIcon(activeCatalog)}</span>
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight">{activeCatalog}</h2>
                      <p className="text-sm text-muted-foreground">
                        Ecosystem catalog displaying {filteredCommunities.length} communities
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCommunities.map((community, index) => (
                      <CommunityGridCard
                        key={community.id}
                        community={community}
                        index={index}
                        getCatalogIcon={getCatalogIcon}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Inner Grid Card Component for modular reuse
function CommunityGridCard({ community, index, getCatalogIcon }: { community: any; index: number; getCatalogIcon: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
      className="h-full"
    >
      <Card className="h-full hover:border-primary/40 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-muted group-hover:bg-primary transition-colors" />
        
        <div>
          <CardHeader className="pb-2">
            {community.logo && (
              <div className="mb-3 text-center">
                <img
                  src={community.logo}
                  alt={community.name}
                  className="w-16 h-16 rounded-full mx-auto border-2 border-muted object-contain bg-background group-hover:scale-105 transition-transform shadow-md"
                />
              </div>
            )}
            <CardTitle className="text-center text-xl font-bold group-hover:text-primary transition-colors">
              {community.name}
            </CardTitle>
            {community.tagline && (
              <CardDescription className="text-center text-xs line-clamp-1 italic text-muted-foreground mt-1">
                "{community.tagline}"
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4 pb-2">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {community.description}
            </p>

            <div className="flex flex-wrap gap-1 justify-center">
              {community.category && (
                <Badge variant="outline" className="text-[10px] bg-secondary/5 font-semibold">
                  {getCatalogIcon(community.category)} {community.category}
                </Badge>
              )}
              {community.tags?.slice(0, 2).map((tag: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>

            {community.member_count && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{community.member_count.toLocaleString()} members</span>
              </div>
            )}
          </CardContent>
        </div>

        <div className="p-6 pt-0 mt-4 space-y-4">
          <div className="flex gap-1.5 justify-center border-t pt-3">
            {community.website && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                <a href={community.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4" />
                </a>
              </Button>
            )}
            {community.twitter && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                <a href={community.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4 text-sky-400" />
                </a>
              </Button>
            )}
            {community.discord && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                <a href={community.discord} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 text-indigo-400" />
                </a>
              </Button>
            )}
            {community.telegram && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                <a href={community.telegram} target="_blank" rel="noopener noreferrer">
                  <Send className="h-4 w-4 text-blue-400" />
                </a>
              </Button>
            )}
          </div>

          <Link to={`/community/${community.slug}`}>
            <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground font-semibold transition-all" variant="outline">
              Open Portal
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
