# ConveyPro - Production Deployment Guide

**Last Updated:** 2024-11-16/17
**Target Platform:** Vercel
**Database:** Supabase (Production)

---

## 📋 Pre-Deployment Checklist

### ✅ Code Readiness
- [x] Phase 2 features complete
- [x] Build passes locally (`npm run build`)
- [x] All TypeScript errors resolved
- [x] Database migrations prepared
- [x] Demo data seeder tested (£81,420 in quotes)

### ⚠️ What You Need
- Vercel account (free tier works)
- Production Supabase project
- SendGrid API key
- GitHub repository access
- ~1-2 hours for full deployment

---

## 🗄️ Database Setup (Supabase)

### Step 1: Create Production Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Configure:
   - **Name:** ConveyPro Production
   - **Database Password:** Save securely!
   - **Region:** Choose closest to your users (EU for UK)
4. Wait 2-3 minutes for project creation

### Step 2: Run Database Migrations

#### Migration 1: Clients Table
1. Open Supabase → SQL Editor → New Query
2. Copy contents from `supabase/migrations/20241116000000_create_clients_table.sql`
3. Paste and click "Run"
4. **Expected output:** `Success. No rows returned`

**What this creates:**
- `clients` table with full profile fields
- Life stage and client type classification
- RLS policies for multi-tenant security
- Foreign key from `quotes` → `clients`
- Indexed for performance

#### Migration 2: Firm Logos Storage Bucket

**Option A: Via Supabase UI (Recommended)**
1. Go to Supabase → Storage → Create bucket
2. Configure:
   - **Bucket name:** `firm-logos`
   - **Public bucket:** ✅ Checked
   - **File size limit:** 5 MB
   - **Allowed MIME types:** `image/jpeg,image/jpg,image/png,image/webp,image/svg+xml`
3. Click "Create bucket"

**Option B: Via SQL (Advanced)**
1. Open Supabase → SQL Editor → New Query
2. Copy contents from `supabase/migrations/20241116000001_create_firm_logos_bucket.sql`
3. Paste and click "Run"
4. **Note:** May fail due to permissions - use Option A if error occurs

### Step 3: Get Supabase Credentials

1. Go to Supabase → Settings → API
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep secret!

**Save these securely** - you'll need them for Vercel!

---

## 🚀 Vercel Deployment

### Step 1: Connect GitHub Repository

1. Go to https://vercel.com (sign up/login)
2. Click "Add New Project"
3. Import your GitHub repository: `Trek-mad/ConveyPro`
4. Select branch: `claude/phase-2-form-builder-0151jSm8PvAf8MqE51ryMAwW`

### Step 2: Configure Build Settings

Vercel should auto-detect Next.js. Verify:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Step 3: Add Environment Variables

Click "Environment Variables" and add:

