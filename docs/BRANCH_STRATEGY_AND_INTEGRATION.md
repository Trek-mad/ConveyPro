# Branch Strategy & Integration Plan for Purchase Client Workflow

**Date:** 2025-11-20
**Status:** ✅ Phase 12 Branch Created
**Current Branch:** `claude/phase-12-purchase-workflow-01BBD4YzKUvHpqg7AL5YEEHs`

---

## ✅ RESOLVED - Sequential Build Strategy Applied

### ConveyPro Sequential Build Pattern

**How We Build ConveyPro:**
```
Phase 1 → Phase 2 → Phase 3 → ... → Phase 11 → Phase 12 (Purchase Workflow)
   ↓        ↓         ↓                ↓            ↓
 (copy)  (copy)    (copy)           (copy)      (copy)
  all      all       all              all         all
```

**Each new phase:**
1. Starts from the previous phase branch (full copy)
2. Adds new features on top of existing codebase
3. Becomes the base for the next phase

This ensures **sequential, cumulative development** where every phase builds on everything before it.

---

## 📊 Current Branch State

### Phase 12 Branch (Current)

**Branch:** `claude/phase-12-purchase-workflow-01BBD4YzKUvHpqg7AL5YEEHs` ✅

**Contents:**
- ✅ All Phase 1-11 features (100+ commits)
- ✅ Purchase Workflow specification documents
- ✅ Ready for Phase 1 Foundation implementation

**Based On:** Phase 11 (commit `6dc8f91`)

---

## 🏗️ What Phase 12 Includes (Inherited from Phases 1-11)

### Phase 1-3: Foundation & Core Features
- Multi-tenant architecture (tenants, profiles, memberships)
- Authentication & authorization (Supabase Auth + RLS)
- Quotes system (LBTT calculator, fee quotes)
- Properties management
- Email campaigns

### Phase 4: Automation & Integrations
- Form-to-client automation
- Webhook system
- Integration framework (`/settings/integrations`)

### Phase 5: Email Engagement
- Email tracking & analytics
- Open/click rate monitoring
- Campaign performance metrics

### Phase 6: Advanced Analytics
- Funnel analysis (`/analytics/funnel`)
- Revenue tracking (`/analytics/revenue`)
- Dashboard widgets

### Phase 7: Intelligent Automation
- Automated workflows
- Smart recommendations

### Phase 8: Team Collaboration
- Team management features
- Collaborative tools

### Phase 9: Client Portal
- Client-facing portal
- Secure access system

### Phase 10: Form Builder
- Complete custom form builder (`/admin/forms`)
- Form template editor
- Form preview system
- LBTT rate management (`/admin/lbtt-rates`)
- Form submission webhooks

### Phase 11: Go-to-Market
- Marketing pages (`/marketing/pricing`)
- Billing & subscriptions (`/api/billing/*`)
- Demo request system
- Support ticket system
- Branding customization (logo upload)

---

## 🚀 What We're Building in Phase 12

### Purchase Client Workflow System

**8 Implementation Phases** (see `PURCHASE_WORKFLOW_PHASES.md`):

1. **Phase 1 - Foundation** (Weeks 1-3)
   - 10 new database tables
   - RLS policies
   - TypeScript types
   - Basic service layer
   - Client & Matter CRUD

2. **Phase 2 - Workflow & Tasks** (Weeks 4-6)
   - 12-stage workflow engine
   - Auto-task generation
   - Stage transitions
   - Activity timeline

3. **Phase 3 - Documents & Questionnaire** (Weeks 7-9)
   - Supabase Storage integration
   - Document management
   - Financial questionnaire
   - ADS detection

4. **Phase 4 - Offer Management** (Weeks 10-12)
   - Offer creation & approval
   - Client acceptance portal
   - PDF generation
   - Verbal/written tracking

5. **Phase 5 - Fee Earner Allocation** (Weeks 13-15)
   - Availability calendar
   - Workload calculation
   - Auto-assignment algorithm
   - Capacity management

6. **Phase 6 - Reminders & Notifications** (Weeks 16-17)
   - Automated email reminders
   - Closing date alerts
   - Task due date reminders

7. **Phase 7 - Client Portal** (Weeks 18-19)
   - Secure client access
   - Offer acceptance page
   - Matter status view

8. **Phase 8 - Reporting & Analytics** (Weeks 20-22)
   - Matter funnel reports
   - Fee earner performance
   - Conversion analytics

---

## 🔗 Integration with Existing System

### How Purchase Workflow Connects to Phase 11 Features

**Integrates With Form Builder (Phase 10):**
- Financial questionnaire uses form builder
- Client intake forms link to matters
- Custom field templates

**Integrates With Campaigns (Phase 3):**
- Matter creation triggers campaign enrollment
- Client journey automation
- Post-purchase nurture campaigns

**Integrates With Analytics (Phase 6):**
- Purchase funnel metrics
- Conversion tracking (quote → matter → completion)
- Fee earner performance dashboards

**Integrates With Client Portal (Phase 9):**
- Matter status view for clients
- Document access
- Offer acceptance

**Integrates With Billing (Phase 11):**
- Track revenue per matter
- Fee earner commission tracking
- Subscription tier gating

---

## 📋 Sequential Build Strategy - Applied

### What We Did

