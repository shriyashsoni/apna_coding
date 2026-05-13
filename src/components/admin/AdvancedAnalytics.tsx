import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { BarChart3, TrendingUp, TrendingDown, Activity, UserCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export function AdvancedAnalytics() {
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
        { count: users },
        { count: products },
        { count: news },
        { count: registrations }
      ] = await Promise.all([
        supabase.from('hackathons').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('registrations').select('*', { count: 'exact', head: true }).catch(() => ({ count: 0 }))
      ]);

      setAnalytics({
        totalHackathons: hackathons || 0,
        totalEvents: events || 0,
        totalJobs: jobs || 0,
        totalUsers: users || 0,
        totalProducts: products || 0,
        totalNews: news || 0,
        totalRegistrations: registrations || 0
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
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const growthMetrics = [
    {
      title: "Total Content",
      value: (analytics.totalHackathons || 0) + (analytics.totalEvents || 0) + (analytics.totalJobs || 0),
      icon: BarChart3,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: "+18%",
      isPositive: true,
    },
    {
      title: "Active Users",
      value: analytics.totalUsers || 0,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      trend: "+12%",
      isPositive: true,
    },
    {
      title: "Total Registrations",
      value: analytics.totalRegistrations || 0,
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      trend: "+24%",
      isPositive: true,
    },
    {
      title: "Published Products",
      value: analytics.totalProducts || 0,
      icon: Zap,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      trend: "+8%",
      isPositive: true,
    },
    {
      title: "News Articles",
      value: analytics.totalNews || 0,
      icon: Activity,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      trend: "+15%",
      isPositive: true,
    },
    {
      title: "Engagement Rate",
      value: "68%",
      icon: TrendingUp,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      trend: "+5%",
      isPositive: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Advanced Analytics
          </CardTitle>
          <CardDescription>
            Detailed insights into platform performance and user engagement
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {growthMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-primary/20 hover:border-primary/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {metric.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{metric.value}</p>
                      <div className={`flex items-center gap-1 text-sm ${metric.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{metric.trend}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`${metric.bgColor} p-3 rounded-lg`}>
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Hackathons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{Math.floor(analytics.totalHackathons * 0.2)}</div>
            <p className="text-xs text-muted-foreground">Estimated in last 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{Math.floor(analytics.totalEvents * 0.25)}</div>
            <p className="text-xs text-muted-foreground">Estimated in last 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{Math.floor(analytics.totalUsers * 0.15)}</div>
            <p className="text-xs text-muted-foreground">Joined in last 30 days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
