import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface RegisterEventDialogProps {
  eventId?: string;
  hackathonId?: string;
  requireApproval: boolean;
  capacity?: number | null;
  walletAddress: string;
  userEmail?: string;
  userName?: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function RegisterEventDialog({
  eventId,
  hackathonId,
  requireApproval,
  capacity,
  walletAddress,
  userEmail = "",
  userName = "",
  onSuccess,
  trigger
}: RegisterEventDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);

  const [formData, setFormData] = useState({
    name: userName,
    email: userEmail,
  });

  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Sync user profile values when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: userName || formData.name,
        email: userEmail || formData.email,
      });
      fetchCustomFields();
    }
  }, [isOpen, userName, userEmail]);

  const fetchCustomFields = async () => {
    setIsLoadingFields(true);
    try {
      let query = supabase.from("registration_fields").select("*").order("order_index", { ascending: true });
      if (eventId) {
        query = query.eq("event_id", eventId);
      } else if (hackathonId) {
        query = query.eq("hackathon_id", hackathonId);
      } else {
        setCustomFields([]);
        return;
      }

      const { data, error } = await query;
      if (error) throw error;
      setCustomFields(data || []);
      
      // Initialize default answers
      const initialAnswers: Record<string, any> = {};
      (data || []).forEach(f => {
        if (f.field_type === "checkbox") {
          initialAnswers[f.id] = false;
        } else {
          initialAnswers[f.id] = "";
        }
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error("Error fetching custom registration fields:", err);
    } finally {
      setIsLoadingFields(false);
    }
  };

  const handleAnswerChange = (fieldId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and Email are required");
      return;
    }

    // Validate custom required fields
    for (const field of customFields) {
      if (field.required) {
        const val = answers[field.id];
        if (field.field_type === "checkbox" && !val) {
          toast.error(`Please check the box for: ${field.label}`);
          return;
        }
        if (field.field_type !== "checkbox" && (!val || !val.toString().trim())) {
          toast.error(`Please answer: ${field.label}`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      // 1. Check current registrations to handle capacity/waitlist
      let countQuery = supabase.from("registrations").select("id", { count: "exact", head: true });
      if (eventId) {
        countQuery = countQuery.eq("event_id", eventId);
      } else {
        countQuery = countQuery.eq("hackathon_id", hackathonId);
      }
      
      const { count } = await countQuery;
      const currentCount = count || 0;

      // 2. Determine registration status
      let targetStatus = "registered";
      if (requireApproval) {
        targetStatus = "pending";
      } else if (capacity && currentCount >= capacity) {
        targetStatus = "waitlist";
      }

      // 3. Submit registration
      const { error } = await supabase.from("registrations").insert({
        event_id: eventId || null,
        hackathon_id: hackathonId || null,
        wallet_address: walletAddress,
        email: formData.email.trim(),
        name: formData.name.trim(),
        status: targetStatus,
        answers: answers
      });

      if (error) {
        if (error.message && error.message.includes("unique")) {
          throw new Error("You are already registered for this event!");
        }
        throw error;
      }

      if (targetStatus === "pending") {
        toast.success("✅ RSVP request submitted! The host will review your request.");
      } else if (targetStatus === "waitlist") {
        toast.info("⏳ Event capacity is full. You've been placed on the Waitlist.");
      } else {
        toast.success("🎟️ Registration successful! Your ticket is ready.");
      }

      setIsOpen(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to register");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Register Now
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Event Registration
          </DialogTitle>
          <DialogDescription>
            Join this event by providing your details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* Render custom questions */}
          {isLoadingFields ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            customFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label} {field.required && "*"}
                </Label>
                
                {field.field_type === "text" && (
                  <Input
                    id={field.id}
                    placeholder="Your answer"
                    value={answers[field.id] || ""}
                    onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                    required={field.required}
                  />
                )}

                {field.field_type === "select" && (
                  <Select
                    value={answers[field.id] || ""}
                    onValueChange={(val) => handleAnswerChange(field.id, val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt: string) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.field_type === "checkbox" && (
                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                      id={field.id}
                      checked={answers[field.id] || false}
                      onCheckedChange={(checked) => handleAnswerChange(field.id, !!checked)}
                    />
                    <label
                      htmlFor={field.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree
                    </label>
                  </div>
                )}
              </div>
            ))
          )}

          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Confirm Registration"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
