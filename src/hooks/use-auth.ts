import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { isSuperAdmin } from "@/lib/admin-config";

export function useAuth() {
  const { 
    user: privyUser, 
    authenticated, 
    login, 
    logout, 
    ready 
  } = usePrivy();
  
  const address = privyUser?.wallet?.address;
  const email = privyUser?.email?.address;
  // Support GitHub login: extract GitHub account info
  const githubAccount = (privyUser as any)?.github;
  const githubUsername = githubAccount?.username;
  const githubSubject = githubAccount?.subject;
  // Support X (Twitter) login: extract Twitter account info
  const twitterAccount = (privyUser as any)?.twitter;
  const twitterUsername = twitterAccount?.username;
  const twitterSubject = twitterAccount?.subject;
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      if (!address && !email && !githubSubject && !twitterSubject) {
        setUser(null);
        setIsLoadingUser(false);
        return;
      }

      setIsLoadingUser(true);
      try {
        let userData = null;

        // 1. Try fetching by email if it exists (highly unique for Gmail/Google login)
        if (email) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();
          
          if (data) {
            userData = data;
            // Sync wallet address in DB if it's available in Privy but not in DB
            if (address && userData.wallet_address !== address && !address.startsWith('email:')) {
              const { data: updatedData } = await supabase
                .from('users')
                .update({ wallet_address: address, updated_at: new Date().toISOString() })
                .eq('id', userData.id)
                .select()
                .maybeSingle();
              if (updatedData) userData = updatedData;
            }
          }
        }

        // 2. Fallback to fetching by wallet address if not found by email
        if (!userData && address) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', address)
            .maybeSingle();
          if (data) userData = data;
        }

        // 2.5. Fallback to fetching by GitHub subject if not found by email or wallet
        if (!userData && githubSubject) {
          const ghWallet = `github:${githubSubject}`;
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', ghWallet)
            .maybeSingle();
          if (data) userData = data;
        }

        // 2.6. Fallback to fetching by Twitter/X subject if not found by other methods
        if (!userData && twitterSubject) {
          const twWallet = `twitter:${twitterSubject}`;
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', twWallet)
            .maybeSingle();
          if (data) userData = data;
        }

        // Determine which auth provider was used for this login
        const authProvider = twitterSubject
          ? 'twitter'
          : githubSubject
            ? 'github'
            : email
              ? 'google'
              : address
                ? 'wallet'
                : 'unknown';

        // 3. If authenticated but doesn't exist in our DB yet, automatically register them!
        if (!userData) {
          const username = email
            ? email.split('@')[0]
            : githubUsername
              ? githubUsername
              : twitterUsername
                ? twitterUsername
                : `user_${address?.slice(2, 8) || 'anon'}`;
          const name = twitterUsername || githubUsername || username;
          // Avoid using empty address due to UNIQUE NOT NULL constraint
          const userWallet = address || (email ? `email:${email}` : githubSubject ? `github:${githubSubject}` : `twitter:${twitterSubject}`);

          const { data, error } = await supabase
            .from('users')
            .insert({
              wallet_address: userWallet,
              email: email || null,
              username: username,
              name: name,
              auth_provider: authProvider,
              role: isSuperAdmin(address || '', email || '') ? 'admin' : 'user'
            })
            .select()
            .maybeSingle();

          if (data) userData = data;
        }

        // Backfill auth_provider for existing users who don't have it set
        if (userData && !userData.auth_provider) {
          await supabase
            .from('users')
            .update({ auth_provider: authProvider, updated_at: new Date().toISOString() })
            .eq('id', userData.id);
          userData = { ...userData, auth_provider: authProvider };
        }

        // Super Admin role assurance
        if (userData && isSuperAdmin(address || '', email || '')) {
          userData = { ...userData, role: 'admin' };
        }

        setUser(userData);
      } catch (err) {
        console.error("Error fetching/syncing user from Supabase:", err);
        // Fallback for super admins
        if (isSuperAdmin(address || '', email || '')) {
          setUser({
            wallet_address: address || `email:${email}`,
            email: email,
            role: 'admin'
          });
        }
      } finally {
        setIsLoadingUser(false);
      }
    }

    if (ready && authenticated) {
      fetchUser();
    } else if (ready && !authenticated) {
      setUser(null);
      setIsLoadingUser(false);
    }
  }, [address, email, githubSubject, twitterSubject, authenticated, ready]);

  const isLoading = !ready || isLoadingUser;
  const isAuthenticated = authenticated;

  return {
    isLoading,
    isAuthenticated,
    user,
    privyUser,
    signIn: login,
    signOut: logout,
  };
}
