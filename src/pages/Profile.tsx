import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const { user: privyUser, authenticated, ready, linkWallet } = usePrivy();
  const address = privyUser?.wallet?.address;
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !authenticated) {
      navigate("/");
      toast.error("Please sign in to access your profile");
      return;
    }
    
    if (ready && authenticated) {
      fetchUserData();
    }
  }, [authenticated, address, navigate, ready]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      let userData = null;
      const email = privyUser?.email?.address;
      
      // 1. Try email lookup
      if (email) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .maybeSingle();
        if (data) userData = data;
      }
      
      // 2. Fallback to wallet lookup
      if (!userData && address) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("wallet_address", address)
          .maybeSingle();
        if (data) userData = data;
      }
      
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (data: any) => {
    const email = privyUser?.email?.address || user?.email;
    const userWallet = address || user?.wallet_address || `email:${email}`;
    if (!userWallet) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .upsert({
          wallet_address: userWallet,
          name: data.name,
          email: email || data.email || null,
          bio: data.bio,
          twitter_handle: data.twitterHandle,
          github_username: data.githubUsername,
          linkedin_url: data.linkedinUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'wallet_address' });

      if (error) throw error;
      
      setUser({ ...user, ...data });
      window.dispatchEvent(new Event('user-updated'));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  if (!authenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2">Profile Dashboard</h1>
            <p className="text-muted-foreground">Manage your personal details and Web3 identity.</p>
          </div>

          <div className="w-full">
            <ProfileInfoCard 
              address={address}
              isCustomWallet={!!(privyUser?.wallet && privyUser.wallet.walletClientType !== 'privy')}
              walletType={privyUser?.wallet?.walletClientType || privyUser?.wallet?.connectorType}
              onLinkWallet={linkWallet}
              profile={user ? {
                name: user.name,
                email: user.email,
                bio: user.bio,
                twitterHandle: user.twitter_handle,
                githubUsername: user.github_username,
                linkedinUrl: user.linkedin_url,
                role: user.role,
                canPostHackathons: user.can_post_hackathons,
                canPostEvents: user.can_post_events,
                canPostJobs: user.can_post_jobs,
                avatar_url: user.avatar_url
              } : null}
              onSave={handleSaveProfile}
            />
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
