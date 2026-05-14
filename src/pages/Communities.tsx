import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Globe, Twitter, MessageCircle, Send, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { SEO } from "@/components/SEO";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Communities() {
  const [communities, setCommunities] = useState<any[] | null>(null);
  const [featuredCommunities, setFeaturedCommunities] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
    fetchFeaturedCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from("community_pages")
        .select("*")
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
        .from("community_pages")
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Communities"
        description="Explore Web3 communities, DAOs, and projects in the Apna Coding ecosystem"
        keywords={["web3 communities", "dao", "blockchain communities", "crypto communities"]}
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Web3 Communities</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and connect with amazing Web3 communities, DAOs, and projects
          </p>
        </motion.div>

        {/* Featured Communities Carousel */}
        {featuredCommunities && featuredCommunities.length > 0 && (
          <FeaturedCarousel
            items={featuredCommunities}
            title="⭐ Featured Communities"
            renderCard={(community) => (
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-yellow-500/20">
                <CardHeader>
                  {community.logo && (
                    <div className="mb-4">
                      <img
                        src={community.logo}
                        alt={community.name}
                        className="w-20 h-20 rounded-full mx-auto border-2 border-primary"
                      />
                    </div>
                  )}
                  <CardTitle className="text-center text-2xl">{community.name}</CardTitle>
                  {community.tagline && (
                    <CardDescription className="text-center text-base">
                      {community.tagline}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-4 text-center">
                    {community.description}
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {community.category && (
                      <Badge variant="outline">{community.category}</Badge>
                    )}
                    {community.tags?.slice(0, 3).map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {community.member_count && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{community.member_count.toLocaleString()} members</span>
                    </div>
                  )}

                  <div className="flex gap-2 justify-center pt-2">
                    {community.website && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={community.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {community.twitter && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={community.twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {community.discord && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={community.discord} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {community.telegram && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={community.telegram} target="_blank" rel="noopener noreferrer">
                          <Send className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>

                  <Link to={`/community/${community.slug}`}>
                    <Button className="w-full hover:bg-primary/90" variant="outline">
                      View Community
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          />
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading communities...</div>
          </div>
        ) : !communities || communities.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No communities yet. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community, index) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    {community.logo && (
                      <div className="mb-4">
                        <img
                          src={community.logo}
                          alt={community.name}
                          className="w-16 h-16 rounded-full mx-auto border-2 border-primary"
                        />
                      </div>
                    )}
                    <CardTitle className="text-center">{community.name}</CardTitle>
                    {community.tagline && (
                      <CardDescription className="text-center text-sm">
                        {community.tagline}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {community.description}
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {community.category && (
                        <Badge variant="outline">{community.category}</Badge>
                      )}
                      {community.tags?.slice(0, 2).map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {community.member_count && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{community.member_count.toLocaleString()} members</span>
                      </div>
                    )}

                    <div className="flex gap-2 justify-center pt-2">
                      {community.website && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={community.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {community.twitter && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={community.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {community.discord && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={community.discord} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {community.telegram && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={community.telegram} target="_blank" rel="noopener noreferrer">
                            <Send className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>

                    <Link to={`/community/${community.slug}`}>
                      <Button className="w-full group-hover:bg-primary/90" variant="outline">
                        View Community
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
