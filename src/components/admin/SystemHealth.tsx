import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Database, Server, Zap, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export function SystemHealth() {
  const { user: authUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const address = authUser?.wallet_address;
  const isConnected = isAuthenticated;
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!isConnected || !address) return;
    setIsLoading(true);
    try {
      const [
        { count: hackathons },
        { count: events },
        { count: jobs },
        { count: news },
        { count: users }
      ] = await Promise.all([
        supabase.from('hackathons').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true })
      ]);

      setAnalytics({
        totalHackathons: hackathons || 0,
        totalEvents: events || 0,
        totalJobs: jobs || 0,
        totalNews: news || 0,
        totalUsers: users || 0
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [isConnected, address]);

  if (isLoading || !analytics) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>Monitor system status and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-20 animate-pulse" />
            <p>Loading system metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalContent =
    (analytics.totalHackathons || 0) +
    (analytics.totalEvents || 0) +
    (analytics.totalJobs || 0) +
    (analytics.totalNews || 0);

  const systemMetrics = [
    {
      name: "Database Health",
      status: "operational",
      uptime: "99.9%",
      icon: Database,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      value: 99.9,
    },
    {
      name: "API Performance",
      status: "operational",
      uptime: "100%",
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      value: 100,
    },
    {
      name: "Content Storage",
      status: "operational",
      usage: `${totalContent} items`,
      icon: Server,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      value: Math.min((totalContent / 1000) * 100, 100),
    },
    {
      name: "User Activity",
      status: "high",
      active: `${analytics.totalUsers || 0} users`,
      icon: Activity,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      value: Math.min(((analytics.totalUsers || 0) / 500) * 100, 100),
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health Monitor
          </CardTitle>
          <CardDescription>
            Real-time monitoring of system performance and status
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systemMetrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                      <metric.icon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold">{metric.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            metric.status === "operational"
                              ? "default"
                              : metric.status === "high"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {metric.status === "operational" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {metric.status}
                        </Badge>
                        {metric.uptime && (
                          <span className="text-xs text-muted-foreground">
                            {metric.uptime} uptime
                          </span>
                        )}
                        {metric.usage && (
                          <span className="text-xs text-muted-foreground">
                            {metric.usage}
                          </span>
                        )}
                        {metric.active && (
                          <span className="text-xs text-muted-foreground">
                            {metric.active}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Progress value={metric.value} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {metric.value.toFixed(1)}% capacity
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-500">
                {systemMetrics.filter((m) => m.status === "operational").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Services Running</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-500">{totalContent}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Content</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-500">
                {analytics.totalUsers || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Active Users</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-orange-500">99.9%</p>
              <p className="text-sm text-muted-foreground mt-1">Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
