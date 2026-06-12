import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { usePrivy } from '@privy-io/react-auth';
import { isSuperAdmin } from '@/lib/admin-config';

export function useAdmin() {
  const { user } = usePrivy();
  const address = user?.wallet?.address;
  const email = user?.email?.address;
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (!address) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if super admin first (hardcoded/config list)
      if (isSuperAdmin(address, email)) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('wallet_address', address)
          .single();

        if (data?.role && data.role !== 'user') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [address, email]);

  return { isAdmin, loading };
}
