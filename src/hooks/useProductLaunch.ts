import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { 
  parseEther, 
  createWalletClient, 
  custom, 
  createPublicClient, 
  http 
} from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { toast } from 'sonner';
import {
  PRODUCT_LAUNCH_CONTRACT,
  PRODUCT_LAUNCH_ABI,
  LAUNCH_FEE
} from '@/contracts/ProductLaunchVerification';

export function useProductLaunch() {
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const [isLaunching, setIsLaunching] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [isSuccess, setIsSuccess] = useState(false);

  const launchProduct = async (
    name: string,
    description: string,
    category: string,
    logoUrl: string,
    websiteUrl: string,
    socialLinks: string[]
  ) => {
    if (!wallet) {
      toast.error('Please connect your wallet');
      return null;
    }

    try {
      setIsLaunching(true);
      setIsSuccess(false);

      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        account: wallet.address as `0x${string}`,
        chain: wallet.chainId === 'eip155:84532' ? baseSepolia : base,
        transport: custom(provider)
      });

      const publicClient = createPublicClient({
        chain: wallet.chainId === 'eip155:84532' ? baseSepolia : base,
        transport: http()
      });

      const network = wallet.chainId === 'eip155:84532' ? 'base-sepolia' : 'base';
      const contractAddress = PRODUCT_LAUNCH_CONTRACT[network].address;

      if (contractAddress === '0x_DEPLOY_ADDRESS_HERE') {
        toast.error('Contract not deployed on this network');
        return null;
      }

      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: PRODUCT_LAUNCH_ABI,
        functionName: 'launchProduct',
        args: [name, description, category, logoUrl, websiteUrl, socialLinks],
        value: parseEther(LAUNCH_FEE),
      });

      setTxHash(hash);
      toast.success('Transaction submitted! Waiting for confirmation...');

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === 'success') {
        setIsSuccess(true);
        toast.success('Product launched on-chain successfully!');
      } else {
        toast.error('Transaction failed');
      }

      return hash;
    } catch (error: any) {
      console.error('Launch error:', error);

      if (error.message?.includes('User rejected')) {
        toast.error('Transaction rejected');
      } else if (error.message?.includes('Incorrect stake amount')) {
        toast.error('Incorrect launch fee amount');
      } else {
        toast.error(error.message || 'Failed to launch product');
      }

      return null;
    } finally {
      setIsLaunching(false);
    }
  };

  return {
    launchProduct,
    isLaunching,
    isSuccess,
    txHash,
  };
}

export function useApproveProduct() {
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const [isApproving, setIsApproving] = useState(false);

  const approveProduct = async (productId: number) => {
    if (!wallet) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      setIsApproving(true);

      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        account: wallet.address as `0x${string}`,
        chain: wallet.chainId === 'eip155:84532' ? baseSepolia : base,
        transport: custom(provider)
      });

      const publicClient = createPublicClient({
        chain: wallet.chainId === 'eip155:84532' ? baseSepolia : base,
        transport: http()
      });

      const network = wallet.chainId === 'eip155:84532' ? 'base-sepolia' : 'base';
      const contractAddress = PRODUCT_LAUNCH_CONTRACT[network].address;

      if (contractAddress === '0x_DEPLOY_ADDRESS_HERE') {
        toast.error('Contract not deployed on this network');
        return false;
      }

      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: PRODUCT_LAUNCH_ABI,
        functionName: 'approveProduct',
        args: [BigInt(productId)],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      toast.success('Product approved! Stake refunded to founder.');
      return true;
    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error(error.message || 'Failed to approve product');
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  return {
    approveProduct,
    isApproving,
  };
}

export function useRejectProduct() {
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const [isRejecting, setIsRejecting] = useState(false);

  const rejectProduct = async (productId: number) => {
    if (!wallet) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      setIsRejecting(true);

      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        account: wallet.address as `0x${string}`,
        chain: wallet.chainId === 'eip155:84532' ? baseSepolia : base,
        transport: custom(provider)
      });

      const publicClient = createPublicClient({
        chain: wallet.chainId === 'eip155:84532' ? baseSepolia : base,
        transport: http()
      });

      const network = wallet.chainId === 'eip155:84532' ? 'base-sepolia' : 'base';
      const contractAddress = PRODUCT_LAUNCH_CONTRACT[network].address;

      if (contractAddress === '0x_DEPLOY_ADDRESS_HERE') {
        toast.error('Contract not deployed on this network');
        return false;
      }

      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: PRODUCT_LAUNCH_ABI,
        functionName: 'rejectProduct',
        args: [BigInt(productId)],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      toast.success('Product rejected. Stake kept in contract.');
      return true;
    } catch (error: any) {
      console.error('Reject error:', error);
      toast.error(error.message || 'Failed to reject product');
      return false;
    } finally {
      setIsRejecting(false);
    }
  };

  return {
    rejectProduct,
    isRejecting,
  };
}
