import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Plus, Trophy, Calendar, Briefcase, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { CreateHackathonDialog } from "@/components/hackathons/CreateHackathonDialog";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";

interface ContentPublisherProps {
  onSuccess: () => void;
}

export function ContentPublisher({ onSuccess }: ContentPublisherProps) {
  const { user: authUser } = useAuth();
  const address = authUser?.wallet_address;

  // Hackathon state
  const [hackathonUrl, setHackathonUrl] = useState("");
  const [isScrapingHackathon, setIsScrapingHackathon] = useState(false);

  // Event state
  const [eventUrl, setEventUrl] = useState("");
  const [isScrapingEvent, setIsScrapingEvent] = useState(false);
  const [selectedEventGroupId, setSelectedEventGroupId] = useState<string>("");
  const [safeEventGroups, setSafeEventGroups] = useState<any[]>([]);

  useEffect(() => {
    const fetchEventGroups = async () => {
      try {
        const { data, error } = await supabase
          .from('event_groups')
          .select('id, group_name, location');
        if (error) throw error;
        setSafeEventGroups(data || []);
      } catch (err) {
        console.error("Error fetching event groups:", err);
      }
    };
    fetchEventGroups();
  }, []);

  // Job state - AI Scraping
  const [jobUrl, setJobUrl] = useState("");
  const [isScrapingJob, setIsScrapingJob] = useState(false);

  // Job state - Manual Post
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    type: "full-time",
    salary: "",
    link: "",
  });
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  const handleScrapeHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("AI scraping logic needs to be migrated to Supabase Edge Functions");
  };

  const handleScrapeEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("AI scraping logic needs to be migrated to Supabase Edge Functions");
  };

  const handleScrapeJob = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("AI scraping logic needs to be migrated to Supabase Edge Functions");
  };

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!jobFormData.title.trim() || !jobFormData.company.trim() || !jobFormData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmittingJob(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          title: jobFormData.title.trim(),
          company: jobFormData.company.trim(),
          description: jobFormData.description.trim(),
          location: jobFormData.location.trim(),
          type: jobFormData.type,
          salary: jobFormData.salary.trim() || null,
          link: jobFormData.link.trim(),
          wallet_address: address,
          is_approved: false
        });

      if (error) throw error;

      toast.success("✅ Job submitted for review! Check Approvals tab.");
      setIsJobDialogOpen(false);
      setJobFormData({
        title: "",
        company: "",
        description: "",
        location: "",
        type: "full-time",
        salary: "",
        link: "",
      });
      onSuccess();
    } catch (error) {
      toast.error("Failed to create job");
      console.error(error);
    } finally {
      setIsSubmittingJob(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Content Publisher
          </CardTitle>
          <CardDescription>
            Publish hackathons, events, and jobs using AI scraping or manual entry. All content will be submitted for approval.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="hackathons" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hackathons" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Hackathons
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Jobs
          </TabsTrigger>
        </TabsList>

        {/* Hackathons Tab */}
        <TabsContent value="hackathons" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish Hackathon</CardTitle>
              <CardDescription>
                Use AI to scrape hackathon details from a URL or manually enter information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Auto-Publish Section */}
              <div className="border border-primary/20 rounded-lg p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold text-lg">AI Auto-Publish</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Paste any hackathon link from Devpost, MLH, or other platforms. Our AI will automatically extract all details!
                </p>

                <form onSubmit={handleScrapeHackathon} className="space-y-4">
                  <div>
                    <Label htmlFor="hackathonUrl">Hackathon URL</Label>
                    <Textarea
                      id="hackathonUrl"
                      value={hackathonUrl}
                      onChange={(e) => setHackathonUrl(e.target.value)}
                      placeholder="https://devpost.com/hackathons/..."
                      className="min-h-[100px] mt-2"
                      disabled={isScrapingHackathon}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={isScrapingHackathon}
                  >
                    {isScrapingHackathon ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        AI Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Scrape & Submit with AI
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Manual Post Section */}
              <div className="border border-primary/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Manual Post</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Manually enter hackathon details if you prefer to fill out the form yourself
                </p>

                <CreateHackathonDialog onSuccess={onSuccess} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish Event</CardTitle>
              <CardDescription>
                Use AI to scrape event details from a URL or manually enter information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Auto-Publish Section */}
              <div className="border border-primary/20 rounded-lg p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-lg">AI Auto-Publish</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Paste any event link from Meetup, Eventbrite, or other platforms. Our AI will automatically extract all details!
                </p>

                <form onSubmit={handleScrapeEvent} className="space-y-4">
                  <div>
                    <Label htmlFor="eventUrl">Event URL</Label>
                    <Textarea
                      id="eventUrl"
                      value={eventUrl}
                      onChange={(e) => setEventUrl(e.target.value)}
                      placeholder="https://meetup.com/events/..."
                      className="min-h-[100px] mt-2"
                      disabled={isScrapingEvent}
                    />
                  </div>

                  {/* Event Group Dropdown */}
                  {safeEventGroups.length > 0 && (
                    <div>
                      <Label htmlFor="eventGroupSelect">Event Group (Optional)</Label>
                      <Select
                        value={selectedEventGroupId || "none"}
                        onValueChange={(value) => setSelectedEventGroupId(value === "none" ? "" : value)}
                        disabled={isScrapingEvent}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Publish as individual event (no group)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Individual Event (No Group)</SelectItem>
                          {safeEventGroups.map((group: any) => (
                            <SelectItem key={group.id} value={group.id}>
                              📍 {group.group_name} - {group.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Assign this event to a group like "Consensus Hong Kong 2026" or keep it as a standalone event
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    disabled={isScrapingEvent}
                  >
                    {isScrapingEvent ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        AI Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Scrape & Submit with AI
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Manual Post Section */}
              <div className="border border-primary/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Manual Post</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Manually enter event details if you prefer to fill out the form yourself
                </p>

                <CreateEventDialog onSuccess={onSuccess} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish Job</CardTitle>
              <CardDescription>
                Use AI to scrape job details from a URL or manually enter information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Auto-Publish Section */}
              <div className="border border-primary/20 rounded-lg p-6 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold text-lg">AI Auto-Publish</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Paste any job posting link from LinkedIn, Indeed, AngelList, or other platforms. Our AI will automatically extract all details!
                </p>

                <form onSubmit={handleScrapeJob} className="space-y-4">
                  <div>
                    <Label htmlFor="jobUrl">Job Posting URL</Label>
                    <Textarea
                      id="jobUrl"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="https://linkedin.com/jobs/..."
                      className="min-h-[100px] mt-2"
                      disabled={isScrapingJob}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    disabled={isScrapingJob}
                  >
                    {isScrapingJob ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        AI Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Scrape & Submit with AI
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Manual Post Section for Jobs */}
              <div className="border border-primary/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold text-lg">Manual Post</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Fill out the job details form to post a new job listing
                </p>

                <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Post Job Manually
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Post Job Listing</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitJob} className="space-y-4">
                      <div>
                        <Label htmlFor="jobTitle">Job Title *</Label>
                        <Input
                          id="jobTitle"
                          value={jobFormData.title}
                          onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                          placeholder="Senior Frontend Developer"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="jobCompany">Company *</Label>
                        <Input
                          id="jobCompany"
                          value={jobFormData.company}
                          onChange={(e) => setJobFormData({ ...jobFormData, company: e.target.value })}
                          placeholder="Acme Corp"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="jobDescription">Description *</Label>
                        <Textarea
                          id="jobDescription"
                          value={jobFormData.description}
                          onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                          placeholder="Job description and requirements..."
                          className="min-h-[120px]"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="jobLocation">Location *</Label>
                        <Input
                          id="jobLocation"
                          value={jobFormData.location}
                          onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                          placeholder="Remote, San Francisco, etc."
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="jobType">Job Type *</Label>
                        <Select
                          value={jobFormData.type}
                          onValueChange={(value) => setJobFormData({ ...jobFormData, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full Time</SelectItem>
                            <SelectItem value="part-time">Part Time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="jobSalary">Salary (Optional)</Label>
                        <Input
                          id="jobSalary"
                          value={jobFormData.salary}
                          onChange={(e) => setJobFormData({ ...jobFormData, salary: e.target.value })}
                          placeholder="$80,000 - $120,000"
                        />
                      </div>

                      <div>
                        <Label htmlFor="jobLink">Application Link *</Label>
                        <Input
                          id="jobLink"
                          value={jobFormData.link}
                          onChange={(e) => setJobFormData({ ...jobFormData, link: e.target.value })}
                          placeholder="https://company.com/careers/job-id"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmittingJob}
                      >
                        {isSubmittingJob ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Post Job
                          </>
                        )}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
