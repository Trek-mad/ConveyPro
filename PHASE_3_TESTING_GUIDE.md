# Phase 3: Automated Cross-Selling Campaign System - Testing Guide

## 🎯 What's New in Phase 3

You now have a complete email automation and campaign management system integrated into ConveyPro. This allows you to create targeted cross-selling campaigns (e.g., "Wills for Property Buyers") and automatically send personalized emails to clients.

## ✅ Deployment Checklist

### 1. Environment Variables (Already Configured)
- ✅ `SENDGRID_API_KEY` - Your SendGrid API key
- ✅ `SENDGRID_FROM_EMAIL` - Verified sender email
- ✅ `SENDGRID_FROM_NAME` - Your firm name
- ⚠️ `CRON_SECRET` - **ADD THIS** for secure cron job execution

**Add CRON_SECRET to Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `CRON_SECRET` = `your-random-secure-string-here` (generate a random UUID)
3. This protects your email queue processing endpoint

### 2. Database Migrations (Already Completed)
- ✅ All 7 Phase 3 tables created in Supabase
- ✅ Email tracking fields added

### 3. Vercel Cron Configuration (Auto-Deployed)
- ✅ `vercel.json` configured to run email queue processing every 5 minutes
- ✅ Endpoint: `/api/cron/process-email-queue`

---

## 🧪 Testing Phase 3 Features

### Navigation Access

**What to Look For:**
- In the sidebar navigation, you should see a new **"Campaigns"** menu item with a Mail icon
- It appears between "Analytics" and "Quotes"
- Click it to access `/campaigns`

### 1. Campaigns Dashboard (`/campaigns`)

**Test:**
1. Click "Campaigns" in sidebar
2. You should see the campaigns dashboard with:
   - Header: "Campaigns"
   - Stats cards showing Total Campaigns, Active, Completed, Total Sent
   - "New Campaign" button (top right)
   - Campaign list table (currently empty)

**Expected Results:**
- Stats show all zeros (no campaigns yet)
- Empty state message: "No campaigns yet. Create your first campaign to start cross-selling."

### 2. Create a Campaign (`/campaigns/new`)

**Test:**
1. Click "New Campaign" button
2. Fill out the form:
   - **Name:** "Wills for Property Buyers"
   - **Description:** "Offer will writing services to clients who have purchased property"
   - **Campaign Type:** Select "Wills" from dropdown
   - **Target Life Stages:** Check "First Time Buyer" and "Moving Up"
3. Click "Create Campaign"

**Expected Results:**
- Form saves successfully
- Redirects to campaign detail page (`/campaigns/[id]`)
- Campaign appears in Active status

**Campaign Types Available:**
- Wills
- Power of Attorney
- Estate Planning
- Remortgage
- Custom

**Target Life Stages:**
- First Time Buyer
- Moving Up
- Investor
- Retired
- Downsizing

### 3. Campaign Detail Page (`/campaigns/[id]`)

**Test:**
1. After creating campaign, you should land on detail page
2. Check for these sections:
   - **Header:** Campaign name, description, status badge
   - **Stats Cards:** Sent, Opened, Clicked, Converted (all zeros initially)
   - **Email Templates Tab:** List of email templates for this campaign
   - **Triggers Tab:** Automation trigger rules
   - **Subscribers Tab:** Clients enrolled in campaign
   - **Settings Tab:** Campaign configuration

**Expected Results:**
- All sections render correctly
- "Add Template" button visible in Templates tab
- Empty states show helpful messages

### 4. Create Email Template (`/campaigns/[id]/templates/new`)

**Test:**
1. From campaign detail page, click Templates tab
2. Click "Add Template" button
3. Fill out template form:
   - **Name:** "Initial Wills Introduction"
   - **Description:** "First email in the wills campaign sequence"
   - **Subject Line:** "Important: Protecting Your New Property with a Will"
   - **Preview Text:** "Hi {{client_name}}, congratulations on your property purchase..."
   - **Sequence Order:** 1
   - **Send Delay:** 7 days
   - **Body (HTML):** Use the variable buttons to insert personalization

**Variable Buttons to Test:**
Click each button to insert variables at cursor position:
- `{{client_name}}` - Client's full name
- `{{firm_name}}` - Your law firm name
- `{{service_name}}` - Service name (e.g., "Will Writing")
- `{{quote_value}}` - Quote amount (if applicable)
- `{{property_address}}` - Client's property address

**Expected Results:**
- Variables insert at cursor position with proper `{{}}` syntax
- Cursor moves to after inserted variable
- Form saves successfully
- Redirects back to campaign detail page
- Template appears in Templates list

**Example Email Body:**
```
Dear {{client_name}},

Congratulations on your recent property purchase! As you settle into your new home, it's the perfect time to ensure your assets are protected.

At {{firm_name}}, we specialize in will writing services that give you peace of mind. Many of our property buyers don't realize that without a will, their property may not go to their intended beneficiaries.

We'd love to offer you a complimentary consultation to discuss your estate planning needs.

Best regards,
{{firm_name}} Team
```

### 5. Edit Template (`/campaigns/[id]/templates/[templateId]/edit`)

