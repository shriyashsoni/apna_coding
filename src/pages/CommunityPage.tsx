import { useParams } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Twitter, MessageCircle, Send, Github, Users, CheckCircle, Calendar, MapPin, Edit, Plus, Trash2, PlusCircle, Check, ShieldAlert, Sparkles, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { ShareButtons } from "@/components/ShareButtons";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function CommunityPage() {
  const { slug } = useParams<{ slug: string }>();
  const [community, setCommunity] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  
  // Dialog Open States
  const [isEditCommunityOpen, setIsEditCommunityOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  
  // Community edit form state
  const [communityForm, setCommunityForm] = useState<any>({
    name: "",
    tagline: "",
    description: "",
    logo: "",
    cover_image: "",
    website: "",
    twitter: "",
    discord: "",
    telegram: "",
    github: "",
    category: "",
    tags: "",
    member_count: 0,
    founded: "",
    about: "",
    mission: "",
    vision: "",
    values: "",
    features: "",
    full_description: "",
    is_published: false
  });

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "Online",
    type: "Meetup",
    registration_link: "",
    image_url: ""
  });

  useEffect(() => {
    if (slug) {
      fetchCommunity();
    }
  }, [slug]);

  const fetchCommunity = async () => {
    try {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      setCommunity(data);
      
      // Initialize edit form with database properties
      setCommunityForm({
        name: data.name || "",
        tagline: data.tagline || "",
        description: data.description || "",
        logo: data.logo || "",
        cover_image: data.cover_image || "",
        website: data.website || "",
        twitter: data.twitter || "",
        discord: data.discord || "",
        telegram: data.telegram || "",
        github: data.github || "",
        category: data.category || "Web3",
        tags: data.tags ? data.tags.join(", ") : "",
        member_count: data.member_count || 0,
        founded: data.founded || "",
        about: data.about || "",
        mission: data.mission || "",
        vision: data.vision || "",
        values: data.values ? data.values.join(", ") : "",
        features: data.features ? data.features.join("\n") : "",
        full_description: data.full_description || "",
        is_published: data.is_published || false
      });

      // Fetch events linked to this community
      fetchEvents(data.id);
    } catch (error) {
      console.error("Error fetching community:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (communityId: string) => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("group_id", communityId)
        .order("date", { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const handleUpdateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const { error } = await supabase
        .from("communities")
        .update({
          name: communityForm.name,
          tagline: communityForm.tagline || null,
          description: communityForm.description,
          logo: communityForm.logo || null,
          cover_image: communityForm.cover_image || null,
          website: communityForm.website || null,
          twitter: communityForm.twitter || null,
          discord: communityForm.discord || null,
          telegram: communityForm.telegram || null,
          github: communityForm.github || null,
          category: communityForm.category || null,
          tags: communityForm.tags ? communityForm.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
          member_count: parseInt(communityForm.member_count) || 0,
          founded: communityForm.founded || null,
          about: communityForm.about || null,
          mission: communityForm.mission || null,
          vision: communityForm.vision || null,
          values: communityForm.values ? communityForm.values.split(",").map((v: string) => v.trim()).filter(Boolean) : [],
          features: communityForm.features ? communityForm.features.split("\n").map((f: string) => f.trim()).filter(Boolean) : [],
          full_description: communityForm.about || communityForm.full_description || null,
          is_published: communityForm.is_published
        })
        .eq("id", community.id);

      if (error) throw error;
      
      toast.success("✨ Community page updated successfully!");
      setIsEditCommunityOpen(false);
      fetchCommunity();
    } catch (err: any) {
      toast.error(err.message || "Failed to update community");
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const { error } = await supabase
        .from("events")
        .insert({
          title: eventForm.title,
          description: eventForm.description,
          date: new Date(eventForm.date).toISOString(),
          location: eventForm.location,
          type: eventForm.type,
          registration_link: eventForm.registration_link || null,
          image_url: eventForm.image_url || null,
          group_id: community.id,
          wallet_address: user.wallet_address,
          is_approved: true
        });

      if (error) throw error;
      
      toast.success("✅ Event added and linked successfully!");
      setIsAddEventOpen(false);
      setEventForm({
        title: "",
        description: "",
        date: "",
        location: "Online",
        type: "Meetup",
        registration_link: "",
        image_url: ""
      });
      fetchEvents(community.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to add event");
    }
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      const { error } = await supabase
        .from("events")
        .update({
          title: editingEvent.title,
          description: editingEvent.description,
          date: new Date(editingEvent.date).toISOString(),
          location: editingEvent.location,
          type: editingEvent.type,
          registration_link: editingEvent.registration_link || null,
          image_url: editingEvent.image_url || null,
        })
        .eq("id", editingEvent.id);

      if (error) throw error;
      
      toast.success("✅ Event details updated!");
      setEditingEvent(null);
      fetchEvents(community.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to update event");
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the event "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
      
      toast.success("🗑️ Event removed successfully!");
      fetchEvents(community.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event");
    }
  };

  const handleTogglePublish = async () => {
    try {
      const newStatus = !community.is_published;
      const { error } = await supabase
        .from("communities")
        .update({ is_published: newStatus })
        .eq("id", community.id);

      if (error) throw error;
      
      toast.success(`Community is now ${newStatus ? "Published" : "in Draft"}`);
      fetchCommunity();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
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

      {/* Floating Admin Controls */}
      {isAdmin && (
        <div className="bg-primary/10 border-b border-primary/20 sticky top-24 md:top-28 z-30 backdrop-blur-md">
          <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary animate-pulse" />
              <span className="font-semibold text-sm">👑 Admin Control Hub:</span>
              <Badge variant={community.is_published ? "default" : "secondary"}>
                {community.is_published ? "🟢 Live / Published" : "🟡 Draft Mode"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleTogglePublish} className="h-8">
                {community.is_published ? "Unpublish to Draft" : "Publish to Live"}
              </Button>
              
              <Button size="sm" variant="outline" onClick={() => setIsEditCommunityOpen(true)} className="h-8 gap-1.5">
                <Edit className="h-3.5 w-3.5" />
                Edit Community Details
              </Button>
              
              <Button size="sm" onClick={() => setIsAddEventOpen(true)} className="h-8 gap-1.5">
                <PlusCircle className="h-3.5 w-3.5" />
                Add & Link Event
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-28 md:pt-32 pb-16">
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
                className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-primary bg-background object-contain shadow-xl"
              />
            )}

            <h1 className="text-4xl md:text-6xl font-bold mb-4">{community.name}</h1>

            {community.tagline && (
              <p className="text-xl text-primary mb-6">{community.tagline}</p>
            )}

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
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
                    <MessageCircle className="mr-2 h-4 w-4 text-indigo-400" />
                    Discord
                  </a>
                </Button>
              )}
              {community.twitter && (
                <Button variant="outline" asChild>
                  <a href={community.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="mr-2 h-4 w-4 text-sky-400" />
                    Twitter
                  </a>
                </Button>
              )}
              {community.telegram && (
                <Button variant="outline" asChild>
                  <a href={community.telegram} target="_blank" rel="noopener noreferrer">
                    <Send className="mr-2 h-4 w-4 text-blue-400" />
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
              <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground font-medium">
                <Users className="h-5 w-5 text-primary" />
                <span>{community.member_count.toLocaleString()} members</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 bg-card/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Full Description */}
            {community.full_description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border-primary/10 bg-card/30 backdrop-blur-sm shadow-xl">
                  <CardContent className="pt-6">
                    <p className="text-lg leading-relaxed whitespace-pre-line text-muted-foreground">
                      {community.full_description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* About */}
            {community.about && community.about !== community.full_description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-6">About {community.name}</h2>
                <Card className="border-primary/10 bg-card/30 shadow-xl">
                  <CardContent className="pt-6">
                    <p className="text-lg leading-relaxed whitespace-pre-line text-muted-foreground">{community.about}</p>
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
                    <Card className="h-full border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors shadow-lg">
                      <CardContent className="pt-6">
                        <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Our Mission
                        </h3>
                        <p className="leading-relaxed text-muted-foreground">{community.mission}</p>
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
                    <Card className="h-full border-secondary/20 bg-secondary/5 hover:border-secondary/40 transition-colors shadow-lg">
                      <CardContent className="pt-6">
                        <h3 className="text-xl font-bold mb-4 text-secondary flex items-center gap-2">
                          <Sparkles className="h-5 w-5 animate-pulse" />
                          Our Vision
                        </h3>
                        <p className="leading-relaxed text-muted-foreground">{community.vision}</p>
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
                    <Card key={i} className="hover:border-primary/30 transition-colors shadow-md">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <p className="font-semibold">{value}</p>
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
                <h2 className="text-3xl font-bold mb-6">Key Features & Offerings</h2>
                <div className="space-y-4">
                  {community.features.map((feature: string, i: number) => (
                    <Card key={i} className="hover:border-secondary/20 transition-all shadow-md">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold">{i + 1}</span>
                          </div>
                          <p className="text-lg text-muted-foreground">{feature}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Upcoming Community Events Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pt-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Calendar className="text-primary" />
                  Upcoming Events
                </h2>
                {isAdmin && (
                  <Button size="sm" variant="outline" onClick={() => setIsAddEventOpen(true)} className="gap-1">
                    <Plus className="h-4 w-4" />
                    New Event
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="relative overflow-hidden group hover:border-primary/40 transition-all duration-300 shadow-lg">
                    {/* Event Banner */}
                    <div className="h-44 w-full bg-muted relative overflow-hidden">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                          <Calendar className="h-12 w-12 text-muted-foreground opacity-50" />
                        </div>
                      )}
                      
                      {/* Admin Quick Actions Overlay */}
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-md p-1 rounded-md border">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.preventDefault();
                              setEditingEvent(event);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteEvent(event.id, event.title);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{event.type || "Meetup"}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold line-clamp-1">{event.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-red-400" />
                          {event.location || "Online"}
                        </span>
                        
                        {event.registration_link && (
                          <a
                            href={event.registration_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                          >
                            Register
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {events.length === 0 && (
                  <div className="col-span-2 text-center py-12 border-2 border-dashed rounded-lg bg-card/20 border-primary/20">
                    <p className="text-muted-foreground">No upcoming events listed for this community.</p>
                    {isAdmin && (
                      <Button size="sm" variant="link" onClick={() => setIsAddEventOpen(true)} className="mt-2 text-primary font-semibold">
                        Add the first event now!
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Founded Year */}
            {community.founded && (
              <Card className="border-primary/10">
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

      {/* FOOTER */}
      <Footer />

      {/* Edit Community Dialog Dashboard */}
      <Dialog open={isEditCommunityOpen} onOpenChange={setIsEditCommunityOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
              <Edit className="text-primary" />
              Edit Community Profile
            </DialogTitle>
            <DialogDescription>
              Fill out community narratives, metrics, lists, and assets.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateCommunity}>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="general">1. General</TabsTrigger>
                <TabsTrigger value="socials">2. Socials & Stats</TabsTrigger>
                <TabsTrigger value="about">3. About & Vision</TabsTrigger>
                <TabsTrigger value="lists">4. Values & Bulletins</TabsTrigger>
              </TabsList>
              
              {/* Tab 1: General Info */}
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commName">Community Name *</Label>
                    <Input
                      id="commName"
                      value={communityForm.name}
                      onChange={(e) => setCommunityForm({ ...communityForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="commTagline">Tagline</Label>
                    <Input
                      id="commTagline"
                      value={communityForm.tagline}
                      onChange={(e) => setCommunityForm({ ...communityForm, tagline: e.target.value })}
                      placeholder="e.g. A DeFi community on Celo"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="commDesc">Short Card Description *</Label>
                  <Textarea
                    id="commDesc"
                    value={communityForm.description}
                    onChange={(e) => setCommunityForm({ ...communityForm, description: e.target.value })}
                    rows={2}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commLogo">Logo Image URL</Label>
                    <Input
                      id="commLogo"
                      type="url"
                      value={communityForm.logo}
                      onChange={(e) => setCommunityForm({ ...communityForm, logo: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="commCover">Hero Background Cover URL</Label>
                    <Input
                      id="commCover"
                      type="url"
                      value={communityForm.cover_image}
                      onChange={(e) => setCommunityForm({ ...communityForm, cover_image: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commCat">Category</Label>
                    <Input
                      id="commCat"
                      value={communityForm.category}
                      onChange={(e) => setCommunityForm({ ...communityForm, category: e.target.value })}
                      placeholder="DeFi, DAO, Developer, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="commTags">Tags (comma-separated)</Label>
                    <Input
                      id="commTags"
                      value={communityForm.tags}
                      onChange={(e) => setCommunityForm({ ...communityForm, tags: e.target.value })}
                      placeholder="web3, celo, builders"
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Tab 2: Socials & Stats */}
              <TabsContent value="socials" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commMembers">Member Count</Label>
                    <Input
                      id="commMembers"
                      type="number"
                      value={communityForm.member_count}
                      onChange={(e) => setCommunityForm({ ...communityForm, member_count: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="commFounded">Founded Year</Label>
                    <Input
                      id="commFounded"
                      value={communityForm.founded}
                      onChange={(e) => setCommunityForm({ ...communityForm, founded: e.target.value })}
                      placeholder="e.g. 2025"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commWeb">Website URL</Label>
                    <Input
                      id="commWeb"
                      type="url"
                      value={communityForm.website}
                      onChange={(e) => setCommunityForm({ ...communityForm, website: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="commTwitter">Twitter URL</Label>
                    <Input
                      id="commTwitter"
                      type="url"
                      value={communityForm.twitter}
                      onChange={(e) => setCommunityForm({ ...communityForm, twitter: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <Label htmlFor="commDiscord">Discord URL</Label>
                    <Input
                      id="commDiscord"
                      type="url"
                      value={communityForm.discord}
                      onChange={(e) => setCommunityForm({ ...communityForm, discord: e.target.value })}
                    />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="commTelegram">Telegram URL</Label>
                    <Input
                      id="commTelegram"
                      type="url"
                      value={communityForm.telegram}
                      onChange={(e) => setCommunityForm({ ...communityForm, telegram: e.target.value })}
                    />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="commGithub">GitHub Organization URL</Label>
                    <Input
                      id="commGithub"
                      type="url"
                      value={communityForm.github}
                      onChange={(e) => setCommunityForm({ ...communityForm, github: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Tab 3: Detailed Narratives */}
              <TabsContent value="about" className="space-y-4">
                <div>
                  <Label htmlFor="commAbout">About Section (Introductory paragraph)</Label>
                  <Textarea
                    id="commAbout"
                    value={communityForm.about}
                    onChange={(e) => setCommunityForm({ ...communityForm, about: e.target.value })}
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="commFullDesc">Full Detailed Narrative</Label>
                  <Textarea
                    id="commFullDesc"
                    value={communityForm.full_description}
                    onChange={(e) => setCommunityForm({ ...communityForm, full_description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commMission">Our Mission Statement</Label>
                    <Textarea
                      id="commMission"
                      value={communityForm.mission}
                      onChange={(e) => setCommunityForm({ ...communityForm, mission: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="commVision">Our Vision Statement</Label>
                    <Textarea
                      id="commVision"
                      value={communityForm.vision}
                      onChange={(e) => setCommunityForm({ ...communityForm, vision: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Tab 4: Lists & Bulletins */}
              <TabsContent value="lists" className="space-y-4">
                <div>
                  <Label htmlFor="commValues">Core Community Values (comma-separated)</Label>
                  <Input
                    id="commValues"
                    value={communityForm.values}
                    onChange={(e) => setCommunityForm({ ...communityForm, values: e.target.value })}
                    placeholder="Decentralization, Inclusion, Innovation"
                  />
                </div>
                
                <div>
                  <Label htmlFor="commFeatures">Key Features & Offerings (One highlight per line)</Label>
                  <Textarea
                    id="commFeatures"
                    value={communityForm.features}
                    onChange={(e) => setCommunityForm({ ...communityForm, features: e.target.value })}
                    rows={6}
                    placeholder="Technical bootcamps & developer workshops&#10;Open source grants and sponsorship programs&#10;24/7 technical support discord community"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <input
                    type="checkbox"
                    id="commPublishCheck"
                    checked={communityForm.is_published}
                    onChange={(e) => setCommunityForm({ ...communityForm, is_published: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="commPublishCheck" className="font-semibold text-sm cursor-pointer">
                    Publish this community page immediately (make visible on communities directory)
                  </Label>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-3 justify-end pt-6 mt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsEditCommunityOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="px-8">
                Save Community Profile
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Linked Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="text-primary" />
              Link New Event to {community.name}
            </DialogTitle>
            <DialogDescription>
              Create an event that will appear directly on this community page!
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <Label htmlFor="evtTitle">Event Title *</Label>
              <Input
                id="evtTitle"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="e.g. Solidity Developer Workshop"
                required
              />
            </div>
            <div>
              <Label htmlFor="evtDesc">Event Description</Label>
              <Textarea
                id="evtDesc"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Describe what builders will learn or do..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="evtDate">Date & Time *</Label>
                <Input
                  id="evtDate"
                  type="datetime-local"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="evtType">Event Type</Label>
                <Input
                  id="evtType"
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                  placeholder="Meetup, Workshop, AMAs, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="evtLoc">Location</Label>
                <Input
                  id="evtLoc"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="e.g. Zoom, Discord, Event Hall"
                />
              </div>
              <div>
                <Label htmlFor="evtReg">Registration / Event Link</Label>
                <Input
                  id="evtReg"
                  type="url"
                  value={eventForm.registration_link}
                  onChange={(e) => setEventForm({ ...eventForm, registration_link: e.target.value })}
                  placeholder="e.g. https://luma.com/event-id"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="evtImg">Banner Image URL</Label>
              <Input
                id="evtImg"
                type="url"
                value={eventForm.image_url}
                onChange={(e) => setEventForm({ ...eventForm, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddEventOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Link & Create Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Linked Event Dialog */}
      <Dialog open={editingEvent !== null} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Community Event</DialogTitle>
            <DialogDescription>Modify event details. Changes will reflect instantly.</DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <form onSubmit={handleEditEvent} className="space-y-4">
              <div>
                <Label htmlFor="editEventTitle">Event Title *</Label>
                <Input
                  id="editEventTitle"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editEventDesc">Description</Label>
                <Textarea
                  id="editEventDesc"
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editEventDate">Date & Time *</Label>
                  <Input
                    id="editEventDate"
                    type="datetime-local"
                    value={editingEvent.date ? new Date(new Date(editingEvent.date).getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editEventType">Event Type</Label>
                  <Input
                    id="editEventType"
                    value={editingEvent.type}
                    onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value })}
                    placeholder="e.g. Meetup, Workshop"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editEventLoc">Location</Label>
                  <Input
                    id="editEventLoc"
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editEventReg">Registration Link</Label>
                  <Input
                    id="editEventReg"
                    type="url"
                    value={editingEvent.registration_link || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, registration_link: e.target.value })}
                    placeholder="https://example.com/register"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editEventImg">Banner Image URL</Label>
                <Input
                  id="editEventImg"
                  type="url"
                  value={editingEvent.image_url || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, image_url: e.target.value })}
                  placeholder="https://example.com/banner.png"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingEvent(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
