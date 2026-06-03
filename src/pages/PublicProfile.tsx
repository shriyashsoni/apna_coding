import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Twitter, 
  Github, 
  Linkedin, 
  Award, 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck,
  User,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

export default function PublicProfile() {
  const { walletAddress } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      fetchUserData();
    }
  }, [walletAddress]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user by wallet address
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .or(`wallet_address.eq.${walletAddress},username.eq.${walletAddress}`)
        .maybeSingle();

      if (userError) throw userError;

      if (userData) {
        setProfile(userData);

        // 2. Fetch user's certificates
        const { data: certsData, error: certsError } = await supabase
          .from("certificates")
          .select("*")
          .or(`participant_wallet.eq.${walletAddress},user_id.eq.${userData.id}`)
          .order("created_at", { ascending: false });

        if (certsError) throw certsError;
        setCertificates(certsData || []);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching public profile:", error);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyWallet = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success("Wallet address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#050505] text-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse font-mono">Resolving Web3 Identity...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-[#050505] text-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto px-4 text-center">
          <User className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't resolve a registered user profile for the wallet address {formatAddress(walletAddress || "")}.
          </p>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const profileName = profile.name || "Web3 Builder";
  const profileBio = profile.bio || `Developer profile on Apna Coding. Connect and build the future of Web3.`;
  const seoTitle = `${profileName} (${formatAddress(profile.wallet_address)}) - Web3 Developer Profile`;
  const canonicalPath = `/user/${profile.wallet_address}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white pt-24 relative overflow-hidden">
      {/* Dynamic SEO Tag Optimization */}
      <SEO
        title={seoTitle}
        description={profileBio}
        keywords={[profileName, "web3 builder", "solidity developer", "blockchain developer", "apna coding user", profile.wallet_address]}
        url={canonicalPath}
        type="website"
        organization="Apna Coding"
        image={profile.avatar_url || "https://apnacoding.com/og-user.png"}
      />

      {/* Decorative gradient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Identity Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="liquid-glass rounded-3xl p-6 border border-white/10 flex flex-col items-center text-center relative"
            >
              {/* Profile Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold border-2 border-white/20 shadow-xl mb-4 text-white relative">
                {profileName.slice(0, 2).toUpperCase()}
                {profile.role === "admin" && (
                  <span className="absolute -bottom-1 -right-1 bg-primary text-black p-1 rounded-full border border-[#050505] shadow" title="Admin">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </span>
                )}
              </div>

              {/* User Bio Details */}
              <h2 className="text-2xl font-bold tracking-tight mb-1">{profileName}</h2>
              <Badge variant="secondary" className="mb-4 bg-white/10 hover:bg-white/20 border border-white/10">
                {profile.role?.toUpperCase() || "BUILDER"}
              </Badge>

              {/* Wallet address copy widget */}
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-muted-foreground w-full justify-between mb-6">
                <span className="font-mono text-white/80">{formatAddress(profile.wallet_address)}</span>
                <button 
                  onClick={handleCopyWallet} 
                  className="hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                  title="Copy Wallet Address"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* User bio description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                "{profileBio}"
              </p>

              {/* Social profile connectivity links */}
              <div className="flex gap-3 justify-center w-full pt-4 border-t border-white/5">
                {profile.twitter_handle && (
                  <a 
                    href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-white rounded-2xl transition-all"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {profile.github_username && (
                  <a 
                    href={`https://github.com/${profile.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-white rounded-2xl transition-all"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {profile.linkedin_url && (
                  <a 
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-white rounded-2xl transition-all"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {!profile.twitter_handle && !profile.github_username && !profile.linkedin_url && (
                  <span className="text-xs text-muted-foreground/60 italic py-2">No connected Web3 accounts</span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Certificates Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="liquid-glass border border-white/10 rounded-3xl p-6 bg-transparent">
                <CardHeader className="px-0 pt-0 pb-6 border-b border-white/5">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Award className="h-6 w-6 text-primary" /> On-Chain Credentials
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Verified NFT and Flow blockchain proof-of-achievements
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary/30">
                      {certificates.length} Total
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pt-6">
                  {certificates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {certificates.map((cert) => (
                        <div 
                          key={cert.id}
                          className="flex flex-col justify-between p-5 border border-white/5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <Badge className="bg-white/10 text-white/80 hover:bg-white/20 border border-white/10 text-[10px]">
                                {cert.event_type?.toUpperCase() || "HACKATHON"}
                              </Badge>
                              {cert.flow_nft_id && (
                                <Badge className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-[10px] flex items-center gap-1">
                                  <ShieldCheck className="h-3 w-3" /> Minted
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold text-lg line-clamp-1 mb-1" title={cert.event_name}>{cert.event_name}</h3>
                            <p className="text-xs text-muted-foreground mb-4">
                              {cert.event_date ? new Date(cert.event_date).toLocaleDateString() : "TBD"}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-auto">
                            <span className="text-xs font-mono text-muted-foreground">
                              {cert.certificate_number}
                            </span>
                            <Link to={`/verify/${cert.certificate_number}`}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs gap-1 hover:text-white text-muted-foreground p-0 h-auto hover:bg-transparent"
                              >
                                View Details <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
                      <Award className="h-12 w-12 text-muted-foreground/20 mb-3 animate-pulse" />
                      <p className="font-mono text-sm">No dynamic certificates issued yet.</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Earn certificates by completing hackathons and events.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
