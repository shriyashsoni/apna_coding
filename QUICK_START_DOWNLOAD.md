# Quick Start: Download Full Codebase Feature

## For You (The Website Owner)

### How to Use:
1. Open your website
2. Look at the top navbar - you'll see a **"Download Full Codebase"** button
3. Click it
4. Wait a few seconds (you'll see progress messages)
5. A file called `project-vercel-ready.zip` will download
6. Extract it and deploy to Vercel immediately!

### What You Get:
- ✅ Complete project (all files)
- ✅ Real `.env.local` with actual API keys
- ✅ Ready to deploy immediately
- ✅ No configuration needed

### Deploy to Vercel:
```bash
# Extract the ZIP
unzip project-vercel-ready.zip
cd project-vercel-ready

# Install dependencies
pnpm install

# Test locally (optional)
pnpm run dev

# Deploy to Vercel
vercel --prod
```

That's it! Your complete website will be live on Vercel.

## Button Location

### Desktop:
The button is in the main navigation bar at the top of the page, between "News" and your profile/wallet connect buttons.

### Mobile:
Open the hamburger menu (☰) and you'll see the button in the dropdown menu.

## What Happens When You Click:

1. **"Generating complete codebase ZIP..."** - Starting
2. **"Reading all project files from server..."** - Scanning files
3. **"Found X files. Creating ZIP archive..."** - Creating ZIP
4. **"All files added! Environment variables included with real values."** - Files added
5. **"Compressing and generating ZIP file..."** - Compressing
6. **"Complete codebase downloaded! (X files, Y MB)"** - Done! ✅

## Important Notes

### ⚠️ Security Warning:
The ZIP file contains **REAL API KEYS** from your `.env.local` file:
- CONVEX_DEPLOYMENT
- VITE_CONVEX_URL
- VITE_CONVEX_SITE_URL

**Keep this ZIP file secure!** Don't share it publicly or commit it to GitHub.

### What's NOT Included (by design):
- ❌ `node_modules/` - Too large, you'll reinstall with `pnpm install`
- ❌ `.git/` - Version control history
- ❌ `dist/` - Build artifacts
- ❌ `pnpm-lock.yaml` - Can be regenerated

### What IS Included:
- ✅ All source code (frontend + backend)
- ✅ All configuration files
- ✅ All assets and images
- ✅ Smart contracts
- ✅ `.env.local` with real values
- ✅ `VERCEL_DEPLOYMENT_README.md` (deployment guide)
- ✅ `package.json` (all dependencies)

## Troubleshooting

**Q: Button doesn't work?**
A: Make sure your Convex backend is running. The button needs the server to read files.

**Q: Download is slow?**
A: It's reading your entire project from the server. For large projects, this can take 10-30 seconds.

**Q: Can I customize what's included?**
A: Yes! Edit `src/convex/downloadCodebase.ts` and modify the `excludePatterns` array.

**Q: Can I share this ZIP with my team?**
A: Yes, but be careful - it contains real API keys. Your team will be able to access your Convex database.

## Support

For technical details, see:
- `DOWNLOAD_CODEBASE_FEATURE.md` - Implementation details
- `DOWNLOAD_FEATURE_SUMMARY.md` - Comprehensive overview

---

**Ready to try it?** Open your website and click the "Download Full Codebase" button! 🚀
