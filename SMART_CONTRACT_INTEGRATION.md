# 🚀 Smart Contract Integration Guide

## Product Launch Verification Contract

This guide explains how the smart contract integration works for product launches on Apna Coding.

---

## 📋 Overview

The Product Launch Verification contract ensures quality and prevents spam by:
1. **Requiring a 0.001 ETH launch fee** when users submit products
2. **Refunding the fee** when admin approves the product
3. **Keeping the fee** if product is rejected (spam prevention)

---

## 🔧 Contract Details

**Contract File:** `/contracts/ProductLaunchVerification.sol`

**Key Features:**
- Launch Fee: **0.001 ETH** (fixed)
- Admin Wallet: `0x9D307F0C1B614C9088Aa83eAE9AA3D9779c4921D`
- Networks: Base Mainnet & Base Sepolia Testnet

**Contract Functions:**
- `launchProduct()` - Users pay 0.001 ETH to launch product
- `approveProduct(uint256 productId)` - Admin approves and refunds stake
- `rejectProduct(uint256 productId)` - Admin rejects, keeps stake
- `withdraw()` - Admin withdraws accumulated rejected stakes

---

## 📁 Files Created

### 1. Contract Configuration
**File:** `/src/contracts/ProductLaunchVerification.ts`

Contains:
- Contract ABI
- Deployment addresses (Base & Base Sepolia)
- Constants (LAUNCH_FEE, ADMIN_ADDRESS)
- ProductStatus enum

### 2. Custom Hooks
**File:** `/src/hooks/useProductLaunch.ts`

Exports:
- `useProductLaunch()` - For users to launch products
- `useApproveProduct()` - For admin to approve products
- `useRejectProduct()` - For admin to reject products

### 3. Updated Files
- `/src/pages/Products.tsx` - Product creation with payment
- `/src/lib/wagmi.ts` - Added Base & Base Sepolia networks

---

## 🌐 Network Support

### Base Mainnet (Production)
- Chain ID: `8453`
- Contract Address: `0x_DEPLOY_ADDRESS_HERE` ⚠️ **Update after deployment**

### Base Sepolia (Testnet)
- Chain ID: `84532`
- Contract Address: `0x_DEPLOY_ADDRESS_HERE` ⚠️ **Update after deployment**

---

## 🚀 Deployment Steps

### Step 1: Deploy Contract

```bash
# Using Hardhat or Foundry
forge create --rpc-url <BASE_RPC_URL> \
  --private-key <DEPLOYER_PRIVATE_KEY> \
  contracts/ProductLaunchVerification.sol:ProductLaunchVerification

# Or using Remix IDE:
# 1. Go to https://remix.ethereum.org
# 2. Upload ProductLaunchVerification.sol
# 3. Compile with Solidity 0.8.20
# 4. Deploy to Base Sepolia (testnet) or Base Mainnet
# 5. Copy deployed contract address
```

### Step 2: Update Contract Addresses

**Edit:** `/src/contracts/ProductLaunchVerification.ts`

```typescript
export const PRODUCT_LAUNCH_CONTRACT = {
  'base-sepolia': {
    address: '0xYOUR_TESTNET_ADDRESS' as `0x${string}`, // ⚠️ UPDATE HERE
    chainId: 84532,
  },
  'base': {
    address: '0xYOUR_MAINNET_ADDRESS' as `0x${string}`, // ⚠️ UPDATE HERE
    chainId: 8453,
  },
} as const;
```

### Step 3: Get Base RPC URLs

**Free RPC Providers:**
- Alchemy: https://www.alchemy.com
- QuickNode: https://www.quicknode.com
- Public Base RPC: https://mainnet.base.org

### Step 4: Test on Sepolia First!

1. Get Base Sepolia ETH from faucet:
   - https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - https://faucet.quicknode.com/base/sepolia

2. Connect wallet to Base Sepolia in MetaMask

3. Try launching a test product

---

## 💻 How It Works

### User Flow (Launching Product)

1. User clicks "Add Product" on `/products` page
2. Fills in product details (name, description, category, etc.)
3. Clicks "Launch Product (0.001 ETH)" button
4. **MetaMask popup appears** requesting 0.001 ETH payment
5. User confirms transaction
6. Transaction gets mined on Base network
7. Product is saved to database with status "Pending"
8. Product awaits admin approval

### Admin Flow (Approving Product)

1. Admin goes to `/admin` dashboard
2. Views pending products in admin panel
3. Reviews product details
4. Clicks "Approve" or "Reject"
5. **If Approved:**
   - Smart contract refunds 0.001 ETH to user
   - Product becomes visible on site
6. **If Rejected:**
   - Smart contract keeps the 0.001 ETH
   - Prevents spam and low-quality submissions

---

## 🛠️ Usage Examples

### For Users (Frontend)

