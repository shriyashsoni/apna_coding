import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, User, ChevronDown, Activity } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WalletConnect() {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const address = user?.wallet?.address;

  // Find the currently active wallet to get its chain
  const activeWallet = wallets.find(w => w.address === address) || wallets[0];

  const getNetworkName = (chainId?: string) => {
    if (!chainId) return "Unknown Network";
    if (chainId.includes("eip155:1")) return "Ethereum";
    if (chainId.includes("eip155:137")) return "Polygon";
    if (chainId.includes("eip155:8453")) return "Base";
    if (chainId.includes("eip155:42220")) return "Celo";
    if (chainId.includes("eip155:44787")) return "Alfajores";
    if (chainId.includes("eip155:11155111")) return "Sepolia";
    return "EVM Chain";
  };

  const getCurrencyName = (chainId?: string) => {
    if (!chainId) return "ETH";
    if (chainId.includes("eip155:137")) return "MATIC";
    if (chainId.includes("eip155:42220") || chainId.includes("eip155:44787")) return "CELO";
    return "ETH";
  };

  if (authenticated && address) {
    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-white/10 bg-[#121212] text-white hover:bg-white/5 rounded-xl flex items-center gap-2"
            >
              <User className="h-4 w-4 text-gray-400" />
              <span>Account</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#121212] border-white/10 text-white">
            <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <div className="px-2 py-1.5 text-sm text-gray-400 flex justify-between items-center">
              <span>Network</span>
              <span className="text-white font-medium flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-green-400" />
                {getNetworkName(activeWallet?.chainId)}
              </span>
            </div>
            <div className="px-2 py-1.5 text-sm text-gray-400 flex justify-between items-center">
              <span>Currency</span>
              <span className="text-white font-medium">
                {getCurrencyName(activeWallet?.chainId)}
              </span>
            </div>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              onClick={login}
              className="hover:bg-white/5 focus:bg-white/5 cursor-pointer"
            >
              <Wallet className="mr-2 h-4 w-4" />
              <span>Change Wallet / Network</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          className="border-white/10 bg-[#121212] text-white hover:bg-white/5 rounded-xl font-mono"
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </Button>

        <Button
          onClick={logout}
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={login}
      className="bg-white text-black hover:bg-gray-200 rounded-full px-6 font-medium"
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