**Test:**
1. From campaign detail → Templates tab
2. Click "Edit" on a template
3. Modify the subject line or body
4. Click "Update Template"

**Expected Results:**
- Pre-populated form with existing template data
- Changes save successfully
- Returns to campaign detail page
- Template shows updated content

### 6. Edit Campaign (`/campaigns/[id]/edit`)

**Test:**
1. From campaign detail page header
2. Click "Edit Campaign" button
3. Modify campaign name or description
4. Add/remove target life stages
5. Click "Update Campaign"

**Expected Results:**
- Form pre-populated with current campaign data
- Changes save successfully
- Returns to campaign detail page
- Campaign shows updated information

### 7. Campaign Status Management

**Test:**
1. From campaigns dashboard
2. Click status badge on a campaign
3. Try changing status: Draft → Active → Paused → Completed

**Expected Results:**
- Status updates immediately
- Stats reflect active/paused campaigns
- Active campaigns can send emails
- Draft campaigns cannot send

---

## 🔧 Backend Features to Verify

### Email Queue Processing (Automated)

**How It Works:**
- Vercel Cron runs `/api/cron/process-email-queue` every 5 minutes
- Processes up to 50 pending emails per run
- Updates email_queue status: pending → sending → sent
- Creates records in email_history for tracking

**Manual Test (Optional):**
```bash
# From Vercel Dashboard → Deployments → [Latest] → Functions
# Click on /api/cron/process-email-queue
# View execution logs to verify it runs every 5 minutes
```

**Expected Response:**
```json
{
  "success": true,
  "processed": 0,
  "errors": 0,
  "duration_ms": 150
}
```

### SendGrid Webhook (Already Deployed)

**Endpoint:** `/api/webhooks/sendgrid`

**Tracks:**
- Email delivered
- Email opened (with timestamp)
- Email clicked
- Email bounced
- Spam reports
- Unsubscribes

**Verification:**
1. Check Supabase → email_history table after sending test emails
2. Look for populated fields: `delivered_at`, `opened_at`, `clicked_at`

---

## 📊 Database Tables Created

1. **campaigns** - Campaign definitions and metrics
2. **email_templates** - Email content with variables
3. **campaign_triggers** - Automation rules (future: auto-enroll clients)
4. **email_queue** - Scheduled emails waiting to send
5. **email_history** - Sent email tracking and engagement
6. **campaign_subscribers** - Client enrollment in campaigns
7. **campaign_analytics** - Daily aggregated metrics

**Verify in Supabase:**
```sql
-- Check campaigns table
SELECT * FROM campaigns;

-- Check templates table
SELECT * FROM email_templates;

-- Check email queue (should be empty initially)
SELECT * FROM email_queue WHERE status = 'pending';
```

---

## 🐛 Common Issues & Solutions

### Issue: "Campaigns" not in sidebar
**Solution:** Make sure you're viewing the latest Vercel deployment (commit e417e78 or later)

### Issue: 401 Unauthorized when creating campaign
**Solution:** Ensure you're logged in as Owner or Admin role. Regular users can only view campaigns.

### Issue: Template variables not working
**Solution:** Variables must use exact syntax: `{{variable_name}}`. No spaces inside braces.

### Issue: Emails not sending
**Solution:**
1. Check `SENDGRID_API_KEY` is set in Vercel
2. Verify `CRON_SECRET` is configured
3. Check email_queue table has pending emails
4. Wait up to 5 minutes for cron to run

### Issue: Cron job not running
**Solution:**
1. Verify `vercel.json` is deployed
2. Check Vercel logs for cron execution
3. Ensure CRON_SECRET env var is set
4. Cron only runs on production deployments, not preview

---

## 📈 Success Metrics

**Phase 3 is working correctly when:**
- ✅ Campaigns menu appears in sidebar
- ✅ Can create/edit campaigns
- ✅ Can create/edit email templates with variables
- ✅ Templates save with proper sequence ordering
- ✅ Variable buttons insert {{tags}} at cursor position
- ✅ Campaign dashboard shows correct stats
- ✅ Role-based access works (only admins can edit)
- ✅ Email queue processes every 5 minutes (check logs)
- ✅ SendGrid webhook updates email_history table

---

## 🚀 Next Steps After Testing

1. **Test Email Flow:**
   - Manually add a record to email_queue table
   - Wait 5 minutes for cron to process
   - Verify email arrives in inbox
   - Check email_history for tracking

2. **Create Real Campaigns:**
   - Wills for Property Buyers
   - Power of Attorney for Elderly Clients
   - Remortgage Services for Existing Clients

3. **Build Campaign Triggers (Future):**
   - Auto-enroll when quote accepted
   - Auto-enroll based on client life stage
   - Date-based triggers (e.g., 6 months after purchase)

4. **Analytics Dashboard:**
   - View campaign performance metrics
   - Track conversion rates
   - Calculate ROI

---

## 📞 Support

**If you encounter any issues:**
1. Check browser console for errors (F12)
2. Check Vercel deployment logs
3. Verify database migrations ran successfully in Supabase
4. Ensure all environment variables are set

**Deployment URL:**
Your latest deployment should be at: `https://your-project.vercel.app`

Look for deployment with commit message: **"Feat: Add Campaigns to navigation menu"**
