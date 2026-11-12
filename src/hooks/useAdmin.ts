import { isTeamRole } from '@/lib/admin-config';
import { useAuth } from '@/hooks/use-auth';

/** Display gating only. Backend authorization must independently verify identity. */
export function useAdmin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  return { isAdmin: isAuthenticated && !isLoading && isTeamRole(user?.role), loading: isLoading };
}
