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
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { uploadRemoteImageToSupabase } from "@/utils/image-uploader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageEditItem, setImageEditItem] = useState<ContentItem | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [mirrorToStorage, setMirrorToStorage] = useState(false);

  // Storage folder per type for mirrored images (matches uploadRemoteImageToSupabase)
  const folderForType = (type: ContentType): "events" | "hackathons" | "news" => {
    switch (type) {
      case "hackathon": return "hackathons";
      case "news": return "news";
      default: return "events";
    }
  };

  // Confirm a mirrored URL actually decodes as an image before writing it to a record
  const imageDecodes = (url: string) => new Promise<boolean>((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(false), 8000);
    img.onload = () => { clearTimeout(timer); resolve(true); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = url;
  });

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      console.log("Fetching unified content library...");
      
      const [
        eventsRes,
        hackathonsRes,
        jobsRes,
        newsRes,
        productsRes,
        communitiesRes,
      ] = await Promise.all([
        supabase.from("events").select("id, title, description, is_approved, is_featured, created_at"),
        supabase.from("hackathons").select("id, title, name, description, is_approved, is_featured, created_at, slug"),
        supabase.from("jobs").select("id, title, company, is_approved, is_featured, created_at"),
        supabase.from("news").select("id, title, is_approved, is_published, is_featured, created_at, slug, category"),
        supabase.from("products").select("id, name, description, status, is_featured, created_at, slug, category"),
        supabase.from("communities").select("id, name, description, is_published, is_featured, created_at, slug, category"),
      ]);

      if (eventsRes.error) console.error("Events fetch error:", eventsRes.error);
      if (hackathonsRes.error) console.error("Hackathons fetch error:", hackathonsRes.error);
      if (jobsRes.error) console.error("Jobs fetch error:", jobsRes.error);
      if (newsRes.error) console.error("News fetch error:", newsRes.error);
      if (productsRes.error) console.error("Products fetch error:", productsRes.error);
      if (communitiesRes.error) console.error("Communities fetch error:", communitiesRes.error);

      const eventsData = eventsRes.data || [];
      const hackathonsData = hackathonsRes.data || [];
      const jobsData = jobsRes.data || [];
      const newsData = newsRes.data || [];
      const productsData = productsRes.data || [];
      const communitiesData = communitiesRes.data || [];

      const unified: ContentItem[] = [
        ...eventsData.map((i: any) => ({ 
          id: i.id,
          type: "event" as const, 
          title: i.title || "Untitled Event",
          description: i.description,
          is_approved: !!i.is_approved,
          is_featured: !!i.is_featured,
          created_at: i.created_at
        })),
        ...hackathonsData.map((i: any) => ({ 
          id: i.id,
          type: "hackathon" as const, 
          title: i.title || i.name || "Untitled Hackathon",
          description: i.description,
          is_approved: !!i.is_approved,
          is_featured: !!i.is_featured,
          created_at: i.created_at,
          slug: i.slug
        })),
        ...jobsData.map((i: any) => ({ 
          id: i.id,
          type: "job" as const, 
          title: i.title ? `${i.title} @ ${i.company || 'Unknown'}` : "Untitled Job",
          is_approved: !!i.is_approved,
          is_featured: !!i.is_featured,
          created_at: i.created_at
        })),
        ...newsData.map((i: any) => ({ 
          id: i.id,
          type: "news" as const, 
          title: i.title || "Untitled News", 
          description: undefined, 
          is_approved: !!(i.is_approved || i.is_published),
          is_featured: !!i.is_featured,
          created_at: i.created_at,
          slug: i.slug,
          category: i.category
        })),
        ...productsData.map((i: any) => ({ 
          id: i.id,
          type: "product" as const, 
          title: i.name || "Untitled Product", 
          description: i.description, 
          is_approved: i.status === 'approved',
          is_featured: !!i.is_featured,
          created_at: i.created_at,
          slug: i.slug,
          category: i.category
        })),
        ...communitiesData.map((i: any) => ({ 
          id: i.id,
          type: "community" as const, 
          title: i.name || "Untitled Community", 
          description: i.description, 
          is_approved: !!i.is_published,
          is_featured: !!i.is_featured,
          created_at: i.created_at,
          slug: i.slug,
          category: i.category
        })),
      ];

      unified.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      
      setItems(unified);
    } catch (err) {
      console.error("Critical error in content library:", err);
      toast.error("Critical error loading library. See console.");
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

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const table = getTableForType(itemToDelete.type);
      const { error } = await supabase.from(table).delete().eq("id", itemToDelete.id);
      if (error) throw error;
      
      setItems(prev => prev.filter(i => !(i.id === itemToDelete.id && i.type === itemToDelete.type)));
      toast.success("Item deleted successfully");
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  // Image-capable types and their live DB image columns (mirrored where the
  // schema keeps two: events image+image_url, news cover_image+image_url)
  const imageColumnsForType = (type: ContentType): string[] => {
    switch (type) {
      case "event": return ["image", "image_url"];
      case "hackathon": return ["image"];
      case "news": return ["cover_image", "image_url"];
      default: return [];
    }
  };

  const canEditImage = (type: ContentType) => imageColumnsForType(type).length > 0;

  const handleSaveImage = async () => {
    if (!imageEditItem) return;
    const url = imageUrlInput.trim();
    if (!url) {
      toast.error("Please enter an image URL");
      return;
    }
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    setIsSavingImage(true);
    try {
      let finalUrl = url;
      if (mirrorToStorage) {
        // Copy the remote image into our own Supabase storage via the existing
        // client-side uploader (same-origin URL sidesteps cross-origin CDN blocks).
        const mirrored = await uploadRemoteImageToSupabase(url, folderForType(imageEditItem.type));
        if (!mirrored.includes("supabase.co/storage")) {
          toast.error("Mirror failed: the image could not be fetched. The record was left unchanged.");
          return;
        }
        if (!(await imageDecodes(mirrored))) {
          toast.error("Mirror failed: the stored file is not a displayable image. The record was left unchanged.");
          return;
        }
        finalUrl = mirrored;
      }
      const table = getTableForType(imageEditItem.type);
      const updates = Object.fromEntries(imageColumnsForType(imageEditItem.type).map(c => [c, finalUrl]));
      const { error } = await supabase.from(table).update(updates).eq("id", imageEditItem.id);
      if (error) throw error;
      toast.success(`Image updated for "${imageEditItem.title}"`);
      setImageEditItem(null);
      setImageUrlInput("");
      setMirrorToStorage(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update image");
    } finally {
      setIsSavingImage(false);
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
                        
                        {canEditImage(item.type) && (
                          <Button
                            variant="outline"
                            size="sm"
                            title="Edit image"
                            onClick={() => {
                              setImageEditItem(item);
                              setImageUrlInput("");
                            }}
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          title="Delete"
                          onClick={() => setItemToDelete(item)}
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

      {/* In-page delete confirmation (replaces native window.confirm, which
          blocks automation and wedges the admin session) */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && !isDeleting && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {itemToDelete?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              "{itemToDelete?.title}" will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image editor: set/replace the listing image without delete+repost */}
      <Dialog open={!!imageEditItem} onOpenChange={(open) => !open && setImageEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit image</DialogTitle>
            <DialogDescription>
              Set the image URL for "{imageEditItem?.title}". The listing updates in place - no need to delete and repost.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="url"
            placeholder="https://example.com/image.png"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
          />
          <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={mirrorToStorage}
              onChange={(e) => setMirrorToStorage(e.target.checked)}
              disabled={isSavingImage}
            />
            <span>
              Mirror to site storage before saving. Copies the image into our own storage
              (via the existing client-side uploader) so listings do not break when a
              third-party CDN blocks cross-origin loading. Recommended for images hosted
              on cdn.ethglobal.com or other blocked CDNs.
            </span>
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageEditItem(null)} disabled={isSavingImage}>Cancel</Button>
            <Button onClick={handleSaveImage} disabled={isSavingImage}>
              {isSavingImage ? (mirrorToStorage ? "Mirroring..." : "Saving...") : "Save image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
