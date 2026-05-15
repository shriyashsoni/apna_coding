import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Bot, 
  Power, 
  Zap, 
  Search, 
  Twitter, 
  Send, 
  Instagram, 
  MessageSquare,
  Activity,
  History,
  Settings2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Globe,
  Newspaper,
  Trophy,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function AutonomousAgentManager() {
  const [isActive, setIsActive] = useState(true);
  const [scanningStatus, setScanningStatus] = useState<string>("Idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    itemsFound: 0,
    autoPublished: 0,
    socialPosts: 0,
    activeHours: 0
  });

  const fetchStats = async () => {
    try {
      const [hackathons, jobs, news, logsData] = await Promise.all([
        supabase.from('hackathons').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('news').select('id', { count: 'exact', head: true }),
        supabase.from('autonomous_agent_logs').select('*').order('timestamp', { ascending: false }).limit(20)
      ]);

      setStats({
        itemsFound: (hackathons.count || 0) + (jobs.count || 0) + (news.count || 0),
        autoPublished: (hackathons.count || 0) + (jobs.count || 0) + (news.count || 0),
        socialPosts: logsData.data?.filter(l => l.action_type === 'social').length || 0,
        activeHours: 24
      });
      
      setLogs(logsData.data || []);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const triggerAgentCycle = async () => {
    if (!isActive) return;
    try {
      setScanningStatus("Initiating Web Search...");
      const { data, error } = await supabase.functions.invoke('autonomous-master-agent');
      if (error) throw error;
      
      fetchLogs();
      toast.success(`Cycle complete: ${data.published} new items published!`);
    } catch (err: any) {
      console.error("Agent cycle failed:", err);
      toast.error("Agent cycle encountered an error.");
    } finally {
      setScanningStatus("Idle - Monitoring Industry");
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5s for real-time feel
    return () => clearInterval(interval);
  }, []);

  // Mock activity simulation for the UI progress bar
  useEffect(() => {
    if (isActive) {
      triggerAgentCycle();
      const cycleInterval = setInterval(triggerAgentCycle, 1000 * 60 * 60); // Run every hour
      
      const progressInterval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 1));
      }, 5000);

      return () => {
        clearInterval(cycleInterval);
        clearInterval(progressInterval);
      };
    }
  }, [isActive]);

  const addLog = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    setLogs(prev => [{
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }, ...prev.slice(0, 19)]);
  };

  const handleToggle = (checked: boolean) => {
    setIsActive(checked);
    if (checked) {
      toast.success("Super Agent Activated! Monitoring 24/7...");
      addLog("Master AI Agent Online. Initiating global industry scan.", "success");
    } else {
      toast.warning("Super Agent Deactivated.");
      addLog("Agent going offline.", "warning");
      setScanningStatus("Idle");
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Control Card */}
      <Card className={`border-2 transition-all duration-500 ${isActive ? 'border-primary shadow-[0_0_20px_rgba(0,255,255,0.2)]' : 'border-border'}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isActive ? 'bg-primary/20 animate-pulse' : 'bg-muted'}`}>
              <Bot className={`h-8 w-8 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Autonomous Super Agent</CardTitle>
              <CardDescription>Industry-wide discovery, auto-publishing, and social broadcasting</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isActive ? "default" : "secondary"} className="px-3 py-1">
               {isActive ? "SYSTEM ACTIVE 24/7" : "PAUSED"}
            </Badge>
            <Switch checked={isActive} onCheckedChange={handleToggle} />
          </div>
        </CardHeader>
        <CardContent>
          {isActive ? (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="flex items-center gap-2 text-primary font-medium">
                  <Activity className="h-4 w-4 animate-spin" />
                   {isActive ? (scanningStatus === "Idle" ? "Agent Monitoring 24/7" : scanningStatus) : "System Paused"}
                </span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-4 bg-background/50 rounded-lg border border-primary/20 text-center">
                  <Search className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{stats.itemsFound}</div>
                  <div className="text-xs text-muted-foreground">Items Found</div>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-green-500/20 text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{stats.autoPublished}</div>
                  <div className="text-xs text-muted-foreground">Auto Published</div>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-blue-500/20 text-center">
                  <Twitter className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{stats.socialPosts}</div>
                  <div className="text-xs text-muted-foreground">Social Posts</div>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-purple-500/20 text-center">
                  <Zap className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-xs text-muted-foreground">Status</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Power className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Toggle the switch to activate the Autonomous Industry Agent</p>
              <p className="text-sm mt-2">The agent will automatically discover content and manage your social presence</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logs / Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Live Intelligence Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground italic">
                  No activity recorded yet
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-md bg-muted/30 border border-border/50">
                    <span className="text-[10px] font-mono text-muted-foreground mt-1 whitespace-nowrap">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <div className="flex-1 text-sm">
                      <span className={`
                        ${log.status === 'success' ? 'text-green-500' : ''}
                        ${log.status === 'warning' ? 'text-yellow-500' : ''}
                        ${log.status === 'error' ? 'text-red-500' : ''}
                      `}>
                        {log.message}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration / Channels */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Channel Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-md text-blue-500">
                    <Twitter className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Twitter (X)</p>
                    <p className="text-[10px] text-muted-foreground">Connected as @ApnaCoding</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">LIVE</Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-500/10 rounded-md text-sky-500">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Telegram</p>
                    <p className="text-[10px] text-muted-foreground">Bot Active</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">LIVE</Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 opacity-50">
                  <div className="p-2 bg-pink-500/10 rounded-md text-pink-500">
                    <Instagram className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Instagram</p>
                    <p className="text-[10px] text-muted-foreground">Pending Setup</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-[10px]">Setup</Button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 opacity-50">
                  <div className="p-2 bg-green-500/10 rounded-md text-green-500">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">WhatsApp</p>
                    <p className="text-[10px] text-muted-foreground">Pending Setup</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-[10px]">Setup</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Intelligence Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">Ethereum</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20">Solana</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20">AI Agents</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20">Hackathons</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20">DePIN</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20">RWA</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs">
                Update Focus Areas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
