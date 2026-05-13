import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Wallet, Twitter, Github, Linkedin } from "lucide-react";
import { useState, useEffect } from "react";

interface ProfileData {
  name?: string;
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
  const [bio, setBio] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setTwitterHandle(profile.twitterHandle || "");
      setGithubUsername(profile.githubUsername || "");
      setLinkedinUrl(profile.linkedinUrl || "");
    }
  }, [profile]);

  const handleSave = async () => {
    await onSave({ name, bio, twitterHandle, githubUsername, linkedinUrl });
    setIsEditing(false);
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="border-primary/30"
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Wallet Address</label>
          <div className="flex items-center gap-2 bg-muted/50 p-3 rounded border border-primary/10">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
            placeholder="Your name"
            className="bg-background/50 border-primary/20"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Bio</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={!isEditing}
            placeholder="Tell us about yourself..."
            className="bg-background/50 border-primary/20 min-h-[100px]"
          />
        </div>

        <div className="pt-4 border-t border-primary/10">
          <h3 className="text-lg font-bold mb-4">Connect Social Accounts</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Twitter className="h-5 w-5 text-primary" />
              <Input
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                disabled={!isEditing}
                placeholder="@username"
                className="bg-background/50 border-primary/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-primary" />
              <Input
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                disabled={!isEditing}
                placeholder="github-username"
                className="bg-background/50 border-primary/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <Linkedin className="h-5 w-5 text-primary" />
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

        {isEditing && (
          <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Save Changes
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
