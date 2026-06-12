import { useEffect, useState } from "react";
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

interface CreateEventDialogProps {
  onSuccess: () => void;
}

interface CustomFieldInput {
  label: string;
  type: "text" | "select" | "checkbox";
  options: string; // Comma separated options for select dropdown
  required: boolean;
}

export function CreateEventDialog({ onSuccess }: CreateEventDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventGroups, setEventGroups] = useState<any[]>([]);

  const { user: privyUser, authenticated } = usePrivy();
  const address = privyUser?.wallet?.address;

  // Fetch event groups for dropdown (admin only)
  useEffect(() => {
    const fetchEventGroups = async () => {
      if (!address) return;
      try {
        const { data, error } = await supabase
          .from('event_groups')
          .select('id, group_name, location');
        if (error) throw error;
        setEventGroups(data || []);
      } catch (err) {
        console.error("Error fetching event groups:", err);
      }
    };
    fetchEventGroups();
  }, [address]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    type: "meetup",
    imageUrl: "",
    eventGroupId: "" as string,
    // Hosted properties
    conductingType: "external", // external | hosted
    locationType: "physical", // physical | virtual | hybrid
    virtualUrl: "",
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
      toast.error("Please connect your wallet to create an event");
      return;
    }

    if (!formData.date) {
      toast.error("Please provide an event date");
      return;
    }

    const eventDate = new Date(formData.date).getTime();

    if (isNaN(eventDate)) {
      toast.error("Invalid date format. Please select a valid date and time.");
      return;
    }

    // Check if the event date is in the past
    const now = new Date().getTime();
    if (eventDate < now) {
      toast.error("Event date cannot be in the past. Please select a future date.");
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

    setIsSubmitting(true);
    try {
      // 1. Create main event record
      const { data: newEvent, error } = await supabase.from('events').insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: eventDate,
        location: formData.location.trim(),
        type: formData.type,
        image: formData.imageUrl.trim() || null,
        wallet_address: address,
        event_group_id: formData.eventGroupId || null,
        is_approved: false,
        conducting_type: formData.conductingType,
        location_type: formData.locationType,
        virtual_url: formData.conductingType === "hosted" && (formData.locationType === "virtual" || formData.locationType === "hybrid") ? formData.virtualUrl.trim() : null,
        capacity: formData.conductingType === "hosted" && formData.capacity ? parseInt(formData.capacity) : null,
        require_approval: formData.conductingType === "hosted" ? formData.requireApproval : false,
        timezone: formData.timezone,
        registration_link: formData.conductingType === "external" ? formData.registrationLink.trim() : null,
      }).select().single();

      if (error) throw error;

      // 2. Add custom registration questions if hosted
      if (formData.conductingType === "hosted" && customFields.length > 0 && newEvent) {
        const fieldsToInsert = customFields.map((field, idx) => ({
          event_id: newEvent.id,
          label: field.label.trim(),
          field_type: field.type,
          options: field.type === "select" ? field.options.split(",").map(o => o.trim()).filter(Boolean) : null,
          required: field.required,
          order_index: idx
        }));

        const { error: fieldsError } = await supabase.from('registration_fields').insert(fieldsToInsert);
        if (fieldsError) throw fieldsError;
      }

      toast.success("✅ Event submitted for review! Admin will approve it soon.");
      setIsOpen(false);
      setFormData({
        title: "",
        description: "",
        date: "",
        location: "",
        type: "meetup",
        imageUrl: "",
        eventGroupId: "",
        conductingType: "external",
        locationType: "physical",
        virtualUrl: "",
        capacity: "",
        requireApproval: false,
        timezone: "UTC",
        registrationLink: "",
      });
      setCustomFields([]);
      onSuccess();
    } catch (error) {
      toast.error("Failed to create event");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6 shadow-lg shadow-cyan-500/10">
          <Plus className="mr-2 h-5 w-5" /> Host an Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Host New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <Label htmlFor="title">Event Title *</Label>
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

          {/* Date & Timezone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date & Time *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
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
          </div>

          {/* Conducting Type: External URL vs Hosted RSVP on Platform */}
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
                <SelectItem value="external">External Link (Redirect users to Luma/Meetup/etc.)</SelectItem>
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
                placeholder="https://lu.ma/example"
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
                      <SelectItem value="physical">Physical Address Only</SelectItem>
                      <SelectItem value="virtual">Virtual Link Only</SelectItem>
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
                  <Label htmlFor="virtualUrl">Virtual Meeting URL (Zoom, Google Meet, etc.) *</Label>
                  <Input
                    id="virtualUrl"
                    type="url"
                    value={formData.virtualUrl}
                    onChange={(e) => setFormData({ ...formData, virtualUrl: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    This link is kept hidden until a guest registration is approved.
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
                  Require Host Approval (Guests are "pending" until you approve them)
                </Label>
              </div>

              {/* Custom Questions Builder */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Custom RSVP Questions</Label>
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
                            id={`req-${idx}`}
                            checked={field.required}
                            onCheckedChange={(checked) => updateCustomField(idx, "required", !!checked)}
                          />
                          <Label htmlFor={`req-${idx}`} className="text-xs cursor-pointer">Required</Label>
                        </div>
                      </div>
                      
                      {field.type === "select" && (
                        <Input
                          placeholder="Options (comma separated: Web3, AI, DeFi)"
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

          {/* Location Address */}
          {(formData.conductingType === "external" || formData.locationType === "physical" || formData.locationType === "hybrid") && (
            <div>
              <Label htmlFor="location">Physical Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., San Francisco, CA or Mumbai, India"
                required
              />
            </div>
          )}

          {/* Event Type */}
          <div>
            <Label htmlFor="type">Event Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meetup">Meetup</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event Group */}
          {eventGroups && eventGroups.length > 0 && (
            <div>
              <Label htmlFor="eventGroup">Event Group (Optional)</Label>
              <Select
                value={formData.eventGroupId}
                onValueChange={(value) => setFormData({ ...formData, eventGroupId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No group (standalone event)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No group (standalone event)</SelectItem>
                  {eventGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.group_name} - {group.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Event Image */}
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
                Submitting Event...
              </>
            ) : (
              "Submit Event for Review"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
