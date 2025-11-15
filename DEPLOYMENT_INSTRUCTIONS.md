# Deployment Instructions for Vercel

## 🎯 Quick Setup Guide

This document is for the team member deploying MatchFoundry to Vercel.

---

## Step 1: Database Setup (5 minutes)

### Option A: Neon (Recommended - Free)

1. Go to https://neon.tech
2. Sign up / Login
3. Click "Create Project"
4. Name: `matchfoundry`
5. Region: Choose closest to users
6. Copy the connection string (looks like):
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/matchfoundry?sslmode=require
   ```

### Option B: Supabase (Alternative - Free)

1. Go to https://supabase.com
2. Create new project
3. Wait for database provisioning (~2 mins)
4. Go to Settings → Database
5. Copy "Connection string" (URI format)

### Option C: Railway (Alternative)

1. Go to https://railway.app
2. New Project → Provision PostgreSQL
3. Copy DATABASE_URL from Variables tab

---

## Step 2: Deploy to Vercel (5 minutes)

### 2.1 Connect Repository

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import the GitHub repository
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: `./` (default)

### 2.2 Configure Environment Variables

**CRITICAL**: Add these in Vercel dashboard before deploying:

Click "Environment Variables" and add:

#### Required Variables:

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `DATABASE_URL` | `postgresql://...` | From Neon/Supabase (Step 1) |
| `OPENAI_API_KEY` | `sk-proj-...` | Get from repo owner or https://platform.openai.com/api-keys |
| `AUTH_SECRET` | `generate-new-one` | Run: `openssl rand -base64 32` |
| `AUTH_URL` | `https://your-app.vercel.app` | Leave empty for now, update after deployment |

#### How to Add Variables in Vercel:

```
1. In deployment settings, find "Environment Variables"
2. For each variable:
   - Name: DATABASE_URL
   - Value: [paste the value]
   - Environment: Production, Preview, Development (select all)
   - Click "Add"
3. Repeat for all 4 variables
```

### 2.3 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Should see "Congratulations" message
4. Copy the deployment URL (e.g., `https://founder-match-xyz.vercel.app`)

---

## Step 3: Run Database Migrations (5 minutes)

You need to apply database schema to your production database.

### Option A: Via Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link to project
vercel link

# 4. Pull environment variables
vercel env pull .env.production

# 5. Run migration
npx prisma migrate deploy

# 6. Seed demo users
npx prisma db seed
```

### Option B: Locally with Production Database URL

```bash
# 1. Set production database URL temporarily
export DATABASE_URL="postgresql://your-neon-or-supabase-url"

# 2. Run migration
npx prisma migrate deploy

# 3. Seed demo users
npx prisma db seed

# 4. Unset variable
unset DATABASE_URL
```

---

## Step 4: Update AUTH_URL (2 minutes)

1. Go back to Vercel dashboard
2. Settings → Environment Variables
3. Find `AUTH_URL`
4. Edit value to: `https://your-actual-app.vercel.app`
5. Click "Save"
6. Redeploy (Deployments → ... → Redeploy)

---

## Step 5: Test Deployment (5 minutes)

### 5.1 Test Authentication

1. Open `https://your-app.vercel.app`
2. Should redirect to `/login`
3. Try registering a new user
4. Should auto-login and redirect to main app

### 5.2 Test Demo Accounts

Login with these accounts (password: `password123` for all):
- alice@example.com (Founder)
- bob@example.com (Expert)
- carla@example.com (Admin)

### 5.3 Test Full Flow

**As Alice (Founder):**
1. Go to "Check-in" tab
2. Enter text: "I need help with pricing strategy"
3. Click "Extract with AI"
4. Save check-in

**As Bob (Expert):**
1. Login as bob@example.com
2. Go to "Check-in" tab
3. Enter text: "I just completed my pricing research"
4. Save check-in

**Back as Alice:**
1. Go to "Matches" tab
2. Click "Refresh AI matches"
3. Should see Bob as a match
4. Click "Request 30-min coffee chat"

