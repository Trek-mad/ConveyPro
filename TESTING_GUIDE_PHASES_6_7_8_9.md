# Testing Guide: Phases 6, 7, 8, and 9

**Branch:** `claude/phases-6-7-8-9-testing-015jod3AP3UByjRJ2AZbFbpy`
**Date:** November 20, 2024
**Status:** Ready for Testing

---

## 🎯 Overview

This consolidated branch contains **ALL** features from Phases 1-9:
- ✅ **Phases 1-5:** Complete (MVP, Analytics, Cross-Selling, Form Automation, Email Engagement)
- ✅ **Phase 6:** Advanced Analytics
- ✅ **Phase 7:** Form Builder
- ✅ **Phase 8:** Team Collaboration
- ✅ **Phase 9:** Client Portal

**Total Code:** 9,108+ lines across 38 new files

---

## 🚀 Quick Start

### 1. Pull the Testing Branch

```bash
# Fetch and checkout the consolidated testing branch
git fetch origin claude/phases-6-7-8-9-testing-015jod3AP3UByjRJ2AZbFbpy
git checkout claude/phases-6-7-8-9-testing-015jod3AP3UByjRJ2AZbFbpy
```

### 2. Run Database Migrations

You need to run **4 new migrations** in your Supabase SQL Editor:

```sql
-- Phase 6: Already included in Phase 5 (no separate migration)

-- Phase 7: Form Builder (2 migrations)
-- Run: supabase/migrations/20241120000001_create_form_builder_schema.sql
-- Run: supabase/migrations/20241120000002_fix_form_builder_rls_policies.sql

-- Phase 8: Team Collaboration
-- Run: supabase/migrations/20241120000003_create_team_collaboration_system.sql

-- Phase 9: Client Portal
-- Run: supabase/migrations/20241120000004_create_client_portal_system.sql
```

### 3. Install Dependencies (if needed)

