# Flow NFT Certificate System - Deployment Guide

## Overview
Apna Coding now issues certificates as NFTs on the Flow blockchain. This guide will help you deploy the smart contract and configure the system.

---

## 📋 What's Included

### Backend (Convex)
- ✅ Certificate schema with Flow NFT fields
- ✅ Certificate minting mutations
- ✅ Certificate verification queries
- ✅ Bulk certificate issuance
- ✅ NFT status tracking

### Frontend (React)
- ✅ Certificate viewing page (`/certificates`)
- ✅ Certificate verification page (`/verify/:certificateNumber`)
- ✅ CertificateViewer component with NFT display
- ✅ Profile page showing certificates

### Smart Contract (Flow Cadence)
- ✅ `ApnaCodingCertificate` NFT contract
- ✅ Minting functionality
- ✅ Metadata storage
- ✅ Non-transferable by default

---

## 🚀 Deployment Steps

### Step 1: Deploy Flow Smart Contract

#### 1.1 Get Flow Wallet
1. Install **Flow Wallet** extension from https://wallet.flow.com
2. Create a new wallet or import existing one
3. **IMPORTANT**: Save your seed phrase securely

#### 1.2 Get Testnet FLOW Tokens
1. Go to Flow Testnet Faucet: https://testnet-faucet.onflow.org
2. Enter your wallet address
3. Request testnet FLOW tokens (you'll need ~1 FLOW for deployment)

#### 1.3 Deploy Using Flow CLI (Recommended)

**Install Flow CLI:**
```bash
# macOS/Linux
sh -ci "$(curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh)"

# Or via Homebrew
brew install flow-cli
```

**Initialize Flow Project:**
```bash
cd /path/to/apna-coding
flow init
```

**Update `flow.json`:**
```json
{
  "contracts": {
    "ApnaCodingCertificate": "./contracts/CertificateNFT.cdc"
  },
  "networks": {
    "testnet": "access.devnet.nodes.onflow.org:9000"
  },
  "accounts": {
    "testnet-account": {
      "address": "YOUR_TESTNET_ADDRESS",
      "key": "YOUR_PRIVATE_KEY"
    }
  },
  "deployments": {
    "testnet": {
      "testnet-account": ["ApnaCodingCertificate"]
    }
  }
}
```

**Deploy Contract:**
```bash
flow project deploy --network=testnet
```

**Copy the deployed contract address from the output!**

---

#### 1.4 Alternative: Deploy Using Flow Playground (Web)

1. Go to https://play.flow.com
2. Click "New Account"
3. Copy the contents of `contracts/CertificateNFT.cdc`
4. Paste into the contract editor
5. Update the imports at the top:
   ```cadence
   import NonFungibleToken from 0x631e88ae7f1d7c20
   import MetadataViews from 0x631e88ae7f1d7c20
   ```
6. Click "Deploy" button
7. Copy the deployed contract address

---

### Step 2: Update Frontend Configuration

Open `/src/lib/flowConfig.ts` and update:

```typescript
export const FLOW_CONFIG = {
  testnet: {
    accessNode: "https://rest-testnet.onflow.org",
    contractAddress: "0xYOUR_CONTRACT_ADDRESS_HERE", // ← UPDATE THIS
    contractName: "ApnaCodingCertificate",
    chainId: "flow-testnet",
    explorer: "https://testnet.flowscan.org",
  },
  // ... mainnet config
}
```

---

### Step 3: Test the System

#### 3.1 Issue Test Certificate

Run this in your browser console or create a test script:

```javascript
// Use Convex dashboard or call from admin UI
await convex.mutation(api.certificates.issueCertificate, {
  userId: "YOUR_USER_ID",
  eventId: "test-hackathon-1",
  eventType: "hackathon",
  eventName: "Test Hackathon 2025",
  eventDate: "January 15, 2025",
  certificateType: "participation",
  achievementLevel: "participant",
  skills: ["Solidity", "React", "Web3"],
});
```

#### 3.2 Verify Certificate

1. Go to `/certificates` page
2. You should see your test certificate
3. Copy the certificate number
4. Go to `/verify/[certificate-number]`
5. Should show verified certificate

---

### Step 4: Mint NFT (Optional - For Testing)

To actually mint the certificate as an NFT on Flow:

1. **User needs Flow wallet** (Flow Wallet or Blocto)
2. **Call the mint function** in your Flow smart contract:

```cadence
import ApnaCodingCertificate from 0xYOUR_CONTRACT_ADDRESS

transaction {
  prepare(signer: AuthAccount) {
    // Create collection if doesn't exist
    if signer.borrow<&ApnaCodingCertificate.Collection>(from: ApnaCodingCertificate.CollectionStoragePath) == nil {
      signer.save(<- ApnaCodingCertificate.createEmptyCollection(), to: ApnaCodingCertificate.CollectionStoragePath)
      signer.link<&ApnaCodingCertificate.Collection{ApnaCodingCertificate.ApnaCodingCertificateCollectionPublic}>(
        ApnaCodingCertificate.CollectionPublicPath,
        target: ApnaCodingCertificate.CollectionStoragePath
      )
    }

    // Get minter (admin only)
    let minter = signer.borrow<&ApnaCodingCertificate.NFTMinter>(from: ApnaCodingCertificate.MinterStoragePath)
      ?? panic("Could not borrow minter reference")

    // Mint certificate
    let recipient = signer.getCapability<&{NonFungibleToken.CollectionPublic}>(ApnaCodingCertificate.CollectionPublicPath).borrow()!

    minter.mintNFT(
      recipient: recipient,
      recipientName: "John Doe",
      recipientWallet: signer.address,
      eventId: "test-hackathon-1",
      eventName: "Test Hackathon 2025",
      eventType: "hackathon",
      skills: ["Solidity", "React"],
      achievementLevel: "participant",
      verificationHash: "abc123..."
    )
  }
}
```

3. **Update database** with NFT status:

```javascript
await convex.mutation(api.certificates.updateNftStatus, {
  certificateId: "certificate_id_here",
  flowNftId: 1, // NFT ID from Flow
  flowTxHash: "transaction_hash_from_flow",
  flowContractAddress: "0xYOUR_CONTRACT_ADDRESS",
  flowWalletAddress: "0xUSER_FLOW_WALLET",
});
```

---

## 🎯 Production Deployment (Mainnet)

### Requirements:
1. **Real FLOW tokens** (~2 FLOW for deployment + gas)
2. **Funded wallet** on Flow Mainnet
3. **Tested contract** on testnet first

### Steps:
1. Update `flow.json` for mainnet:
   ```json
   {
     "networks": {
       "mainnet": "access.mainnet.nodes.onflow.org:9000"
     },
     "accounts": {
       "mainnet-account": {
         "address": "YOUR_MAINNET_ADDRESS",
         "key": "YOUR_PRIVATE_KEY"
       }
     },
     "deployments": {
       "mainnet": {
         "mainnet-account": ["ApnaCodingCertificate"]
       }
     }
   }
   ```

2. Deploy to mainnet:
   ```bash
   flow project deploy --network=mainnet
   ```

3. Update frontend config:
   ```typescript
   export const CURRENT_NETWORK: keyof typeof FLOW_CONFIG = "mainnet";
   ```

4. Update mainnet contract address in `flowConfig.ts`

---

## 🔧 Admin Tools

### Bulk Issue Certificates

Admin dashboard can bulk issue certificates for hackathon participants:

```javascript
await convex.mutation(api.certificates.bulkIssueCertificates, {
  eventId: "hackathon-123",
  eventType: "hackathon",
  eventName: "ETHIndia 2025",
  eventDate: "January 20-22, 2025",
  certificates: [
    {
      userId: "user_id_1",
      certificateType: "winner",
      achievementLevel: "winner",
      achievement: "1st Place",
      projectName: "DeFi Protocol",
    },
    {
      userId: "user_id_2",
      certificateType: "participation",
      achievementLevel: "participant",
    },
    // ... more certificates
  ],
});
```

---

## 📊 Database Schema

### Certificate Fields:
- `userId` - User ID
- `eventId` - Event/Hackathon ID
- `eventType` - "hackathon", "event", "course", "internship"
- `eventName` - Name of event
- `eventDate` - Date of event
- `certificateType` - Type of certificate
- `certificateNumber` - Unique ID (format: AC-TYPE-TIMESTAMP-XXXX)
- `verificationHash` - Verification hash
- `nftMinted` - Whether minted as NFT
- `flowNftId` - NFT ID on Flow
- `flowTxHash` - Transaction hash
- `flowWalletAddress` - Recipient's Flow wallet
- `claimStatus` - "pending", "claimed", "minted"

---

## 🛡️ Security Best Practices

1. **Admin Wallet Security**
   - Store private keys in environment variables
   - Never commit private keys to git
   - Use hardware wallet for mainnet

2. **Rate Limiting**
   - Implement rate limits on certificate issuance
   - Prevent spam minting

3. **Verification**
   - Always verify user eligibility before issuing
   - Use verification hashes to prevent tampering

4. **NFT Minting**
   - Only admin can mint NFTs
   - Validate all certificate data before minting

---

## 🧪 Testing Checklist

- [ ] Deploy contract to testnet
- [ ] Update frontend config with contract address
- [ ] Issue test certificate via backend
- [ ] View certificate on `/certificates` page
- [ ] Verify certificate on `/verify/:number` page
- [ ] Check certificate shows in profile
- [ ] Test NFT minting (optional)
- [ ] Verify Flow transaction on testnet explorer

---

## 📚 Resources

- **Flow Docs**: https://docs.onflow.org
- **Flow CLI**: https://docs.onflow.org/flow-cli
- **Cadence Language**: https://docs.onflow.org/cadence
- **Flow Playground**: https://play.flow.com
- **Flow Testnet Explorer**: https://testnet.flowscan.org
- **Flow Wallet**: https://wallet.flow.com

---

## 🐛 Troubleshooting

### Issue: "Contract not found"
**Solution**: Make sure you updated the contract address in `flowConfig.ts`

### Issue: "Could not borrow minter reference"
**Solution**: Only the contract deployer (admin) can mint NFTs. Make sure you're using the admin wallet.

### Issue: "Certificate not showing on profile"
**Solution**: Check that:
1. Certificate was successfully created in database
2. User ID matches
3. Frontend is querying correct user ID

### Issue: "Flow transaction failed"
**Solution**:
1. Check you have enough FLOW tokens for gas
2. Verify contract address is correct
3. Check transaction logs on Flow explorer

---

## 🎉 Next Steps

After successful deployment:

1. **Announce Feature** - Let users know about NFT certificates
2. **Issue Certificates** - Start issuing certificates for past events
3. **Marketing** - Promote this unique Web3 feature
4. **Monitor** - Track minting activity and user engagement

---

## 📧 Support

For deployment issues:
- GitHub Issues: https://github.com/apnacoding/support
- Email: dev@apnacoding.site
- Discord: [Link to Discord]

---

**Created by**: Apna Coding Team
**Last Updated**: January 2025
**Version**: 1.0.0
