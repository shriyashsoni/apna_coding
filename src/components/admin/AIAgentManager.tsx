import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Bot,
  Sparkles,
  Link as LinkIcon,
  FileText,
  Plus,
  Trash2,
  Eye,
  Loader2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";
import { scrapeContentDirectly } from "@/utils/frontend-scraper";

export function AIAgentManager() {
  const { user: authUser } = useAuth();
  const address = authUser?.wallet_address;
  const [selectedJobType, setSelectedJobType] = useState<string>("community");
  const [sourceType, setSourceType] = useState<string>("url");
  const [sourceData, setSourceData] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_agent_jobs')
        .select('*')
        .order('initiated_at', { ascending: false });
      if (error) throw error;
      setJobs(data || []);

      // Calculate stats
      if (data) {
        const total = data.length;
        const completed = data.filter(j => j.status === 'completed').length;
        const processing = data.filter(j => j.status === 'processing').length;
        const failed = data.filter(j => j.status === 'failed').length;
        setStats({ total, completed, processing, failed, avgProcessingTime: 0, totalTokensUsed: 0 });
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!sourceData.trim()) {
      toast.error("Please provide source data");
      return;
    }

    setIsCreating(true);
    try {
      // 1. Create the job entry
      const { data: job, error: jobError } = await supabase
        .from('ai_agent_jobs')
        .insert({
          job_type: selectedJobType,
          source_type: sourceType,
          source_data: sourceData,
          status: 'pending',
          initiated_at: new Date().toISOString(),
          wallet_address: address
        })
        .select()
        .single();

      if (jobError) throw jobError;

      toast.success("Job created! AI extraction started in background...");
      setSourceData("");
      fetchJobs();

      // 2. Invoke the backend processing function
      const { data: processResult, error: processError } = await supabase.functions.invoke('process-ai-job', {
        body: { job_id: job.id }
      });

      if (processError) throw processError;

      toast.success("AI extraction completed and sent to approval section!");
      fetchJobs();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create extraction job");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!address) return;

    try {
      const { error } = await supabase.from('ai_agent_jobs').delete().eq('id', jobId);
      if (error) throw error;
      toast.success("Job deleted");
      fetchJobs();
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":
        return "default";
      case "processing":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case "community":
        return "🌐";
      case "news":
        return "📰";
      case "hackathon":
        return "🏆";
      default:
        return "📄";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            AI Agent Auto-Extraction
          </h2>
          <p className="text-muted-foreground mt-2">
            Automatically extract and create content from URLs or text using AI
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create Extraction Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create AI Extraction Job
              </DialogTitle>
              <DialogDescription>
                AI will automatically extract information and create content
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <Label>Content Type</Label>
                <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="community">🌐 Community Page</SelectItem>
                    <SelectItem value="news">📰 News Article</SelectItem>
                    <SelectItem value="hackathon">🏆 Hackathon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Source Type</Label>
                <Select value={sourceType} onValueChange={setSourceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">🔗 URL</SelectItem>
                    <SelectItem value="text">📝 Text/Description</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  {sourceType === "url" ? "URL" : "Text Content"}
                </Label>
                {sourceType === "url" ? (
                  <Input
                    value={sourceData}
                    onChange={(e) => setSourceData(e.target.value)}
                    placeholder="https://example.com/community"
                    type="url"
                  />
                ) : (
                  <Textarea
                    value={sourceData}
                    onChange={(e) => setSourceData(e.target.value)}
                    placeholder="Paste content or description here..."
                    rows={6}
                  />
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  AI will analyze and extract structured information to create content
                </p>
              </div>

              <Button
                type="submit"
                disabled={isCreating || !sourceData.trim()}
                className="w-full gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Start AI Extraction
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {stats.completed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {stats.processing}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">
                {stats.failed}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      {stats && stats.completed > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.avgProcessingTime / 1000).toFixed(2)}s
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tokens Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalTokensUsed.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {((stats.completed / stats.total) * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Jobs
          </CardTitle>
          <CardDescription>
            View and manage AI extraction jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!jobs || jobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No extraction jobs yet</p>
              <p className="text-sm">Create your first AI extraction job to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">
                            {getJobTypeIcon(job.job_type)}
                          </span>
                          <div>
                            <CardTitle className="text-lg capitalize">
                              {job.job_type} Extraction
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {job.source_type === "url" ? "🔗 " : "📝 "}
                              {job.source_data.substring(0, 100)}
                              {job.source_data.length > 100 ? "..." : ""}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Created: {new Date(job.initiated_at).toLocaleString()}
                          </span>
                          {job.completed_at && (
                            <span>
                              Completed: {new Date(job.completed_at).toLocaleString()}
                            </span>
                          )}
                          {job.processing_time && (
                            <span>
                              ⚡ {(job.processing_time / 1000).toFixed(2)}s
                            </span>
                          )}
                          {job.tokens_used && (
                            <span>🎯 {job.tokens_used} tokens</span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {job.status === "completed" && job.created_item_id && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => {
                                const url =
                                  job.created_item_type === "community"
                                    ? `/community/${job.extracted_data?.slug}`
                                    : job.created_item_type === "news"
                                    ? `/news/${job.extracted_data?.slug}`
                                    : `/hackathons`;
                                window.open(url, "_blank");
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {job.error && (
                        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive">
                          <strong>Error:</strong> {job.error}
                        </div>
                      )}

                      {job.status === "completed" && job.extracted_data && (
                        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded">
                          <div className="text-sm">
                            <strong className="text-primary">✅ Created:</strong>{" "}
                            {job.extracted_data.name || job.extracted_data.title}
                          </div>
                          {job.extracted_data.slug && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Slug: {job.extracted_data.slug}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