```bash
npm install
# or
yarn install
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

---

## 📋 Complete Testing Checklist

### PHASE 6: Advanced Analytics ✅

#### Revenue Attribution
- [ ] Navigate to `/analytics/revenue`
- [ ] Verify revenue breakdown by source (website, referral, marketing, repeat)
- [ ] Check revenue by service (conveyancing, wills, estate planning)
- [ ] Confirm monthly trending charts display correctly
- [ ] Test date range filters

#### Client Journey
- [ ] Navigate to `/analytics/conversions`
- [ ] View client journey timeline
- [ ] Check event tracking (quote created, email sent, quote accepted)
- [ ] Verify journey stages visualization
- [ ] Test filtering by client

#### Conversion Funnel
- [ ] Check 5-stage funnel (Lead → Contacted → Quoted → Accepted → Paid)
- [ ] Verify drop-off percentages
- [ ] Review stage recommendations
- [ ] Check time-in-stage tracking

---

### PHASE 7: Form Builder ✅

#### Form Template Creation
- [ ] Navigate to `/admin/forms`
- [ ] Click "Create New Form"
- [ ] Add form fields (text, email, phone, select, etc.)
- [ ] Configure 12 field types
- [ ] Set up pricing rules (fixed, tiered, per-item, percentage, conditional)
- [ ] Save form template
- [ ] Verify form appears in list

#### Form Preview
- [ ] Click "Preview" on a form
- [ ] Verify all fields render correctly
- [ ] Test form validation
- [ ] Check pricing calculations
- [ ] Submit form (preview mode - won't save)

#### LBTT Rates Management
- [ ] Navigate to `/admin/lbtt-rates`
- [ ] Verify 2025-26 rates displayed (8% ADS)
- [ ] Check rate history
- [ ] Test rate version control

#### Form Deletion
- [ ] Delete a test form
- [ ] Confirm deletion dialog appears
- [ ] Verify form removed from list
- [ ] Check CASCADE deletion (fields/pricing removed)

#### Sample Form Script
- [ ] Run `scripts/create-sample-form.sql` in Supabase
- [ ] Verify "Scottish Residential Purchase (Sample)" form created
- [ ] Check 8 fields and 4 pricing rules loaded
- [ ] Preview the sample form

---

### PHASE 8: Team Collaboration ✅

#### Staff Management
- [ ] Navigate to `/team`
- [ ] View team workload statistics
- [ ] Check capacity indicators (green/yellow/red)
- [ ] Verify staff performance metrics
- [ ] Update staff availability status

#### Quote Assignments
- [ ] Assign quote to team member
- [ ] Check notification sent to assignee
- [ ] View quote assignments list
- [ ] Test different assignment types (primary, secondary, reviewer)

#### Approval Workflows
**Create Workflow:**
- [ ] Navigate to approvals settings (if UI exists, otherwise use API)
- [ ] Create approval workflow for quotes
- [ ] Set auto-approve threshold (e.g., £1,000)
- [ ] Configure approval steps

**Submit for Approval:**
- [ ] Create high-value quote (above threshold)
- [ ] Submit for approval
- [ ] Check approval request created
- [ ] Verify approver notified

**Approve/Reject:**
- [ ] View pending approvals
- [ ] Add comment to approval
- [ ] Approve or reject request
- [ ] Verify submitter notified
- [ ] Check audit trail

#### Notifications Center
- [ ] Click bell icon in navigation
- [ ] View unread count badge
- [ ] Check notification types displayed
- [ ] Mark single notification as read
- [ ] Mark all as read
- [ ] Test priority levels (low, normal, high, urgent)
- [ ] Click notification action link

#### Audit Logs
- [ ] View audit logs (if UI exists, otherwise check database)
- [ ] Verify all actions logged:
  - [ ] Quote created
  - [ ] Client updated
  - [ ] Quote approved
  - [ ] Campaign launched
- [ ] Check before/after changes tracked
- [ ] Verify IP address logged
- [ ] Confirm logs cannot be modified

---

### PHASE 9: Client Portal ✅

#### Client Authentication

**Magic Link Login:**
- [ ] Navigate to `/portal/login` (if exists, otherwise use API)
- [ ] Request magic link for test client email
- [ ] Check console/logs for magic link URL
- [ ] Click magic link
- [ ] Verify login successful
- [ ] Check session created

**Email Verification:**
- [ ] Request verification email
- [ ] Click verification link
- [ ] Verify email_verified flag set to true

#### Client Dashboard
- [ ] Login as client
- [ ] Navigate to `/portal/dashboard` (or equivalent)
- [ ] Verify dashboard shows:
  - [ ] Client name and details
  - [ ] All quotes list
  - [ ] Recent messages
  - [ ] Uploaded documents
  - [ ] Upcoming consultations

#### Quote Management
- [ ] View all client quotes
- [ ] Check quote status displayed correctly
- [ ] Click "Download PDF" button
- [ ] Verify PDF downloads
- [ ] Accept a quote online (if UI exists)

#### Secure Messaging
- [ ] Send message to firm
- [ ] View message history
- [ ] Reply to thread
- [ ] Upload attachment (if implemented)
- [ ] Check staff receives notification

#### Document Upload
- [ ] Upload ID document
- [ ] Upload proof of address
- [ ] Upload signed contract
- [ ] Verify document type selection works
- [ ] Check verification status
- [ ] Verify staff can approve documents

#### Email Preferences
- [ ] Navigate to preferences page
- [ ] Toggle email marketing OFF
- [ ] Toggle email notifications ON
- [ ] Change preferred contact method
- [ ] Unsubscribe from newsletters
- [ ] Save preferences
- [ ] Verify changes persist

#### Consultation Booking
- [ ] Schedule phone consultation
- [ ] Select date and time
- [ ] Add client notes
- [ ] Submit booking
- [ ] Verify booking appears in dashboard
- [ ] Check confirmation status

---

## 🔍 Database Verification

### Check All Tables Created

```sql
-- Form Builder tables (Phase 7)
SELECT tablename FROM pg_tables WHERE schemaname = 'public'
AND tablename IN (
  'form_templates', 'form_fields', 'form_field_options',
  'form_pricing_rules', 'form_pricing_tiers', 'form_instances',
  'form_instance_pricing', 'lbtt_rates', 'form_submissions', 'form_steps'
);

