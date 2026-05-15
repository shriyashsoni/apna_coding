# Resend Email Setup Guide

## ✅ What's Implemented

The AI Email Partnership Agent now sends emails **directly** using Resend API. No Gmail redirection, no manual steps - just click "Send Email Directly" and it's sent!

## 🔧 Setup Instructions

### 1. Get Your Resend API Key

1. Go to https://resend.com and sign up (free account available)
2. Verify your email address
3. Go to API Keys section
4. Create a new API key
5. Copy the API key (starts with `re_`)

### 2. Add API Key to Convex Environment

Run this command in your terminal:

```bash
npx convex env set RESEND_API_KEY re_your_api_key_here
```

Replace `re_your_api_key_here` with your actual Resend API key.

### 3. (Optional) Verify Your Domain

By default, emails are sent from `onboarding@resend.dev`. To use your own domain:

1. Go to Resend dashboard → Domains
2. Add your domain (e.g., `apnacoding.com`)
3. Add the DNS records they provide
4. Wait for verification (usually 5-10 minutes)
5. Update the `from` address in `/src/convex/sendEmailResend.ts`:

```typescript
from: "Apna Coding <hello@apnacoding.com>", // Your verified domain
```

## 📧 How It Works

1. **Generate Email**: AI creates 3 templates (Formal, Friendly, Creative)
2. **Click "Send Email Directly"**: Email is sent instantly via Resend
3. **Recipient Receives**: Perfectly formatted HTML email with:
   - Clickable links (blue, underlined)
   - Proper paragraph spacing
   - Professional signature
   - Contact info and social media links
   - All HTML formatting preserved!

## 🆓 Free Tier Limits

Resend free tier includes:
- **100 emails/day**
- **3,000 emails/month**
- All features included
- No credit card required

Perfect for testing and small-scale partnerships!

## 🚀 Paid Plans (if needed)

- **Pro**: $20/month - 50,000 emails/month
- **Business**: Custom pricing - Unlimited emails

## 🔍 Testing

To test if it's working:

1. Generate an email in the AI Email Agent
2. Use your own email as the recipient
3. Click "Send Email Directly"
4. Check your inbox - you should receive a perfectly formatted HTML email!

## ⚠️ Important Notes

1. **Default Sender**: Emails are sent from `onboarding@resend.dev` until you verify your own domain
2. **Spam Folders**: Some email providers may mark emails as spam if sent from `resend.dev`. Verify your domain to fix this!
3. **Rate Limits**: Free tier is 100 emails/day. Upgrade if you need more.

## 🐛 Troubleshooting

### "Failed to send email" error
- Check that RESEND_API_KEY is set correctly in Convex environment
- Verify the API key is valid at resend.com

### Emails going to spam
- Verify your own domain in Resend
- Update the `from` address to use your verified domain

### "Invalid from address" error
- Make sure you're using either `onboarding@resend.dev` or a verified domain

## ✅ Ready to Use!

Once you've added the RESEND_API_KEY to Convex environment, you're all set! Just click "Send Email Directly" and the recipient will receive a perfectly formatted HTML email instantly! 🚀
