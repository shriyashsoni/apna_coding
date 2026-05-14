import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Sparkles, Edit, Trash2, Eye, Globe, Loader2, Power, Link as LinkIcon, Star } from "lucide-react";
import { Link } from "react-router";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { scrapeContentDirectly } from "@/utils/frontend-scraper";

export function CommunityPagesManager() {
  const { user: authUser } = useAuth();
  const address = authUser?.wallet_address;
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enhancingId, setEnhancingId] = useState<string>("");
  const [communityUrl, setCommunityUrl] = useState("");
  const [isScrapingLink, setIsScrapingLink] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);

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
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    coverImage: "",
    logo: "",
    website: "",
    twitter: "",
    discord: "",
    telegram: "",
    github: "",
    category: "",
    tags: "",
    memberCount: "",
    founded: "",
    isPublished: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!formData.name || !formData.slug || !formData.description) {
      toast.error("Name, slug, and description are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('communities').insert({
        name: formData.name,
        slug: formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        tagline: formData.tagline || null,
        description: formData.description,
        cover_image: formData.coverImage || null,
        logo: formData.logo || null,
        website: formData.website || null,
        twitter: formData.twitter || null,
        discord: formData.discord || null,
        telegram: formData.telegram || null,
        github: formData.github || null,
        category: formData.category || null,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
        member_count: formData.memberCount ? parseInt(formData.memberCount) : 0,
        founded: formData.founded || null,
        is_published: formData.isPublished,
        wallet_address: address,
      });

      if (error) throw error;

      toast.success(`Community "${formData.name}" created!`);
      setIsOpen(false);
      setFormData({
        name: "",
        slug: "",
        tagline: "",
        description: "",
        coverImage: "",
        logo: "",
        website: "",
        twitter: "",
        discord: "",
        telegram: "",
        github: "",
        category: "",
        tags: "",
        memberCount: "",
        founded: "",
        isPublished: false,
      });
      fetchCommunities();
    } catch (error: any) {
      toast.error(error.message || "Failed to create community");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnhance = async (communityId: string) => {
    toast.info("AI enhancement logic needs to be migrated to Supabase Edge Functions");
  };

  const handleDelete = async (communityId: string, name: string) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!confirm(`Delete "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase.from('communities').delete().eq('id', communityId);
      if (error) throw error;
      toast.success(`Community "${name}" deleted`);
      fetchCommunities();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete community");
    }
  };

  const handleTogglePublish = async (communityId: string, currentStatus: boolean, name: string) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const { error } = await supabase.from('communities').update({ is_published: !currentStatus }).eq('id', communityId);
      if (error) throw error;
      toast.success(`"${name}" is now ${!currentStatus ? 'published' : 'unpublished'}`);
      fetchCommunities();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle publish status");
    }
  };

  const handleToggleAutoPublish = async (communityId: string, currentStatus: boolean, name: string) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const { error } = await supabase.from('communities').update({ auto_publish_on_ai_enhance: !currentStatus }).eq('id', communityId);
      if (error) throw error;
      toast.success(`AI Auto-Publish ${!currentStatus ? 'enabled' : 'disabled'} for "${name}"`);
      fetchCommunities();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle AI auto-publish");
    }
  };

  const handleToggleFeatured = async (communityId: string, currentStatus: boolean, name: string) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const { error } = await supabase.from('communities').update({ is_featured: !currentStatus }).eq('id', communityId);
      if (error) throw error;
      toast.success(`"${name}" ${!currentStatus ? 'added to' : 'removed from'} featured communities`);
      fetchCommunities();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle featured status");
    }
  };

  const handleSubmitLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsScrapingLink(true);
    try {
      const result = await scrapeContentDirectly(communityUrl.trim(), 'communities');
      
      if (!result.success) throw new Error(result.error || "Scraping failed");

      const { error: insertError } = await supabase.from('communities').insert({
        ...result.data,
        slug: result.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        wallet_address: address,
        is_published: true
      });

      if (insertError) throw insertError;
      
      toast.success("✅ Community page created successfully!");
      setCommunityUrl("");
      setIsOpen(false);
      fetchCommunities();
    } catch (err: any) {
      toast.error(err.message || "Failed to scrape community data");
    } finally {
      setIsScrapingLink(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick AI Scrape Card */}
      <Card className="border-primary/20 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Add Community from Link
          </CardTitle>
          <CardDescription>
            Paste a community website URL and our scraper will automatically extract and create the page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitLink} className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/community"
              value={communityUrl}
              onChange={(e) => setCommunityUrl(e.target.value)}
              className="flex-1 bg-background/50 border-primary/20"
              disabled={isScrapingLink}
            />
            <Button
              type="submit"
              disabled={isScrapingLink || !communityUrl.trim()}
              className="min-w-[140px]"
            >
              {isScrapingLink ? (
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
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Pages</h2>
          <p className="text-muted-foreground">Or add manually with full customization</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Manually
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Community Page</DialogTitle>
              <DialogDescription>
                Create a new community page manually or by providing a URL for AI extraction.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="link" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="link">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  From Link (AI)
                </TabsTrigger>
                <TabsTrigger value="manual">
                  <Plus className="h-4 w-4 mr-2" />
                  Manual Entry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="link" className="space-y-4 mt-4">
                <Card className="border-primary/20 bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-lg">AI-Powered Community Scraper</CardTitle>
                    <CardDescription>
                      Paste a URL to a community website, project page, or DAO, and our AI will automatically extract and structure all the information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitLink} className="space-y-4">
                      <div>
                        <Label htmlFor="communityUrl">Community/Project URL</Label>
                        <Input
                          id="communityUrl"
                          type="url"
                          placeholder="https://example.com/community"
                          value={communityUrl}
                          onChange={(e) => setCommunityUrl(e.target.value)}
                          className="bg-background/50 border-primary/20"
                          disabled={isScrapingLink}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          AI will extract: name, description, logo, social links, category, tags, and more
                        </p>
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isScrapingLink || !communityUrl.trim()}
                      >
                        {isScrapingLink ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Scraping Community Data...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Scrape with AI
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4 mt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Community Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      // Auto-generate slug
                      if (!formData.slug) {
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                        });
                      } else {
                        setFormData({ ...formData, name: e.target.value });
                      }
                    }}
                    placeholder="e.g., XYZ DAO"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      })
                    }
                    placeholder="e.g., xyz-dao"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL: /community/{formData.slug || "slug"}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g., Building the future of DeFi"
                />
              </div>

              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description (1-2 sentences)"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., DeFi, NFT, Gaming, DAO"
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., web3, defi, dao"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <Label htmlFor="coverImage">Cover Image URL</Label>
                  <Input
                    id="coverImage"
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="memberCount">Member Count</Label>
                  <Input
                    id="memberCount"
                    type="number"
                    value={formData.memberCount}
                    onChange={(e) => setFormData({ ...formData, memberCount: e.target.value })}
                    placeholder="e.g., 5000"
                  />
                </div>

                <div>
                  <Label htmlFor="founded">Founded Year</Label>
                  <Input
                    id="founded"
                    value={formData.founded}
                    onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                    placeholder="e.g., 2024"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Social Links</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Website URL"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                  <Input
                    placeholder="Twitter URL"
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  />
                  <Input
                    placeholder="Discord URL"
                    type="url"
                    value={formData.discord}
                    onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                  />
                  <Input
                    placeholder="Telegram URL"
                    type="url"
                    value={formData.telegram}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <Label htmlFor="isPublished" className="cursor-pointer">
                  Publish immediately
                </Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Community"
                  )}
                </Button>
              </div>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Communities List */}
      <div className="grid gap-4">
        {communities.map((community) => (
          <Card key={community.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {community.logo && (
                      <img src={community.logo} alt={community.name} className="w-10 h-10 rounded-full" />
                    )}
                    <div>
                      <CardTitle>{community.name}</CardTitle>
                      <CardDescription>/community/{community.slug}</CardDescription>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{community.description}</p>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    {community.category && <Badge variant="outline">{community.category}</Badge>}
                    {community.is_published ? (
                      <Badge variant="default">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                    {community.is_featured && (
                      <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                        <Star className="mr-1 h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                    {community.ai_enhanced && (
                      <Badge variant="secondary">
                        <Sparkles className="mr-1 h-3 w-3" />
                        AI Enhanced
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Switch
                      checked={community.is_published}
                      onCheckedChange={() => handleTogglePublish(community.id, community.is_published, community.name)}
                    />
                    <Label className="text-sm cursor-pointer" onClick={() => handleTogglePublish(community.id, community.is_published, community.name)}>
                      {community.is_published ? '🟢 Published' : '🔴 Draft'}
                    </Label>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Switch
                      checked={community.auto_publish_on_ai_enhance || false}
                      onCheckedChange={() => handleToggleAutoPublish(community.id, community.auto_publish_on_ai_enhance || false, community.name)}
                    />
                    <Label className="text-sm cursor-pointer" onClick={() => handleToggleAutoPublish(community.id, community.auto_publish_on_ai_enhance || false, community.name)}>
                      {community.auto_publish_on_ai_enhance ? '⚡ AI Auto-Publish: ON' : '⚡ AI Auto-Publish: OFF'}
                    </Label>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Switch
                      checked={community.is_featured || false}
                      onCheckedChange={() => handleToggleFeatured(community.id, community.is_featured || false, community.name)}
                    />
                    <Label className="text-sm cursor-pointer" onClick={() => handleToggleFeatured(community.id, community.is_featured || false, community.name)}>
                      {community.is_featured ? '⭐ Featured: ON' : '⭐ Featured: OFF'}
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEnhance(community.id)}
                    disabled={enhancingId === community.id}
                  >
                    {enhancingId === community.id ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-1 h-4 w-4" />
                        AI Enhance
                      </>
                    )}
                  </Button>

                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/community/${community.slug}`} target="_blank">
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(community.id, community.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {communities.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No community pages yet. Create your first one!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
