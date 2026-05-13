#!/bin/bash

# Script to create downloadable platform package
# This creates a clean ZIP file of the entire platform

echo "🎁 Creating Apna Coding Platform Download Package..."

# Set variables
PACKAGE_NAME="apna-coding-platform"
OUTPUT_DIR="./download-packages"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ZIP_NAME="${PACKAGE_NAME}_${TIMESTAMP}.zip"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Create temporary directory for package
TEMP_DIR=$(mktemp -d)
PACKAGE_DIR="$TEMP_DIR/$PACKAGE_NAME"
mkdir -p "$PACKAGE_DIR"

echo "📦 Copying files to package directory..."

# Copy essential files and directories
cp -r src "$PACKAGE_DIR/"
cp -r public "$PACKAGE_DIR/" 2>/dev/null || true
cp -r contracts "$PACKAGE_DIR/"

# Copy configuration files
cp package.json "$PACKAGE_DIR/"
cp package-lock.json "$PACKAGE_DIR/" 2>/dev/null || true
cp pnpm-lock.yaml "$PACKAGE_DIR/" 2>/dev/null || true
cp tsconfig.json "$PACKAGE_DIR/"
cp tsconfig.node.json "$PACKAGE_DIR/" 2>/dev/null || true
cp vite.config.ts "$PACKAGE_DIR/"
cp tailwind.config.ts "$PACKAGE_DIR/"
cp postcss.config.js "$PACKAGE_DIR/" 2>/dev/null || true
cp index.html "$PACKAGE_DIR/"

# Copy environment example
cp .env.example "$PACKAGE_DIR/" 2>/dev/null || echo "VITE_CONVEX_URL=your_convex_url_here" > "$PACKAGE_DIR/.env.example"

# Copy documentation
cp README.md "$PACKAGE_DIR/" 2>/dev/null || true
cp SMART_CONTRACT_DEPLOYMENT.md "$PACKAGE_DIR/" 2>/dev/null || true

# Create comprehensive README for the package
cat > "$PACKAGE_DIR/PACKAGE_README.md" << 'READMEEOF'
# Apna Coding Platform - Complete Package

Welcome to the Apna Coding platform source code! This package contains everything you need to run your own Web3 coding community platform.

## 📦 Package Contents

- **src/** - Complete React TypeScript frontend
- **contracts/** - Solidity smart contracts with deployment scripts
- **public/** - Static assets
- **Configuration files** - All necessary config files
- **.env.example** - Environment variables template

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- npm or pnpm
- Convex account (free): https://convex.dev

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Set Up Environment Variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Convex URL:
```
VITE_CONVEX_URL=https://your-project.convex.cloud
```

3. **Set Up Convex Backend**
```bash
npx convex dev
```

This will:
- Create a Convex project (if needed)
- Deploy your backend functions
- Set up the database schema

4. **Start Development Server**
```bash
npm run dev
```

Visit http://localhost:5173

## 🔧 Configuration

### Convex Setup

1. Sign up at https://convex.dev
2. Create a new project
3. Copy your deployment URL to `.env`
4. Run `npx convex dev` to deploy backend

### Smart Contracts (Optional)

To deploy smart contracts:

```bash
cd contracts
npm install
cp .env.example .env
# Add your private key to .env
npm run deploy:sepolia  # Testnet
npm run deploy:polygon  # Mainnet
```

See `contracts/README.md` for detailed instructions.

## 📚 Features

### Frontend
- 50+ pages and components
- Responsive mobile design
- Dark mode support
- Admin dashboard
- Authentication (Email + Wallet)

### Backend
- Convex serverless backend
- Real-time data synchronization
- File storage
- Authentication
- Admin functions

### Smart Contracts
- Product launch on-chain
- Staking system
- Multi-network support

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Convex
- **Web3:** Wagmi, RainbowKit
- **Smart Contracts:** Solidity, Hardhat
- **Email:** Resend
- **AI:** vly-integrations (GPT-4)

## 📖 Documentation

- **SMART_CONTRACT_DEPLOYMENT.md** - Smart contract deployment guide
- **contracts/README.md** - Contract documentation
- **src/convex/README.md** - Backend documentation

## 🔐 Environment Variables

Required environment variables:

```bash
# Convex
VITE_CONVEX_URL=your_convex_url

# Optional - for production
RESEND_API_KEY=your_resend_key
VLY_INTEGRATION_KEY=your_vly_key
```

## 🚢 Deployment

### Frontend Deployment

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Backend Deployment

Convex automatically deploys when you run:
```bash
npx convex deploy
```

## 📞 Support

Need help? Contact us:

- 📧 Email: apnacoding.tech@gmail.com
- 🌐 Website: https://apnacoding.site
- 💬 Telegram: https://t.me/apnacodingtech
- 🐦 Twitter: https://x.com/apna_coding

## 📄 License

MIT License - Free to use and modify

## 🙏 Credits

Built with ❤️ by Apna Coding
https://apnacoding.site

---

**Happy Coding! 🚀**
READMEEOF

# Create .gitignore
cat > "$PACKAGE_DIR/.gitignore" << 'GITIGNOREEOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Convex
.convex/

# Smart Contracts
contracts/node_modules/
contracts/artifacts/
contracts/cache/
contracts/deployments/
contracts/.env

# Misc
.turbo
.next/
out/
.vercel
GITIGNOREEOF

echo "🗜️  Creating ZIP archive..."

# Create ZIP file
cd "$TEMP_DIR"
zip -r "$ZIP_NAME" "$PACKAGE_NAME" -x "*/node_modules/*" "*/dist/*" "*/.git/*" "*/.convex/*" "*/cache/*" "*/artifacts/*" > /dev/null 2>&1

# Move ZIP to output directory
mv "$ZIP_NAME" "$OUTPUT_DIR/"

# Cleanup
rm -rf "$TEMP_DIR"

# Get file size
FILE_SIZE=$(du -h "$OUTPUT_DIR/$ZIP_NAME" | cut -f1)

echo "✅ Package created successfully!"
echo ""
echo "📦 Package: $ZIP_NAME"
echo "📍 Location: $OUTPUT_DIR/$ZIP_NAME"
echo "📏 Size: $FILE_SIZE"
echo ""
echo "🎉 Download package is ready!"
