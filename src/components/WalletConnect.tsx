import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, User, FileText, Shield, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router";
import { useAdmin } from "@/hooks/useAdmin";

export function WalletConnect() {
  const { login, logout, authenticated, user } = usePrivy();
  const { isAdmin } = useAdmin();
  const address = user?.wallet?.address;
  const walletType = user?.wallet?.walletClientType || user?.wallet?.connectorType;

  const getWalletIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'metamask': return 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg';
      case 'coinbase_wallet': return 'https://avatars.githubusercontent.com/u/18060234?s=200&v=4';
      case 'wallet_connect': return 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg';
      case 'phantom': return 'https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/wwe1kcl7b6ok3b2n8eex';
      case 'rainbow': return 'https://raw.githubusercontent.com/rainbow-me/rainbow/master/assets/icon.png';
      case 'trust_wallet': return 'https://trustwallet.com/assets/images/media/assets/trust_wallet_logo.svg';
      default: return null;
    }
  };

  if (authenticated && address) {
    const iconUrl = getWalletIcon(walletType);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 gap-2 px-3 pl-2"
          >
            {iconUrl ? (
              <img src={iconUrl} alt="Wallet" className="w-5 h-5 object-contain rounded-sm" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
            <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 border-primary/30 bg-card">
          <div className="px-2 py-2 mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono truncate">{address}</span>
            <Button
              onClick={logout}
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Logout"
            >
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
          <DropdownMenuSeparator className="bg-primary/20" />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer py-2">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/my-content" className="cursor-pointer py-2">
              <FileText className="mr-2 h-4 w-4" />
              My Content
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator className="bg-primary/20" />
              <DropdownMenuItem asChild>
                <Link to="/admin" className="cursor-pointer text-primary py-2">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
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
