# 🎓 Quick Start: How to Issue Certificates

## 🚀 3 Easy Ways to Issue Certificates

---

## ✅ **Method 1: Use the Issue Certificate Page** (EASIEST!)

### Step 1: Go to the page
Open your browser and go to:
```
http://localhost:5173/issue-certificate
```

Or if deployed:
```
https://your-site.com/issue-certificate
```

### Step 2: You'll see a form with these fields:
- **User ID** - Get from Convex dashboard (see below)
- **Event Type** - Select: Hackathon/Event/Course/Internship
- **Event Name** - Type the event name
- **Event Date** - Type or leave blank for today
- **Certificate Type** - Select: Participation/Winner/Runner-Up/Completion
- **Achievement Level** - Select: Participant/Winner/Completion
- **Achievement** - Optional (e.g., "1st Place")
- **Skills** - Optional (e.g., "React, Web3, Solidity")

### Step 3: Fill and Submit
Click **"Issue Certificate"** button

### Step 4: Done!
You'll see the certificate number. User can now view it at `/certificates`

---

## ✅ **Method 2: Quick Button (Coming Soon)**

I created a `QuickCertificateIssue` component that shows a button with a popup form.

You can add it anywhere by importing:
```tsx
import { QuickCertificateIssue } from "@/components/QuickCertificateIssue";

// Then use it:
<QuickCertificateIssue
  eventId="hackathon-123"
  eventName="ETHIndia 2025"
  eventDate="January 20-22, 2025"
  eventType="hackathon"
/>
```

This will show a small button that opens a popup to issue certificates quickly!

---

## ✅ **Method 3: Using Convex Dashboard** (For Advanced Users)

### Step 1: Open Convex Dashboard
Go to: https://dashboard.convex.dev

### Step 2: Select Your Project
Click on your Apna Coding project

### Step 3: Go to Functions
- Click "Functions" in the left sidebar
- Find `certificates:issueCertificate`
- Click on it

### Step 4: Run with JSON
Paste this JSON (replace values):
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

### Step 5: Click "Run"
You'll get back the certificate number!

---

## 📝 How to Get User ID (Very Important!)

### Option A: From Convex Dashboard (Easiest)

1. Go to Convex Dashboard: https://dashboard.convex.dev
2. Select your project
3. Click "Data" in the left sidebar
4. Click on "users" table
5. Find the user you want
6. Copy their **`_id`** field
   - It looks like: `j12345abcde` or `k98765zyxwv`

### Option B: User's Profile
If you have the user's wallet address:
1. Go to Convex Data → users table
2. Search for their wallet address
3. Copy the `_id`

### Option C: Programmatically
```javascript
// If you know wallet address
const user = await ctx.db
  .query("users")
  .withIndex("by_wallet", (q) =>
    q.eq("walletAddress", "0x1234...")
  )
  .first();

const userId = user._id; // This is what you need!
```

---

## 📋 Example: Issue a Certificate Step-by-Step

### Scenario: Issue certificate to a hackathon participant

**Step 1: Get User ID**
- Go to Convex → Data → users
- Find user "John Doe"
- Copy _id: `j98765zyxwv`

**Step 2: Go to Issue Page**
- Open: `http://localhost:5173/issue-certificate`

**Step 3: Fill Form**
- User ID: `j98765zyxwv`
- Event Type: Hackathon
- Event Name: ETHIndia 2025
- Event Date: January 20-22, 2025
- Certificate Type: Participation
- Achievement Level: Participant
- Skills: React, Web3, Solidity

**Step 4: Submit**
- Click "Issue Certificate"
- You get: `AC-PARTICIPATION-1736877000-1234`

**Step 5: Verify**
- Go to: `/verify/AC-PARTICIPATION-1736877000-1234`
- You'll see the verified certificate!

**Step 6: User Can View**
- User logs in
- Goes to `/certificates`
- Sees their new certificate!

---

## 🎯 Quick Reference

### All Certificate Pages:
| Page | URL | Who Can Access |
|------|-----|----------------|
| Issue Certificate | `/issue-certificate` | Admin Only |
| View Certificates | `/certificates` | Logged-in Users |
| Verify Certificate | `/verify/:number` | Everyone |
| User Profile | `/profile` | Logged-in Users |

### Certificate Number Format:
```
AC-TYPE-TIMESTAMP-RANDOM

Example:
AC-PARTICIPATION-1736877000-1234
AC-WINNER-1736877100-5678
```

### Required Fields:
- ✅ User ID (from Convex)
- ✅ Event Name
- ✅ Certificate Type
- ✅ Achievement Level

### Optional Fields:
- Event ID (auto-generated)
- Event Date (defaults to today)
- Achievement (e.g., "1st Place")
- Project Name
- Team Name
- Skills

---

## 🔧 Troubleshooting

### "User not found" error
**Fix**: Make sure the User ID is correct
- Go to Convex Dashboard → users table
- Copy the exact `_id` value

### "Access denied" on /issue-certificate
**Fix**: You need admin permissions
- Make sure you're logged in
- Make sure your wallet has admin role

### Certificate not showing on /certificates page
**Fix**:
- Make sure User ID was correct when issuing
- User needs to be logged in with matching wallet

### Can't find the issue page
**Fix**: Make sure you're going to the right URL:
```
http://localhost:5173/issue-certificate
```

---

## ✨ Tips & Best Practices

1. **Keep User IDs Handy**: Save frequently used User IDs in a notepad

2. **Use Descriptive Event Names**:
   - ✅ "ETHIndia 2025"
   - ❌ "Event 1"

3. **Add Skills**: They show up nicely on the certificate!

4. **Test First**: Issue yourself a test certificate first

5. **Bulk Issuance**: For many certificates, use the `bulkIssueCertificates` function in Convex

---

## 🎉 You're Ready!

**Just remember these 3 steps:**
1. Get User ID from Convex
2. Go to `/issue-certificate`
3. Fill form and submit!

**That's it!** 🚀

---

## 📞 Need Help?

- Read: `/HOW_TO_ISSUE_CERTIFICATES.md` (detailed guide)
- Read: `/FLOW_NFT_CERTIFICATE_DEPLOYMENT.md` (deployment guide)
- Check: Convex Dashboard for user IDs

---

**Happy Certificate Issuing!** 🎓✨
