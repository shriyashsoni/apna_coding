import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "@/lib/supabase";

interface CreateHackathonDialogProps {
  onSuccess: () => void;
}

interface CustomFieldInput {
  label: string;
  type: "text" | "select" | "checkbox";
  options: string;
  required: boolean;
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
    imageUrl: "",
    websiteUrl: "",
    discordUrl: "",
    twitterUrl: "",
    eligibility: "",
    rules: "",
    maxTeamSize: "4",
    minTeamSize: "1",
    // Hosted properties
    conductingType: "external", // external | hosted
    locationType: "virtual", // physical | virtual | hybrid
    virtualUrl: "",
    location: "",
    capacity: "",
    requireApproval: false,
    timezone: "UTC",
    registrationLink: "",
  });

  const [customFields, setCustomFields] = useState<CustomFieldInput[]>([]);

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      { label: "", type: "text", options: "", required: false }
    ]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, key: keyof CustomFieldInput, value: any) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [key]: value };
    setCustomFields(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticated) {
      toast.error("Please connect your wallet to create a hackathon");
      return;
    }

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

      // 1. Create hackathon record
      const { data: newHackathon, error } = await supabase.from('hackathons').insert({
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
        website_url: formData.websiteUrl.trim() || null,
        discord_url: formData.discordUrl.trim() || null,
        twitter_url: formData.twitterUrl.trim() || null,
        eligibility: formData.eligibility.trim() || null,
        rules: formData.rules.trim() || null,
        max_team_size: parseInt(formData.maxTeamSize) || null,
        min_team_size: parseInt(formData.minTeamSize) || null,
        is_approved: false,
        conducting_type: formData.conductingType,
        location_type: formData.locationType,
        virtual_url: formData.conductingType === "hosted" && (formData.locationType === "virtual" || formData.locationType === "hybrid") ? formData.virtualUrl.trim() : null,
        location: (formData.conductingType === "external" || formData.locationType === "physical" || formData.locationType === "hybrid") ? formData.location.trim() : "Virtual",
        capacity: formData.conductingType === "hosted" && formData.capacity ? parseInt(formData.capacity) : null,
        require_approval: formData.conductingType === "hosted" ? formData.requireApproval : false,
        timezone: formData.timezone,
        registration_link: formData.conductingType === "external" ? formData.registrationLink.trim() : null,
      }).select().single();

      if (error) throw error;

      // 2. Add custom registration questions if hosted
      if (formData.conductingType === "hosted" && customFields.length > 0 && newHackathon) {
        const fieldsToInsert = customFields.map((field, idx) => ({
          hackathon_id: newHackathon.id,
          label: field.label.trim(),
          field_type: field.type,
          options: field.type === "select" ? field.options.split(",").map(o => o.trim()).filter(Boolean) : null,
          required: field.required,
          order_index: idx
        }));

        const { error: fieldsError } = await supabase.from('registration_fields').insert(fieldsToInsert);
        if (fieldsError) throw fieldsError;
      }

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
        imageUrl: "",
        websiteUrl: "",
        discordUrl: "",
        twitterUrl: "",
        eligibility: "",
        rules: "",
        maxTeamSize: "4",
        minTeamSize: "1",
        conductingType: "external",
        locationType: "virtual",
        virtualUrl: "",
        location: "",
        capacity: "",
        requireApproval: false,
        timezone: "UTC",
        registrationLink: "",
      });
      setCustomFields([]);
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
        <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6 shadow-lg shadow-cyan-500/10">
          <Plus className="mr-2 h-5 w-5" /> Host a Hackathon
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Host New Hackathon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <Label htmlFor="title">Hackathon Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
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

          {/* Start & End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date & Time *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date & Time *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={formData.timezone} onValueChange={(val) => setFormData({ ...formData, timezone: val })}>
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="IST">IST (India)</SelectItem>
                <SelectItem value="EST">EST (US Eastern)</SelectItem>
                <SelectItem value="PST">PST (US Pacific)</SelectItem>
                <SelectItem value="GMT">GMT (London)</SelectItem>
                <SelectItem value="SGT">SGT (Singapore)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prize Pool */}
          <div>
            <Label htmlFor="prizes">Prize Pool *</Label>
            <Input
              id="prizes"
              value={formData.prizes}
              onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
              placeholder="e.g. $5,000 + NFTs"
              required
            />
          </div>

          {/* Registration Type: External URL vs Hosted RSVP */}
          <div>
            <Label>Registration Flow Type *</Label>
            <Select
              value={formData.conductingType}
              onValueChange={(val) => setFormData({ ...formData, conductingType: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="external">External Link (Redirect users to Devpost/Luma/etc.)</SelectItem>
                <SelectItem value="hosted">Hosted RSVP (Manage registrations & check-in guests here)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* If External Link */}
          {formData.conductingType === "external" && (
            <div>
              <Label htmlFor="registrationLink">Registration Link *</Label>
              <Input
                id="registrationLink"
                type="url"
                value={formData.registrationLink}
                onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                placeholder="https://devpost.com/hackathon"
                required
              />
            </div>
          )}

          {/* If Hosted RSVP */}
          {formData.conductingType === "hosted" && (
            <div className="space-y-4 p-4 border border-cyan-500/20 rounded-lg bg-cyan-950/10">
              <h4 className="font-semibold text-cyan-400 text-sm">Hosted Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="locationType">Location Type</Label>
                  <Select
                    value={formData.locationType}
                    onValueChange={(val) => setFormData({ ...formData, locationType: val })}
                  >
                    <SelectTrigger id="locationType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virtual">Virtual Link Only</SelectItem>
                      <SelectItem value="physical">Physical Venue Only</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity Limit (Optional)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>
              </div>

              {(formData.locationType === "virtual" || formData.locationType === "hybrid") && (
                <div>
                  <Label htmlFor="virtualUrl">Virtual Meeting/Discord URL *</Label>
                  <Input
                    id="virtualUrl"
                    type="url"
                    value={formData.virtualUrl}
                    onChange={(e) => setFormData({ ...formData, virtualUrl: e.target.value })}
                    placeholder="https://discord.gg/..."
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    This link is kept hidden until a builder's RSVP is approved.
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="requireApproval"
                  checked={formData.requireApproval}
                  onCheckedChange={(checked) => setFormData({ ...formData, requireApproval: !!checked })}
                />
                <Label htmlFor="requireApproval" className="cursor-pointer">
                  Require Host Approval (Builders are "pending" until you approve them)
                </Label>
              </div>

              {/* Custom Questions Builder */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Custom Builder Questions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                    <Plus className="h-4 w-4 mr-1" /> Add Question
                  </Button>
                </div>

                {customFields.map((field, idx) => (
                  <div key={idx} className="flex gap-2 items-start bg-slate-900/60 p-3 rounded border border-slate-800">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Question Label (e.g. GitHub Username)"
                        value={field.label}
                        onChange={(e) => updateCustomField(idx, "label", e.target.value)}
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={field.type}
                          onValueChange={(val) => updateCustomField(idx, "type", val)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Input</SelectItem>
                            <SelectItem value="select">Dropdown Menu</SelectItem>
                            <SelectItem value="checkbox">Checkbox Agreement</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`hreq-${idx}`}
                            checked={field.required}
                            onCheckedChange={(checked) => updateCustomField(idx, "required", !!checked)}
                          />
                          <Label htmlFor={`hreq-${idx}`} className="text-xs cursor-pointer">Required</Label>
                        </div>
                      </div>
                      
                      {field.type === "select" && (
                        <Input
                          placeholder="Options (comma separated: Solidity, Rust, TS)"
                          value={field.options}
                          onChange={(e) => updateCustomField(idx, "options", e.target.value)}
                          required
                        />
                      )}
                    </div>
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeCustomField(idx)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Physical Address */}
          {(formData.conductingType === "external" || formData.locationType === "physical" || formData.locationType === "hybrid") && (
            <div>
              <Label htmlFor="location">Physical Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Innovation Center, Mumbai"
                required
              />
            </div>
          )}

          {/* Team Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minTeamSize">Min Team Size</Label>
              <Input
                id="minTeamSize"
                type="number"
                value={formData.minTeamSize}
                onChange={(e) => setFormData({ ...formData, minTeamSize: e.target.value })}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="maxTeamSize">Max Team Size</Label>
              <Input
                id="maxTeamSize"
                type="number"
                value={formData.maxTeamSize}
                onChange={(e) => setFormData({ ...formData, maxTeamSize: e.target.value })}
                min="1"
              />
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="category">
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
                <SelectTrigger id="status">
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

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g. blockchain, web3, defi"
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-2">
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
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="twitterUrl">Twitter URL</Label>
              <Input
                id="twitterUrl"
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <Label htmlFor="imageUrl">Cover Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Hackathon...
              </>
            ) : (
              "Submit Hackathon for Review"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
