import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Shield, Users, Check, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export function PermissionsManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTogglePermission = async (
    userId: string,
    permission: string,
    currentValue: boolean
  ) => {
    setProcessing(`${userId}-${permission}`);
    try {
      const { error } = await supabase
        .from('users')
        .update({ [permission]: !currentValue })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success(`Permission ${!currentValue ? "granted" : "revoked"} successfully`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update permission");
    } finally {
      setProcessing(null);
    }
  };

  const handleGrantAll = async (userId: string) => {
    setProcessing(`${userId}-all-grant`);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          can_post_hackathons: true,
          can_post_events: true,
          can_post_jobs: true
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success("✅ All permissions granted successfully!");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to grant permissions");
    } finally {
      setProcessing(null);
    }
  };

  const handleRevokeAll = async (userId: string) => {
    setProcessing(`${userId}-all-revoke`);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          can_post_hackathons: false,
          can_post_events: false,
          can_post_jobs: false
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success("🚫 All permissions revoked successfully!");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke permissions");
    } finally {
      setProcessing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>User Permissions Manager</CardTitle>
              <CardDescription>
                Grant or revoke content posting permissions to users. Only Super Admin can manage permissions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Can Post Hackathons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {users.filter((u: any) => u.can_post_hackathons).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Can Post Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {users.filter((u: any) => u.can_post_events).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Can Post Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {users.filter((u: any) => u.can_post_jobs).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Users & Permissions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user: any, index: number) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border rounded-lg p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{user.name || 'Anonymous'}</h3>
                      {user.is_super_admin && (
                        <Badge variant="destructive" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          SUPER ADMIN
                        </Badge>
                      )}
                      {user.role === "admin" && !user.is_super_admin && (
                        <Badge variant="secondary" className="text-xs">Admin</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{user.email}</p>
                      <p className="font-mono text-xs">{user.wallet_address}</p>
                    </div>
                  </div>

                  {/* Permissions */}
                  {!user.is_super_admin && (
                    <div className="flex flex-col gap-3">
                      {/* Individual Permissions */}
                      <div className="flex flex-wrap gap-3">
                        {/* Hackathons Permission */}
                        <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md">
                          <Switch
                            checked={user.can_post_hackathons}
                            onCheckedChange={() =>
                              handleTogglePermission(
                                user.id,
                                "can_post_hackathons",
                                user.can_post_hackathons
                              )
                            }
                            disabled={processing === `${user.id}-can_post_hackathons`}
                          />
                          <span className="text-sm">Hackathons</span>
                          {user.can_post_hackathons && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>

                        {/* Events Permission */}
                        <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md">
                          <Switch
                            checked={user.can_post_events}
                            onCheckedChange={() =>
                              handleTogglePermission(
                                user.id,
                                "can_post_events",
                                user.can_post_events
                              )
                            }
                            disabled={processing === `${user.id}-can_post_events`}
                          />
                          <span className="text-sm">Events</span>
                          {user.can_post_events && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>

                        {/* Jobs Permission */}
                        <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md">
                          <Switch
                            checked={user.can_post_jobs}
                            onCheckedChange={() =>
                              handleTogglePermission(
                                user.id,
                                "can_post_jobs",
                                user.can_post_jobs
                              )
                            }
                            disabled={processing === `${user.id}-can_post_jobs`}
                          />
                          <span className="text-sm">Jobs</span>
                          {user.can_post_jobs && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGrantAll(user.id)}
                          disabled={processing === `${user.id}-all-grant`}
                          className="flex-1"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Grant All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeAll(user.id)}
                          disabled={processing === `${user.id}-all-revoke`}
                          className="flex-1"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Revoke All
                        </Button>
                      </div>
                    </div>
                  )}

                  {user.is_super_admin && (
                    <div className="text-sm text-muted-foreground italic">
                      Super Admin has all permissions by default
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
