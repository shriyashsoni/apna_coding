import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Award, Sparkles, Info, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export default function IssueCertificate() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const address = user?.wallet_address;
  const isConnected = isAuthenticated;
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedCertNumber, setIssuedCertNumber] = useState("");

  const [form, setForm] = useState({
    userId: "",
    eventId: "",
    eventType: "hackathon",
    eventName: "",
    eventDate: "",
    certificateType: "participation",
    achievementLevel: "participant",
    achievement: "",
    projectName: "",
    teamName: "",
    skills: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      toast.error("Admin access required");
      return;
    }

    if (!form.userId || !form.eventName) {
      toast.error("Please fill in User ID and Event Name");
      return;
    }

    setIsSubmitting(true);

    try {
      const certificateNumber = `AC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.floor(Date.now() / 1000)}`;
      
      const { data, error } = await supabase
        .from('certificates')
        .insert({
          user_id: form.userId,
          certificate_number: certificateNumber,
          event_id: form.eventId || form.eventName.toLowerCase().replace(/\s+/g, "-"),
          event_type: form.eventType,
          event_name: form.eventName,
          event_date: form.eventDate || new Date().toLocaleDateString("en-US", {
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
        })
        .select()
        .single();

      if (error) throw error;

      setIssuedCertNumber(certificateNumber);
      toast.success("Certificate issued successfully!");

      // Reset form
      setForm({
        userId: "",
        eventId: "",
        eventType: "hackathon",
        eventName: "",
        eventDate: "",
        certificateType: "participation",
        achievementLevel: "participant",
        achievement: "",
        projectName: "",
        teamName: "",
        skills: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to issue certificate");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground mb-4">
                Please connect your wallet to issue certificates
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <Award className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You don't have admin permissions to issue certificates
              </p>
              <Button onClick={() => navigate("/")}>
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
              <Award className="w-10 h-10 text-primary" />
              Issue Certificate
            </h1>
            <p className="text-muted-foreground">
              Create verified certificates for hackathons, events, courses, and more
            </p>
          </div>

          {/* Success Message */}
          {issuedCertNumber && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  Certificate issued successfully! Number: <span className="font-mono font-bold">{issuedCertNumber}</span>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/verify/${issuedCertNumber}`)}
                >
                  Verify
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Info Alert */}
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              <strong>How to get User ID:</strong> Go to your Supabase dashboard → users table → copy the id field
            </AlertDescription>
          </Alert>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Details</CardTitle>
              <CardDescription>
                Fill in the information to create a new certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User & Event Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID *</Label>
                    <Input
                      id="userId"
                      placeholder="j12345abcde"
                      value={form.userId}
                      onChange={(e) => setForm({ ...form, userId: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">From Convex dashboard</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type *</Label>
                    <Select
                      value={form.eventType}
                      onValueChange={(value) => setForm({ ...form, eventType: value })}
                    >
                      <SelectTrigger id="eventType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hackathon">Hackathon</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="eventName">Event Name *</Label>
                    <Input
                      id="eventName"
                      placeholder="ETHIndia 2025"
                      value={form.eventName}
                      onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Input
                      id="eventDate"
                      placeholder="January 20-22, 2025"
                      value={form.eventDate}
                      onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventId">Event ID (Optional)</Label>
                    <Input
                      id="eventId"
                      placeholder="Auto-generated if empty"
                      value={form.eventId}
                      onChange={(e) => setForm({ ...form, eventId: e.target.value })}
                    />
                  </div>
                </div>

                {/* Certificate Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificateType">Certificate Type *</Label>
                    <Select
                      value={form.certificateType}
                      onValueChange={(value) => setForm({ ...form, certificateType: value })}
                    >
                      <SelectTrigger id="certificateType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="participation">Participation</SelectItem>
                        <SelectItem value="winner">Winner</SelectItem>
                        <SelectItem value="runner-up">Runner-Up</SelectItem>
                        <SelectItem value="completion">Completion</SelectItem>
                        <SelectItem value="special-mention">Special Mention</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="achievementLevel">Achievement Level *</Label>
                    <Select
                      value={form.achievementLevel}
                      onValueChange={(value) => setForm({ ...form, achievementLevel: value })}
                    >
                      <SelectTrigger id="achievementLevel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="participant">Participant</SelectItem>
                        <SelectItem value="winner">Winner</SelectItem>
                        <SelectItem value="completion">Completion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="achievement">Achievement (Optional)</Label>
                    <Input
                      id="achievement"
                      placeholder="1st Place, Best Innovation, etc."
                      value={form.achievement}
                      onChange={(e) => setForm({ ...form, achievement: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Project Name (Optional)</Label>
                      <Input
                        id="projectName"
                        placeholder="DeFi Protocol"
                        value={form.projectName}
                        onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teamName">Team Name (Optional)</Label>
                      <Input
                        id="teamName"
                        placeholder="Team Alpha"
                        value={form.teamName}
                        onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (Optional)</Label>
                    <Input
                      id="skills"
                      placeholder="React, Solidity, Web3, Smart Contracts (comma-separated)"
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Issuing Certificate...
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      Issue Certificate
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