-- Team Collaboration tables (Phase 8)
SELECT tablename FROM pg_tables WHERE schemaname = 'public'
AND tablename IN (
  'staff_profiles', 'quote_assignments', 'client_assignments',
  'approval_workflows', 'approval_requests', 'approval_comments',
  'notifications', 'audit_logs'
);

-- Client Portal tables (Phase 9)
SELECT tablename FROM pg_tables WHERE schemaname = 'public'
AND tablename IN (
  'client_users', 'magic_links', 'client_sessions',
  'client_messages', 'client_preferences',
  'client_documents', 'consultation_bookings'
);
```

### Check RLS Policies

```sql
-- Should return 30+ policies across all tables
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'form_templates', 'staff_profiles', 'notifications',
  'client_users', 'client_messages', 'client_documents'
)
ORDER BY tablename, policyname;
```

### Check Indexes

```sql
-- Should return 45+ indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'form_templates', 'form_fields', 'staff_profiles',
  'notifications', 'client_users', 'client_messages'
)
ORDER BY tablename, indexname;
```

---

## 🧪 API Testing

### Phase 7: Form Builder APIs

```bash
# Get all form templates
curl -X GET http://localhost:3000/api/admin/forms

# Create form template
curl -X POST http://localhost:3000/api/admin/forms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Form",
    "slug": "test-form",
    "visibility": "global",
    "fields": [...],
    "pricing_rules": [...]
  }'

# Delete form
curl -X DELETE http://localhost:3000/api/admin/forms/{id}
```

### Phase 8: Team Collaboration APIs

```bash
# Get team stats
curl -X GET http://localhost:3000/api/team/staff?action=stats

# Get notifications
curl -X GET http://localhost:3000/api/team/notifications

# Get notification stats
curl -X GET http://localhost:3000/api/team/notifications?action=stats

# Mark notification as read
curl -X PATCH http://localhost:3000/api/team/notifications \
  -H "Content-Type: application/json" \
  -d '{"action": "mark_read", "notification_id": "uuid"}'

# Get approval requests
curl -X GET http://localhost:3000/api/team/approvals?status=pending

# Approve request
curl -X PATCH http://localhost:3000/api/team/approvals/{id} \
  -H "Content-Type: application/json" \
  -d '{"action": "approve", "decision_note": "Approved"}'
```

### Phase 9: Client Portal APIs

```bash
# Send magic link
curl -X POST http://localhost:3000/api/portal/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"action": "send", "email": "client@example.com"}'

# Verify magic link
curl -X POST http://localhost:3000/api/portal/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"action": "verify", "token": "token-from-email"}'

# Get dashboard data
curl -X GET "http://localhost:3000/api/portal/dashboard?client_id=uuid&tenant_id=uuid"

# Get messages
curl -X GET "http://localhost:3000/api/portal/messages?client_id=uuid"

# Send message
curl -X POST http://localhost:3000/api/portal/messages \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "uuid",
    "tenant_id": "uuid",
    "sender_type": "client",
    "sender_id": "uuid",
    "message_text": "Hello from client"
  }'

# Get preferences
curl -X GET "http://localhost:3000/api/portal/preferences?client_id=uuid&tenant_id=uuid"

# Update preferences
curl -X PATCH http://localhost:3000/api/portal/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "uuid",
    "tenant_id": "uuid",
    "email_marketing": false,
    "email_notifications": true
  }'
