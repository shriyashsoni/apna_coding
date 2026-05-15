import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  Trash2,
  Star,
  Eye,
  Calendar,
  Trophy,
  Briefcase,
  Newspaper,
  Package,
  MessageSquare,
  MoreVertical,
  Loader2,
  CheckCircle2,
  XCircle,
  Database,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type ContentType = "event" | "hackathon" | "job" | "news" | "product" | "community";

interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  slug?: string;
  category?: string;
}

export function GlobalContentExplorer() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ContentType | "all">("all");
  const [showOnlyApproved, setShowOnlyApproved] = useState(false);

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const [
        { data: events },
        { data: hackathons },
        { data: jobs },
        { data: news },
        { data: products },
        { data: communities },
      ] = await Promise.all([
        supabase.from("events").select("id, title, description, is_approved, is_featured, created_at"),
        supabase.from("hackathons").select("id, title, description, is_approved, is_featured, created_at, slug"),
        supabase.from("jobs").select("id, title, company, is_approved, is_featured, created_at"),
        supabase.from("news").select("id, title, excerpt, is_approved, is_published, is_featured, created_at, slug, category"),
        supabase.from("products").select("id, name, description, status, is_featured, created_at, slug, category"),
        supabase.from("communities").select("id, name, description, is_published, is_featured, created_at, slug, category"),
      ]);

      const unified: ContentItem[] = [
        ...(events || []).map((i) => ({ ...i, type: "event" as const, title: i.title })),
        ...(hackathons || []).map((i) => ({ ...i, type: "hackathon" as const, title: i.title })),
        ...(jobs || []).map((i) => ({ ...i, type: "job" as const, title: `${i.title} @ ${i.company}` })),
        ...(news || []).map((i) => ({ 
          ...i, 
          type: "news" as const, 
          title: i.title, 
          description: i.excerpt, 
          is_approved: i.is_approved || i.is_published 
        })),
        ...(products || []).map((i) => ({ 
          ...i, 
          type: "product" as const, 
          title: i.name, 
          is_approved: i.status === 'approved' 
        })),
        ...(communities || []).map((i) => ({ 
          ...i, 
          type: "community" as const, 
          title: i.name, 
          is_approved: i.is_published 
        })),
      ];

      // Sort by created_at desc
      unified.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setItems(unified);
    } catch (err) {
      console.error("Error fetching unified content:", err);
      toast.error("Failed to load content library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  const handleToggleFeatured = async (item: ContentItem) => {
    try {
      const table = getTableForType(item.type);
      const { error } = await supabase
        .from(table)
        .update({ is_featured: !item.is_featured })
        .eq("id", item.id);

      if (error) throw error;
      
      setItems(prev => prev.map(i => (i.id === item.id && i.type === item.type) ? { ...i, is_featured: !i.is_featured } : i));
      toast.success(`${item.title} is now ${!item.is_featured ? 'featured' : 'unfeatured'}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update featured status");
    }
  };

  const handleDelete = async (item: ContentItem) => {
    if (!window.confirm(`Are you sure you want to delete this ${item.type}?`)) return;
    
    try {
      const table = getTableForType(item.type);
      const { error } = await supabase.from(table).delete().eq("id", item.id);
      if (error) throw error;
      
      setItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
      toast.success("Item deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    }
  };

  const getTableForType = (type: ContentType) => {
    switch (type) {
      case "event": return "events";
      case "hackathon": return "hackathons";
      case "job": return "jobs";
      case "news": return "news";
      case "product": return "products";
      case "community": return "communities";
    }
  };

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case "event": return <Calendar className="h-4 w-4" />;
      case "hackathon": return <Trophy className="h-4 w-4" />;
      case "job": return <Briefcase className="h-4 w-4" />;
      case "news": return <Newspaper className="h-4 w-4" />;
      case "product": return <Package className="h-4 w-4" />;
      case "community": return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (item.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesApproval = !showOnlyApproved || item.is_approved;
    return matchesSearch && matchesType && matchesApproval;
  });

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Global Content Library (Master Manager)
          </CardTitle>
          <CardDescription>
            Unified management for all approved and pending content across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search everything..."
                className="pl-9 bg-background/50 border-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {(["all", "event", "hackathon", "job", "news", "product", "community"] as const).map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-6 border border-primary/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  id="approved-only" 
                  checked={showOnlyApproved} 
                  onCheckedChange={setShowOnlyApproved} 
                />
                <Label htmlFor="approved-only" className="text-sm cursor-pointer">
                  Show Only Approved/Published
                </Label>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Showing {filteredItems.length} of {items.length} items
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Loading master content library...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-primary/10 rounded-xl">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">No content found</p>
              </div>
            ) : (
              <div className="grid gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={`${item.type}-${item.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-lg border border-primary/10 transition-all"
                    >
                      <div className="flex-1 flex items-start gap-4">
                        <div className={`p-2 rounded-lg bg-primary/10 text-primary`}>
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-semibold text-lg">{item.title}</h4>
                            <Badge variant="outline" className="capitalize text-[10px]">
                              {item.type}
                            </Badge>
                            {item.is_approved ? (
                              <Badge variant="default" className="bg-green-500/20 text-green-500 hover:bg-green-500/30 text-[10px] border-green-500/30">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] opacity-70">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                            {item.is_featured && (
                              <Badge variant="default" className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 text-[10px] border-yellow-500/30">
                                <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 max-w-2xl">
                            {item.description || "No description available"}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-mono">
                            <span>ID: {item.id.slice(0, 8)}...</span>
                            <span>•</span>
                            <span>Added: {new Date(item.created_at).toLocaleDateString()}</span>
                            {item.slug && (
                              <>
                                <span>•</span>
                                <span className="text-primary/70">/{item.slug}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                        <div className="flex items-center gap-2 mr-4 bg-background/40 p-2 rounded-lg border border-primary/5">
                          <Switch 
                            id={`feature-${item.id}`} 
                            checked={item.is_featured} 
                            onCheckedChange={() => handleToggleFeatured(item)}
                          />
                          <Label htmlFor={`feature-${item.id}`} className="text-xs cursor-pointer whitespace-nowrap">
                            Feature
                          </Label>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          title="View on site"
                          onClick={() => {
                             const urlMap: Record<ContentType, string> = {
                               event: `/events`,
                               hackathon: `/hackathons`,
                               job: `/jobs`,
                               news: `/news/${item.slug}`,
                               product: `/products`,
                               community: `/community/${item.slug}`
                             };
                             window.open(urlMap[item.type], "_blank");
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          title="Delete"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
