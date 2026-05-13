# Apna Coding Smart Contracts

Professional smart contracts for launching and managing Web3 products on-chain with staking capabilities.

## 📋 Overview

This repository contains two main smart contracts:

### 1. **ProductLaunch.sol**
A comprehensive contract for launching Web3 products on-chain with features including:
- ✅ Product registration with metadata
- ✅ Upvoting system
- ✅ Creator verification
- ✅ Product categorization
- ✅ Social links integration
- ✅ Launch fee mechanism
- ✅ Admin controls

### 2. **ProductStaking.sol**
A staking contract that allows users to stake ETH for products they support:
- ✅ Stake ETH for specific products
- ✅ Earn rewards based on time staked
- ✅ Flexible unstaking
- ✅ Per-product staking pools
- ✅ Reward rate configuration
- ✅ Multi-product staking support

## 🚀 Deployment Information

**Deployer Address:** `0x6F9788e39e8C629f73C27db48cce03eA1fB9Acc1`
**Staking Contract:** `0xE114AA229DE7c88BC22d2F5ec628532c9c46663c`

## 🛠️ Installation

```bash
cd contracts
npm install
cp .env.example .env
# Edit .env with your configuration
```

## 📝 Compilation

```bash
npm run compile
```

## 🚀 Quick Deployment

### Testnet (Sepolia):
```bash
npm run deploy:sepolia
```

### Mainnet:
```bash
npm run deploy:polygon
# or deploy:arbitrum, deploy:base, etc.
```

See README for full documentation.
