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
  const { user: privyUser, authenticated, ready } = usePrivy();
  const address = privyUser?.wallet?.address;
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
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
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (data: any) => {
    if (!address) return;
    
    try {
      // If user doesn't exist yet, we might need an upsert, but typically they are created on login.
      // Assuming upsert based on wallet_address
      const { error } = await supabase
        .from("users")
        .upsert({
          wallet_address: address,
          name: data.name,
          email: data.email,
          bio: data.bio,
          twitter_handle: data.twitterHandle,
          github_username: data.githubUsername,
          linkedin_url: data.linkedinUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'wallet_address' });

      if (error) throw error;
      
      setUser({ ...user, ...data });
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
              address={address as `0x${string}`}
              profile={user ? {
                name: user.name,
                email: user.email,
                bio: user.bio,
                twitterHandle: user.twitter_handle,
                githubUsername: user.github_username,
                linkedinUrl: user.linkedin_url
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
