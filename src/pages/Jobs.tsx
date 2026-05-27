import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, DollarSign, Building, ExternalLink, Plus, Sparkles, Loader2, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { scrapeContentDirectly } from "@/utils/frontend-scraper";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export default function Jobs() {
  const { user: authUser, isAuthenticated, isLoading: isAuthLoading, signIn } = useAuth();
  const address = authUser?.wallet_address;
  const isConnected = isAuthenticated;
  const isAdmin = authUser?.role === "admin";
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrapingJobs, setIsScrapingJobs] = useState(false);
  const [isScraperOpen, setIsScraperOpen] = useState(false);
  const [scraperMode, setScraperMode] = useState<"ai" | "url">("ai");
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    type: "full-time",
    salary: "",
    link: "",
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast.error("Please connect your wallet to post a job");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          title: formData.title,
          company: formData.company,
          description: formData.description,
          location: formData.location,
          type: formData.type,
          salary: formData.salary || null,
          link: formData.link,
          wallet_address: address,
          is_approved: true // Auto-approve for now
        });

      if (error) throw error;

      toast.success(isAdmin ? "✅ Job posted successfully!" : "✅ Job submitted for review! Admin will approve it soon.");
      setIsOpen(false);
      setFormData({
        title: "",
        company: "",
        description: "",
        location: "",
        type: "full-time",
        salary: "",
        link: "",
      });
      fetchJobs();
    } catch (error) {
      toast.error("Failed to post job");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScrapeJobs = async () => {
    if (!isAdmin) {
      toast.error("Only admins can use AI Job Scraper");
      return;
    }

    if (scraperMode === "url" && !scrapeUrl.trim()) {
      toast.error("Please enter a URL to scrape");
      return;
    }

    setIsScrapingJobs(true);
    try {
      if (scraperMode === "ai") {
        toast.info("AI Generation mode is currently transitioning to frontend. Please use 'Scrape URL' for now.");
        setIsScrapingJobs(false);
        return;
      }

      const result = await scrapeContentDirectly(scrapeUrl.trim(), 'jobs');
      
      if (!result.success) throw new Error(result.error || "Scraping failed");

      const { error: insertError } = await supabase.from('jobs').insert({
        ...result.data,
        wallet_address: address,
        is_approved: isAdmin
      });

      if (insertError) throw insertError;

      toast.success("✅ Job scraped and posted successfully!");
      setIsScraperOpen(false);
      setScrapeUrl("");
      fetchJobs();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to scrape job");
    } finally {
      setIsScrapingJobs(false);
    }
  };

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    jobs.forEach((job: any) => {
      if (job.location) {
        locations.add(job.location);
      }
    });
    return Array.from(locations).sort();
  }, [jobs]);

  const jobTypes = ["full-time", "part-time", "contract", "internship"];

  const filteredResults = jobs.filter((job: any) => {
    if (locationFilter !== "all" && job.location !== locationFilter) return false;
    if (typeFilter !== "all" && job.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const title = job.title?.toLowerCase() || "";
      const company = job.company?.toLowerCase() || "";
      const description = job.description?.toLowerCase() || "";
      const location = job.location?.toLowerCase() || "";
      if (!title.includes(query) && !company.includes(query) && !description.includes(query) && !location.includes(query)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-32 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 cyber-glitch" data-text="Career Hub">Career Hub</h1>
            <p className="text-sm md:text-base text-muted-foreground">Find your dream job in tech.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {isAdmin && (
              <Dialog open={isScraperOpen} onOpenChange={setIsScraperOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-purple-500 text-purple-500 hover:bg-purple-500/10 w-full sm:w-auto"
                  >
                    <Sparkles className="mr-2 h-4 w-4" /> AI Job Scraper
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      AI Job Scraper
                    </DialogTitle>
                    <DialogDescription>
                      Use AI to automatically scrape and post job listings
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Scraper Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={scraperMode === "ai" ? "default" : "outline"}
                          className="w-full"
                          onClick={() => setScraperMode("ai")}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          AI Generate
                        </Button>
                        <Button
                          type="button"
                          variant={scraperMode === "url" ? "default" : "outline"}
                          className="w-full"
                          onClick={() => setScraperMode("url")}
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          Scrape URL
                        </Button>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {scraperMode === "ai" ? (
                          <>
                            <strong>AI Generate:</strong> AI will create 8-10 realistic Web3 and blockchain job listings from top companies.
                          </>
                        ) : (
                          <>
                            <strong>Scrape URL:</strong> AI will analyze a job board webpage and extract all job listings automatically.
                          </>
                        )}
                      </p>
                    </div>

                    {scraperMode === "url" && (
                      <div className="space-y-2">
                        <label htmlFor="scrape-url" className="text-sm font-medium">
                          Job Board URL
                        </label>
                        <Input
                          id="scrape-url"
                          type="url"
                          placeholder="https://example.com/jobs"
                          value={scrapeUrl}
                          onChange={(e) => setScrapeUrl(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsScraperOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 bg-purple-500 hover:bg-purple-600"
                        onClick={handleScrapeJobs}
                      >
                        Start Scraping
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Post a Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post a New Job</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Senior React Developer"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Tech Corp"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Job description and requirements..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Remote / City"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Job Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="salary">Salary (optional)</Label>
                    <Input
                      id="salary"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="$80k - $120k"
                    />
                  </div>

                  <div>
                    <Label htmlFor="link">Application Link *</Label>
                    <Input
                      id="link"
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      placeholder="https://company.com/apply"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Posting..." : "Post Job"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-3">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              type="text"
              placeholder="Search jobs by title, company, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-card/30 animate-pulse border border-primary/10" />
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-primary/20 rounded-lg bg-card/10">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredResults.map((job: any, i: number) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative cursor-pointer"
                onClick={() => navigate(`/jobs/${job.slug || job.id}`)}
              >
                <div className="bg-card border border-primary/10 rounded-lg p-6 group-hover:border-primary/50 transition-all group-hover:bg-card/50 flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Building className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">{job.title}</h3>
                      <Badge variant="outline" className="border-primary/30 text-primary text-xs">{job.type}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-4 gap-y-1.5">
                      <span className="flex items-center"><Building className="h-3 w-3 mr-1" /> {job.company}</span>
                      <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {job.location}</span>
                      {job.salary && <span className="flex items-center text-accent"><DollarSign className="h-3 w-3 mr-1" /> {job.salary}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <div className="text-xs text-muted-foreground hidden md:block">
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90" 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isAuthenticated && signIn) {
                          toast.error("Please connect your wallet to apply");
                          signIn();
                          return;
                        }
                        window.open(job.link, "_blank");
                      }}
                    >
                      Apply Now <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
