import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "@/lib/supabase";

interface CreateHackathonDialogProps {
  onSuccess: () => void;
}

export function CreateHackathonDialog({ onSuccess }: CreateHackathonDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user: privyUser, authenticated } = usePrivy();
  const address = privyUser?.wallet?.address;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    prizes: "",
    status: "upcoming",
    tags: "",
    category: "general",
    registrationLink: "",
    websiteUrl: "",
    discordUrl: "",
    twitterUrl: "",
    eligibility: "",
    rules: "",
    maxTeamSize: "4",
    minTeamSize: "1",
    imageUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticated) {
      toast.error("Please connect your wallet to create a hackathon");
      return;
    }

    // Validate dates
    if (!formData.startDate || !formData.endDate) {
      toast.error("Please provide both start and end dates");
      return;
    }

    const startDate = new Date(formData.startDate).getTime();
    const endDate = new Date(formData.endDate).getTime();

    if (isNaN(startDate) || isNaN(endDate)) {
      toast.error("Invalid date format. Please select valid dates.");
      return;
    }

    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!formData.prizes.trim()) {
      toast.error("Prize information is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const parseTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

      const { error } = await supabase.from('hackathons').insert({
        name: formData.title.trim(),
        description: formData.description.trim(),
        start_date: startDate,
        end_date: endDate,
        prizes: formData.prizes.trim(),
        status: formData.status,
        image: formData.imageUrl.trim() || null,
        tags: parseTags,
        category: formData.category,
        wallet_address: address,
        registration_link: formData.registrationLink.trim() || null,
        website_url: formData.websiteUrl.trim() || null,
        discord_url: formData.discordUrl.trim() || null,
        twitter_url: formData.twitterUrl.trim() || null,
        eligibility: formData.eligibility.trim() || null,
        rules: formData.rules.trim() || null,
        max_team_size: parseInt(formData.maxTeamSize) || null,
        min_team_size: parseInt(formData.minTeamSize) || null,
        is_approved: false
      });

      if (error) throw error;

      toast.success("✅ Hackathon submitted for review! Admin will approve it soon.");
      setIsOpen(false);
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        prizes: "",
        status: "upcoming",
        tags: "",
        category: "general",
        registrationLink: "",
        websiteUrl: "",
        discordUrl: "",
        twitterUrl: "",
        eligibility: "",
        rules: "",
        maxTeamSize: "4",
        minTeamSize: "1",
        imageUrl: "",
      });
      onSuccess();
    } catch (error) {
      toast.error("Failed to create hackathon");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6">
          <Plus className="mr-2 h-5 w-5" /> Manual Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manually Post Hackathon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="prizes">Prize Pool *</Label>
            <Input
              id="prizes"
              value={formData.prizes}
              onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
              placeholder="e.g., $10,000 in prizes"
              required
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">Hackathon Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Paste a direct link to your hackathon image
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="web3">Web3</SelectItem>
                  <SelectItem value="ai">AI/ML</SelectItem>
                  <SelectItem value="defi">DeFi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., blockchain, web3, defi"
            />
          </div>

          <div>
            <Label htmlFor="registrationLink">Registration Link</Label>
            <Input
              id="registrationLink"
              type="url"
              value={formData.registrationLink}
              onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="discordUrl">Discord URL</Label>
              <Input
                id="discordUrl"
                type="url"
                value={formData.discordUrl}
                onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
                placeholder="https://discord.gg/..."
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Post Hackathon"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}