import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, Calendar, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export function QuickStats() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [
        { count: usersCount },
        { count: hackathonsCount },
        { count: eventsCount },
        { count: jobsCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('hackathons').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true })
      ]);

      setStats([
        {
          title: "Total Users",
          value: usersCount || 0,
          icon: Users,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          trend: "+12% from last month",
        },
        {
          title: "Hackathons",
          value: hackathonsCount || 0,
          icon: Trophy,
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
          trend: "Active hackathons",
        },
        {
          title: "Events",
          value: eventsCount || 0,
          icon: Calendar,
          color: "text-cyan-500",
          bgColor: "bg-cyan-500/10",
          trend: "Upcoming events",
        },
        {
          title: "Jobs",
          value: jobsCount || 0,
          icon: Briefcase,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          trend: "Active listings",
        },
      ]);
    } catch (error) {
      console.error("Error fetching quick stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-primary/20">
            <CardHeader className="pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