**As Bob:**
1. Go to "Chats" tab
2. See Alice's request in "Pending"
3. Click "Propose 3 slots"
4. DatePicker modal opens
5. Adjust times if needed
6. Click "Propose Slots"

**Back as Alice:**
1. Go to "Chats" tab
2. See Bob's proposed times in "Choose a time"
3. Click "Select" on preferred time
4. Chat moves to "Upcoming"
5. See "🎥 Join Jitsi Meeting" button

**Test Video Call:**
1. Click "Join Jitsi Meeting" button
2. Opens Jitsi Meet in new tab
3. Should work (no errors)
4. Open same link in another browser/device
5. Both should join the same room

---

## Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Solution: Add all 4 variables in Vercel dashboard
- Make sure they're selected for "Production" environment

**Error: Database connection failed**
- Solution: Check DATABASE_URL format
- For Neon: Must include `?sslmode=require`
- For Supabase: Use "Connection string" not "Connection pooling"

### Login Doesn't Work

**Error: AUTH_SECRET not found**
- Solution: Generate new secret: `openssl rand -base64 32`
- Add to Vercel environment variables
- Redeploy

**Error: Redirect loop**
- Solution: Update AUTH_URL to match your Vercel URL
- Format: `https://your-app.vercel.app` (no trailing slash)

### Database Empty

**Error: No demo users**
- Solution: Run seed command:
  ```bash
  DATABASE_URL="your-production-url" npx prisma db seed
  ```

### Jitsi Doesn't Work

**Error: Meeting link doesn't open**
- Solution: This should work automatically
- Jitsi Meet is public, no API key needed
- Check browser isn't blocking pop-ups

### OpenAI Extraction Fails

**Error: Invalid API key**
- Solution: Verify OPENAI_API_KEY in Vercel
- Get fresh key from https://platform.openai.com/api-keys
- Format: `sk-proj-...` (not `sk-...` for older keys)

---

## Environment Variables Reference

### Where to Find Each Variable

#### 1. DATABASE_URL
```
Source: Neon / Supabase / Railway
Format: postgresql://username:password@host:5432/database?sslmode=require
Example: postgresql://user:pass@ep-cool-name-123.us-east-2.aws.neon.tech/matchfoundry?sslmode=require

How to get:
- Neon: Dashboard → Connection String → Copy "Connection string"
- Supabase: Settings → Database → "Connection string" (URI mode)
- Railway: Project → PostgreSQL → Variables → DATABASE_URL
```

#### 2. OPENAI_API_KEY
```
Source: OpenAI Platform
Format: sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (48+ chars)

How to get:
1. Go to https://platform.openai.com/api-keys
2. Login with OpenAI account
3. Click "Create new secret key"
4. Name: "MatchFoundry Production"
5. Copy immediately (won't be shown again)

Cost: ~$0.01 per 100 check-ins (GPT-4o-mini is cheap)
```

#### 3. AUTH_SECRET
```
Source: Generate locally
Format: Random 32-byte base64 string (44 chars)

How to generate:
# macOS / Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

Example: +PM8F+p6qy8HqK7bVwhB8EAS+Jots2TwgcspGg23h/k=

⚠️ IMPORTANT: Generate a NEW secret for production (don't reuse from .env)
```

#### 4. AUTH_URL
```
Source: Your Vercel deployment URL
Format: https://your-app-name.vercel.app (no trailing slash)

How to get:
1. Deploy to Vercel first (leave this empty initially)
2. Copy the deployment URL from Vercel dashboard
3. Update AUTH_URL environment variable
4. Redeploy

Example: https://matchfoundry.vercel.app
```

---

## Security Notes

### ✅ Safe to Commit (Already in Git)
- `.env.example` - Template without secrets ✅
- All source code ✅
- `prisma/schema.prisma` - Database schema ✅
- Migration files ✅

### ❌ NEVER Commit These Files
- `.env` - Contains actual secrets ❌
- `.env.local` - Local secrets ❌
- `.env.production` - Production secrets ❌
- `node_modules/` - Already in .gitignore ✅

