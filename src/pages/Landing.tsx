import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { InteractiveFeaturesSection } from "@/components/InteractiveFeaturesSection";
import { FeaturedPartnersCarousel } from "@/components/FeaturedPartnersCarousel";
import { ArrowRight, Code, Cpu, Globe, Trophy, Users, Zap, Calendar, Eye, Newspaper, Package, MapPin } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useSupabaseQuery, useSupabaseMutation } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

// Rotating Web3 Activities Component
function RotatingWeb3Activities() {
  const activities = [
    "Events",
    "Conferences",
    "Meetups",
    "Communities",
    "Spaces",
    "AMA Sessions",
    "Workshops",
    "Hackathons",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [activities.length]);

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
        Web3
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ y: 20, opacity: 0, rotateX: 90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: -20, opacity: 0, rotateX: -90 }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-secondary to-primary inline-block"
          style={{ transformStyle: "preserve-3d" }}
        >
          {activities[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// Latest News Component
function LatestNewsBox() {
  const { data: latestNews } = useSupabaseQuery('news', (q) => q.eq('is_published', true).order('created_at', { ascending: false }).limit(3));

  return (
    <Card className="h-full border-primary/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            Latest News
          </CardTitle>
          <Link to="/news">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CardDescription>Stay updated with the latest announcements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestNews && latestNews.length > 0 ? (
          latestNews.map((news: any) => (
            <Link key={news.id} to={`/news/${news.slug}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 border border-primary/20 rounded-lg hover:border-primary/50 hover:bg-card/50 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {news.coverImage && (
                    <img
                      src={news.coverImage}
                      alt={news.title}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {news.category}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                      {news.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(news.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {news.views}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No news yet. Check back soon!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Latest Products Component
function LatestProductsBox() {
  const { data: latestProducts } = useSupabaseQuery('products', (q) => q.eq('is_published', true).order('created_at', { ascending: false }).limit(3));
  const recentProducts = latestProducts;

  return (
    <Card className="h-full border-primary/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-secondary" />
            New Products
          </CardTitle>
          <Link to="/products">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CardDescription>Recently added Web3 products</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentProducts && recentProducts.length > 0 ? (
          recentProducts.map((product: any) => (
            <Link key={product.id} to="/products">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 border border-secondary/20 rounded-lg hover:border-secondary/50 hover:bg-card/50 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No products yet. Be the first to add one!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Landing() {
  const [searchParams] = useSearchParams();
  const { user: authUser } = useAuth();

  const { data: featuredHackathons } = useSupabaseQuery('hackathons', (q) => q.eq('is_featured', true).limit(3));
  const { data: featuredEvents } = useSupabaseQuery('events', (q) => q.eq('is_featured', true).limit(3));
  const { data: featuredCommunities } = useSupabaseQuery('communities', (q) => q.eq('is_featured', true).limit(3));
  
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      const { count: hackathons } = await supabase.from('hackathons').select('*', { count: 'exact', head: true });
      const { count: events } = await supabase.from('events').select('*', { count: 'exact', head: true });
      const { count: jobs } = await supabase.from('ai_jobs').select('*', { count: 'exact', head: true });
      setStats({ hackathons: hackathons || 0, events: events || 0, jobs: jobs || 0 });
    }
    fetchStats();
  }, []);

  // Detect and apply referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode && authUser && !authUser.referred_by_code) {
      // Auto-apply referral code when user connects wallet
      supabase.rpc('apply_referral_code', { p_referral_code: refCode })
        .then(({ data, error }) => {
          if (!error) {
            toast.success(`🎉 Welcome! Referral code applied.`);
          }
        });
    }
  }, [authUser, searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SEO
        title="Build the Future of Web3"
        description="India's Premier Web3 Opportunity Layer. Join hackathons, find Web3 jobs, build products, discover events. Learn blockchain development, smart contracts, DeFi, NFTs. Connect with 20,000+ developers."
        keywords={[
          "web3 community India",
          "blockchain hackathons",
          "web3 jobs India",
          "crypto developer community",
          "DeFi hackathons",
          "NFT development",
          "Solidity tutorials",
          "Ethereum developers India",
          "Web3 learning platform",
          "blockchain careers India",
        ]}
        url="/"
        type="website"
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary border border-primary/50 text-sm font-mono mb-6">
                Open Source Web3 Opportunity layer
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
            >
              Build the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary cyber-glitch" data-text="Future">Future</span> of Web3
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl"
            >
              A decentralized platform where anyone can post hackathons, jobs, and events. Community-to-community support through our platform.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/hackathons">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(255,255,255,0.4)] text-lg h-12 px-8">
                  Post Hackathon <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg h-12 px-8">
                  Explore Products
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Code Snippet Decoration - VS Code Style */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 opacity-30 hidden lg:block pointer-events-none">
          <div className="bg-[#1e1e1e] rounded-lg border border-primary/40 shadow-[0_8px_30px_rgba(255,255,255,0.15)] backdrop-blur-sm overflow-hidden" style={{ width: '320px' }}>
            {/* VS Code Title Bar */}
            <div className="bg-[#1a1a1a] px-4 py-2 flex items-center gap-2 border-b border-[#333333]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#444444]"></div>
                <div className="w-3 h-3 rounded-full bg-[#444444]"></div>
                <div className="w-3 h-3 rounded-full bg-[#444444]"></div>
              </div>
              <span className="text-[#888888] text-xs font-mono ml-2">web3Platform.ts</span>
            </div>
            {/* VS Code Editor Content */}
            <pre className="text-xs font-mono p-6 leading-relaxed">
              <code>
                <span className="text-[#ffffff]">const</span>
                <span className="text-[#cccccc]"> web3Platform</span>
                <span className="text-[#888888]"> = {'{'}</span>
                {'\n'}
                <span className="text-[#cccccc]">  openSource</span>
                <span className="text-[#888888]">: </span>
                <span className="text-[#ffffff]">true</span>
                <span className="text-[#888888]">,</span>
                {'\n'}
                <span className="text-[#cccccc]">  postHackathons</span>
                <span className="text-[#888888]">: </span>
                <span className="text-[#aaaaaa]">'Anyone'</span>
                <span className="text-[#888888]">,</span>
                {'\n'}
                <span className="text-[#cccccc]">  postJobs</span>
                <span className="text-[#888888]">: </span>
                <span className="text-[#aaaaaa]">'Anyone'</span>
                <span className="text-[#888888]">,</span>
                {'\n'}
                <span className="text-[#cccccc]">  postEvents</span>
                <span className="text-[#888888]">: </span>
                <span className="text-[#aaaaaa]">'Anyone'</span>
                <span className="text-[#888888]">,</span>
                {'\n'}
                <span className="text-[#cccccc]">  community</span>
                <span className="text-[#888888]">: </span>
                <span className="text-[#aaaaaa]">'Decentralized'</span>
                {'\n'}
                <span className="text-[#888888]">{'};'}</span>
                {'\n'}
                <span className="text-[#666666]">// Community-powered ✨</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Latest News & Products Section */}
      <section className="py-20 border-y border-primary/10 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Latest News Box */}
            <LatestNewsBox />

            {/* Latest Products Box */}
            <LatestProductsBox />
          </div>
        </div>
      </section>

      {/* Stats Section - Real-time data only */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Developers", value: "20,000+" },
              { label: "Hackathons Listed", value: stats?.hackathons || "0" },
              { label: "Events Listed", value: stats?.events || "0" },
              { label: "Jobs Listed", value: stats?.jobs || "0" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 border border-primary/20 rounded-lg bg-card/20 hover:bg-card/40 transition-colors hover:border-primary/50">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hackathons Section */}
      <section className="py-20 bg-card/10 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Hackathons</h2>
              <p className="text-sm md:text-base text-muted-foreground">Join the most exciting coding competitions</p>
            </div>
            <Link to="/hackathons" className="w-full md:w-auto">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full md:w-auto">
                View All Hackathons
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredHackathons && featuredHackathons.length > 0 ? (
              featuredHackathons.map((hackathon: any) => (
                <Link key={hackathon.id} to={`/hackathons/${hackathon.slug}`} className="group relative bg-card border border-primary/20 rounded-lg overflow-hidden hover:border-primary transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer">
                  <div className="h-40 bg-muted/50 relative">
                    {hackathon.image ? (
                      <img src={hackathon.image} alt={hackathon.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Trophy className="h-12 w-12 text-primary/50" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/80 text-primary text-xs px-2 py-1 rounded border border-primary/30">
                      {hackathon.status}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{hackathon.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{hackathon.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-accent">{hackathon.prizes}</span>
                      <Button size="sm" variant="ghost" className="hover:text-primary p-0">Details <ArrowRight className="ml-1 h-4 w-4" /></Button>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-primary/20 rounded-lg overflow-hidden p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <Code className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-bold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground text-sm">Check back for exciting upcoming events!</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Interactive Features Section */}
      <InteractiveFeaturesSection />

      {/* Featured Events & Communities Section - Side by Side */}
      <section className="py-20 border-y border-primary/10 bg-card/30">
        <div className="container mx-auto px-4">
          {/* Section Header with Rotating Animation */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Featured <RotatingWeb3Activities />
            </h2>
            <p className="text-muted-foreground text-lg">
              Discover opportunities across the Web3 ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Featured Events Box */}
            <Card className="h-full border-primary/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-secondary" />
                    Featured Events
                  </CardTitle>
                  <Link to="/events">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>Upcoming Web3 events you don't want to miss</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {featuredEvents && featuredEvents.length > 0 ? (
                  featuredEvents.slice(0, 3).map((event: any) => (
                    <Link key={event.id} to="/events">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 border border-secondary/20 rounded-lg hover:border-secondary/50 hover:bg-card/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          {event.image && (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-16 h-16 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {new Date(event.date).toLocaleDateString()}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No events yet. Check back soon!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Featured Communities Box */}
            <Card className="h-full border-primary/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    Featured Communities
                  </CardTitle>
                  <Link to="/communities">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>Connect with leading Web3 communities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {featuredCommunities && featuredCommunities.length > 0 ? (
                  featuredCommunities.slice(0, 3).map((community: any) => (
                    <Link key={community.id} to={`/communities/${community.slug}`}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 border border-accent/20 rounded-lg hover:border-accent/50 hover:bg-card/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          {(community.logo || community.coverImage) && (
                            <img
                              src={community.logo || community.coverImage}
                              alt={community.name}
                              className="w-16 h-16 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {community.category && (
                                <Badge variant="outline" className="text-xs">
                                  {community.category}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                              {community.name}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {community.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No communities yet. Be the first to add one!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Built with the Global Web3 Community */}
      <section className="py-20 border-t border-border bg-gradient-to-b from-background to-card/50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3">🌐 Built with the Global Web3 Community</h2>
            <p className="text-muted-foreground text-lg mb-2">
              Connecting developers and innovators across blockchain ecosystems
            </p>
            <p className="text-sm font-semibold text-primary">
              🔹 Engaging with 80+ Web3 Communities Worldwide
            </p>
          </div>
          
          {/* Row 1: Core L1s & Ethereum Stack - Scroll Left */}
          <div className="mb-6 relative">
            <div className="flex gap-6 animate-scroll-left">
              {[...Array(2)].map((_, setIndex) => (
                <div key={`row1-set-${setIndex}`} className="flex gap-6 flex-shrink-0">
                  {[
                    "https://harmless-tapir-303.convex.cloud/api/storage/b7688aec-6fb3-4ee8-a2c6-379995f90a4f",
                    "https://harmless-tapir-303.convex.cloud/api/storage/a11930f7-3658-401c-bafd-54ffa7d101ea",
                    "https://harmless-tapir-303.convex.cloud/api/storage/17da4dd8-5242-4e76-a4fe-c4be534f0d1e",
                    "https://harmless-tapir-303.convex.cloud/api/storage/6133421f-2615-49a1-9f9d-631c3b14affb",
                    "https://harmless-tapir-303.convex.cloud/api/storage/c6e29be2-8849-4b77-903a-5e414c992d94",
                    "https://harmless-tapir-303.convex.cloud/api/storage/9c6207d8-b71c-4548-be69-fb0f8588e659",
                    "https://harmless-tapir-303.convex.cloud/api/storage/b55ff729-32ea-4cb7-8aaa-4885aaa24dce",
                    "https://harmless-tapir-303.convex.cloud/api/storage/868d376e-037d-4a78-9444-1d20e8ff8318",
                    "https://harmless-tapir-303.convex.cloud/api/storage/cba8b875-2b84-42dd-85f9-7fbb932defad",
                    "https://harmless-tapir-303.convex.cloud/api/storage/602ec7a3-746f-4329-9ac8-854e3d36440a",
                    "https://harmless-tapir-303.convex.cloud/api/storage/050cb42f-ea53-41ed-8a3a-71bbabbcbcba",
                    "https://harmless-tapir-303.convex.cloud/api/storage/8b5baeca-0701-45d8-a57b-72c632a8ff5f",
                    "https://harmless-tapir-303.convex.cloud/api/storage/ccad1050-ab7e-4b0b-b69b-5fbabe548289",
                    "https://harmless-tapir-303.convex.cloud/api/storage/70ea7451-f8ab-41b0-859b-48426bd5d3b3",
                    "https://harmless-tapir-303.convex.cloud/api/storage/3f693122-3353-4fe1-b2d8-9440f33350cd",
                    "https://harmless-tapir-303.convex.cloud/api/storage/ea786302-56f9-4ae7-ad2a-cf57b38a2255",
                    "https://harmless-tapir-303.convex.cloud/api/storage/271a847c-281c-4a81-8901-a13a6e796c0e",
                  ].map((logo, i) => (
                    <div 
                      key={`${setIndex}-${i}`} 
                      className="flex-shrink-0 bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
                      style={{ width: '140px', height: '80px' }}
                    >
                      <img 
                        src={logo} 
                        alt={`Ecosystem ${i + 1}`} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Infrastructure & Scaling - Scroll Right */}
          <div className="mb-6 relative">
            <div className="flex gap-6 animate-scroll-right">
              {[...Array(2)].map((_, setIndex) => (
                <div key={`row2-set-${setIndex}`} className="flex gap-6 flex-shrink-0">
                  {[
                    "https://harmless-tapir-303.convex.cloud/api/storage/40dc1858-5b12-496a-a64a-ac24226b8089",
                    "https://harmless-tapir-303.convex.cloud/api/storage/f7be41f0-72cd-4403-ab76-204a8512829d",
                    "https://harmless-tapir-303.convex.cloud/api/storage/a1f1b599-ec60-436a-b973-97acf2535fc6",
                    "https://harmless-tapir-303.convex.cloud/api/storage/62eb4d82-e806-4301-b111-d2b1d0843d3a",
                    "https://harmless-tapir-303.convex.cloud/api/storage/f2be8bd0-1c8f-4751-b3e3-a1cd0cd37341",
                    "https://harmless-tapir-303.convex.cloud/api/storage/6b2b5ccb-0db5-4305-8152-30b0f87955a7",
                    "https://harmless-tapir-303.convex.cloud/api/storage/4b44ab99-971e-45b4-8380-593e85c77f01",
                    "https://harmless-tapir-303.convex.cloud/api/storage/e7e2891f-737a-4f73-88d4-701dbde3b1b7",
                    "https://harmless-tapir-303.convex.cloud/api/storage/e00bb3e1-e1e9-4c58-a534-69a680e2eb19",
                    "https://harmless-tapir-303.convex.cloud/api/storage/b2813d50-46a7-4c03-9a38-4c20ef414775",
                    "https://harmless-tapir-303.convex.cloud/api/storage/5332eabc-25f5-45d8-9f75-63c3b9da520a",
                    "https://harmless-tapir-303.convex.cloud/api/storage/60568423-6549-472f-8653-df1dfb4cc2c2",
                    "https://harmless-tapir-303.convex.cloud/api/storage/cde0d6d5-5437-4629-8db7-ba58a53d967a",
                    "https://harmless-tapir-303.convex.cloud/api/storage/91c84051-87d0-4700-8ed6-166accd2ef49",
                    "https://harmless-tapir-303.convex.cloud/api/storage/52f06c3a-a0d2-4340-bad8-2f0addc77bb5",
                    "https://harmless-tapir-303.convex.cloud/api/storage/93c8024e-fe9d-48ce-9a25-373b4366555e",
                    "https://harmless-tapir-303.convex.cloud/api/storage/b406469a-f689-4f55-afdd-86dcaa97706c",
                  ].map((logo, i) => (
                    <div 
                      key={`${setIndex}-${i}`} 
                      className="flex-shrink-0 bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
                      style={{ width: '140px', height: '80px' }}
                    >
                      <img 
                        src={logo} 
                        alt={`Ecosystem ${i + 18}`} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Interoperability & Ecosystem Tools - Scroll Left */}
          <div className="relative">
            <div className="flex gap-6 animate-scroll-left-slow">
              {[...Array(2)].map((_, setIndex) => (
                <div key={`row3-set-${setIndex}`} className="flex gap-6 flex-shrink-0">
                  {[
                    "https://harmless-tapir-303.convex.cloud/api/storage/8424d683-4767-4de9-8bff-71f0c27f1bae",
                    "https://harmless-tapir-303.convex.cloud/api/storage/cd41e4e7-9f2d-41d2-bdc5-664d06705bf1",
                    "https://harmless-tapir-303.convex.cloud/api/storage/c015978b-796b-40d8-b5b8-9d2018603156",
                    "https://harmless-tapir-303.convex.cloud/api/storage/ebb818a3-5c56-4834-be7c-f8dc551baeb6",
                    "https://harmless-tapir-303.convex.cloud/api/storage/de8e8618-dfdc-4a5f-9827-dbb9db0683d8",
                    "https://harmless-tapir-303.convex.cloud/api/storage/27ac24bd-d3f0-4295-a6c8-684b308dba4b",
                    "https://harmless-tapir-303.convex.cloud/api/storage/b77bdd39-84db-4456-bed6-80ee179a4a73",
                    "https://harmless-tapir-303.convex.cloud/api/storage/6648cf51-7020-4944-b71e-62f85536cbbb",
                    "https://harmless-tapir-303.convex.cloud/api/storage/ab51017d-e4e1-43bc-a572-a1098592dcff",
                    "https://harmless-tapir-303.convex.cloud/api/storage/dea23233-d170-4c5c-a01c-ee8eea765053",
                    "https://harmless-tapir-303.convex.cloud/api/storage/f8233ff4-b16e-41f5-a3e1-9809d170b33c",
                    "https://harmless-tapir-303.convex.cloud/api/storage/0d645d11-fcda-49b5-b6ce-8571898e0384",
                    "https://harmless-tapir-303.convex.cloud/api/storage/0e2888d5-94ef-470d-9eae-a54347237f75",
                    "https://harmless-tapir-303.convex.cloud/api/storage/54ae71ad-0956-47e9-a029-62179e65cc81",
                    "https://harmless-tapir-303.convex.cloud/api/storage/1ce3c328-d9a8-49d4-b3a8-32e68d87f875",
                    "https://harmless-tapir-303.convex.cloud/api/storage/88b955e8-cdf2-43bd-852b-eec18c6d74eb",
                    "https://harmless-tapir-303.convex.cloud/api/storage/f951ca7a-6cee-42ce-8817-02f9ee88ddff",
                  ].map((logo, i) => (
                    <div 
                      key={`${setIndex}-${i}`} 
                      className="flex-shrink-0 bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
                      style={{ width: '140px', height: '80px' }}
                    >
                      <img 
                        src={logo} 
                        alt={`Ecosystem ${i + 35}`} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section - Modern Web3 Style */}
      <section className="py-20 bg-gradient-to-b from-background via-card/20 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent opacity-50" />
        
        <div className="absolute top-1/4 left-0 w-80 h-48 opacity-20 pointer-events-none">
          <div className="space-y-2">
            {[...Array(15)].map((_, i) => (
              <div
                key={`why-left-${i}`}
                className="h-1 rounded-full bg-gradient-to-r from-primary via-accent to-transparent"
                style={{
                  width: `${Math.random() * 50 + 30}%`,
                  opacity: Math.random() * 0.6 + 0.2,
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-1/4 right-0 w-80 h-48 opacity-20 pointer-events-none">
          <div className="space-y-2">
            {[...Array(15)].map((_, i) => (
              <div
                key={`why-right-${i}`}
                className="h-1 rounded-full bg-gradient-to-l from-secondary via-primary to-transparent ml-auto"
                style={{
                  width: `${Math.random() * 50 + 30}%`,
                  opacity: Math.random() * 0.6 + 0.2,
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Why Choose Apna Coding?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Connect with a global Web3 developer community, discover cutting-edge products, and land your dream job in tech.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Globe,
                title: "Global Community",
                desc: "Connect with developers worldwide and collaborate on Web3 projects",
                link: "/communities",
                gradient: "from-primary/20 via-transparent to-transparent"
              },
              {
                icon: Package,
                title: "Web3 Products",
                desc: "Discover and showcase cutting-edge Web3 products and innovations",
                link: "/products",
                gradient: "from-secondary/20 via-transparent to-transparent"
              },
              {
                icon: Trophy,
                title: "Epic Hackathons",
                desc: "Participate in global hackathons with real rewards and recognition",
                link: "/hackathons",
                gradient: "from-accent/20 via-transparent to-transparent"
              },
              {
                icon: Users,
                title: "Career Opportunities",
                desc: "Get hired by top companies through our AI-powered job platform",
                link: "/jobs",
                gradient: "from-primary/20 via-transparent to-transparent"
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={feature.link}>
                  <div className="group relative p-8 rounded-2xl border border-primary/20 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] cursor-pointer overflow-hidden h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 border border-primary/20">
                        <feature.icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Partners Carousel */}
      <FeaturedPartnersCarousel />

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        
        <div className="absolute top-0 left-1/4 w-96 h-32 opacity-25 pointer-events-none">
          <div className="space-y-2">
            {[...Array(12)].map((_, i) => (
              <div
                key={`cta-top-${i}`}
                className="h-1 rounded-full bg-gradient-to-r from-transparent via-primary to-accent"
                style={{
                  width: `${Math.random() * 70 + 30}%`,
                  opacity: Math.random() * 0.5 + 0.3,
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-0 right-1/4 w-96 h-32 opacity-25 pointer-events-none">
          <div className="space-y-2">
            {[...Array(12)].map((_, i) => (
              <div
                key={`cta-bottom-${i}`}
                className="h-1 rounded-full bg-gradient-to-l from-transparent via-secondary to-primary ml-auto"
                style={{
                  width: `${Math.random() * 70 + 30}%`,
                  opacity: Math.random() * 0.5 + 0.3,
                }}
              />
            ))}
          </div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Career?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already building the future. Start your journey today.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/events">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                Explore Events
              </Button>
            </Link>
            <Link to="/community">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Find Web3 Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}