#### Supabase (from Step 3 above)
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (⚠️ Keep secret!)
```

#### SendGrid (your existing keys)
```
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=your-email@domain.com
```

#### Application URL (update after deployment)
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Note:** You can add a placeholder URL first, then update it after Vercel assigns your domain.

### Step 4: Deploy!

1. Click "Deploy"
2. Wait 2-5 minutes for build
3. **Expected:** ✅ Build successful
4. Click "Visit" to see your deployed app

### Step 5: Update App URL

1. Copy your Vercel URL (e.g., `conveypro.vercel.app`)
2. Go back to Vercel → Settings → Environment Variables
3. Update `NEXT_PUBLIC_APP_URL` with your actual URL
4. Click "Redeploy" to apply the change

---

## ✅ Post-Deployment Testing

### Critical Path Testing

Visit your Vercel URL and test:

#### 1. Authentication Flow
- [ ] Visit `/signup` - Can create account?
- [ ] Visit `/login` - Can log in?
- [ ] Redirects to `/dashboard` after login?

#### 2. Quote Management
- [ ] Click "New Quote" - Form loads?
- [ ] Fill in details (property value, LBTT calculates?)
- [ ] Save quote - Appears in list?
- [ ] Click quote - Detail page loads?
- [ ] Send email - Receives PDF attachment?

#### 3. Analytics Dashboard
- [ ] Visit `/analytics` - Page loads?
- [ ] See KPI cards (revenue, conversion rate)?
- [ ] Charts render properly (Recharts)?
- [ ] Cross-sell performance table displays?

#### 4. Client Management
- [ ] Visit `/clients` - Page loads?
- [ ] Stats cards show data?
- [ ] Click a client - Detail page loads?
- [ ] Cross-sell opportunities show?

#### 5. Firm Branding
- [ ] Visit `/settings/branding` - Page loads?
- [ ] Upload logo - Success message?
- [ ] Logo displays after refresh?
- [ ] Change brand color - Preview updates?

### Performance Checks
- [ ] First load < 3-5 seconds (cold start)
- [ ] Subsequent loads < 1 second
- [ ] No console errors (F12)
- [ ] Mobile responsive (test on phone)

---

## 🌱 Seed Demo Data (Optional)

If you want impressive analytics for demos:

### From Your Local Machine

```bash
# Make sure you have production credentials in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[production-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Run seed script
npm run seed -- --clean
```

**This creates:**
- 15 realistic clients (FTBs, investors, retirees)
- 15 properties across Edinburgh
- 17 quotes (£81,420 total revenue)
- 6 months of historical data

**Analytics will show:**
- Total Revenue: £81,420
- Conversion Rate: ~53% (8 accepted / 15 total)
- Cross-sell Opportunities: Wills, POA, Estate Planning
- Staff Performance: Realistic distribution

---

## 🔧 Common Issues & Solutions

### Build Fails: Google Fonts Error
**Symptom:** Build shows network error for Google Fonts
**Solution:** Ignore it - this is a known limitation in containerized builds. Fonts load fine in the browser.

### "Unknown Staff" in Analytics
**Symptom:** Staff performance shows "Unknown Staff"
**Solution:** Demo data doesn't assign staff names. Create quotes manually as logged-in user for proper attribution.

### Logo Upload Fails
**Symptom:** Error when uploading logo
**Solution:**
- Verify `firm-logos` bucket exists in Supabase Storage
- Check bucket is public
- Verify file size < 5MB and correct format (JPEG/PNG/WebP/SVG)

### RLS Policy Errors
**Symptom:** "Row Level Security policy violation" errors
**Solution:**
- Verify migrations ran successfully
- Check user is logged in
- Confirm tenant_memberships exist for user

### Environment Variables Not Working
**Symptom:** App can't connect to Supabase/SendGrid
**Solution:**
- Double-check all environment variables in Vercel
- Variables must start with `NEXT_PUBLIC_` to be exposed to browser
- Redeploy after adding/changing variables

### Cold Start Delays
**Symptom:** First page load takes 3-5 seconds
**Solution:** This is normal for Vercel serverless functions. Subsequent loads are fast (<1s).

---

## 📊 Monitoring & Maintenance

### Vercel Dashboard
Monitor in Vercel:
- **Deployments:** See build history and logs
- **Functions:** Check serverless function performance
- **Analytics:** Page views and performance metrics (paid feature)

### Supabase Dashboard
Monitor in Supabase:
- **Database:** Row counts, active connections
- **Storage:** Usage and bandwidth
- **Auth:** User signups and logins
- **API:** Request counts and performance

### SendGrid Dashboard
Monitor in SendGrid:
- **Email Activity:** Delivery, opens, clicks
- **API Usage:** Requests and quotas
- **Reputation:** Spam scores and bounces

---

## 🔄 Update & Redeploy Process

### For Future Updates

1. **Make changes on local branch**
   ```bash
   git checkout claude/phase-2-form-builder-0151jSm8PvAf8MqE51ryMAwW
   # Make your changes
   git add .
   git commit -m "feat: Your feature"
   git push
   ```

2. **Vercel auto-deploys**
   - Vercel watches your branch
   - Automatically rebuilds on push
   - Takes 2-5 minutes

3. **Verify deployment**
   - Visit Vercel URL
   - Test changed functionality
   - Check for errors

### Manual Redeploy

1. Go to Vercel → Deployments
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Confirm

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ **Functionality**
- Can create and manage quotes
- Email sending with PDF works
- Analytics dashboard displays correctly
- Client management works
- Branding settings save properly

✅ **Performance**
- First load < 5 seconds
- Subsequent loads < 1 second
- No console errors
- Mobile responsive

✅ **Data**
- User registration/login works
- Quotes save to database
- Client data persists
- Logos upload successfully

---

## 🆘 Need Help?

### Resources
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

### Check These First
1. Environment variables are correct
2. Database migrations ran successfully
3. Storage bucket exists and is public
4. Build logs in Vercel (for build errors)
5. Browser console (F12) for runtime errors

---

**Good luck with your deployment!** 🚀

For Tuesday's demo, you can choose:
- **Production:** Deploy tonight, demo on live URL (impressive!)
- **Localhost:** Demo locally, deploy Wednesday (safer)

Both options work - choose based on your comfort level and time available tonight.
