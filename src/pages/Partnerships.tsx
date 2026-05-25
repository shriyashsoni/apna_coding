import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Twitter, MessageSquare, Globe, Sparkles, Loader2, Plus } from "lucide-react";
import { scrapeContentDirectly } from "@/utils/frontend-scraper";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export default function Partnerships() {
  const { user: authUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const address = authUser?.wallet_address;
  const isAdmin = authUser?.role === "admin";

  const [partnerUrl, setPartnerUrl] = useState("");
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [communities, setCommunities] = useState<any[] | null>(null);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCommunities(data || []);
    } catch (err) {
      console.error("Error fetching communities:", err);
      setCommunities([]);
    }
  };

  const handleScrapeUrl = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!isAdmin) {
      toast.error("Admin access required");
      return;
    }

    if (!partnerUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      new URL(partnerUrl);
    } catch {
      toast.error("Please enter a valid URL (including https://)");
      return;
    }

    setIsScrapingUrl(true);
    try {
      const result = await scrapeContentDirectly(partnerUrl.trim(), 'communities');
      
      if (!result.success) throw new Error(result.error || "Scraping failed");

      const { error: insertError } = await supabase.from('communities').insert({
        ...result.data,
        slug: result.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        wallet_address: address,
        is_published: true
      });

      if (insertError) throw insertError;

      toast.success("✅ Partner scraped and added successfully!");
      setPartnerUrl("");
      fetchCommunities();
    } catch (error: any) {
      toast.error(error.message || "Failed to scrape partner data");
      console.error(error);
    } finally {
      setIsScrapingUrl(false);
    }
  };

  const getPartnershipColor = (type: string) => {
    switch (type) {
      case "official":
      case "Official":
        return "bg-primary text-primary-foreground";
      case "sponsor":
      case "Sponsor":
        return "bg-secondary text-secondary-foreground";
      case "community":
      case "Community":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-2 cyber-glitch" data-text="Our Partners">
            Our Partners
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're proud to collaborate with amazing communities, sponsors, and organizations
            in the Web3 ecosystem to bring you the best learning and networking opportunities.
          </p>
        </div>

        {/* Admin AI Scraper Section */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Partner Scraper (Admin Only)
                </CardTitle>
                <CardDescription>
                  Paste any partner/community website URL and AI will automatically extract and create a partner page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleScrapeUrl} className="flex gap-3">
                  <Input
                    type="url"
                    placeholder="https://example-dao.xyz or https://partner-website.com"
                    value={partnerUrl}
                    onChange={(e) => setPartnerUrl(e.target.value)}
                    disabled={isScrapingUrl}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isScrapingUrl || !partnerUrl.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]"
                  >
                    {isScrapingUrl ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scraping...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Scrape & Add
                      </>
                    )}
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-3">
                  💡 Tip: Works best with official partner websites (DAOs, protocols, communities).
                  Partners will be immediately visible on this page after scraping.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!communities ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-primary/10 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-primary/10 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-primary/10 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : communities.length === 0 ? (
            <div className="col-span-full text-center py-20 border border-dashed border-primary/20 rounded-lg">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">No partnerships yet</h3>
              <p className="text-muted-foreground">Check back soon for exciting collaborations!</p>
            </div>
          ) : (
            communities.map((community: any, i: number) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full hover:border-primary/30 transition-all group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-3">
                      {community.logo && (
                        <img
                          src={community.logo}
                          alt={community.name}
                          className="h-12 w-12 rounded-lg object-cover border border-primary/20"
                        />
                      )}
                      <Badge className={getPartnershipColor(community.partnership_type)}>
                        {community.partnership_type}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {community.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {community.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      {community.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={community.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Website
                          </a>
                        </Button>
                      )}
                      {community.twitter && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={community.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <Twitter className="h-3 w-3" />
                            Twitter
                          </a>
                        </Button>
                      )}
                      {community.discord && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={community.discord}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <MessageSquare className="h-3 w-3" />
                            Discord
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Call to Action */}
        {communities && communities.length > 0 && (
          <div className="mt-16 text-center border border-primary/20 rounded-lg p-8 bg-card/50">
            <h2 className="text-2xl font-bold mb-3">Interested in Partnering?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join our growing ecosystem of partners and collaborate with a vibrant community
              of developers and Web3 enthusiasts.
            </p>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="mailto:apnacoding.tech@gmail.com">
                Contact Us
              </a>
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
