import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin as MapIcon, Users, ArrowLeft, Search, Filter, ShieldAlert, Edit, PlusCircle, Trash2, Check, ExternalLink, RefreshCw, Star, Info, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useMemo, useEffect } from "react";
import { MetaTags } from "@/components/MetaTags";
import { Link, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { scrapeSideEventsList } from "@/utils/frontend-scraper";
import { Badge } from "@/components/ui/badge";

export default function EventGroupDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [venueFilter, setVenueFilter] = useState<string>("");
  const [groupData, setGroupData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAdmin();
  const { user } = useAuth();

  // Dialog open states
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isScrapeDialogOpen, setIsScrapeDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  // Scraper states
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedEvents, setScrapedEvents] = useState<any[]>([]);
  const [selectedScrapedIndexes, setSelectedScrapedIndexes] = useState<number[]>([]);

  // Master Group Edit Form State
  const [groupForm, setGroupForm] = useState({
    groupName: "",
    description: "",
    bannerImage: "",
    location: "",
    startDate: "",
    endDate: "",
    isFeatured: false,
    status: "draft" as "draft" | "published"
  });

  // Single Manual Event Form State
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    type: "meetup",
    registrationLink: "",
    imageUrl: ""
  });

  const fetchGroupAndEvents = async () => {
    if (!slug) return;
    try {
      // 1. Fetch group details
      const { data: group, error: groupError } = await supabase
        .from('event_groups')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (groupError) throw groupError;

      // 2. Fetch all events for this group (Admins see both approved and pending side events)
      let eventsQuery = supabase
        .from('events')
        .select('*')
        .eq('event_group_id', group.id);
      
      if (!isAdmin) {
        eventsQuery = eventsQuery.eq('is_approved', true);
      }

      const { data: events, error: eventsError } = await eventsQuery.order('date', { ascending: true });
      
      if (eventsError) throw eventsError;

      setGroupData({
        ...group,
        events: events || []
      });

      // Populate Master Group Form
      setGroupForm({
        groupName: group.group_name || "",
        description: group.description || "",
        bannerImage: group.banner_image || "",
        location: group.location || "",
        startDate: group.start_date ? new Date(Number(group.start_date)).toISOString().split('T')[0] : "",
        endDate: group.end_date ? new Date(Number(group.end_date)).toISOString().split('T')[0] : "",
        isFeatured: group.is_featured || false,
        status: group.status || "draft"
      });
    } catch (error) {
      console.error("Error fetching event group detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupAndEvents();
  }, [slug, isAdmin]);

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
    const start = new Date(Number(startDate));
    const end = new Date(Number(endDate));
    const startStr = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  // Administrative Handlers
  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const { error } = await supabase
        .from('event_groups')
        .update({
          group_name: groupForm.groupName.trim(),
          description: groupForm.description.trim(),
          banner_image: groupForm.bannerImage.trim() || null,
          location: groupForm.location.trim(),
          start_date: groupForm.startDate ? new Date(groupForm.startDate).getTime() : Date.now(),
          end_date: groupForm.endDate ? new Date(groupForm.endDate).getTime() : Date.now() + 86400000,
          is_featured: groupForm.isFeatured,
          status: groupForm.status,
        })
        .eq('id', groupData.id);

      if (error) throw error;

      toast.success("✨ Master event group updated!");
      setIsEditGroupOpen(false);
      fetchGroupAndEvents();
    } catch (err: any) {
      toast.error(err.message || "Failed to update event group");
    }
  };

  const handleTogglePublish = async () => {
    try {
      const newStatus = groupData.status === "published" ? "draft" : "published";
      const { error } = await supabase
        .from('event_groups')
        .update({ status: newStatus })
        .eq('id', groupData.id);

      if (error) throw error;

      toast.success(newStatus === "published" ? "✅ Live / Published!" : "📝 Moved to Drafts");
      fetchGroupAndEvents();
    } catch (err: any) {
      toast.error(err.message || "Failed to update publication status");
    }
  };

  const handleManualAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const parsedMs = new Date(eventForm.date).getTime();
      if (isNaN(parsedMs)) throw new Error("Invalid event date");

      const { error } = await supabase
        .from('events')
        .insert({
          title: eventForm.title.trim(),
          description: eventForm.description.trim(),
          date: parsedMs,
          location: eventForm.location.trim(),
          type: eventForm.type,
          registration_link: eventForm.registrationLink.trim() || null,
          image: eventForm.imageUrl.trim() || null,
          event_group_id: groupData.id,
          wallet_address: user.wallet_address,
          is_approved: true // Auto-approved by Admin
        });

      if (error) throw error;

      toast.success("✅ Side event manually linked and created!");
      setIsAddEventOpen(false);
      setEventForm({
        title: "",
        description: "",
        date: "",
        location: "",
        type: "meetup",
        registrationLink: "",
        imageUrl: ""
      });
      fetchGroupAndEvents();
    } catch (err: any) {
      toast.error(err.message || "Failed to create side event");
    }
  };

  const handleUpdateSideEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      const parsedMs = new Date(editingEvent.date).getTime();
      if (isNaN(parsedMs)) throw new Error("Invalid date");

      const { error } = await supabase
        .from('events')
        .update({
          title: editingEvent.title.trim(),
          description: editingEvent.description.trim(),
          date: parsedMs,
          location: editingEvent.location.trim(),
          type: editingEvent.type,
          registration_link: editingEvent.registration_link || null,
          image: editingEvent.image || null,
        })
        .eq('id', editingEvent.id);

      if (error) throw error;

      toast.success("✅ Side event updated successfully!");
      setEditingEvent(null);
      fetchGroupAndEvents();
    } catch (err: any) {
      toast.error(err.message || "Failed to update event");
    }
  };

  const handleApproveSideEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_approved: true })
        .eq('id', eventId);

      if (error) throw error;

      toast.success("✅ Side event approved!");
      fetchGroupAndEvents();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve side event");
    }
  };

  const handleDeleteSideEvent = async (eventId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success("🗑️ Side event deleted!");
      fetchGroupAndEvents();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete side event");
    }
  };

  // Bulk Scraper Actions
  const handleBulkScrape = async () => {
    if (!scrapeUrl.trim()) {
      toast.error("Please enter a listings URL");
      return;
    }
    
    setIsScraping(true);
    setScrapedEvents([]);
    setSelectedScrapedIndexes([]);
    
    try {
      const list = await scrapeSideEventsList(scrapeUrl.trim());
      if (list.length === 0) {
        toast.warning("Could not find any side events on this page. Try a different schedule list URL!");
      } else {
        setScrapedEvents(list);
        setSelectedScrapedIndexes(list.map((_, i) => i)); // Check all by default
        toast.success(`✨ Discovered ${list.length} side events!`);
      }
    } catch (err: any) {
      toast.error(err.message || "Bulk scraping failed");
    } finally {
      setIsScraping(false);
    }
  };

  const handleImportSelectedSideEvents = async () => {
    if (selectedScrapedIndexes.length === 0) {
      toast.error("Please select at least one side event to import");
      return;
    }

    try {
      const toImport = scrapedEvents.filter((_, idx) => selectedScrapedIndexes.includes(idx));
      
      const payload = toImport.map(evt => {
        const parsedMs = isNaN(new Date(evt.date).getTime()) ? (Date.now() + 86400000) : new Date(evt.date).getTime();
        return {
          title: evt.title,
          description: evt.description,
          date: parsedMs,
          location: evt.location || "Venue TBA",
          type: evt.type || "Side Event",
          registration_link: evt.registration_link || null,
          image: evt.image_url || null,
          event_group_id: groupData.id,
          wallet_address: user?.wallet_address || null,
          is_approved: true
        };
      });

      const { error } = await supabase.from('events').insert(payload);
      if (error) throw error;

      toast.success(`✨ Successfully imported ${payload.length} side events!`);
      setIsScrapeDialogOpen(false);
      setScrapedEvents([]);
      fetchGroupAndEvents();
    } catch (err: any) {
      toast.error(err.message || "Failed to import side events");
    }
  };

  if (loading || !groupData) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading event guide...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <MetaTags
        title={`${groupData.group_name} Guide | Side Events | Apna Coding`}
        description={groupData.description}
        image={groupData.banner_image || undefined}
        url={`${window.location.origin}/event-groups/${slug}`}
      />
      <Navbar />

      {/* Floating Admin Controls */}
      {isAdmin && (
        <div className="bg-primary/10 border-b border-primary/20 sticky top-16 z-30 backdrop-blur-md">
          <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary animate-pulse" />
              <span className="font-semibold text-sm">👑 Guide Admin Hub:</span>
              <Badge variant={groupData.status === "published" ? "default" : "secondary"}>
                {groupData.status === "published" ? "🟢 Published" : "📝 Draft Guide"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleTogglePublish} className="h-8">
                {groupData.status === "published" ? "Move to Drafts" : "Publish to Live"}
              </Button>
              
              <Button size="sm" variant="outline" onClick={() => setIsEditGroupOpen(true)} className="h-8 gap-1">
                <Edit className="h-3.5 w-3.5" />
                Edit Master
              </Button>

              <Button size="sm" variant="outline" onClick={() => setIsScrapeDialogOpen(true)} className="h-8 gap-1 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/30">
                <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                AI Scrape Side Events
              </Button>
              
              <Button size="sm" onClick={() => setIsAddEventOpen(true)} className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                Add Side Event
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* Banner Section */}
        <section className="relative">
          {groupData.banner_image ? (
            <div className="relative h-96 overflow-hidden">
              <img
                src={groupData.banner_image}
                alt={groupData.group_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />

              <div className="absolute inset-0 flex items-end">
                <div className="max-w-7xl mx-auto px-4 pb-8 w-full">
                  <Link to="/event-groups">
                    <Button variant="ghost" className="mb-4 text-white hover:text-white/90">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Event Guides
                    </Button>
                  </Link>

                  <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
                    {groupData.group_name}
                  </h1>

                  <div className="flex flex-wrap gap-4 text-white/95">
                    <div className="flex items-center bg-black/30 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                      <MapIcon className="h-4 w-4 mr-2 text-red-400" />
                      <span>{groupData.location}</span>
                    </div>
                    <div className="flex items-center bg-black/30 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                      <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                      <span>{formatDateRange(groupData.start_date, groupData.end_date)}</span>
                    </div>
                    <div className="flex items-center bg-black/30 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                      <Users className="h-4 w-4 mr-2 text-secondary" />
                      <span className="font-semibold">{groupData.events?.length || 0} Side Events</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary/15 to-secondary/15 py-20 border-b">
              <div className="max-w-7xl mx-auto px-4">
                <Link to="/event-groups">
                  <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Event Guides
                  </Button>
                </Link>

                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
                  {groupData.group_name}
                </h1>

                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <div className="flex items-center">
                    <MapIcon className="h-5 w-5 mr-2 text-red-500" />
                    <span>{groupData.location}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                    <span>{formatDateRange(groupData.start_date, groupData.end_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-secondary" />
                    <span className="font-semibold">{groupData.events?.length || 0} Side Events</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Master Description */}
        <section className="py-10 px-4 border-b bg-card/20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">About the Guide</h2>
            <p className="text-xl text-muted-foreground max-w-5xl leading-relaxed whitespace-pre-line">
              {groupData.description}
            </p>
          </div>
        </section>

        {/* Filter Toolbar */}
        <section className="py-8 px-4 bg-muted/30 sticky top-28 z-20 backdrop-blur-md border-b">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Filter Side Events</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search titles, venues, descriptions..."
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
                placeholder="Filter by specific venue..."
                value={venueFilter}
                onChange={(e) => setVenueFilter(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Side Events Grid */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 border border-dashed rounded-xl bg-card/10"
              >
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
                <h3 className="text-2xl font-bold mb-2">No side events found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || categoryFilter !== "all" || venueFilter
                    ? "Try adjusting your filter settings above"
                    : "Side events schedule is currently being compiled."}
                </p>
                {isAdmin && (
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => setIsAddEventOpen(true)}>
                      Add Manual Side Event
                    </Button>
                    <Button variant="outline" onClick={() => setIsScrapeDialogOpen(true)} className="gap-1 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10">
                      <RefreshCw className="h-4 w-4" />
                      Bulk Scrape Schedule
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-muted-foreground text-sm font-semibold">
                    Displaying {filteredEvents.length} of {groupData.events?.length || 0} scheduled side events
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                    >
                      <Card className="h-full flex flex-col justify-between overflow-hidden relative group hover:border-primary/40 hover:shadow-xl transition-all duration-300">
                        {/* Status Check for Admin */}
                        {!event.is_approved && (
                          <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md animate-pulse">
                            <Info className="h-3 w-3" />
                            Pending Approval
                          </div>
                        )}

                        {/* Banner Image */}
                        <div className="h-44 w-full bg-muted relative overflow-hidden">
                          {event.image ? (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                              <CalendarIcon className="h-10 w-10 text-muted-foreground opacity-40" />
                            </div>
                          )}

                          {/* Admin controls */}
                          {isAdmin && (
                            <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1 rounded-md border">
                              {!event.is_approved && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleApproveSideEvent(event.id);
                                  }}
                                  className="h-8 w-8 p-0"
                                  title="Approve side event"
                                >
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setEditingEvent({
                                    ...event,
                                    date: event.date ? new Date(Number(event.date) - new Date().getTimezoneOffset()*60000).toISOString().slice(0, 16) : ""
                                  });
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
                                  handleDeleteSideEvent(event.id, event.title);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <CardContent className="pt-4 flex flex-col justify-between flex-1 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-[10px] font-semibold bg-secondary/5 border-secondary/20">
                                {event.type || "Side Event"}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold">
                                <CalendarIcon className="h-3 w-3" />
                                {new Date(Number(event.date)).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>

                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                              {event.title}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                              {event.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t flex items-center justify-between text-xs mt-auto">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <MapIcon className="h-3.5 w-3.5 text-red-400" />
                              <span className="truncate max-w-[150px]">{event.location || "Venue TBA"}</span>
                            </span>

                            {event.registration_link && (
                              <a
                                href={event.registration_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary font-bold hover:underline flex items-center gap-1.5"
                              >
                                Register
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Dialog: Edit Master Event */}
      <Dialog open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
              <Edit className="text-primary" />
              Edit Guide Master details
            </DialogTitle>
            <DialogDescription>Modify event guides, dates, and locations.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateGroup} className="space-y-4">
            <div>
              <Label htmlFor="mstrName">Master Event Name *</Label>
              <Input
                id="mstrName"
                value={groupForm.groupName}
                onChange={(e) => setGroupForm({ ...groupForm, groupName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="mstrDesc">Description *</Label>
              <Textarea
                id="mstrDesc"
                value={groupForm.description}
                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mstrLoc">Location *</Label>
                <Input
                  id="mstrLoc"
                  value={groupForm.location}
                  onChange={(e) => setGroupForm({ ...groupForm, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mstrBanner">Banner Image URL</Label>
                <Input
                  id="mstrBanner"
                  type="url"
                  value={groupForm.bannerImage}
                  onChange={(e) => setGroupForm({ ...groupForm, bannerImage: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mstrStart">Start Date *</Label>
                <Input
                  id="mstrStart"
                  type="date"
                  value={groupForm.startDate}
                  onChange={(e) => setGroupForm({ ...groupForm, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mstrEnd">End Date *</Label>
                <Input
                  id="mstrEnd"
                  type="date"
                  value={groupForm.endDate}
                  onChange={(e) => setGroupForm({ ...groupForm, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="mstrFeatured"
                checked={groupForm.isFeatured}
                onChange={(e) => setGroupForm({ ...groupForm, isFeatured: e.target.checked })}
                className="h-4 w-4 rounded"
              />
              <Label htmlFor="mstrFeatured" className="font-semibold cursor-pointer">Mark as Featured Guide</Label>
            </div>

            <div>
              <Label htmlFor="mstrStatus">Status</Label>
              <select
                id="mstrStatus"
                value={groupForm.status}
                onChange={(e) => setGroupForm({ ...groupForm, status: e.target.value as "draft" | "published" })}
                className="w-full border rounded-md p-2"
              >
                <option value="draft">Draft Guide</option>
                <option value="published">Published Live</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsEditGroupOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Master Details
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Add Side Event Manually */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="text-primary" />
              Add Manual Side Event
            </DialogTitle>
            <DialogDescription>Manually draft and link a side event to this guide.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleManualAddEvent} className="space-y-4">
            <div>
              <Label htmlFor="sTitle">Side Event Title *</Label>
              <Input
                id="sTitle"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="e.g. Celo Hacker Lounge"
                required
              />
            </div>
            <div>
              <Label htmlFor="sDesc">Description *</Label>
              <Textarea
                id="sDesc"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Details about what builders will do..."
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sDate">Date & Time *</Label>
                <Input
                  id="sDate"
                  type="datetime-local"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sType">Type</Label>
                <Input
                  id="sType"
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                  placeholder="Meetup, Hacker House, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sLoc">Venue Location *</Label>
                <Input
                  id="sLoc"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="e.g. Hacker Villa 4"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sReg">Registration Link</Label>
                <Input
                  id="sReg"
                  type="url"
                  value={eventForm.registrationLink}
                  onChange={(e) => setEventForm({ ...eventForm, registrationLink: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sImg">Side Event Banner Image URL</Label>
              <Input
                id="sImg"
                type="url"
                value={eventForm.imageUrl}
                onChange={(e) => setEventForm({ ...eventForm, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddEventOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Link Side Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: AI Bulk Scraper side events */}
      <Dialog open={isScrapeDialogOpen} onOpenChange={setIsScrapeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
              <RefreshCw className="text-yellow-500 animate-spin-slow" />
              AI Schedule Scraper & Bulk Linker
            </DialogTitle>
            <DialogDescription>
              Drop a link to an external conference guide, Luma schedule, or list of side events. The AI scraper will heuristically discover all events and parse them for bulk approval!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="scrapLink" className="sr-only">Scraping Link</Label>
                <Input
                  id="scrapLink"
                  type="url"
                  placeholder="e.g., https://ethereumsideevents.com/schedule"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                />
              </div>
              <Button onClick={handleBulkScrape} disabled={isScraping} className="bg-yellow-500 text-black hover:bg-yellow-600 font-semibold gap-1.5">
                {isScraping ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Scraping List...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Start Scrape
                  </>
                )}
              </Button>
            </div>

            {/* Checklist Scraped Events */}
            {scrapedEvents.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex flex-wrap justify-between items-center pb-2 border-b gap-3">
                  <div>
                    <span className="text-sm font-bold text-primary">Import Checkroom:</span>
                    <p className="text-xs text-muted-foreground">Select, verify, and modify side events in bulk before saving</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedScrapedIndexes(scrapedEvents.map((_, i) => i))} className="h-7 text-xs">Check All</Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedScrapedIndexes([])} className="h-7 text-xs">Clear Check</Button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                  {scrapedEvents.map((event, index) => {
                    const isChecked = selectedScrapedIndexes.includes(index);
                    return (
                      <Card key={index} className={`border ${isChecked ? 'border-primary/50 bg-primary/5 shadow-md' : 'border-muted'} transition-all duration-300`}>
                        <CardContent className="p-4 flex gap-3 items-start">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedScrapedIndexes(selectedScrapedIndexes.filter(i => i !== index));
                              } else {
                                setSelectedScrapedIndexes([...selectedScrapedIndexes, index]);
                              }
                            }}
                            className="mt-2.5 h-4 w-4 rounded border-muted text-primary focus:ring-primary cursor-pointer"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <Input
                                value={event.title}
                                onChange={(e) => {
                                  const updated = [...scrapedEvents];
                                  updated[index].title = e.target.value;
                                  setScrapedEvents(updated);
                                }}
                                className="h-8 font-semibold py-1 bg-background border-primary/20 text-sm focus-visible:ring-1"
                                placeholder="Event Title"
                              />
                              <Badge className="h-6 flex-shrink-0 self-center">Heuristic Scraped</Badge>
                            </div>
                            <Textarea
                              value={event.description}
                              onChange={(e) => {
                                const updated = [...scrapedEvents];
                                updated[index].description = e.target.value;
                                setScrapedEvents(updated);
                              }}
                              className="text-xs text-muted-foreground p-2 bg-background min-h-[45px] border-primary/10"
                              placeholder="Event Description"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-[10px] text-muted-foreground font-semibold">Parsed Date / Time</Label>
                                <Input
                                  value={event.date}
                                  onChange={(e) => {
                                    const updated = [...scrapedEvents];
                                    updated[index].date = e.target.value;
                                    setScrapedEvents(updated);
                                  }}
                                  className="h-7 text-xs bg-background py-1"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground font-semibold">Location / Venue</Label>
                                <Input
                                  value={event.location}
                                  onChange={(e) => {
                                    const updated = [...scrapedEvents];
                                    updated[index].location = e.target.value;
                                    setScrapedEvents(updated);
                                  }}
                                  className="h-7 text-xs bg-background py-1"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Button onClick={handleImportSelectedSideEvents} className="w-full py-6 font-bold text-base flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Import & Save Selected Side Events ({selectedScrapedIndexes.length})
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit Side Event Details */}
      <Dialog open={editingEvent !== null} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Side Event details</DialogTitle>
            <DialogDescription>Modify timings, titles, or locations instantly.</DialogDescription>
          </DialogHeader>

          {editingEvent && (
            <form onSubmit={handleUpdateSideEvent} className="space-y-4">
              <div>
                <Label htmlFor="edtSTitle">Event Title *</Label>
                <Input
                  id="edtSTitle"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edtSDesc">Description *</Label>
                <Textarea
                  id="edtSDesc"
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edtSDate">Date & Time *</Label>
                  <Input
                    id="edtSDate"
                    type="datetime-local"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edtSType">Event Type</Label>
                  <Input
                    id="edtSType"
                    value={editingEvent.type}
                    onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edtSLoc">Location *</Label>
                  <Input
                    id="edtSLoc"
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edtSReg">Registration / Event URL</Label>
                  <Input
                    id="edtSReg"
                    type="url"
                    value={editingEvent.registration_link || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, registration_link: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edtSImg">Cover Image URL</Label>
                <Input
                  id="edtSImg"
                  type="url"
                  value={editingEvent.image || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, image: e.target.value })}
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
