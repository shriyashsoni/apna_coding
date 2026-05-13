import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useAuth() {
  const { 
    user: privyUser, 
    authenticated, 
    login, 
    logout, 
    ready 
  } = usePrivy();
  
  const address = privyUser?.wallet?.address;
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
        
        if (data) {
          setUser(data);
        } else {
          // If user doesn't exist in our users table, we might want to create one
          // or just return null
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user from Supabase:", err);
      } finally {
        setIsLoadingUser(false);
      }
    }

    if (ready) {
      fetchUser();
    }
  }, [address, ready]);

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
