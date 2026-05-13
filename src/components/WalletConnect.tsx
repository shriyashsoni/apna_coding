import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

export function WalletConnect() {
  const { login, logout, authenticated, user } = usePrivy();
  const address = user?.wallet?.address;

  if (authenticated && address) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </Button>
        <Button
          onClick={logout}
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={login}
      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(0,255,255,0.3)]"
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
