# AI Job Scraper Guide

## Overview
The AI Job Scraper is a powerful tool that allows admins to automatically generate or scrape job listings and post them to the Apna Coding platform.

## Features

### 1. **AI Generate Mode** 🤖
- AI automatically creates 8-10 realistic Web3 and blockchain job listings
- Includes jobs from top companies like:
  - Uniswap, Aave, Polygon, Chainlink
  - Compound, MakerDAO, Optimism, Arbitrum
  - zkSync, Lido, Curve, Balancer, and more
- Generates complete job details:
  - Title, company, location
  - Detailed description (200-300 words)
  - Specific requirements
  - Salary ranges
  - Application links

### 2. **URL Scrape Mode** 🌐
- Scrape jobs from any job board or careers page
- AI analyzes the webpage HTML
- Extracts all job listings automatically
- Parses job details intelligently
- Supports any job board URL

## How to Use

### Step 1: Access the AI Job Scraper
1. Navigate to the **Jobs** page (`/jobs`)
2. Look for the **"AI Job Scraper"** button (purple, with sparkles icon)
3. **Note:** Only admins can use this feature

### Step 2: Choose Your Mode

#### Option A: AI Generate
1. Click the "AI Job Scraper" button
2. Select **"AI Generate"** mode
3. Click **"Start Scraping"**
4. Wait for AI to generate jobs (takes 10-20 seconds)
5. Jobs will automatically appear in the job list

#### Option B: Scrape from URL
1. Click the "AI Job Scraper" button
2. Select **"Scrape URL"** mode
3. Enter the job board URL (e.g., `https://crypto-jobs.com/jobs`)
4. Click **"Start Scraping"**
5. AI will analyze the page and extract jobs
6. Jobs will automatically appear in the job list

### Step 3: View Results
- Success notification shows:
  - Number of jobs created
  - Number of duplicates skipped
- Jobs appear immediately in the list below
- Real-time updates (thanks to Convex)

## Examples

### Example 1: Generate Web3 Jobs
```
Mode: AI Generate
Result: 8-10 Web3 jobs created
Companies: Uniswap, Aave, Polygon, etc.
```

### Example 2: Scrape from URL
```
Mode: Scrape URL
URL: https://web3.career/blockchain-jobs
Result: All jobs from that page extracted and posted
```

## Features

### Smart Duplicate Detection
- Automatically skips duplicate jobs
- Checks by title + company combination
- Prevents duplicate listings

### Comprehensive Job Data
Each job includes:
- ✅ Title
- ✅ Company name
- ✅ Location
- ✅ Job type (Remote/Hybrid/Onsite)
- ✅ Employment type (Full-time/Part-time/Contract/Internship)
- ✅ Salary (if available)
- ✅ Detailed description
- ✅ Requirements list
- ✅ Application URL

### Admin-Only Access
- Only authenticated admins can use the scraper
- Non-admins see disabled button
- Error message if non-admin tries to use it

## Technical Details

### Backend Functions

#### `scrapeWeb3Jobs` (AI Generate)
- Uses GPT-4o to generate realistic job listings
- Creates 8-10 jobs per run
- Focuses on Web3/blockchain companies

#### `scrapeJobsFromUrl` (URL Scrape)
- Fetches webpage content
- Uses GPT-4o to extract job data from HTML
- Handles various job board formats
- Returns structured job data

### Frontend Components
- Dialog with mode selection
- URL input for scraping
- Loading states and animations
- Real-time feedback with toast notifications

## Troubleshooting

### Issue: Button is Disabled
**Solution:** You must be logged in as an admin

### Issue: "No jobs found"
**Solution:**
- For URL mode: Try a different URL with actual job listings
- Check that the URL is a valid job board page

### Issue: Scraping takes too long
**Solution:**
- AI processing takes 10-30 seconds
- Wait for completion notification
- Check console for progress logs

### Issue: Duplicate jobs
**Solution:** System automatically skips duplicates - this is expected behavior

## Best Practices

1. **Use AI Generate** for quick testing or when you need sample Web3 jobs
2. **Use URL Scrape** when you want real jobs from specific companies
3. **Run periodically** to keep job listings fresh
4. **Check results** after scraping to ensure quality
5. **Try different URLs** to get diverse job listings

## Supported Job Boards

The URL scraper works with most job board formats:
- ✅ CryptoJobs.com
- ✅ Web3.career
- ✅ RemoteOK.com
- ✅ Company career pages
- ✅ AngelList jobs
- ✅ LinkedIn job listings
- ✅ Indeed job pages

## Future Enhancements

Planned features:
- Schedule automatic scraping
- Filter by job type/location
- Custom job templates
- Bulk edit scraped jobs
- Export job data

---

**Need Help?** Contact the admin team or check the documentation at `/docs`
