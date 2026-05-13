import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, CheckCircle, XCircle, UserPlus, UserMinus, Edit, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";

type ActivityType =
  | "approval"
  | "rejection"
  | "creation"
  | "deletion"
  | "permission_granted"
  | "permission_revoked"
  | "update";

interface Activity {
  id: string;
  type: ActivityType;
  action: string;
  target: string;
  user: string;
  timestamp: number;
}

export function ActivityLog() {
  // Mock activity data - in real implementation, this would come from a query
  const activities: Activity[] = [
    {
      id: "1",
      type: "approval",
      action: "Approved hackathon",
      target: "Web3 Hackathon 2024",
      user: "Super Admin",
      timestamp: Date.now() - 300000, // 5 minutes ago
    },
    {
      id: "2",
      type: "creation",
      action: "Created event",
      target: "React Conference",
      user: "Super Admin",
      timestamp: Date.now() - 900000, // 15 minutes ago
    },
    {
      id: "3",
      type: "permission_granted",
      action: "Granted post hackathons permission",
      target: "user@example.com",
      user: "Super Admin",
      timestamp: Date.now() - 1800000, // 30 minutes ago
    },
    {
      id: "4",
      type: "rejection",
      action: "Rejected job posting",
      target: "Fake Job Position",
      user: "Super Admin",
      timestamp: Date.now() - 3600000, // 1 hour ago
    },
    {
      id: "5",
      type: "update",
      action: "Updated event details",
      target: "AI/ML Workshop",
      user: "Super Admin",
      timestamp: Date.now() - 7200000, // 2 hours ago
    },
    {
      id: "6",
      type: "deletion",
      action: "Deleted spam content",
      target: "Malicious Hackathon",
      user: "Super Admin",
      timestamp: Date.now() - 10800000, // 3 hours ago
    },
    {
      id: "7",
      type: "approval",
      action: "Approved job posting",
      target: "Senior Developer Position",
      user: "Super Admin",
      timestamp: Date.now() - 14400000, // 4 hours ago
    },
    {
      id: "8",
      type: "permission_revoked",
      action: "Revoked post events permission",
      target: "spam@example.com",
      user: "Super Admin",
      timestamp: Date.now() - 18000000, // 5 hours ago
    },
  ];

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "approval":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejection":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "creation":
        return <Plus className="h-4 w-4 text-blue-500" />;
      case "deletion":
        return <Trash2 className="h-4 w-4 text-orange-500" />;
      case "permission_granted":
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      case "permission_revoked":
        return <UserMinus className="h-4 w-4 text-yellow-500" />;
      case "update":
        return <Edit className="h-4 w-4 text-cyan-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case "approval":
        return "text-green-500 bg-green-500/10";
      case "rejection":
        return "text-red-500 bg-red-500/10";
      case "creation":
        return "text-blue-500 bg-blue-500/10";
      case "deletion":
        return "text-orange-500 bg-orange-500/10";
      case "permission_granted":
        return "text-purple-500 bg-purple-500/10";
      case "permission_revoked":
        return "text-yellow-500 bg-yellow-500/10";
      case "update":
        return "text-cyan-500 bg-cyan-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

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

  const formatFullDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>
            Track all admin actions and system changes
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Last 24 hours of admin actions</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-8 pb-4 border-l-2 border-border/50 last:border-l-0 last:pb-0"
                >
                  <div
                    className={`absolute left-[-9px] top-1 p-1.5 rounded-full ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Target:</span> {activity.target}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {activity.type.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        by {activity.user}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {formatFullDate(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-500">
                {activities.filter((a) => a.type === "approval").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Approvals</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-500">
                {activities.filter((a) => a.type === "rejection").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Rejections</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Plus className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-500">
                {activities.filter((a) => a.type === "creation").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Creations</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <UserPlus className="h-6 w-6 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-500">
                {
                  activities.filter(
                    (a) => a.type === "permission_granted" || a.type === "permission_revoked"
                  ).length
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">Permissions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
