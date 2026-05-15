import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Award, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface QuickCertificateIssueProps {
  eventId?: string;
  eventName?: string;
  eventDate?: string;
  eventType?: string;
}

export function QuickCertificateIssue({
  eventId = "",
  eventName = "",
  eventDate = "",
  eventType = "hackathon"
}: QuickCertificateIssueProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    certificateType: "participation",
    achievementLevel: "participant",
    achievement: "",
    projectName: "",
    teamName: "",
    skills: "",
  });

  const handleIssue = async () => {
    if (!form.userId) {
      toast.error("Please enter User ID");
      return;
    }

    if (!eventName) {
      toast.error("Event name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const certificateNumber = `AC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.floor(Date.now() / 1000)}`;

      const { error } = await supabase
        .from('certificates')
        .insert({
          user_id: form.userId,
          certificate_number: certificateNumber,
          event_id: eventId || eventName.toLowerCase().replace(/\s+/g, "-"),
          event_type: eventType,
          event_name: eventName,
          event_date: eventDate || new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          certificate_type: form.certificateType,
          achievement_level: form.achievementLevel,
          achievement: form.achievement || null,
          project_name: form.projectName || null,
          team_name: form.teamName || null,
          skills: form.skills ? form.skills.split(",").map(s => s.trim()) : [],
          issued_at: Date.now()
        });

      if (error) throw error;

      toast.success(`Certificate issued! Number: ${certificateNumber}`);
      setOpen(false);

      // Reset form
      setForm({
        userId: "",
        certificateType: "participation",
        achievementLevel: "participant",
        achievement: "",
        projectName: "",
        teamName: "",
        skills: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to issue certificate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Award className="w-4 h-4 mr-2" />
          Issue Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Issue Certificate
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Info (Read-only) */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-semibold">{eventName}</p>
            <p className="text-xs text-muted-foreground">{eventDate}</p>
          </div>

          {/* User ID */}
          <div className="space-y-2">
            <Label>User ID *</Label>
            <Input
              placeholder="Get from Convex dashboard"
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Go to Convex dashboard → users table → copy _id
            </p>
          </div>

          {/* Certificate Type */}
          <div className="space-y-2">
            <Label>Certificate Type *</Label>
            <Select
              value={form.certificateType}
              onValueChange={(value) => setForm({ ...form, certificateType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participation">Participation</SelectItem>
                <SelectItem value="winner">Winner</SelectItem>
                <SelectItem value="runner-up">Runner-Up</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Achievement Level */}
          <div className="space-y-2">
            <Label>Achievement Level *</Label>
            <Select
              value={form.achievementLevel}
              onValueChange={(value) => setForm({ ...form, achievementLevel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participant">Participant</SelectItem>
                <SelectItem value="winner">Winner</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Achievement (Optional) */}
          <div className="space-y-2">
            <Label>Achievement (Optional)</Label>
            <Input
              placeholder="1st Place, Best Innovation, etc."
              value={form.achievement}
              onChange={(e) => setForm({ ...form, achievement: e.target.value })}
            />
          </div>

          {/* Skills (Optional) */}
          <div className="space-y-2">
            <Label>Skills (Optional)</Label>
            <Input
              placeholder="React, Web3, Solidity (comma-separated)"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
          </div>

          {/* Issue Button */}
          <Button onClick={handleIssue} className="w-full">
            <Award className="w-4 h-4 mr-2" />
            Issue Certificate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
