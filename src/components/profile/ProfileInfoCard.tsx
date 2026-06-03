import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, Twitter, Github, Linkedin, Mail, Shield, Trophy, Calendar, Briefcase, CheckCircle2, Lock, Copy, KeyRound } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ProfileData {
  name?: string;
  email?: string;
  bio?: string;
  twitterHandle?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  role?: string;
  canPostHackathons?: boolean;
  canPostEvents?: boolean;
  canPostJobs?: boolean;
  avatar_url?: string;
  username?: string;
}

interface ProfileInfoCardProps {
  address: string | undefined;
  profile: ProfileData | null | undefined;
  onSave: (data: ProfileData) => Promise<void>;
  isCustomWallet: boolean;
  walletType?: string;
  onLinkWallet: () => void;
}

export function ProfileInfoCard({ address, profile, onSave, isCustomWallet, walletType, onLinkWallet }: ProfileInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setUsername(profile.username || "");
      setEmail(profile.email || "");
      setBio(profile.bio || "");
      setTwitterHandle(profile.twitterHandle || "");
      setGithubUsername(profile.githubUsername || "");
      setLinkedinUrl(profile.linkedinUrl || "");
    }
  }, [profile]);

  const handleSave = async () => {
    await onSave({ name, username, email, bio, twitterHandle, githubUsername, linkedinUrl });
    setIsEditing(false);
  };

  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || email || "apnacoding"}`;

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 w-full" />
      <CardHeader className="relative pt-0 pb-2">
        <div className="absolute -top-16 left-6 border-4 border-background rounded-full overflow-hidden w-24 h-24 bg-card">
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        
        <div className="flex justify-end pt-4">
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (isEditing) handleSave();
              else setIsEditing(true);
            }}
            className={isEditing ? "" : "border-primary/30 select-none cursor-pointer"}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>
        
        {/* Dynamic Role Badge mapping */}
        {(() => {
          const getRoleLabel = (role?: string) => {
            if (!role || role === "user") return null;
            switch (role) {
              case "admin": return { label: "Super Admin", color: "bg-red-500/20 text-red-500 border-red-500/30" };
              case "moderator": return { label: "Moderator", color: "bg-orange-500/20 text-orange-500 border-orange-500/30" };
              case "event_manager": return { label: "Event Manager", color: "bg-purple-500/20 text-purple-500 border-purple-500/30" };
              case "community_manager": return { label: "Community Manager", color: "bg-blue-500/20 text-blue-500 border-blue-500/30" };
              case "content_manager": return { label: "Content Manager", color: "bg-green-500/20 text-green-500 border-green-500/30" };
              case "developer": return { label: "Core Developer", color: "bg-cyan-500/20 text-cyan-500 border-cyan-500/30" };
              case "recruiter": return { label: "Talent Recruiter", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" };
              default: return null;
            }
          };
          const roleBadge = getRoleLabel(profile?.role);
          return (
            <>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <CardTitle className="text-2xl">
                  {name || "Anonymous Builder"}
                </CardTitle>
                {roleBadge && (
                  <Badge variant="outline" className={`font-bold px-2 py-0.5 border ${roleBadge.color} animate-pulse`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {roleBadge.label}
                  </Badge>
                )}
              </div>
              
              {((profile?.role && profile.role !== "user") || profile?.canPostEvents || profile?.canPostHackathons || profile?.canPostJobs) && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile?.canPostHackathons && (
                    <Badge variant="secondary" className="text-[9px] bg-purple-500/10 text-purple-500 border border-purple-500/15 font-semibold py-0">
                      <Trophy className="h-2.5 w-2.5 mr-1" />
                      Hackathons
                    </Badge>
                  )}
                  {profile?.canPostEvents && (
                    <Badge variant="secondary" className="text-[9px] bg-blue-500/10 text-blue-500 border border-blue-500/15 font-semibold py-0">
                      <Calendar className="h-2.5 w-2.5 mr-1" />
                      Events
                    </Badge>
                  )}
                  {profile?.canPostJobs && (
                    <Badge variant="secondary" className="text-[9px] bg-green-500/10 text-green-500 border border-green-500/15 font-semibold py-0">
                      <Briefcase className="h-2.5 w-2.5 mr-1" />
                      Jobs
                    </Badge>
                  )}
                </div>
              )}
            </>
          );
        })()}

        <p className="text-muted-foreground text-sm flex items-center gap-2 mt-2.5">
          <Mail className="h-3.5 w-3.5 text-primary/70" />
          <span className="text-white/80 font-mono">{email || "Gmail Authenticated"}</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
              placeholder="Your full name"
              className="bg-background/50 border-primary/20"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Username (Public URL)</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground text-sm">@</span>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                disabled={!isEditing}
                placeholder="username"
                className="bg-background/50 border-primary/20 pl-7"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                type="email"
                placeholder="you@example.com"
                className="bg-background/50 border-primary/20 pl-9"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Bio</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={!isEditing}
            placeholder="Tell us about your Web3 journey..."
            className="bg-background/50 border-primary/20 min-h-[100px]"
          />
        </div>

        {/* Web3 Cryptographic Identity & Privacy Shield */}
        <div className="pt-6 border-t border-primary/10">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-white">Web3 Identity & Privacy Shield</h3>
          </div>
          
          <div className="bg-black/40 border border-primary/15 rounded-xl p-5 backdrop-blur-md relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            
            {isCustomWallet && address ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-white/50 font-medium">Linked Web3 Wallet ({walletType || 'Custom'})</div>
                      <div className="text-sm font-mono text-emerald-400 font-semibold mt-0.5 break-all flex items-center gap-1.5">
                        {address}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(address);
                            toast.success("Wallet address copied!");
                          }}
                          className="text-white/40 hover:text-white transition-colors p-1 rounded hover:bg-white/5 cursor-pointer"
                          title="Copy Wallet Address"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={onLinkWallet}
                    variant="outline"
                    className="border-primary/25 bg-primary/5 hover:bg-primary/10 text-xs px-3 h-9 rounded-lg self-start sm:self-auto cursor-pointer text-white"
                  >
                    Change Wallet
                  </Button>
                </div>
                
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3.5 text-xs text-emerald-300/80 flex items-start gap-2.5 leading-relaxed">
                  <Lock className="h-4 w-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-300">Privacy Shield Active:</span> Your email identity and personal details are strictly isolated from your Web3 wallet address. On-chain operations will only prompt signature requests via your wallet client. We never track your personal transactions or balance sheets.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white/95">No custom Web3 wallet connected</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                      Connect your MetaMask, Phantom, or Coinbase Wallet to issue dynamic NFT certificates, stake on hackathons, and verify on-chain achievements.
                    </p>
                  </div>
                  
                  <Button
                    onClick={onLinkWallet}
                    className="bg-white hover:bg-white/90 text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.45)] text-xs font-semibold px-4 h-9 rounded-full shrink-0 border border-white/20 hover:scale-[1.02] transition-all duration-200 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
                  >
                    <Wallet className="h-3.5 w-3.5 text-black" />
                    Connect Wallet Securely
                  </Button>
                </div>
                
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-[11px] text-white/40 flex items-start gap-2">
                  <Shield className="h-3.5 w-3.5 mt-0.5 text-white/30 flex-shrink-0" />
                  <span>
                    Signing in with Gmail is the only initial authentication method. Wallet connection is completely optional, sandbox-isolated, and built with privacy-first standards.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-primary/10">
          <h3 className="text-base font-semibold mb-4 text-white">Connect Social Accounts</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Twitter className="h-5 w-5 text-[#1DA1F2]" />
              <Input
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                disabled={!isEditing}
                placeholder="@username"
                className="bg-background/50 border-primary/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-foreground" />
              <Input
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                disabled={!isEditing}
                placeholder="github-username"
                className="bg-background/50 border-primary/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <Linkedin className="h-5 w-5 text-[#0A66C2]" />
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                disabled={!isEditing}
                placeholder="linkedin.com/in/username"
                className="bg-background/50 border-primary/20"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