```bash
# 1. Started from Phase 11 (latest production code)
git checkout origin/claude/phase-11-go-to-market-015jod3AP3UByjRJ2AZbFbpy

# 2. Created Phase 12 branch (following sequential pattern)
git checkout -b claude/phase-12-purchase-workflow-01BBD4YzKUvHpqg7AL5YEEHs

# 3. Brought in Purchase Workflow specs
git cherry-pick d046518  # PURCHASE_CLIENT_WORKFLOW_SPEC.md
git cherry-pick 0b991a5  # PURCHASE_WORKFLOW_PHASES.md
git cherry-pick 844009f  # BRANCH_STRATEGY_AND_INTEGRATION.md (corrected)

# 4. Pushed Phase 12 to remote ✅
git push -u origin claude/phase-12-purchase-workflow-01BBD4YzKUvHpqg7AL5YEEHs
```

### Result

✅ **Phase 12 branch created successfully!**

**Contains:**
- All Phase 1-11 code (complete production system)
- Purchase Workflow specification documents
- Ready to begin Phase 1 Foundation implementation

---

## 🎯 Next Steps - Phase 1 Foundation

### Week 1: Core Tables
- [ ] Create `clients` table migration
- [ ] Create `matters` table migration
- [ ] Create `workflow_stages` table migration
- [ ] Seed workflow stages (12 stages)
- [ ] Test RLS policies

### Week 2: Supporting Tables
- [ ] Create `matter_tasks` table migration
- [ ] Create `documents` table migration
- [ ] Create `matter_activities` table migration
- [ ] Set up Supabase Storage bucket
- [ ] Test relationships

### Week 3: Advanced Tables & Services
- [ ] Create `offers` table migration
- [ ] Create `financial_questionnaires` table migration
- [ ] Create `fee_earner_availability` table migration
- [ ] Create `fee_earner_settings` table migration
- [ ] Generate TypeScript types
- [ ] Build basic service layer (CRUD)
- [ ] Create basic UI components

---

## 🏗️ Build Strategy: Additive Only

**Key Principle:** Phase 12 **adds** new tables, **doesn't modify** existing ones.

```
Existing System (Phase 1-11) ← Untouched
├── tenants
├── profiles
├── tenant_memberships
├── quotes
├── properties
├── campaigns
├── email_templates
├── form_templates
└── ... (50+ tables)

New Purchase System (Phase 12) ← Additive
├── clients (NEW)
├── matters (NEW - links to quotes, properties)
├── workflow_stages (NEW)
├── matter_tasks (NEW)
├── documents (NEW)
├── offers (NEW)
├── financial_questionnaires (NEW)
├── fee_earner_availability (NEW)
├── fee_earner_settings (NEW)
└── matter_activities (NEW)
```

**Integration via Foreign Keys:**
- `matters.quote_id` → `quotes.id` (optional link)
- `matters.property_id` → `properties.id` (required)
- `matters.assigned_fee_earner_id` → `profiles.id`
- All tables have `tenant_id` → `tenants.id`

**Result:** Existing quote/property workflows continue unchanged. New purchase workflow is optional enhancement.

---

## 🔒 Safety Mechanisms

### 1. Feature Flags
```typescript
// Hide Purchase Workflow UI until ready
const showPurchaseWorkflow = await checkFeatureFlag(
  tenant.id,
  'purchase_workflow_enabled'
)
```

### 2. RLS Policies
Every new table has Row Level Security:
- Tenant isolation
- Role-based permissions (viewer, member, manager, admin, owner)
- Soft deletes (`deleted_at`)

### 3. Transactions
All mutations wrapped in database transactions:
- Rollback on error
- Atomic operations
- Data integrity guaranteed

### 4. Migration Rollbacks
Every migration has a rollback script:
```sql
-- Migration: 20250120_create_clients.sql
CREATE TABLE clients (...);

-- Rollback: 20250120_create_clients.rollback.sql
DROP TABLE IF EXISTS clients CASCADE;
```

---

## 📈 Success Metrics - Phase 1 Foundation

**Technical Metrics:**
- [ ] 10 database tables created with RLS
- [ ] 100% of foreign key constraints working
- [ ] TypeScript types generated error-free
- [ ] Service layer has 100% test coverage
- [ ] Zero TypeScript errors in build

**Functional Metrics:**
- [ ] Can create a client
- [ ] Can create a matter linked to client
- [ ] Can view matter list
- [ ] Matter stages display correctly
- [ ] All RLS policies pass security tests

**Timeline:**
- Week 1-3 (15-20 days)
- Daily commits with incremental progress
- Testing after each migration

---

## 📚 Documentation Structure

**Specification Documents:**
- `PURCHASE_CLIENT_WORKFLOW_SPEC.md` - Complete technical spec (200 pages)
- `PURCHASE_WORKFLOW_PHASES.md` - 8-phase implementation guide
- `BRANCH_STRATEGY_AND_INTEGRATION.md` - This document

**Updated When Complete:**
- `STATUS.md` - Overall project status
- `CHANGELOG.md` - Record all Phase 12 changes
- `README.md` - Update with Phase 12 features

---

## 🎉 Phase 12 Status

**Branch Created:** ✅
**Specs Documented:** ✅
**Phase 11 Code Copied:** ✅
**Ready to Build:** ✅

**Next:** Begin Phase 1 Foundation - Database Migrations

---

**Last Updated:** 2025-11-20
**Branch:** `claude/phase-12-purchase-workflow-01BBD4YzKUvHpqg7AL5YEEHs`
**Status:** Ready for Implementation 🚀
