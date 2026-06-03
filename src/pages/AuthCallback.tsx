import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';

/**
 * OAuth callback page — Privy redirects here after Google/GitHub/X login.
 * Once authenticated, we redirect the user to the homepage.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Once Privy finishes processing, send user to homepage
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-white/70 font-medium text-lg">Completing login...</p>
        <p className="text-white/40 text-sm">You'll be redirected shortly</p>
      </div>
    </div>
  );
}
