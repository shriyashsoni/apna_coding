import { useParams, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { useSupabaseMutation } from "@/hooks/useSupabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, MapPin, DollarSign, Building, ExternalLink, Trash2, AlertCircle, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ShareButtons } from "@/components/ShareButtons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function JobDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const address = user?.wallet_address;
  const [job, setJob] = useState<any>(undefined);
  const { mutate: deleteJobMutate } = useSupabaseMutation('jobs');

  useEffect(() => {
    async function fetchJob() {
      if (!slug) return;
      
      // Try fetching by slug first, then ID if it's a UUID
      let query = supabase.from('jobs').select('*');
      
      if (slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        query = query.eq('id', slug);
      } else {
        query = query.eq('slug', slug);
      }

      const { data, error } = await query.single();
      
      if (error) {
        console.error("Error fetching job:", error);
        setJob(null);
      } else {
        setJob(data);
      }
    }
    fetchJob();
  }, [slug]);

  if (job === undefined) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading job details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (job === null) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
            <p className="text-muted-foreground mb-6">This job listing doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/jobs")}>Back to Jobs</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const canDelete = () => {
    if (!user || !address) return false;
    if (user.role === "admin") return true;
    if (job.wallet_address && job.wallet_address.toLowerCase() === address.toLowerCase()) return true;
    return false;
  };

  const handleDelete = async () => {
    if (!address || !job?.id) return;
    try {
      await deleteJobMutate('delete', null, { id: job.id });
      toast.success("Job deleted successfully");
      navigate("/jobs");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete job");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        title={`${job.title} at ${job.company}`}
        description={job.description}
        image={job.image_url || undefined}
        url={`/jobs/${job.slug || job.id}`}
        type="article"
        publishedTime={new Date(job.created_at).toISOString()}
      />
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {job.type}
                    </Badge>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {job.location}
                    </Badge>
                    {job.salary && (
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                        {job.salary}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-3 cyber-glitch" data-text={job.title}>
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-xl text-muted-foreground">
                    <Building className="h-5 w-5 text-primary" />
                    <span>{job.company}</span>
                  </div>
                </div>

                {canDelete() && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this job listing? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                          Delete Job
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <Card className="border-primary/20 bg-card/50">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-6">Job Description</h2>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg">
                        {job.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Apply Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,255,0.4)] text-lg px-8 py-6"
                    onClick={() => window.open(job.link || job.external_url, "_blank")}
                  >
                    Apply for this Position
                    <ExternalLink className="ml-2 h-5 w-5" />
                  </Button>
                  
                  <ShareButtons
                    url={`/jobs/${job.slug || job.id}`}
                    title={`${job.title} at ${job.company}`}
                    description={job.description}
                    hashtags={['jobs', 'tech', 'web3', 'apnacoding']}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="border-primary/20 bg-card/50 sticky top-24">
                  <CardContent className="p-6 space-y-6">
                    <h3 className="font-bold text-xl mb-4 border-b border-border pb-2">Job Overview</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{job.location}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Job Type</p>
                          <p className="text-sm text-muted-foreground capitalize">{job.type}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-accent mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Salary Range</p>
                          <p className="text-sm text-muted-foreground">{job.salary || "Not specified"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-secondary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Posted On</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(job.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => navigate("/jobs")}
                    >
                      View All Jobs
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
