# 🎓 How to Issue Certificates - Quick Guide

## ✅ System Status
- ✅ Smart Contract Deployed on Flow Testnet
- ✅ Backend Certificate System Ready
- ✅ Frontend Pages Created
- ✅ All TypeScript Checks Passed

---

## 🚀 Quick Start: Issue Your First Certificate

### Method 1: Use the Issue Certificate Page (EASIEST)

1. **Go to the page**:
   ```
   http://localhost:5173/issue-certificate
   ```
   (Or `/issue-certificate` on your deployed site)

2. **Fill in the form**:
   - **User ID**: Get from Convex dashboard (users table → copy `_id`)
   - **Event Type**: Choose hackathon/event/course/internship
   - **Event Name**: e.g., "ETHIndia 2025"
   - **Event Date**: e.g., "January 20-22, 2025"
   - **Certificate Type**: Participation/Winner/Runner-Up/Completion
   - **Achievement Level**: Participant/Winner/Completion
   - (Optional) Achievement, Project Name, Team Name, Skills

3. **Click "Issue Certificate"**

4. **Done!** You'll get a certificate number like:
   ```
   AC-PARTICIPATION-1736877000-1234
   ```

5. **Verify it**: Click the "Verify" button or go to:
   ```
   /verify/AC-PARTICIPATION-1736877000-1234
   ```

---

### Method 2: Use Convex Dashboard (ADVANCED)

1. **Open Convex Dashboard**: https://dashboard.convex.dev

2. **Go to Functions** → Find `certificates:issueCertificate`

3. **Run the mutation** with this JSON:
   ```json
   {
     "userId": "j12345abcde",
     "eventId": "ethindia-2025",
     "eventType": "hackathon",
     "eventName": "ETHIndia 2025",
     "eventDate": "January 20-22, 2025",
     "certificateType": "participation",
     "achievementLevel": "participant",
     "skills": ["React", "Web3", "Solidity"]
   }
   ```

4. **Copy the returned certificate number**

---

## 📋 How to Get User ID

There are 2 ways:

### Option 1: From Convex Dashboard
1. Go to Convex Dashboard
2. Click "Data" → "users" table
3. Find the user
4. Copy the `_id` field (looks like `j12345abcde`)

### Option 2: From Your Database
If you have a user's wallet address or email:
```javascript
// Query by wallet
const user = await ctx.db
  .query("users")
  .withIndex("by_wallet", (q) => q.eq("walletAddress", "0x1234..."))
  .first();

console.log(user._id); // This is the user ID
```

---

## 🎨 Certificate Types & Levels

### Certificate Types:
- **participation** - For all participants
- **winner** - For 1st, 2nd, 3rd place
- **runner-up** - For runners-up
- **completion** - For course/internship completion
- **special-mention** - For special recognition

### Achievement Levels:
- **participant** - General participation
- **winner** - Won something
- **completion** - Completed something

### Event Types:
- **hackathon** - Hackathons
- **event** - Events/Conferences
- **course** - Online Courses
- **internship** - Internships

---

## 📍 All Certificate Pages

### For Users:
- **View Certificates**: `/certificates`
- **User Profile**: `/profile` (shows certificates)

### For Admins:
- **Issue Certificate**: `/issue-certificate` (NEW!)
- **Admin Dashboard**: `/admin`

### For Everyone:
- **Verify Certificate**: `/verify/:certificateNumber`
  - Example: `/verify/AC-PARTICIPATION-1736877000-1234`

---

## 🔍 How to Verify Certificates

### Anyone can verify a certificate:

1. **Get certificate number** from the recipient

2. **Go to verification page**:
   ```
   /verify/AC-PARTICIPATION-1736877000-1234
   ```

3. **See verification result**:
   - ✅ Valid certificate with all details
   - ❌ Invalid/not found certificate

---

## 💡 Example Certificate Issuance

### Example 1: Hackathon Participant
```json
{
  "userId": "j98765zyxwv",
  "eventId": "ethindia-2025",
  "eventType": "hackathon",
  "eventName": "ETHIndia 2025",
  "eventDate": "January 20-22, 2025",
  "certificateType": "participation",
  "achievementLevel": "participant",
  "skills": ["Solidity", "React", "Web3"]
}
```

### Example 2: Hackathon Winner
```json
{
  "userId": "j98765zyxwv",
  "eventId": "ethindia-2025",
  "eventType": "hackathon",
  "eventName": "ETHIndia 2025",
  "eventDate": "January 20-22, 2025",
  "certificateType": "winner",
  "achievementLevel": "winner",
  "achievement": "1st Place",
  "projectName": "DeFi Protocol",
  "teamName": "Team Alpha",
  "skills": ["Solidity", "React", "Web3"]
}
```

### Example 3: Course Completion
```json
{
  "userId": "j98765zyxwv",
  "eventId": "web3-development-101",
  "eventType": "course",
  "eventName": "Web3 Development 101",
  "eventDate": "December 2024",
  "certificateType": "completion",
  "achievementLevel": "completion",
  "skills": ["JavaScript", "Solidity", "Web3.js"]
}
```

---

## 🔧 Bulk Certificate Issuance

To issue multiple certificates at once:

```javascript
// Use Convex dashboard or API
await convex.mutation(api.certificates.bulkIssueCertificates, {
  eventId: "ethindia-2025",
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
      certificateType: "winner",
      achievementLevel: "winner",
      achievement: "2nd Place",
      projectName: "NFT Marketplace",
    },
    {
      userId: "user_id_3",
      certificateType: "participation",
      achievementLevel: "participant",
    },
    // ... add more
  ],
});
```

---

## ⚠️ Important Notes

1. **User ID is Required**: Always get the correct user ID from Convex
2. **Certificate Numbers are Unique**: Format is `AC-TYPE-TIMESTAMP-RANDOM`
3. **Verification Hash**: Automatically generated for security
4. **NFT Minting**: Comes later (Phase 2)
5. **Admin Access**: Only admins can issue certificates

---

## 🎯 Next Steps (What You Need to Do)

### Step 1: Update Flow Contract Address

You deployed the contract but didn't share the address yet!

Open: `/src/lib/flowConfig.ts`

Update line 6:
```typescript
contractAddress: "0xYOUR_ACTUAL_CONTRACT_ADDRESS", // ← Put your address here!
```

### Step 2: Test Certificate Issuance

1. Go to `/issue-certificate`
2. Get a user ID from Convex dashboard
3. Issue a test certificate
4. Verify it at `/verify/...`

### Step 3: Check User's Certificate Page

1. Go to `/certificates` (logged in as user)
2. Should see the certificate you issued
3. User can download/share it

---

## 📞 Troubleshooting

### "User not found" error
- Make sure the user ID is correct
- Check Convex dashboard → users table

### "Please fill in all required fields"
- User ID and Event Name are required
- Other fields are optional

### Certificate not showing on `/certificates` page
- Make sure you're logged in as the correct user
- Check that the userId matches

### Can't access `/issue-certificate`
- Only admins can access this page
- Make sure you're an admin in Convex

---

## ✅ Quick Checklist

- [x] Smart contract deployed on Flow testnet
- [ ] Contract address updated in `flowConfig.ts` ← **YOU NEED TO DO THIS!**
- [x] Certificate issuance page created (`/issue-certificate`)
- [x] Certificate verification page created (`/verify/:number`)
- [x] User certificate viewing page (`/certificates`)
- [x] All TypeScript checks passed
- [ ] Test certificate issued ← **DO THIS NEXT!**

---

**Ready to issue certificates!** 🎉

Just update the contract address and start issuing! 🚀
