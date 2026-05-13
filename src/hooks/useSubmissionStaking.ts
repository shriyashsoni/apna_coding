import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { 
  parseEther, 
  createWalletClient, 
  custom, 
  createPublicClient, 
  http 
} from 'viem';
import { sepolia } from 'viem/chains';
import { toast } from 'sonner';
import {
  PUBLIC_SUBMISSION_STAKING_CONTRACT,
  PUBLIC_SUBMISSION_STAKING_ABI
} from '@/contracts/PublicSubmissionStaking';

export enum SubmissionType {
  Event = 0,
  Hackathon = 1,
  Product = 2
}

export function useSubmissionStaking() {
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const submitWithStake = async (type: SubmissionType, contentId: string) => {
    if (!wallet) {
      toast.error('Please connect your wallet');
      return null;
    }

    try {
      setIsSubmitting(true);

      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        account: wallet.address as `0x${string}`,
        chain: sepolia,
        transport: custom(provider)
      });

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http()
      });

      // Switch network if needed
      if (wallet.chainId !== 'eip155:11155111') {
        try {
          await wallet.switchChain(11155111);
        } catch (switchError) {
          toast.error('Please switch to Ethereum Sepolia network');
          return null;
        }
      }

      const hash = await walletClient.writeContract({
        address: PUBLIC_SUBMISSION_STAKING_CONTRACT.address,
        abi: PUBLIC_SUBMISSION_STAKING_ABI,
        functionName: 'submit',
        args: [type, contentId],
        value: parseEther('0.01'),
      });

      setTxHash(hash);
      toast.success('Staking transaction submitted! Waiting for confirmation...');

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (receipt.status === 'success') {
        // Extract submission ID from event logs
        const logs = receipt.logs;
        // The first log should be the Submitted event
        // We can parse it to get the 'id'
        // For simplicity, we can also just fetch the submissionCount from the contract if needed,
        // but parsing the log is more robust.
        
        toast.success('Stake confirmed on-chain!');
        return { hash, receipt };
      } else {
        toast.error('Staking transaction failed');
        return null;
      }
    } catch (error: any) {
      console.error('Staking error:', error);
      toast.error(error.message || 'Failed to stake on-chain');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitWithStake,
    isSubmitting,
    txHash,
  };
}
