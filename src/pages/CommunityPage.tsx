import { useParams } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Twitter, MessageCircle, Send, Github, Users, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { ShareButtons } from "@/components/ShareButtons";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CommunityPage() {
  const { slug } = useParams<{ slug: string }>();
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCommunity();
    }
  }, [slug]);

  const fetchCommunity = async () => {
    try {
      const { data, error } = await supabase
        .from("community_pages")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      setCommunity(data);
    } catch (error) {
      console.error("Error fetching community:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading community...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-2">Community Not Found</h2>
              <p className="text-muted-foreground">The community you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={community.name}
        description={community.description}
        image={community.cover_image || community.logo || undefined}
        keywords={community.tags || []}
        url={`/community/${community.slug}`}
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16">
        {community.cover_image && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${community.cover_image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            {community.logo && (
              <img
                src={community.logo}
                alt={community.name}
                className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-primary"
              />
            )}

            <h1 className="text-4xl md:text-6xl font-bold mb-4">{community.name}</h1>

            {community.tagline && (
              <p className="text-xl text-primary mb-6">{community.tagline}</p>
            )}

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {community.description}
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {community.category && (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {community.category}
                </Badge>
              )}
              {community.tags?.map((tag: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex gap-3 justify-center flex-wrap">
              {community.website && (
                <Button variant="default" asChild>
                  <a href={community.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4" />
                    Website
                  </a>
                </Button>
              )}
              {community.discord && (
                <Button variant="outline" asChild>
                  <a href={community.discord} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Discord
                  </a>
                </Button>
              )}
              {community.twitter && (
                <Button variant="outline" asChild>
                  <a href={community.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                  </a>
                </Button>
              )}
              {community.telegram && (
                <Button variant="outline" asChild>
                  <a href={community.telegram} target="_blank" rel="noopener noreferrer">
                    <Send className="mr-2 h-4 w-4" />
                    Telegram
                  </a>
                </Button>
              )}
              {community.github && (
                <Button variant="outline" asChild>
                  <a href={community.github} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              )}

              <ShareButtons
                url={`/community/${slug}`}
                title={community.name}
                description={community.description}
                hashtags={['web3', 'community', 'blockchain', 'apnacoding']}
              />
            </div>

            {community.member_count && (
              <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span>{community.member_count.toLocaleString()} members</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Full Description */}
            {community.full_description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-lg leading-relaxed whitespace-pre-line">
                      {community.full_description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* About */}
            {community.about && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-6">About {community.name}</h2>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-lg leading-relaxed whitespace-pre-line">{community.about}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Mission & Vision */}
            {(community.mission || community.vision) && (
              <div className="grid md:grid-cols-2 gap-6">
                {community.mission && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full">
                      <CardContent className="pt-6">
                        <h3 className="text-xl font-bold mb-4 text-primary">Our Mission</h3>
                        <p className="leading-relaxed">{community.mission}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {community.vision && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full">
                      <CardContent className="pt-6">
                        <h3 className="text-xl font-bold mb-4 text-secondary">Our Vision</h3>
                        <p className="leading-relaxed">{community.vision}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}

            {/* Values */}
            {community.values && community.values.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-6">Our Values</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {community.values.map((value: string, i: number) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <p className="font-medium">{value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Features */}
            {community.features && community.features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-6">Key Features</h2>
                <div className="space-y-4">
                  {community.features.map((feature: string, i: number) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold">{i + 1}</span>
                          </div>
                          <p className="text-lg">{feature}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Founded */}
            {community.founded && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Founded in {community.founded}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