```

---

## 🐛 Common Issues & Solutions

### Issue: Migration fails with "relation already exists"
**Solution:** Tables may already exist from previous test. Drop tables first or skip if already created.

### Issue: RLS policy errors (403)
**Solution:** Check user is authenticated and has correct tenant_id in session.

### Issue: Magic link not working
**Solution:** Check token hasn't expired (60 min limit) and hasn't been used already (one-time use).

### Issue: Notifications not appearing
**Solution:** Verify user_id matches in notifications table and RLS policies allow access.

### Issue: Form builder not saving fields
**Solution:** Check RLS policies on form_fields table (Migration 20241120000002).

### Issue: Audit logs not creating
**Solution:** Verify audit log trigger is enabled on relevant tables.

---

## 📊 Performance Testing

### Load Testing Checklist
- [ ] Create 100+ form templates
- [ ] Create 1,000+ notifications
- [ ] Create 500+ client messages
- [ ] Test pagination on large datasets
- [ ] Check query performance with indexes
- [ ] Verify RLS policies don't slow queries

### Expected Performance
- Form list page: < 500ms
- Notification center: < 200ms
- Dashboard load: < 1s
- Magic link generation: < 100ms
- Message send: < 300ms

---

## 🔒 Security Testing

### Authentication
- [ ] Verify magic links expire after 60 minutes
- [ ] Confirm magic links are one-time use only
- [ ] Check tokens are hashed (SHA-256)
- [ ] Test session expiry

### Authorization
- [ ] Verify clients can only see their own data
- [ ] Check staff cannot access other tenant's data
- [ ] Test RLS policies block unauthorized access
- [ ] Confirm audit logs cannot be modified

### Data Privacy
- [ ] Verify GDPR consent tracked
- [ ] Check unsubscribe functionality works
- [ ] Test data deletion cascades correctly
- [ ] Confirm sensitive data encrypted (if applicable)

---

## ✅ Sign-Off Checklist

Before marking testing complete, ensure:

### Phase 6
- [ ] Revenue analytics display correctly
- [ ] Client journey tracking works
- [ ] Conversion funnel accurate
- [ ] All charts render properly

### Phase 7
- [ ] Forms can be created and edited
- [ ] All 12 field types work
- [ ] Pricing rules calculate correctly
- [ ] Preview functionality works
- [ ] LBTT rates display (8% ADS)
- [ ] Forms can be deleted

### Phase 8
- [ ] Team workload stats accurate
- [ ] Notifications appear in real-time
- [ ] Approval workflow functions
- [ ] Audit logs capture all actions
- [ ] Assignments notify users

### Phase 9
- [ ] Magic link login works
- [ ] Client dashboard shows all data
- [ ] Secure messaging functional
- [ ] Preferences save correctly
- [ ] Document upload works
- [ ] Consultation booking creates records

---

## 📝 Bug Report Template

```markdown
**Phase:** [6/7/8/9]
**Feature:** [e.g., Form Builder, Notifications, Magic Link]
**Severity:** [Low/Medium/High/Critical]

**Description:**
[What went wrong?]

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**
[What should happen?]

**Actual Behavior:**
[What actually happened?]

**Screenshots:**
[If applicable]

**Environment:**
- Branch: claude/phases-6-7-8-9-testing-015jod3AP3UByjRJ2AZbFbpy
- Browser:
- OS:
- Database: Supabase [version]
```

---

## 🎯 Success Criteria

Testing is complete when:
- ✅ All migrations run successfully
- ✅ All API endpoints respond correctly
- ✅ UI components render without errors
- ✅ No console errors in browser
- ✅ No TypeScript compilation errors
- ✅ All RLS policies enforce correctly
- ✅ Performance meets targets
- ✅ Security tests pass
- ✅ All features in checklist work

---

## 📞 Need Help?

**Documentation:**
- Phase 7: See `docs/FORM-BUILDER.md`
- Phases 8 & 9: See `PHASES_8_AND_9_COMPLETE.md`

**Database Schema:**
- View migrations in `supabase/migrations/`
- Check types in `lib/types/`

**API Reference:**
- Check route files in `app/api/`
- Review services in `lib/services/`

---

## 🚀 After Testing

Once testing is complete:
1. Document all bugs found
2. Create GitHub issues for critical bugs
3. Provide feedback on UX improvements
4. Sign off on each phase
5. Prepare for production deployment

---

**Testing Branch:** `claude/phases-6-7-8-9-testing-015jod3AP3UByjRJ2AZbFbpy`
**Last Updated:** November 20, 2024
**Status:** Ready for Testing

**Happy Testing! 🎉**
