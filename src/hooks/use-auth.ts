import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useSyncExternalStore } from "react";
import { isSuperAdmin } from "@/lib/admin-config";

// Shared across hook instances so all menus and admin screens hide privileges
// while logout is pending. This is UI state, not server authorization.
let logoutPending = false;
const logoutListeners = new Set<() => void>();
const setLogoutPending = (value: boolean) => {
  logoutPending = value;
  logoutListeners.forEach(listener => listener());
};
const subscribeLogout = (listener: () => void) => {
  logoutListeners.add(listener);
  return () => { logoutListeners.delete(listener); };
};

export function useAuth() {
  const { 
    user: privyUser, 
    authenticated, 
    login, 
    logout, 
    ready 
  } = usePrivy();
  
  const isSigningOut = useSyncExternalStore(subscribeLogout, () => logoutPending);
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
  const identity = authenticated && !isSigningOut
    ? [privyUser?.id, address, email, githubSubject, twitterSubject].join('|')
    : '';
  const [resolvedIdentity, setResolvedIdentity] = useState('');

  useEffect(() => {
    let active = true;
    let requestVersion = 0;
    // Clear the old account before reading another account's profile.
    setUser(null);
    setResolvedIdentity('');
    async function fetchUser() {
      const version = ++requestVersion;
      const isCurrent = () => active && version === requestVersion;
      if (!address && !email && !githubSubject && !twitterSubject) {
        setUser(null);
        setResolvedIdentity(identity);
        setIsLoadingUser(false);
        return;
      }

      setIsLoadingUser(true);
      try {
        let userData = null;

        if (!isCurrent()) return;

        // 1. Try fetching by email if it exists (highly unique for Gmail/Google login)
        if (email) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();
          
          if (!isCurrent()) return;
          if (error) throw error;
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
          if (!isCurrent()) return;
          if (error) throw error;
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
          if (!isCurrent()) return;
          if (error) throw error;
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
          if (!isCurrent()) return;
          if (error) throw error;
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
        if (!isCurrent()) return;
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
              role: 'user'
            })
            .select()
            .maybeSingle();

          if (!isCurrent()) return;
          if (error) throw error;
          if (data) userData = data;
        }

        if (!isCurrent()) return;

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

        if (isCurrent()) {
          setUser(userData);
          setResolvedIdentity(identity);
        }
      } catch (err) {
        console.error("Error fetching/syncing user from Supabase:", err);
        // Fallback for super admins
        if (isCurrent() && isSuperAdmin(address || '', email || '')) {
          setResolvedIdentity(identity);
          setUser({
            wallet_address: address || `email:${email}`,
            email: email,
            role: 'admin'
          });
        }
      } finally {
        if (isCurrent()) { setResolvedIdentity(identity); setIsLoadingUser(false); }
      }
    }

    if (ready && authenticated && !isSigningOut) {
      fetchUser();
    } else if (ready && (!authenticated || isSigningOut)) {
      setUser(null);
      setIsLoadingUser(false);
    }

    // Listen for profile updates
    const handleUserUpdate = () => {
      if (ready && authenticated && !isSigningOut) {
        fetchUser();
      }
    };
    window.addEventListener('user-updated', handleUserUpdate);

    return () => {
      active = false;
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, [identity, authenticated, ready, isSigningOut]);

  const isLoading = !ready || isLoadingUser || (authenticated && !isSigningOut && !!identity && resolvedIdentity !== identity);
  const isAuthenticated = authenticated && !isSigningOut;
  const visibleUser = isAuthenticated && ready && resolvedIdentity === identity ? user : null;
  const signOut = async () => {
    if (logoutPending) return;
    setLogoutPending(true);
    try {
      await logout();
    } finally {
      setLogoutPending(false);
    }
  };

  return {
    isLoading,
    isAuthenticated,
    user: visibleUser,
    isSigningOut,
    privyUser,
    signIn: login,
    signOut,
  };
}
