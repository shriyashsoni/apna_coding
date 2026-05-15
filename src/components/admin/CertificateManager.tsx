import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Award, Sparkles, CheckCircle, Clock, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function CertificateManager() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [certificateForm, setCertificateForm] = useState({
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

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setCertificates(data || []);
    } catch (err) {
      console.error("Error fetching certificates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleIssueSingle = async () => {
    if (!certificateForm.userId || !certificateForm.eventName) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const { data, error } = await supabase.from('certificates').insert({
        user_id: certificateForm.userId,
        event_id: certificateForm.eventId || certificateForm.eventName.toLowerCase().replace(/\s/g, "-"),
        event_type: certificateForm.eventType,
        event_name: certificateForm.eventName,
        event_date: certificateForm.eventDate ? new Date(certificateForm.eventDate).getTime() : Date.now(),
        certificate_type: certificateForm.certificateType,
        achievement_level: certificateForm.achievementLevel,
        achievement: certificateForm.achievement || null,
        project_name: certificateForm.projectName || null,
        team_name: certificateForm.teamName || null,
        skills: certificateForm.skills ? certificateForm.skills.split(",").map(s => s.trim()) : null,
        certificate_number: certificateNumber,
        claim_status: "pending",
        nft_minted: false
      }).select().single();

      if (error) throw error;

      toast.success(`Certificate issued! Number: ${certificateNumber}`);
      fetchCertificates();

      // Reset form
      setCertificateForm({
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
    } catch (error) {
      toast.error("Failed to issue certificate");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{certificates.filter(c => c.claim_status === 'pending').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Ready to Mint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {certificates.filter(c => c.claim_status === "claimed").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Total Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {certificates.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issue Certificate Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Issue New Certificate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User ID */}
            <div className="space-y-2">
              <Label>User ID *</Label>
              <Input
                placeholder="user_id_here"
                value={certificateForm.userId}
                onChange={(e) => setCertificateForm({ ...certificateForm, userId: e.target.value })}
              />
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label>Event Type *</Label>
              <Select
                value={certificateForm.eventType}
                onValueChange={(value) => setCertificateForm({ ...certificateForm, eventType: value })}
              >
                <SelectTrigger>
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

            {/* Event Name */}
            <div className="space-y-2">
              <Label>Event Name *</Label>
              <Input
                placeholder="ETHIndia 2025"
                value={certificateForm.eventName}
                onChange={(e) => setCertificateForm({ ...certificateForm, eventName: e.target.value })}
              />
            </div>

            {/* Event Date */}
            <div className="space-y-2">
              <Label>Event Date</Label>
              <Input
                placeholder="January 20-22, 2025"
                value={certificateForm.eventDate}
                onChange={(e) => setCertificateForm({ ...certificateForm, eventDate: e.target.value })}
              />
            </div>

            {/* Certificate Type */}
            <div className="space-y-2">
              <Label>Certificate Type *</Label>
              <Select
                value={certificateForm.certificateType}
                onValueChange={(value) => setCertificateForm({ ...certificateForm, certificateType: value })}
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
                value={certificateForm.achievementLevel}
                onValueChange={(value) => setCertificateForm({ ...certificateForm, achievementLevel: value })}
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

            {/* Achievement */}
            <div className="space-y-2 md:col-span-2">
              <Label>Achievement (Optional)</Label>
              <Input
                placeholder="1st Place, Best Innovation, etc."
                value={certificateForm.achievement}
                onChange={(e) => setCertificateForm({ ...certificateForm, achievement: e.target.value })}
              />
            </div>

            {/* Skills */}
            <div className="space-y-2 md:col-span-2">
              <Label>Skills (Optional)</Label>
              <Input
                placeholder="React, Solidity, Web3 (comma-separated)"
                value={certificateForm.skills}
                onChange={(e) => setCertificateForm({ ...certificateForm, skills: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={handleIssueSingle} className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Issuing...
              </>
            ) : (
              <>
                <Award className="w-4 h-4 mr-2" />
                Issue Certificate
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pending Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recent Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto animate-spin opacity-20" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No certificates issued yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">User: {cert.user_id.substring(0, 8)}...</p>
                      <Badge variant="outline">{cert.event_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{cert.event_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{cert.certificate_number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {cert.nft_minted ? (
                      <Badge className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Minted
                      </Badge>
                    ) : cert.claim_status === "claimed" ? (
                      <Badge variant="secondary">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Claimed
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
