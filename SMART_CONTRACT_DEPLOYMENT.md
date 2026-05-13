# 🚀 Smart Contract Deployment Guide

Complete guide for deploying Apna Coding's product launch smart contracts.

## 📋 Prerequisites

- Node.js v16+ installed
- MetaMask or another Web3 wallet
- ETH/MATIC/other native tokens for gas fees
- Private key for deployment wallet
- (Optional) Etherscan/Polygonscan API key for verification

## 🔧 Setup Steps

### 1. Navigate to Contracts Directory

```bash
cd contracts
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Hardhat
- Ethers.js
- OpenZeppelin contracts
- Hardhat toolbox

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```bash
# Your wallet private key (WITHOUT 0x prefix)
PRIVATE_KEY=your_private_key_here

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Custom RPC URLs (optional - defaults provided)
POLYGON_RPC_URL=https://polygon-rpc.com
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

**⚠️ Security Warning:**
- NEVER commit `.env` file to git
- NEVER share your private key
- Use a dedicated deployment wallet

### 4. Compile Contracts

```bash
npm run compile
```

This generates:
- `artifacts/` - Compiled contract bytecode
- `cache/` - Compilation cache
- Contract ABIs in artifacts folder

## 🚀 Deployment

### Testnet Deployment (Recommended First)

#### Sepolia (Ethereum Testnet)

1. Get Sepolia ETH from faucet:
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia

2. Deploy:
```bash
npm run deploy:sepolia
```

#### Mumbai (Polygon Testnet)

1. Get Mumbai MATIC:
   - https://faucet.polygon.technology/

2. Deploy:
```bash
npm run deploy:mumbai
```

### Mainnet Deployment

⚠️ **Before mainnet deployment:**
1. Verify contracts work on testnet
2. Audit smart contracts
3. Double-check private key and RPC URLs
4. Ensure sufficient native tokens for gas

#### Polygon Mainnet

```bash
npm run deploy:polygon
```

#### Ethereum Mainnet

```bash
npm run deploy:mainnet
```

#### Other Networks

```bash
npm run deploy:arbitrum   # Arbitrum One
npm run deploy:optimism   # Optimism
npm run deploy:base       # Base
npm run deploy:bsc        # BSC
npm run deploy:avalanche  # Avalanche C-Chain
```

## 📝 After Deployment

### 1. Save Contract Addresses

Deployment creates `deployments/<network>.json` with:
```json
{
  "network": "polygon",
  "deployer": "0x6F9788e39e8C629f73C27db48cce03eA1fB9Acc1",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "contracts": {
    "ProductLaunch": "0x...",
    "ProductStaking": "0xE114AA229DE7c88BC22d2F5ec628532c9c46663c"
  }
}
```

### 2. Update Frontend

Update contract addresses in `/src/pages/LaunchOnChain.tsx`:

```typescript
const CONTRACT_ADDRESSES = {
  ProductLaunch: "0xYOUR_DEPLOYED_ADDRESS_HERE",
  ProductStaking: "0xE114AA229DE7c88BC22d2F5ec628532c9c46663c"
};
```

### 3. Verify Contracts

Contracts are auto-verified during deployment if API keys are configured.

Manual verification:
```bash
npx hardhat verify --network polygon <CONTRACT_ADDRESS>
```

### 4. Test Contract Functions

Visit: `https://apnacoding.site/launch-onchain`

Connect wallet and test:
- Launch a product
- Upvote a product
- Stake ETH
- Claim rewards

## 🔍 Contract Verification

### Etherscan Verification

```bash
npx hardhat verify --network mainnet <CONTRACT_ADDRESS>
```

### Polygonscan Verification

```bash
npx hardhat verify --network polygon <CONTRACT_ADDRESS>
```

## 📊 Gas Cost Estimates

| Network | Launch Product | Upvote | Stake | Total |
|---------|---------------|--------|-------|-------|
| Ethereum | ~$50-100 | ~$10-20 | ~$30-50 | High |
| Polygon | ~$0.01-0.05 | ~$0.001 | ~$0.01 | Low |
| Arbitrum | ~$0.10-0.50 | ~$0.02 | ~$0.05 | Medium |
| Base | ~$0.05-0.20 | ~$0.01 | ~$0.02 | Low |

*Prices vary with network congestion*

## 🛡️ Security Checklist

Before mainnet deployment:

- [ ] Contracts compiled without errors
- [ ] Tested on testnet successfully
- [ ] Code reviewed/audited
- [ ] `.env` file is in `.gitignore`
- [ ] Using dedicated deployment wallet
- [ ] Sufficient gas tokens for deployment
- [ ] API keys configured for verification
- [ ] Emergency pause mechanism tested (if implemented)
- [ ] Owner functions tested
- [ ] Frontend integration tested

## 🔗 Useful Links

**Block Explorers:**
- Ethereum: https://etherscan.io
- Polygon: https://polygonscan.com
- Arbitrum: https://arbiscan.io
- Base: https://basescan.org

**Faucets:**
- Sepolia: https://sepoliafaucet.com
- Mumbai: https://faucet.polygon.technology

**RPC Providers:**
- Alchemy: https://www.alchemy.com
- Infura: https://infura.io
- QuickNode: https://www.quicknode.com

## 🆘 Troubleshooting

### "Insufficient funds for gas"
- Ensure wallet has native tokens (ETH/MATIC/etc.)
- Check gas price isn't too low

### "Nonce too high"
- Reset MetaMask nonce in Settings → Advanced

### "Contract verification failed"
- Check API key is correct
- Wait 1-2 minutes after deployment
- Ensure correct constructor arguments

### "Network not configured"
- Check network name in hardhat.config.js
- Verify RPC URL is accessible

## 📞 Support

Questions? Contact:
- Email: apnacoding.tech@gmail.com
- Telegram: @apnacodingtech
- Twitter: @apna_coding

---

**Deployment Addresses:**
- Deployer: `0x6F9788e39e8C629f73C27db48cce03eA1fB9Acc1`
- Staking Contract: `0xE114AA229DE7c88BC22d2F5ec628532c9c46663c`

**Built with ❤️ by Apna Coding**
