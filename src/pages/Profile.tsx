import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { ReferralCard } from "@/components/profile/ReferralCard";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { ActivityStatsCard } from "@/components/profile/ActivityStatsCard";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const { user: privyUser, authenticated, ready } = usePrivy();
  const address = privyUser?.wallet?.address;
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !authenticated) {
      navigate("/");
      toast.error("Please connect your wallet to access your profile");
      return;
    }
    
    if (address) {
      fetchUserData();
    }
  }, [authenticated, address, navigate, ready]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", address)
        .single();
      
      if (userError && userError.code !== "PGRST116") throw userError;
      setUser(userData);

      // Fetch referral stats
      if (userData) {
        const { data: refs, error: refsError } = await supabase
          .from("referrals")
          .select("*, referred_user:users!referred_id(*)")
          .eq("referrer_id", userData.id);
        
        if (refsError) throw refsError;

        const totalReferrals = refs?.length || 0;
        let tier = "none";
        if (totalReferrals >= 10) tier = "gold";
        else if (totalReferrals >= 5) tier = "silver";
        else if (totalReferrals >= 1) tier = "bronze";

        setReferralStats({
          referralCode: userData.referral_code,
          totalReferrals,
          totalPoints: userData.points || 0,
          tier,
          benefits: getTierBenefits(tier),
          referredUsers: refs?.map(r => ({
            name: r.referred_user?.name || "Anonymous",
            walletAddress: r.referred_user?.wallet_address,
            timestamp: new Date(r.created_at).getTime(),
            pointsAwarded: r.points_awarded,
            status: "completed"
          }))
        });

        // Auto-generate referral code if missing
        if (!userData.referral_code) {
          const { data: codeData, error: codeError } = await supabase.rpc("generate_referral_code");
          if (!codeError) {
            await supabase.from("users").update({ referral_code: codeData }).eq("id", userData.id);
            userData.referral_code = codeData;
            setUser({ ...userData });
          }
        }
      }

      // Fetch certificates
      if (userData) {
        const { data: certs, error: certsError } = await supabase
          .from("certificates")
          .select("*")
          .eq("user_id", userData.id);
        
        if (certsError) throw certsError;
        setCertificates(certs || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTierBenefits = (tier: string) => {
    switch (tier) {
      case "gold": return ["Premium Content", "Free Courses", "Internship Access", "Priority Support"];
      case "silver": return ["Premium Content", "Free Courses"];
      case "bronze": return ["Premium Content"];
      default: return [];
    }
  };

  const handleSaveProfile = async (data: any) => {
    if (!address || !user) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: data.name,
          bio: data.bio,
          twitter_handle: data.twitterHandle,
          github_username: data.githubUsername,
          linkedin_url: data.linkedinUrl
        })
        .eq("id", user.id);

      if (error) throw error;
      
      setUser({ ...user, ...data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  const handleApplyReferralCode = async (code: string) => {
    if (!user) return;
    if (user.referred_by_code) {
      toast.error("You have already applied a referral code");
      return;
    }

    try {
      // Find referrer
      const { data: referrer, error: referrerError } = await supabase
        .from("users")
        .select("*")
        .eq("referral_code", code)
        .single();
      
      if (referrerError || !referrer) {
        throw new Error("Invalid referral code");
      }

      if (referrer.id === user.id) {
        throw new Error("You cannot refer yourself");
      }

      // 1. Update user
      await supabase
        .from("users")
        .update({ referred_by_code: code, points: (user.points || 0) + 50 })
        .eq("id", user.id);
      
      // 2. Create referral record
      await supabase
        .from("referrals")
        .insert({
          referrer_id: referrer.id,
          referred_id: user.id,
          points_awarded: 100
        });
      
      // 3. Update referrer points
      await supabase
        .from("users")
        .update({ points: (referrer.points || 0) + 100 })
        .eq("id", referrer.id);

      toast.success("Referral code applied! You earned 50 bonus points!");
      fetchUserData();
    } catch (error: any) {
      toast.error(error.message || "Failed to apply referral code");
      throw error;
    }
  };

  if (!authenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 cyber-glitch" data-text="Profile Dashboard">Profile Dashboard</h1>
            <p className="text-muted-foreground">Manage your Web3 identity and contributions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Referral System Card - Full Width */}
            <div className="lg:col-span-3">
              <ReferralCard 
                stats={referralStats}
                hasAppliedCode={!!user?.referred_by_code}
                appliedCode={user?.referred_by_code}
                onApplyCode={handleApplyReferralCode}
              />
            </div>

            {/* Profile Card */}
            <div className="lg:col-span-2">
              <ProfileInfoCard 
                address={address as `0x${string}`}
                profile={user ? {
                  name: user.name,
                  bio: user.bio,
                  twitterHandle: user.twitter_handle,
                  githubUsername: user.github_username,
                  linkedinUrl: user.linkedin_url
                } : null}
                onSave={handleSaveProfile}
              />
            </div>

            {/* Stats & Certificates Card */}
            <ActivityStatsCard certificates={certificates} />
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