### 🔒 Private Repository = Safe
Since the repository is **private**:
- Only collaborators can access code ✅
- GitHub encrypts private repos ✅
- Still, **DO NOT commit .env files** as a best practice ❌

### 🔑 Sharing API Keys with Colleague

**Option 1: Secure Messaging (Recommended)**
- Use encrypted messaging: Signal, WhatsApp, Telegram
- Send each key in separate messages
- Delete messages after keys are added to Vercel
- Example:
  ```
  Message 1: "DATABASE_URL: postgresql://..."
  Message 2: "OPENAI_API_KEY: sk-proj-..."
  Message 3: "AUTH_SECRET: [generate new one]"
  ```

**Option 2: Password Manager**
- Use shared vault: 1Password, Bitwarden, LastPass
- Create secure note with all variables
- Share vault with colleague
- Revoke access after deployment

**Option 3: Vercel Team (Best for Organizations)**
- Invite colleague to Vercel team
- They can see environment variables in dashboard
- No need to share keys separately
- Enterprise feature (may require paid plan)

---

## Post-Deployment Checklist

After successful deployment:

- [ ] All 4 environment variables added to Vercel
- [ ] Database migrations applied (`prisma migrate deploy`)
- [ ] Demo users seeded (`prisma db seed`)
- [ ] AUTH_URL updated with actual Vercel URL
- [ ] Application loads without errors
- [ ] Can register new user
- [ ] Can login with demo accounts
- [ ] AI extraction works (check-in flow)
- [ ] Matching generates results
- [ ] DatePicker modal opens correctly
- [ ] Coffee chat scheduling flow works end-to-end
- [ ] Jitsi meeting button appears after scheduling
- [ ] Jitsi video call opens and works
- [ ] Admin dashboard shows metrics

---

## Custom Domain (Optional)

If you want a custom domain:

1. **Buy domain** (Namecheap, Google Domains, etc.)
2. **In Vercel:**
   - Settings → Domains
   - Add domain: `matchfoundry.com`
   - Follow DNS instructions
3. **Update AUTH_URL:**
   - Change to `https://matchfoundry.com`
   - Redeploy

---

## Monitoring & Logs

### View Application Logs
1. Vercel Dashboard → Your Project
2. Click on latest deployment
3. Go to "Logs" tab
4. Filter by:
   - Errors (red)
   - Functions (API routes)
   - Static (pages)

### Common Log Messages
```
✅ "Seeded users with password: password123" - Database seeded successfully
✅ "Proposed 3 time slots" - Scheduling working
✅ "Generated Jitsi Meet link" - Video chat working
❌ "Failed to connect to database" - Check DATABASE_URL
❌ "Invalid API key" - Check OPENAI_API_KEY
❌ "Auth secret not found" - Check AUTH_SECRET
```

---

## Cost Estimates

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month (plenty for demo)
- **Neon**: 0.5GB storage, 100 hours compute/month (sufficient)
- **OpenAI**: Pay-as-you-go (~$0.01 per 100 check-ins)
- **Jitsi**: Free (hosted by Jitsi, unlimited meetings)

### Expected Costs for Hackathon Demo
- Month 1: **$0-5** (mostly OpenAI, very light usage)
- If you get 1000 users: **$10-20/month**

---

## Support

If you encounter issues:

1. **Check Vercel Logs** - Most errors visible there
2. **Verify Environment Variables** - Most common issue
3. **Test Database Connection** - Use Prisma Studio
   ```bash
   DATABASE_URL="production-url" npx prisma studio
   ```
4. **Contact Repo Owner** - For API key issues

---

## Quick Reference

**Dashboard URLs:**
- Vercel: https://vercel.com/dashboard
- Neon: https://console.neon.tech
- Supabase: https://app.supabase.com
- OpenAI: https://platform.openai.com

**Useful Commands:**
```bash
# Deploy from CLI
vercel --prod

# View logs
vercel logs

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Generate new auth secret
openssl rand -base64 32
```

---

**Estimated Total Time: 20-30 minutes**
**Difficulty: Easy** ✅

Good luck with the deployment! 🚀
