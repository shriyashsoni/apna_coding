import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Calendar, Briefcase, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export function RecentActivity() {
  const { user: authUser } = useAuth();
  const address = authUser?.wallet_address;
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecentActivity = async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const [
        { data: hackathons },
        { data: events },
        { data: jobs }
      ] = await Promise.all([
        supabase.from('hackathons').select('*').eq('is_approved', false).order('created_at', { ascending: false }).limit(5),
        supabase.from('events').select('*').eq('is_approved', false).order('created_at', { ascending: false }).limit(5),
        supabase.from('jobs').select('*').eq('is_approved', false).order('created_at', { ascending: false }).limit(5)
      ]);

      const items: any[] = [];

      if (hackathons) {
        hackathons.forEach((item: any) => {
          items.push({
            type: "hackathon",
            title: item.name,
            timestamp: new Date(item.created_at).getTime(),
            icon: Trophy,
            color: "text-purple-500",
            badge: "Pending Approval",
            badgeVariant: "destructive" as const,
          });
        });
      }

      if (events) {
        events.forEach((item: any) => {
          items.push({
            type: "event",
            title: item.title,
            timestamp: new Date(item.created_at).getTime(),
            icon: Calendar,
            color: "text-blue-500",
            badge: "Pending Approval",
            badgeVariant: "destructive" as const,
          });
        });
      }

      if (jobs) {
        jobs.forEach((item: any) => {
          items.push({
            type: "job",
            title: item.title,
            timestamp: new Date(item.created_at).getTime(),
            icon: Briefcase,
            color: "text-green-500",
            badge: "Pending Approval",
            badgeVariant: "destructive" as const,
          });
        });
      }

      items.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(items);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, [address]);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest content submissions awaiting approval</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-20 animate-pulse" />
              <p>Loading activity...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 10).map((activity, index) => (
                <motion.div
                  key={`${activity.type}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className={`${activity.color} mt-1`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={activity.badgeVariant} className="text-xs">
                        {activity.badge}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
