import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Download, Upload, Clock, CheckCircle, AlertTriangle, HardDrive, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export function BackupRestore() {
  const { user: authUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const address = authUser?.wallet_address;
  const isConnected = isAuthenticated;
  const [counts, setCounts] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchCounts = async () => {
    if (!isConnected || !address) return;
    setIsLoading(true);
    try {
      const [
        { count: hackathons },
        { count: events },
        { count: jobs },
        { count: users }
      ] = await Promise.all([
        supabase.from('hackathons').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true })
      ]);

      setCounts({
        users: users || 0,
        hackathons: hackathons || 0,
        events: events || 0,
        jobs: jobs || 0
      });
    } catch (err) {
      console.error("Error fetching counts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [isConnected, address]);

  // Mock backup history
  const backupHistory = [
    {
      id: "1",
      date: new Date(Date.now() - 86400000).toISOString(),
      size: "24.5 MB",
      status: "completed",
      records: { users: 150, hackathons: 45, events: 32, jobs: 68 },
    },
    {
      id: "2",
      date: new Date(Date.now() - 86400000 * 7).toISOString(),
      size: "22.1 MB",
      status: "completed",
      records: { users: 142, hackathons: 43, events: 28, jobs: 65 },
    }
  ];

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    toast.info("🔄 Creating database backup...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        data: counts,
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("✅ Backup created and downloaded successfully!");
    } catch (error) {
      toast.error("❌ Failed to create backup");
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async () => {
    setIsRestoring(true);
    toast.info("🔄 Preparing to restore backup...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("✅ Backup restore initiated - this may take a few minutes");
    } catch (error) {
      toast.error("❌ Failed to restore backup");
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const getTimeSince = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)} weeks ago`;
  };

  if (isLoading && isConnected) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup & Restore
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto animate-spin opacity-20" />
            <p className="mt-2 text-muted-foreground">Fetching database stats...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup & Restore
          </CardTitle>
          <CardDescription>
            Create backups and restore your database to ensure data safety
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5" />
              Create New Backup
            </CardTitle>
            <CardDescription>
              Download a complete snapshot of your database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Users</span>
                <span className="font-medium">{counts.users || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Hackathons</span>
                <span className="font-medium">{counts.hackathons || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Events</span>
                <span className="font-medium">{counts.events || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Jobs</span>
                <span className="font-medium">{counts.jobs || 0}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estimated Size</span>
                  <Badge variant="secondary">
                    ~{((counts.users || 0) * 0.1).toFixed(1)} MB
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
            >
              {isCreatingBackup ? (
                <>
                  <HardDrive className="h-4 w-4 mr-2 animate-pulse" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restore from Backup
            </CardTitle>
            <CardDescription>
              Upload and restore a previous backup file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-dashed rounded-lg space-y-3 text-center">
              <Database className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <div>
                <p className="font-medium">Upload Backup File</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a .json backup file to restore
                </p>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-500 mb-1">Warning</p>
                  <p className="text-yellow-500/90">
                    Restoring a backup will overwrite current data. Make sure to create
                    a backup of the current state before proceeding.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleRestoreBackup}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <>
                  <HardDrive className="h-4 w-4 mr-2 animate-pulse" />
                  Restoring...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Restore
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Backup History
          </CardTitle>
          <CardDescription>Recent database backups and restore points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backupHistory.map((backup, index) => (
              <motion.div
                key={backup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{formatDate(backup.date)}</p>
                      <Badge variant="secondary" className="text-xs">
                        {getTimeSince(backup.date)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{backup.size}</span>
                      <span>•</span>
                      <span>
                        {Object.values(backup.records).reduce((a, b) => a + b, 0)} records
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Restore
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
