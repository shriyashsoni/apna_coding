import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, Twitter, Github, Linkedin, Mail } from "lucide-react";
import { useState, useEffect } from "react";

interface ProfileData {
  name?: string;
  email?: string;
  bio?: string;
  twitterHandle?: string;
  githubUsername?: string;
  linkedinUrl?: string;
}

interface ProfileInfoCardProps {
  address: `0x${string}` | undefined;
  profile: ProfileData | null | undefined;
  onSave: (data: ProfileData) => Promise<void>;
}

export function ProfileInfoCard({ address, profile, onSave }: ProfileInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setBio(profile.bio || "");
      setTwitterHandle(profile.twitterHandle || "");
      setGithubUsername(profile.githubUsername || "");
      setLinkedinUrl(profile.linkedinUrl || "");
    }
  }, [profile]);

  const handleSave = async () => {
    await onSave({ name, email, bio, twitterHandle, githubUsername, linkedinUrl });
    setIsEditing(false);
  };

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || address || "apnacoding"}`;

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
            className={isEditing ? "" : "border-primary/30"}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>
        
        <CardTitle className="text-2xl mt-4">
          {name || "Anonymous Builder"}
        </CardTitle>
        <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
          <Wallet className="h-3.5 w-3.5" />
          <span className="font-mono">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</span>
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

        <div className="pt-6 border-t border-primary/10">
          <h3 className="text-base font-semibold mb-4">Connect Social Accounts</h3>
          
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