```typescript
import { useProductLaunch } from '@/hooks/useProductLaunch';
import { LAUNCH_FEE } from '@/contracts/ProductLaunchVerification';

function MyComponent() {
  const { launchProduct, isLaunching } = useProductLaunch();

  const handleLaunch = async () => {
    const txHash = await launchProduct();
    if (txHash) {
      console.log('Product launched! TX:', txHash);
      // Save product to database
    }
  };

  return (
    <button onClick={handleLaunch} disabled={isLaunching}>
      Launch Product ({LAUNCH_FEE} ETH)
    </button>
  );
}
```

### For Admin (Approval)

```typescript
import { useApproveProduct, useRejectProduct } from '@/hooks/useProductLaunch';

function AdminPanel() {
  const { approveProduct, isApproving } = useApproveProduct();
  const { rejectProduct, isRejecting } = useRejectProduct();

  const handleApprove = async (productId: number) => {
    const success = await approveProduct(productId);
    if (success) {
      // Update product status in database
    }
  };

  const handleReject = async (productId: number) => {
    const success = await rejectProduct(productId);
    if (success) {
      // Update product status in database
    }
  };

  return (
    <>
      <button onClick={() => handleApprove(1)} disabled={isApproving}>
        Approve Product
      </button>
      <button onClick={() => handleReject(2)} disabled={isRejecting}>
        Reject Product
      </button>
    </>
  );
}
```

---

## 🔐 Security Features

✅ **Fixed Admin Address** - Hardcoded in contract, cannot be changed
✅ **Fixed Launch Fee** - 0.001 ETH, cannot be manipulated
✅ **Single Approval** - Products can only be approved/rejected once
✅ **Automatic Refund** - Approved products get instant refund
✅ **Spam Prevention** - Rejected products lose their stake

---

## 📊 Admin Earnings

Admin can withdraw accumulated fees from rejected products:

```solidity
// Only admin can call this
function withdraw() external onlyAdmin {
    payable(admin).transfer(address(this).balance);
}
```

**Example:**
- 100 products launched = 0.1 ETH total
- 80 approved (refunded) = 0 ETH retained
- 20 rejected (spam) = 0.02 ETH retained
- Admin withdraws 0.02 ETH

---

## 🧪 Testing Checklist

### Before Mainnet Deployment

- [ ] Deploy to Base Sepolia testnet
- [ ] Update testnet contract address in config
- [ ] Test product launch with testnet ETH
- [ ] Test admin approval (refund works)
- [ ] Test admin rejection (keeps fee)
- [ ] Test withdraw function
- [ ] Verify contract on BaseScan
- [ ] Test with multiple users
- [ ] Check gas costs

### After Mainnet Deployment

- [ ] Deploy to Base Mainnet
- [ ] Update mainnet contract address in config
- [ ] Verify contract on BaseScan
- [ ] Test with small amount first
- [ ] Monitor first 10 launches closely
- [ ] Set up contract monitoring (etherscan alerts)

---

## 🌟 Future Enhancements

### Possible Upgrades
1. **Tiered Launch Fees**
   - Basic: 0.001 ETH
   - Featured: 0.005 ETH (highlighted on homepage)
   - Premium: 0.01 ETH (top placement + marketing)

2. **Time-Based Refunds**
   - Full refund if approved within 24 hours
   - 80% refund if approved within 7 days
   - 50% refund after 7 days

3. **Multi-Sig Admin**
   - Require 2/3 admins to approve/reject
   - Prevents single point of failure

4. **Stake Rewards**
   - Users get bonus tokens for approved products
   - Incentivize quality submissions

---

## 📞 Support & Resources

### Documentation
- Wagmi Docs: https://wagmi.sh
- RainbowKit Docs: https://www.rainbowkit.com
- Base Docs: https://docs.base.org
- Solidity Docs: https://docs.soliditylang.org

### Get Help
- Base Discord: https://discord.gg/base
- Wagmi Discord: https://discord.gg/wagmi

---

## ⚠️ Important Notes

1. **Update Contract Addresses** - The placeholder addresses `0x_DEPLOY_ADDRESS_HERE` MUST be replaced with actual deployed contract addresses before going live.

2. **Test First** - Always test on Base Sepolia testnet before deploying to mainnet.

3. **Gas Fees** - Users pay ~$0.01-0.05 in gas fees + 0.001 ETH stake.

4. **Admin Responsibility** - Admin must review products promptly to refund honest users.

5. **Network Switching** - Users need to switch to Base network in MetaMask to launch products.

---

## ✅ Integration Complete!

The smart contract is now fully integrated into the frontend:
- ✅ Users can launch products with 0.001 ETH fee
- ✅ Payment flow integrated into product creation
- ✅ UI shows launch fee and network info
- ✅ Hooks created for approval/rejection
- ✅ Base & Base Sepolia networks configured

**Next Steps:**
1. Deploy contract to Base Sepolia
2. Update contract addresses in `/src/contracts/ProductLaunchVerification.ts`
3. Test with testnet ETH
4. Deploy to Base Mainnet
5. Update mainnet address
6. Launch! 🚀

---

**Made with ❤️ for Apna Coding Community**
