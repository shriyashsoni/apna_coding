import { useAuth } from '@/hooks/use-auth';
import { useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, User, FileText, Shield, ChevronDown, RefreshCw, Network } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router";

const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', hex: 'eip155:1' },
  { id: 137, name: 'Polygon', hex: 'eip155:137' },
  { id: 42161, name: 'Arbitrum', hex: 'eip155:42161' },
  { id: 8453, name: 'Base', hex: 'eip155:8453' },
  { id: 42220, name: 'Celo', hex: 'eip155:42220' },
];

export function WalletConnect() {
  const { isAuthenticated, user, privyUser, signIn, signOut } = useAuth();
  const { wallets } = useWallets();
  const address = privyUser?.wallet?.address;
  const isCustomWallet = privyUser?.wallet && privyUser.wallet.walletClientType !== 'privy';
  const walletType = privyUser?.wallet?.walletClientType || privyUser?.wallet?.connectorType;

  const activeWallet = wallets[0];
  const currentChainId = activeWallet?.chainId;

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

  const handleSwitchChain = async (chainId: number) => {
    try {
      if (activeWallet) {
        await activeWallet.switchChain(chainId);
      }
    } catch (e) {
      console.error('Failed to switch chain', e);
    }
  };

  const email = privyUser?.email?.address || user?.email;
  const name = user?.name || user?.username || email?.split('@')[0] || "Builder";
  const isAdmin = user?.role === 'admin';

  if (isAuthenticated) {
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || "apnacoding"}`;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 gap-2 px-3 pl-2 h-10 select-none cursor-pointer"
          >
            <img src={avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full bg-primary/20 object-cover" />
            <span className="font-medium max-w-[110px] truncate text-white/90">{name}</span>
            <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 border-primary/20 bg-black/95 backdrop-blur-md text-foreground p-1">
          {/* User Details Header */}
          <div className="px-3 py-3 mb-1">
            <div className="font-medium text-white truncate text-sm">{name}</div>
            {email && <div className="text-xs text-white/60 truncate font-mono mt-0.5">{email}</div>}
            
            {/* Show custom wallet address if linked */}
            {isCustomWallet && address ? (
              <div className="mt-2.5 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-1">
                <span className="text-[10px] text-emerald-400 font-mono font-medium truncate">
                  🔗 {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                  {walletType || 'Wallet'}
                </span>
              </div>
            ) : (
              <div className="mt-2.5 text-[10px] text-white/40 italic flex items-center gap-1.5 px-1 py-0.5">
                <Wallet className="h-3 w-3 text-white/30" />
                No custom wallet linked
              </div>
            )}
          </div>

          <DropdownMenuSeparator className="bg-primary/10 my-1" />

          {/* Wallet Actions (only if they have a custom wallet linked) */}
          {isCustomWallet && activeWallet && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer py-2 text-white/90 focus:text-white">
                  <Network className="mr-2 h-4 w-4 text-primary/80" />
                  Switch Network
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="border-primary/20 bg-black/95 backdrop-blur-md min-w-[160px] p-1">
                    {SUPPORTED_CHAINS.map((chain) => (
                      <DropdownMenuItem 
                        key={chain.id} 
                        className="cursor-pointer py-2 focus:bg-primary/10 focus:text-white"
                        onClick={() => handleSwitchChain(chain.id)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className={`w-2 h-2 rounded-full ${currentChainId === chain.hex ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-muted-foreground/30'}`} />
                          {chain.name}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator className="bg-primary/10 my-1" />
            </>
          )}
          
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer py-2 text-white/90 focus:text-white focus:bg-primary/10 flex items-center">
              <User className="mr-2 h-4 w-4 text-primary/80" />
              Profile Dashboard
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link to="/my-content" className="cursor-pointer py-2 text-white/90 focus:text-white focus:bg-primary/10 flex items-center">
              <FileText className="mr-2 h-4 w-4 text-primary/80" />
              My Content
            </Link>
          </DropdownMenuItem>
          
          {isAdmin && (
            <>
              <DropdownMenuSeparator className="bg-primary/10 my-1" />
              <DropdownMenuItem asChild>
                <Link to="/admin" className="cursor-pointer text-primary py-2 font-medium focus:text-white focus:bg-primary/20 flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Link>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator className="bg-primary/10 my-1" />
          
          <DropdownMenuItem 
            onClick={signOut}
            className="cursor-pointer py-2 text-rose-400 focus:text-white focus:bg-rose-500/20 flex items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={signIn}
      className="bg-primary text-primary-foreground hover:bg-primary/95 shadow-[0_0_15px_rgba(59,130,246,0.25)] font-medium gap-2 px-5 py-2.5 rounded-full border border-primary/20 hover:scale-[1.02] transition-all duration-200 select-none cursor-pointer"
    >
      <User className="h-4 w-4 text-white" />
      Sign In
    </Button>
  );
}
