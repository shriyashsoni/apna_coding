# Admin Certificate Manager Guide

## Overview
The Admin Certificate Manager is a powerful tool for generating and managing NFT certificates on the Flow blockchain. Admins can bulk-generate certificates for multiple users or issue individual certificates with Flow NFT integration.

## Features

### 🎯 Bulk Certificate Generation
- Select multiple users from the list
- Generate certificates for all selected users with one click
- Perfect for events, hackathons, and courses

### 👤 Single Certificate Generation
- Issue individual certificates with custom details
- Add specific achievements, project names, and team information
- Ideal for special awards and recognitions

### 🔗 Flow NFT Integration
- Mint certificates as NFTs on Flow blockchain
- Track minting status (pending/minted)
- Store transaction hashes on-chain
- Verify certificates on Flow explorer

### 📊 Real-time Statistics
- View total users
- Track pending certificates
- Monitor selected users count

## Accessing the Admin Certificate Manager

### Method 1: From Admin Dashboard
1. Navigate to `/admin` (Admin Dashboard)
2. Look for the **"Certificate Manager"** button in Quick Actions
3. Click to open the Certificate Manager

### Method 2: Direct URL
Go directly to: `/admin/certificates`

## How to Use

### Bulk Certificate Generation

#### Step 1: Select Users
1. **Search Users:** Use the search bar to filter by name, email, or wallet address
2. **Select Users:** Click on user cards to select them (they'll show a checkmark)
3. **Quick Actions:**
   - **Select All:** Click "Select All" to select all filtered users
   - **Clear Selection:** Click "Clear Selection" to deselect everyone

#### Step 2: Configure Certificate Details
1. Click **"Generate for X Selected"** button
2. Fill in the certificate form:
   - **Event Name*** (required): e.g., "Web3 Hackathon 2024"
   - **Event Date*** (required): Select the event date
   - **Event Type**: Choose from:
     - Hackathon
     - Event
     - Course
     - Internship
   - **Certificate Type**: Choose from:
     - Participation
     - Winner
     - Completion

#### Step 3: Generate Certificates
1. Click **"Generate Certificates"**
2. Wait for confirmation
3. Success! Certificates are created for all selected users

### Single Certificate Generation

#### Step 1: Open Dialog
1. Click **"Generate Single Certificate"** button

#### Step 2: Fill Details
Complete all required fields:
- **Select User*** (required): Choose from dropdown
- **Event Name*** (required): e.g., "Blockchain Workshop"
- **Event Date*** (required): Select date
- **Event Type**: Hackathon/Event/Course/Internship
- **Certificate Type**: Participation/Winner/Completion

**Optional fields:**
- Achievement: Custom achievement text
- Project Name: Name of winning project
- Team Name: Team name (if applicable)

#### Step 3: Generate
1. Click **"Generate Certificate"**
2. Get certificate number in success message
3. Certificate is ready!

## Flow NFT Minting

### What is NFT Minting?
NFT minting converts your off-chain certificate into an on-chain NFT on the Flow blockchain. This provides:
- Permanent blockchain verification
- True ownership for recipients
- Tamper-proof records
- Flow explorer verification

### How to Mint NFTs

#### Step 1: View Pending Certificates
1. Go to **"Pending NFTs"** tab
2. See all certificates that need minting

#### Step 2: Connect Flow Wallet
1. Click **"Mint NFT"** on any certificate
2. Flow wallet connection popup appears
3. Authenticate with your Flow wallet

#### Step 3: Mint Transaction
1. Review transaction details
2. Approve the transaction in your wallet
3. Wait for transaction confirmation (10-30 seconds)
4. Success! NFT is minted

#### Step 4: Verify
- Certificate updated with:
  - Flow NFT ID
  - Transaction hash
  - Minting timestamp
- View on Flow explorer using transaction hash

## Certificate Information

### Generated Certificate Includes:
- ✅ **Certificate Number**: Unique identifier (e.g., AC-PARTICIPATION-1234567890-5678)
- ✅ **Participant Details**: Name, wallet address, email
- ✅ **Event Information**: Name, date, type
- ✅ **Achievement Level**: Participant/Winner/Completion
- ✅ **Verification Hash**: For authenticity checks
- ✅ **Timestamps**: Issue date, claim date, mint date

### Certificate Types:
1. **Participation**: For event attendees
2. **Winner**: For competition winners
3. **Completion**: For course/program completion

### Event Types:
1. **Hackathon**: Coding competitions
2. **Event**: Conferences, workshops, meetups
3. **Course**: Educational programs
4. **Internship**: Internship completion

## User Experience

### For Certificate Recipients:
1. **Notification**: Users see their new certificate
2. **View Certificate**: Go to `/certificates` to view all certificates
3. **Claim NFT**: Users can claim their NFT on Flow blockchain
4. **Verify**: Anyone can verify at `/verify/:certificateNumber`

## Statistics Dashboard

The Certificate Manager shows:
- **Total Users**: All registered users
- **Pending Certificates**: Certificates awaiting NFT minting
- **Selected Users**: Currently selected for bulk generation

## Search & Filter

### Search Capabilities:
- Search by **user name**
- Search by **email**
- Search by **wallet address**
- Real-time filtering as you type

### User Display:
Each user card shows:
- Name (or "Anonymous" if not set)
- Email or wallet address
- User role (admin/user)
- Selection status (checkmark)

## Flow Blockchain Integration

### Testnet Configuration
Current setup uses Flow Testnet:
- **Network**: Flow Testnet
- **Access Node**: https://rest-testnet.onflow.org
- **Contract**: ApnaCodingCertificate
- **Explorer**: https://testnet.flowscan.org

### Contract Address Setup
⚠️ **Important**: Update the contract address in `/src/lib/flowConfig.ts`:
```typescript
contractAddress: "0xYOUR_CONTRACT_ADDRESS_HERE",
```

### Smart Contract Functions
The admin can call:
- `mintNFT()`: Mint new certificate NFT
- Transfer certificates to recipients
- Query NFT metadata on-chain

## Best Practices

### 1. Bulk Generation
- Use bulk generation for events with many participants
- Review selected users before generating
- Use consistent event naming for easy tracking

### 2. Individual Certificates
- Use for special awards and recognitions
- Add detailed achievement information
- Include project and team names for hackathons

### 3. NFT Minting
- Mint NFTs in batches to save gas
- Verify transaction completion on Flow explorer
- Keep transaction hashes for records

### 4. Event Management
- Use descriptive event names
- Set accurate event dates
- Choose appropriate certificate types

## Troubleshooting

### Issue: "Access Denied"
**Solution**: You must be logged in as an admin

### Issue: Can't select users
**Solution**:
- Make sure users list is loaded
- Check if search filters are too restrictive
- Try refreshing the page

### Issue: NFT minting fails
**Solution**:
- Ensure Flow wallet is connected
- Check you have sufficient FLOW tokens for gas
- Verify contract address is correct in config
- Check Flow testnet status

### Issue: "User doesn't have wallet address"
**Solution**: User must connect wallet to receive NFT. Generate certificate anyway - they can claim later.

### Issue: Certificate already exists
**Solution**: System prevents duplicates. Check existing certificates first.

## Security

### Admin-Only Access
- Only authenticated admins can access
- Non-admins are redirected
- Wallet connection required

### Certificate Integrity
- Unique certificate numbers
- Verification hashes prevent tampering
- On-chain NFT verification
- Immutable blockchain records

## Future Enhancements

Planned features:
- CSV bulk upload
- Certificate templates
- Email notifications
- Automatic NFT minting
- Certificate analytics
- Export functionality
- Multi-language support

## Support

For help or issues:
1. Check this guide first
2. Review console logs for errors
3. Contact technical admin
4. Check Flow blockchain status

## Quick Reference

### URLs
- Admin Dashboard: `/admin`
- Certificate Manager: `/admin/certificates`
- Issue Certificate: `/issue-certificate`
- View Certificates: `/certificates`
- Verify Certificate: `/verify/:certificateNumber`

### Keyboard Shortcuts
- `Esc`: Close dialogs
- `Enter`: Submit forms (when in input fields)

### Status Indicators
- **Pending**: Certificate created, NFT not minted
- **Claimed**: User claimed certificate
- **Minted**: NFT successfully minted on Flow
- **Selected**: User selected for bulk generation

---

**Need Help?** Contact the admin team or check the Flow documentation at https://docs.onflow.org
