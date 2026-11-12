import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { browserTimeZone, isValidTimeZone, resolveZonedTimestamp, buildEventTimestamp, timestampToFormFields, timezoneForSubmit, timeZoneOptions } from "@/lib/event-date";

interface EditEventDialogProps {
  event: any | null;
  onClose: () => void;
  onSuccess: (updated: any) => void;
}

/**
 * Native edit flow for events. The admin UI previously offered only feature /
 * delete, so a wrong field (including the old form-forced 09:00 placeholder
 * times) could only be fixed by deleting the listing. Clearing the time field
 * marks the event date-only ("time to be announced"); see src/lib/event-date.ts.
 */
export function EditEventDialog({ event, onClose, onSuccess }: EditEventDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    timeZone: browserTimeZone(),
    location: "",
    type: "meetup",
    registrationLink: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (!event) return;
    const { date, time, timeZone } = timestampToFormFields(event.date, event.timezone);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      date,
      time,
      timeZone: timeZone,
      location: event.location || "",
      type: event.type || "meetup",
      registrationLink: event.registration_link || "",
      imageUrl: event.image || event.image_url || "",
    });
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event?.id) return;

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!formData.date) {
      toast.error("Please provide an event date");
      return;
    }

    const eventDate = buildEventTimestamp(formData.date, formData.time, formData.timeZone);
    if (eventDate === null) {
      const detailed = formData.time && isValidTimeZone(formData.timeZone)
        ? resolveZonedTimestamp(formData.date, formData.time, formData.timeZone)
        : null;
      toast.error(detailed?.error || "Invalid date format. Please select a valid date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updates = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: eventDate,
        location: formData.location.trim(),
        type: formData.type,
        image: formData.imageUrl.trim() || null,
        registration_link: formData.registrationLink.trim() || null,
        timezone: timezoneForSubmit(formData.time, formData.timeZone),
      };
      const { error } = await supabase.from('events').update(updates).eq('id', event.id);
      if (error) throw error;

      toast.success("Event updated");
      onSuccess({ ...event, ...updates });
      onClose();
    } catch (error) {
      toast.error("Failed to update event");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="edit-date">Event Date *</Label>
            <Input
              id="edit-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-time">Start Time (optional)</Label>
            <Input
              id="edit-time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty if the organizer has not announced a start time - the event will show "Time to be announced" instead of a made-up hour.
            </p>
          </div>

          <div>
            <Label htmlFor="edit-tz">Timezone (applies when a start time is set)</Label>
            <Select value={formData.timeZone} onValueChange={(value) => setFormData({ ...formData, timeZone: value })}>
              <SelectTrigger id="edit-tz">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeZoneOptions().map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Pick the venue&apos;s timezone - e.g. Asia/Dubai for a &quot;9:00 doors, Dubai&quot; time. Defaults to your browser timezone. The instant is stored unambiguously and each visitor sees it in their own time.
            </p>
          </div>

          <div>
            <Label htmlFor="edit-location">Location *</Label>
            <Input
              id="edit-location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., San Francisco, CA or Online"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-type">Event Type</Label>
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

          <div>
            <Label htmlFor="edit-imageUrl">Event Image URL</Label>
            <Input
              id="edit-imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <Label htmlFor="edit-registrationLink">Registration Link</Label>
            <Input
              id="edit-registrationLink"
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
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
