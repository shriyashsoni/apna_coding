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
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      if (!address) {
        setUser(null);
        setIsLoadingUser(false);
        return;
      }

      setIsLoadingUser(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', address)
          .single();
        
        let userData = data;
        
        // If user is a super admin, ensure they have the admin role regardless of DB state
        if (isSuperAdmin(address, email)) {
          if (userData) {
            userData = { ...userData, role: 'admin' };
          } else {
            // Create a temporary user object for the session if they don't exist in DB yet
            userData = {
              wallet_address: address,
              email: email,
              role: 'admin',
              username: email?.split('@')[0] || 'Admin'
            };
          }
        }
        
        setUser(userData);
      } catch (err) {
        console.error("Error fetching user from Supabase:", err);
        
        // Fallback for super admins even if DB query fails
        if (isSuperAdmin(address, email)) {
          setUser({
            wallet_address: address,
            email: email,
            role: 'admin'
          });
        }
      } finally {
        setIsLoadingUser(false);
      }
    }

    if (ready) {
      fetchUser();
    }
  }, [address, email, ready]);

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
