import { useEffect, useState } from "react";
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

interface CreateEventDialogProps {
  onSuccess: () => void;
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
    registrationLink: "",
    imageUrl: "",
    eventGroupId: "" as string,
  });

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
      const { error } = await supabase.from('events').insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: eventDate,
        location: formData.location.trim(),
        type: formData.type,
        image: formData.imageUrl.trim() || null,
        wallet_address: address,
        registration_link: formData.registrationLink.trim() || null,
        event_group_id: formData.eventGroupId || null,
        is_approved: false
      });

      if (error) throw error;

      toast.success("✅ Event submitted for review! Admin will approve it soon.");
      setIsOpen(false);
      setFormData({
        title: "",
        description: "",
        date: "",
        location: "",
        type: "meetup",
        registrationLink: "",
        imageUrl: "",
        eventGroupId: "",
      });
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
        <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6">
          <Plus className="mr-2 h-5 w-5" /> Manual Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manually Post Event</DialogTitle>
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

          <div>
            <Label htmlFor="date">Event Date *</Label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Select the exact date and time for your event
            </p>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., San Francisco, CA or Online"
              required
            />
          </div>

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
              </SelectContent>
            </Select>
          </div>

          {/* Event Group Dropdown (Admin Only) */}
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
              <p className="text-xs text-muted-foreground mt-1">
                Assign this event to a group like "Consensus Hong Kong 2026"
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="imageUrl">Event Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Paste a direct link to your event image
            </p>
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Post Event"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
