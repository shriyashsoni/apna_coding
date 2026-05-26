import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Users, Check, X, Loader2, Search, PlusCircle, UserCheck, AlertTriangle, Sparkles, Star, Calendar, MessageSquare, Briefcase, Mail, Wallet, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export function PermissionsManager() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Search/Add new team member states
  const [searchWallet, setSearchWallet] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearchingDb, setIsSearchingDb] = useState(false);

  // New member setup state
  const [selectedRole, setSelectedRole] = useState("content_manager");
  const [canPostHackathons, setCanPostHackathons] = useState(true);
  const [canPostEvents, setCanPostEvents] = useState(true);
  const [canPostJobs, setCanPostJobs] = useState(true);

  const fetchTeamMembers = async () => {
    setIsLoading(true);
    try {
      // Fetch all users with administrative roles or custom post permissions
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('role', 'user')
        .order('name');
      
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (err) {
      console.error("Error fetching team members:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleSearchWallet = async () => {
    const cleanWallet = searchWallet.trim().toLowerCase();
    if (!cleanWallet.startsWith("0x") || cleanWallet.length < 40) {
      toast.error("Please enter a valid Ethereum wallet address");
      return;
    }

    setIsSearchingDb(true);
    setSearchResult(null);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', cleanWallet)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setSearchResult({
          exists: true,
          user: data,
          role: data.role || "user",
          canPostHackathons: data.can_post_hackathons || false,
          canPostEvents: data.can_post_events || false,
          canPostJobs: data.can_post_jobs || false
        });
        setSelectedRole(data.role === "user" ? "content_manager" : data.role);
        setCanPostHackathons(data.can_post_hackathons || false);
        setCanPostEvents(data.can_post_events || false);
        setCanPostJobs(data.can_post_jobs || false);
      } else {
        setSearchResult({
          exists: false,
          walletAddress: cleanWallet
        });
        setSelectedRole("content_manager");
        setCanPostHackathons(true);
        setCanPostEvents(true);
        setCanPostJobs(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to query wallet address");
    } finally {
      setIsSearchingDb(false);
    }
  };

  const handleSaveTeamMember = async () => {
    if (!searchResult) return;
    const wallet = searchResult.exists ? searchResult.user.wallet_address : searchResult.walletAddress;

    setProcessing("saving-member");
    try {
      if (searchResult.exists) {
        // Update existing active profile safely without overwriting standard user details
        const { error } = await supabase
          .from('users')
          .update({
            role: selectedRole,
            can_post_hackathons: canPostHackathons,
            can_post_events: canPostEvents,
            can_post_jobs: canPostJobs
          })
          .eq('wallet_address', wallet);

        if (error) throw error;
        toast.success("✨ Team member permissions updated!");
      } else {
        // Create pre-authorization skeleton record
        const { error } = await supabase
          .from('users')
          .insert({
            wallet_address: wallet,
            role: selectedRole,
            can_post_hackathons: canPostHackathons,
            can_post_events: canPostEvents,
            can_post_jobs: canPostJobs,
            name: "Pre-Authorized Team Member",
            bio: "Awaiting first wallet onboarding login to finalize setup."
          });

        if (error) throw error;
        toast.success("🛡️ Skeleton profile pre-authorized! Dashboard is ready for them.");
      }

      setSearchResult(null);
      setHasSearched(false);
      setSearchWallet("");
      fetchTeamMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update team member");
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleInlinePermission = async (
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
      
      toast.success(`Access privileges updated`);
      fetchTeamMembers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update privilege");
    } finally {
      setProcessing(null);
    }
  };

  const handleRemoveFromTeam = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke all team privileges from "${name}"?`)) return;

    setProcessing(`${userId}-remove`);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          role: 'user',
          can_post_hackathons: false,
          can_post_events: false,
          can_post_jobs: false
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success("🚫 Member removed from Team and reverted to Standard User.");
      fetchTeamMembers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update member");
    } finally {
      setProcessing(null);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return { label: "Super Admin", color: "bg-red-500/20 text-red-500 border-red-500/30" };
      case "moderator": return { label: "Moderator", color: "bg-orange-500/20 text-orange-500 border-orange-500/30" };
      case "event_manager": return { label: "Event Manager", color: "bg-purple-500/20 text-purple-500 border-purple-500/30" };
      case "community_manager": return { label: "Community Mgr", color: "bg-blue-500/20 text-blue-500 border-blue-500/30" };
      case "content_manager": return { label: "Content Mgr", color: "bg-green-500/20 text-green-500 border-green-500/30" };
      case "developer": return { label: "Core Dev", color: "bg-cyan-500/20 text-cyan-500 border-cyan-500/30" };
      case "recruiter": return { label: "Recruiter", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" };
      default: return { label: "Standard User", color: "bg-muted text-muted-foreground" };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading team management dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              {teamMembers.length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Super Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-red-500 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              {teamMembers.filter(t => t.role === "admin").length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-green-500 flex items-center gap-2">
              <UserCheck className="h-6 w-6" />
              {teamMembers.filter(t => t.name && t.name !== "Pre-Authorized Team Member").length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pre-Authorized (Awaiting login)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-yellow-500 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              {teamMembers.filter(t => !t.name || t.name === "Pre-Authorized Team Member").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboard Team Member Search Controller */}
      <Card className="border-primary/20 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="text-primary h-5 w-5" />
            Onboard or Modify Team Members
          </CardTitle>
          <CardDescription>
            Search by wallet address to see if they are active, authorize their custom role, and assign their specific admin rules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Paste team member wallet address (0x...)"
                value={searchWallet}
                onChange={(e) => setSearchWallet(e.target.value)}
                className="pl-10 bg-background/50 border-primary/20 focus-visible:ring-1"
              />
            </div>
            <Button onClick={handleSearchWallet} disabled={isSearchingDb} className="min-w-[120px]">
              {isSearchingDb ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Verify Address"
              )}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {hasSearched && searchResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 border rounded-lg bg-muted/20 border-primary/10 mt-2 space-y-5"
              >
                {/* Profile registry check */}
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground block mb-1">Onboarding Registry Status</span>
                    {searchResult.exists ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10 border-green-500/20 gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                          Active / Logged In User
                        </Badge>
                        <span className="font-semibold text-sm">{searchResult.user.name || "Anonymous User"}</span>
                      </div>
                    ) : (
                      <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10 border-yellow-500/20 gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                        Pre-Authorized (Has not logged in yet)
                      </Badge>
                    )}
                  </div>
                  <span className="font-mono text-xs text-muted-foreground bg-background p-1.5 rounded border border-primary/10">
                    {searchResult.exists ? searchResult.user.wallet_address : searchResult.walletAddress}
                  </span>
                </div>

                {/* Form Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Select Role */}
                  <div className="space-y-2">
                    <Label htmlFor="tRole" className="font-semibold">Assign Staff Role</Label>
                    <p className="text-xs text-muted-foreground mb-1">Restricts access to specific tabs matching their workflow.</p>
                    <select
                      id="tRole"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full bg-background border border-primary/20 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="admin">Super Admin (Unrestricted Dashboard)</option>
                      <option value="moderator">Moderator (Approvals & Reviews)</option>
                      <option value="event_manager">Event Manager (Guides & Side Events)</option>
                      <option value="community_manager">Community Manager (Catalogs & Directories)</option>
                      <option value="content_manager">Content Manager (Jobs, Hackathons, News)</option>
                      <option value="developer">Core Developer (Technical Platform controls)</option>
                      <option value="recruiter">Talent Recruiter (Talent and Job Boards)</option>
                    </select>
                  </div>

                  {/* Permissions Switch Grid */}
                  <div className="space-y-3">
                    <Label className="font-semibold">Granular Access Rules</Label>
                    <p className="text-xs text-muted-foreground mb-2">Enable specific publishing access blocks regardless of role.</p>
                    <div className="grid grid-cols-1 gap-2.5">
                      <div className="flex items-center justify-between p-2.5 bg-background/50 rounded border border-primary/10">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">Post Hackathons</span>
                          <span className="text-[10px] text-muted-foreground">Manage and list developer hackathons</span>
                        </div>
                        <Switch checked={canPostHackathons} onCheckedChange={setCanPostHackathons} />
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-background/50 rounded border border-primary/10">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">Post Events</span>
                          <span className="text-[10px] text-muted-foreground">Submit and approve scheduled events</span>
                        </div>
                        <Switch checked={canPostEvents} onCheckedChange={setCanPostEvents} />
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-background/50 rounded border border-primary/10">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">Post Jobs</span>
                          <span className="text-[10px] text-muted-foreground">List and verify career opportunities</span>
                        </div>
                        <Switch checked={canPostJobs} onCheckedChange={setCanPostJobs} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button variant="outline" size="sm" onClick={() => { setSearchResult(null); setHasSearched(false); }}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveTeamMember} disabled={processing === "saving-member"}>
                    {processing === "saving-member" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Team Member...
                      </>
                    ) : (
                      <>
                        <Check className="mr-1.5 h-4 w-4" />
                        Confirm & Save Permissions
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Team Roster List */}
      <Card className="border-primary/20 bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Team Roster & Security Permissions</CardTitle>
          </div>
          <CardDescription>
            Lists all onboarded and pre-authorized staff members with quick security rules and permission overrides.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-lg bg-muted/10">
                <ShieldAlert className="h-10 w-10 mx-auto text-muted-foreground mb-2 opacity-55" />
                <h4 className="font-semibold">No team members registered yet</h4>
                <p className="text-xs text-muted-foreground mt-1">Search a wallet address to pre-authorize your first team member!</p>
              </div>
            ) : (
              teamMembers.map((member: any, index: number) => {
                const isActive = member.name && member.name !== "Pre-Authorized Team Member";
                const badgeInfo = getRoleLabel(member.role);
                const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name || member.wallet_address}`;
                
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                    className="border rounded-lg p-4 bg-muted/10 border-primary/10 hover:border-primary/30 transition-all duration-300 relative group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Avatar + Details */}
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/20 bg-card flex-shrink-0">
                          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold truncate text-sm sm:text-base">{isActive ? member.name : "Pre-Authorized Member"}</span>
                            <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 border ${badgeInfo.color}`}>
                              {badgeInfo.label}
                            </Badge>
                            
                            {isActive ? (
                              <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10 border-green-500/20 text-[9px] h-4 py-0 flex items-center gap-0.5">
                                <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10 border-yellow-500/20 text-[9px] h-4 py-0 flex items-center gap-0.5">
                                <span className="h-1 w-1 rounded-full bg-yellow-500" />
                                Pre-Auth
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
                            {member.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-primary/70" />
                                {member.email}
                              </span>
                            )}
                            <span className="flex items-center gap-1 font-mono text-[10px] bg-background px-1.5 py-0.5 rounded border border-primary/5">
                              <Wallet className="h-3 w-3 text-secondary/70" />
                              {member.wallet_address}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Action Controls */}
                      <div className="flex flex-wrap items-center gap-4 lg:self-center">
                        {/* Switches */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {/* Hackathons switch */}
                          <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded border border-primary/10">
                            <Switch
                              checked={member.can_post_hackathons || false}
                              onCheckedChange={() =>
                                handleToggleInlinePermission(
                                  member.id,
                                  "can_post_hackathons",
                                  member.can_post_hackathons || false
                                )
                              }
                              disabled={processing === `${member.id}-can_post_hackathons`}
                              className="scale-75 origin-left"
                            />
                            <span className="text-[10px] font-semibold pr-1">Hackathons</span>
                          </div>

                          {/* Events switch */}
                          <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded border border-primary/10">
                            <Switch
                              checked={member.can_post_events || false}
                              onCheckedChange={() =>
                                handleToggleInlinePermission(
                                  member.id,
                                  "can_post_events",
                                  member.can_post_events || false
                                )
                              }
                              disabled={processing === `${member.id}-can_post_events`}
                              className="scale-75 origin-left"
                            />
                            <span className="text-[10px] font-semibold pr-1">Events</span>
                          </div>

                          {/* Jobs switch */}
                          <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded border border-primary/10">
                            <Switch
                              checked={member.can_post_jobs || false}
                              onCheckedChange={() =>
                                handleToggleInlinePermission(
                                  member.id,
                                  "can_post_jobs",
                                  member.can_post_jobs || false
                                )
                              }
                              disabled={processing === `${member.id}-can_post_jobs`}
                              className="scale-75 origin-left"
                            />
                            <span className="text-[10px] font-semibold pr-1">Jobs</span>
                          </div>
                        </div>

                        {/* Revoke button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromTeam(member.id, member.name || member.wallet_address)}
                          disabled={processing === `${member.id}-remove`}
                          className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity"
                          title="Revoke team access"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
