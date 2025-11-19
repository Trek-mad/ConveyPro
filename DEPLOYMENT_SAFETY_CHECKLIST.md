# ConveyPro - Deployment Safety Checklist

**Last Updated:** 2025-11-19
**Version:** 1.0
**Purpose:** Ensure safe, reliable deployments with zero downtime

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Execution](#deployment-execution)
3. [Post-Deployment Verification](#post-deployment-verification)
4. [Rollback Procedures](#rollback-procedures)
5. [Phase-Specific Checklists](#phase-specific-checklists)
6. [Emergency Contacts](#emergency-contacts)

---

## Pre-Deployment Checklist

### Code Quality

- [ ] **All TypeScript errors resolved**
  ```bash
  npm run build
  # Expected: Exit code 0, no errors
  ```

- [ ] **Linting passes**
  ```bash
  npm run lint
  # Expected: No errors, warnings acceptable if documented
  ```

- [ ] **All tests passing**
  ```bash
  npm test
  # Expected: 100% pass rate
  ```

- [ ] **No console errors in development**
  ```bash
  npm run dev
  # Open browser console, navigate through app
  # Expected: No red errors
  ```

### Documentation

- [ ] **CHANGELOG.md updated**
  - New version entry added
  - Features documented
  - Bug fixes listed
  - Breaking changes noted

- [ ] **README.md updated**
  - Version number current
  - New features listed
  - Environment variables documented

- [ ] **STATUS.md updated**
  - Deployment status reflects current state
  - Known issues documented
  - Phase status accurate

- [ ] **Database migrations documented**
  - Migration files have descriptive names
  - Rollback migrations created
  - Migration order verified

### Database

- [ ] **Migrations tested locally**
  ```bash
  npx supabase start
  npx supabase db push
  # Expected: Migrations run successfully
  ```

- [ ] **Rollback migrations created**
  ```bash
  # For each migration file, create corresponding rollback
  # Example:
  # 20241119_add_campaigns.sql
  # 20241119_add_campaigns_rollback.sql
  ```

- [ ] **Migrations tested on staging database**
  ```bash
  # Run migrations on Supabase staging project
  # Verify data integrity
  # Test rollback
  ```

- [ ] **Database backup created**
  ```bash
  # Supabase auto-backups daily
  # Verify backup exists in dashboard:
  # Supabase → Database → Backups
  ```

- [ ] **RLS policies verified**
  ```bash
  # Test in Supabase SQL Editor:
  # 1. Create test tenant
  # 2. Create test user
  # 3. Verify user can only see their tenant's data
  ```

### Environment Variables

- [ ] **All required variables documented**
  ```bash
  # Check .env.example is up to date
  diff .env.example .env.local
  ```

- [ ] **Vercel environment variables set**
  - Navigate to Vercel Dashboard → Settings → Environment Variables
  - Verify all required variables present
  - Check for typos in variable names
  - Verify values are production-ready (not dev values)

- [ ] **Secrets rotated if needed**
  - API keys are current
  - Database passwords are secure
  - Webhook secrets are unique

- [ ] **Environment-specific values verified**
  ```bash
  # Production values:
  NEXT_PUBLIC_APP_ENV=production
  NEXT_PUBLIC_APP_URL=https://conveypro.vercel.app
  # (not localhost!)
  ```

### Dependencies

- [ ] **package.json version bumped**
  ```bash
  npm version major|minor|patch
  ```

- [ ] **Dependencies up to date**
  ```bash
  npm outdated
  # Review and update critical dependencies
  ```

- [ ] **No security vulnerabilities**
  ```bash
  npm audit
  # Expected: 0 high/critical vulnerabilities
  ```

- [ ] **Lock file committed**
  ```bash
  git status package-lock.json
  # Expected: Up to date with package.json
  ```

### Git

- [ ] **All changes committed**
  ```bash
  git status
  # Expected: Working tree clean
  ```

- [ ] **On correct branch**
  ```bash
  git branch --show-current
  # Expected: develop (for staging) or main (for production)
  ```

- [ ] **Up to date with remote**
  ```bash
  git pull origin develop
  # Expected: Already up to date
  ```

- [ ] **Release tag created**
  ```bash
  git tag -a v2.1.0 -m "Release v2.1.0 - Description"
  git push origin v2.1.0
  ```

### Vercel

- [ ] **Previous deployments successful**
  - Check Vercel dashboard
  - Verify last 3 deployments succeeded

- [ ] **Build time reasonable**
  - Last build: < 5 minutes (expected)
  - If > 10 minutes, investigate

- [ ] **No pending domain changes**
  - DNS propagated
  - SSL certificate valid

### External Services

- [ ] **Supabase status: Operational**
  - Check https://status.supabase.com
  - Verify project is running

- [ ] **SendGrid status: Operational**
  - Check https://status.sendgrid.com
  - Verify API key is active
  - Check sender verification

- [ ] **Vercel status: Operational**
  - Check https://www.vercel-status.com

### Timing

- [ ] **Deployment scheduled appropriately**
  - ✅ Good: Evenings, weekends, off-peak hours
  - ❌ Bad: Monday mornings, end of month, peak hours

- [ ] **Team availability**
  - Developer on standby for 2 hours post-deployment
  - Can rollback if issues detected

### Notifications

- [ ] **Team notified of deployment**
  - Slack/email notification sent
  - Deployment time communicated
  - Expected downtime (if any) noted

---

## Deployment Execution

### Step 1: Pre-Deployment Backup

```bash
# 1. Tag current production state
git checkout main
git pull origin main
git tag -a backup-pre-deploy-$(date +%Y-%m-%d-%H%M) -m "Backup before deploying v2.1.0"
git push origin --tags

# 2. Verify Supabase backup exists
# Supabase Dashboard → Database → Backups
# Confirm backup within last 24 hours
```

**Checkpoint:**
- [ ] Backup tag created and pushed
- [ ] Supabase backup verified

---

### Step 2: Run Database Migrations (If Any)

```bash
# 1. Connect to Supabase production
psql {production-connection-string}

# 2. Verify current schema version
SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 5;

# 3. Run migrations
\i supabase/migrations/20241119_new_feature.sql

# 4. Verify migration succeeded
SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 1;
# Expected: New migration in list

# 5. Verify data integrity
# Run test queries to ensure data looks correct

# 6. Exit psql
\q
```

**Checkpoint:**
- [ ] Migrations ran successfully
- [ ] Schema version updated
- [ ] Data integrity verified
- [ ] No errors in migration logs

**Rollback if:**
- Migration fails
- Data corruption detected
- Schema doesn't match expected state

---

### Step 3: Deploy Application

#### Option A: Automatic Deployment (Recommended)

```bash
# Merge to main triggers automatic Vercel deployment
git checkout main
git pull origin main
git merge develop --no-ff -m "Release v2.1.0"
git push origin main

# Vercel auto-deploys from main branch
# Monitor deployment in Vercel dashboard
```

#### Option B: Manual Deployment

```bash
# Deploy using Vercel CLI
git checkout main
git pull origin main
vercel --prod

# Follow prompts
# Expected: Deployment URL returned
```

**Checkpoint:**
- [ ] Deployment initiated
- [ ] Build started in Vercel dashboard
- [ ] No build errors

**Monitor:**
- Vercel Dashboard → Deployments → Latest deployment
- Watch build logs
- Expected build time: 3-5 minutes

---

### Step 4: Wait for Deployment Complete

**Expected Timeline:**
- Build: 2-3 minutes
- Deploy: 1-2 minutes
- DNS propagation: 1-2 minutes
- **Total: 5-7 minutes**

**During Deployment:**
- Watch Vercel dashboard for errors
- Don't close terminal
- Have rollback commands ready

**Checkpoint:**
- [ ] Build status: "Success"
- [ ] Deployment status: "Ready"
- [ ] Production URL updated

---

## Post-Deployment Verification

### Immediate Checks (0-5 minutes)

- [ ] **Application loads**
  ```bash
  curl -I https://conveypro.vercel.app
  # Expected: HTTP 200 OK
  ```

- [ ] **Homepage renders**
  - Open https://conveypro.vercel.app in browser
  - Expected: No white screen, no error page

- [ ] **Authentication works**
  - Navigate to /login
  - Attempt login with test account
  - Expected: Successful login

- [ ] **Dashboard loads**
  - After login, verify dashboard renders
  - Expected: No errors in browser console

- [ ] **API endpoints responding**
  ```bash
  # Test health endpoint (if exists)
  curl https://conveypro.vercel.app/api/health
  # Expected: { "status": "ok" }
  ```

### Critical User Flows (5-15 minutes)

- [ ] **User can create quote**
  - Navigate to Quotes → New Quote
  - Fill in form
  - Submit
  - Expected: Quote created, no errors

- [ ] **LBTT calculator works**
  - In quote form, enter property value
  - Expected: LBTT calculated automatically

- [ ] **PDF generation works**
  - Create or view quote
  - Click "Generate PDF"
  - Expected: PDF downloads successfully

- [ ] **Email sending works**
  - Send test quote via email
  - Check recipient inbox
  - Expected: Email received within 2 minutes

- [ ] **Client management works**
  - Navigate to Clients
  - Create new client
  - View client profile
  - Expected: All features functional

- [ ] **Analytics dashboard loads**
  - Navigate to Analytics
  - Expected: Charts render, data displays

### Database Verification (15-30 minutes)

- [ ] **Data integrity maintained**
  ```sql
  -- Connect to Supabase production
  -- Run verification queries

  -- Check row counts match expected
  SELECT
    (SELECT COUNT(*) FROM quotes) as quotes,
    (SELECT COUNT(*) FROM clients) as clients,
    (SELECT COUNT(*) FROM properties) as properties;

  -- Expected: Counts match pre-deployment numbers
  ```

- [ ] **RLS policies working**
  ```sql
  -- Test as non-admin user
  -- Verify can only see own tenant's data
  SET role = 'authenticated';
  SELECT * FROM quotes WHERE tenant_id != '{test-tenant-id}';
  -- Expected: 0 rows (RLS blocking)
  ```

- [ ] **Migrations reflected**
  ```sql
  -- Verify new columns/tables exist
  \d+ campaigns  -- Example: New table from Phase 3
  -- Expected: Table structure matches migration
  ```

### Performance Verification (30-60 minutes)

- [ ] **Page load times acceptable**
  - Open Chrome DevTools → Network tab
  - Load homepage
  - Expected: Load time < 2 seconds

- [ ] **API response times acceptable**
  - Open Chrome DevTools → Network tab
  - Perform quote creation
  - Expected: API calls < 500ms

- [ ] **No memory leaks**
  - Open Chrome DevTools → Memory tab
  - Navigate around app for 5 minutes
  - Take heap snapshot
  - Expected: Memory stable, no continuous growth

### Error Monitoring (Ongoing)

- [ ] **Check Vercel logs**
  - Vercel Dashboard → Logs
  - Filter: Last 30 minutes
  - Expected: No errors, minimal warnings

- [ ] **Check browser console**
  - Navigate through app
  - Monitor console for errors
  - Expected: No red errors

- [ ] **Monitor Supabase logs**
  - Supabase Dashboard → Logs
  - Expected: Normal query patterns, no errors

### Email Verification

- [ ] **Test email delivery**
  ```bash
  # Send test email via app
  # Check SendGrid dashboard for delivery
  # Expected: Email delivered within 2 minutes
  ```

- [ ] **Check SendGrid dashboard**
  - SendGrid → Activity
  - Expected: Emails delivering, no bounces

### Phase-Specific Verification

For **Phase 3** (Campaigns):
- [ ] Create test campaign
- [ ] Add email template
- [ ] Enroll test client
- [ ] Verify campaign analytics

For **Phase 4** (Forms):
- [ ] Submit test form via webhook
- [ ] Verify client/property/quote created
- [ ] Check campaign enrollment

For **Phase 5** (Email Engagement):
- [ ] Send test campaign email
- [ ] Open tracking works
- [ ] Click tracking works

For **Phase 6** (Analytics):
- [ ] Revenue attribution loads
- [ ] Conversion funnel displays
- [ ] Client journey tracks

For **Phase 7** (AI):
- [ ] Lead scoring calculates
- [ ] Hot leads dashboard displays
- [ ] Predictive insights generate

---

## Rollback Procedures

### When to Rollback

**Immediate Rollback If:**
- Application doesn't load (white screen, 500 error)
- Critical feature broken (can't create quotes)
- Data corruption detected
- Security vulnerability exposed
- Database errors in logs

**Consider Rollback If:**
- Performance degraded significantly
- Minor feature broken but workaround exists
- Unexpected errors in logs (investigate first)

### Rollback Method 1: Vercel Dashboard (Fastest)

**Time: ~2 minutes**

1. Navigate to Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click "⋯" menu → "Promote to Production"
4. Confirm promotion

**When to Use:**
- Application code issue (not database)
- Need fastest rollback
- Previous deployment was stable

---

### Rollback Method 2: Deploy Previous Tag

**Time: ~5 minutes**

```bash
# 1. Find previous stable tag
git tag -l "v*" --sort=-creatordate | head -5

# 2. Checkout tag
git checkout v2.0.0

# 3. Deploy to production
vercel --prod

# 4. Wait for deployment
# Monitor Vercel dashboard

# 5. Verify application loads
curl -I https://conveypro.vercel.app
# Expected: HTTP 200 OK
```

**When to Use:**
- Need to deploy specific version
- Know exact tag to deploy
- Have time for full deployment

---

### Rollback Method 3: Database Rollback

**Time: ~10 minutes**
**Risk: High - Potential data loss**

```bash
# 1. Connect to Supabase production
psql {production-connection-string}

# 2. Verify current migration
SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 1;

# 3. Run rollback migration
\i supabase/migrations/20241119_new_feature_rollback.sql

# 4. Verify rollback succeeded
SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 5;

# 5. Check data integrity
# Run verification queries

# 6. Exit
\q
```

**When to Use:**
- Database migration caused issue
- Data corruption from new schema
- No application code changes

**Warning:**
- May result in data loss
- Only use if migration is the problem
- Consider restoring from backup instead

---

### Rollback Method 4: Restore Database Backup

**Time: ~30 minutes**
**Risk: High - Data loss since backup**

```bash
# 1. Go to Supabase Dashboard
# 2. Database → Backups
# 3. Find backup before deployment
# 4. Click "Restore"
# 5. Confirm restoration

# Warning: All data since backup will be lost
```

**When to Use:**
- Database corruption severe
- Migration rollback doesn't work
- Last resort only

---

### Post-Rollback Actions

After successful rollback:

- [ ] Verify application working
- [ ] Monitor error logs for 30 minutes
- [ ] Notify team of rollback
- [ ] Document what went wrong
- [ ] Create incident report
- [ ] Create hotfix branch to fix issue
- [ ] Test fix thoroughly in staging
- [ ] Schedule re-deployment

---

## Phase-Specific Checklists

### Phase 2: Analytics & Client Management

**Already Deployed ✅**

**Pre-Deployment:**
- [x] Demo data seeder tested
- [x] Analytics charts render correctly
- [x] Client profiles display
- [x] Logo upload functionality works (CORS issue documented)

**Post-Deployment:**
- [x] Verified on Vercel production
- [x] Demo data loaded successfully
- [x] Charts display with real data

---

### Phase 3: Cross-Selling & Email Automation

**Status:** Ready for deployment

**Pre-Deployment:**
- [ ] **Database migrations ready**
  - `20241118000000_create_campaign_system.sql`
  - `20241118000001_add_email_history_tracking_fields.sql`

- [ ] **Environment variables set in Vercel**
  ```bash
  CRON_SECRET=your-random-uuid
  ```

- [ ] **Test campaign creation**
  - Create campaign locally
  - Add email template
  - Test auto-enrollment
  - Verify SendGrid integration

- [ ] **Test email queue**
  - Queue test email
  - Verify SendGrid sends
  - Check email_history tracking

**Post-Deployment:**
- [ ] Run migrations on production database
- [ ] Create test campaign
- [ ] Enroll test client
- [ ] Verify email sends
- [ ] Check campaign analytics
- [ ] Verify cron jobs running (email queue processing)

**Rollback Plan:**
- Rollback migrations if data issues
- Remove CRON_SECRET if cron issues
- Previous version had no campaigns (safe to rollback)

---

### Phase 4: Form-to-Client Automation

**Status:** Ready for deployment

**Pre-Deployment:**
- [ ] **Environment variables set in Vercel**
  ```bash
  FORM_WEBHOOK_SECRET=your-random-secret
  ```

- [ ] **Test webhook locally**
  - Use webhook test form
  - Verify client created
  - Verify property created
  - Verify quote created
  - Verify campaign enrollment

- [ ] **Configure external form providers**
  - Typeform webhook URL
  - Jotform webhook URL
  - Google Forms (if using)

**Post-Deployment:**
- [ ] Get production webhook URL
- [ ] Configure external forms with production URL
- [ ] Submit test form
- [ ] Verify auto-creation pipeline
- [ ] Check client appears in dashboard
- [ ] Check quote appears in quotes list
- [ ] Verify campaign enrollment

**Rollback Plan:**
- Remove FORM_WEBHOOK_SECRET
- Previous version had no webhook (safe to rollback)
- External forms won't work but won't error

---

### Phase 5: Email Engagement Tracking

**Status:** Ready for deployment

**Pre-Deployment:**
- [ ] **Verify Phase 3 deployed**
  - Email tracking depends on email_history table
  - Requires Phase 3 campaign system

- [ ] **Test engagement metrics**
  - Send test email
  - Track open
  - Track click
  - Verify metrics calculate

**Post-Deployment:**
- [ ] Navigate to /campaigns/analytics
- [ ] Verify engagement funnel displays
- [ ] Send test campaign
- [ ] Open test email
- [ ] Click link in test email
- [ ] Verify open/click tracked in dashboard

**Rollback Plan:**
- No database changes (uses Phase 3 tables)
- Safe to rollback, engagement tracking stops

---

### Phase 6: Advanced Analytics

**Status:** Ready for deployment

**Pre-Deployment:**
- [ ] **Test revenue attribution**
  - View /analytics/revenue
  - Verify charts display
  - Check by source
  - Check by service

- [ ] **Test conversion funnel**
  - View /analytics/conversions
  - Verify 5 stages display
  - Check dropoff analysis

- [ ] **Test client journey**
  - View client profile
  - Verify timeline displays
  - Check journey stages

**Post-Deployment:**
- [ ] Navigate to /analytics/revenue
- [ ] Verify revenue attribution loads
- [ ] Navigate to /analytics/conversions
- [ ] Verify funnel displays
- [ ] View client profile
- [ ] Verify journey timeline

**Rollback Plan:**
- No database changes
- Safe to rollback, analytics features removed

---

### Phase 7: Intelligent Automation

**Status:** Ready for deployment

**Pre-Deployment:**
- [ ] **Test lead scoring**
  - Score test clients
  - Verify 100-point algorithm
  - Check hot/warm/cold classification

- [ ] **Test predictive insights**
  - Generate insights for test client
  - Verify upsell detection
  - Check stale quote alerts

- [ ] **Test hot leads dashboard**
  - View /dashboard/hot-leads
  - Verify leads prioritized
  - Check recommended actions

**Post-Deployment:**
- [ ] Navigate to /dashboard/hot-leads
- [ ] Verify leads display
- [ ] Check lead scores calculate
- [ ] Verify classification (hot/warm/cold)
- [ ] Click into lead detail
- [ ] Verify insights display
- [ ] Test upsell recommendations

**Rollback Plan:**
- No database changes
- Safe to rollback, AI features removed

---

## Emergency Contacts

### Internal Team

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Developer | [Name] | [Phone/Email] | On-call during deployment |
| DevOps | [Name] | [Phone/Email] | Escalation if deployment issues |
| Product Owner | [Name] | [Email] | Business decisions |

### External Services

| Service | Support | Status Page |
|---------|---------|-------------|
| Vercel | support@vercel.com | https://www.vercel-status.com |
| Supabase | support@supabase.io | https://status.supabase.com |
| SendGrid | support@sendgrid.com | https://status.sendgrid.com |

### Escalation Path

1. **Minor Issue**: Developer investigates, fixes in next release
2. **Major Issue**: Developer attempts rollback
3. **Critical Issue**: Developer rolls back, notifies team, creates incident
4. **Service Outage**: Check status pages, contact support

---

## Deployment Log Template

### Deployment: v2.1.0 to Production

**Date:** 2024-11-19
**Time:** 18:00 GMT
**Deployed By:** [Name]
**Deployment Method:** Automatic (Vercel)

**Pre-Deployment Checklist:**
- [x] All tests passing
- [x] Migrations tested
- [x] Environment variables set
- [x] Team notified

**Deployment Timeline:**
- 18:00 - Pre-deployment checks complete
- 18:05 - Migrations run on production DB
- 18:10 - Code deployed to Vercel
- 18:15 - Deployment complete
- 18:16 - Immediate verification passed
- 18:30 - Critical flows tested
- 18:45 - Performance verified
- 19:00 - Monitoring stable, deployment successful

**Issues Encountered:**
- None

**Rollback Required:**
- No

**Post-Deployment Actions:**
- Monitored logs for 1 hour
- All metrics normal
- No user reports of issues

**Sign-off:**
- Developer: [Name, Timestamp]
- Product Owner: [Name, Timestamp]

---

## Quick Reference

### Pre-Deployment Commands

```bash
# Build and test
npm run build && npm run lint && npm test

# Create release tag
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin v2.1.0

# Deploy to production
git checkout main && git merge develop && git push origin main
```

### Rollback Commands

```bash
# Vercel: Use dashboard (fastest)

# Or deploy previous tag
git checkout v2.0.0 && vercel --prod

# Database rollback
psql {connection} -f supabase/migrations/rollback.sql
```

### Verification Commands

```bash
# Test homepage
curl -I https://conveypro.vercel.app

# Test API
curl https://conveypro.vercel.app/api/health

# Check build status
vercel inspect {deployment-url}
```

---

**Last Updated:** 2025-11-19
**Version:** 1.0
**Status:** Ready for Phase 3-7 Deployment
**Next Review:** After first production deployment
