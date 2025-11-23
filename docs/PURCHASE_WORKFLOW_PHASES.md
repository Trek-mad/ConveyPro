# Purchase Client Workflow - Implementation Phases

**Quick Reference Guide**

---

## Overview

**Total Timeline:** 20-22 weeks (5-6 months)
**Total Effort:** 110-130 developer days
**Phases:** 8 incremental phases

Each phase is independently deployable for early user feedback.

---

## Phase 1: Foundation (Weeks 1-3) ⚙️

**Goal:** Establish core data models and basic CRUD operations

### Deliverables
- ✅ Database migrations for 10 new tables
- ✅ TypeScript types generation
- ✅ RLS policies for all tables
- ✅ Service layer: `client.service.ts`, `matter.service.ts`, `document.service.ts`
- ✅ Basic UI: Client list/create, Matter list/create
- ✅ Auto-number generation (M00001-25 format)

### Tables Created
1. `clients` - Standalone client records
2. `matters` - Purchase transaction cases
3. `workflow_stages` - Stage definitions
4. `matter_tasks` - Checklist tasks
5. `documents` - Document storage metadata
6. `offers` - Offer tracking
7. `financial_questionnaires` - Financial assessments
8. `fee_earner_availability` - Calendar blocking
9. `fee_earner_settings` - Capacity configuration
10. `matter_activities` - Activity timeline

### Success Criteria
- [ ] Can create clients
- [ ] Can create matters linked to clients
- [ ] Can view matter list
- [ ] All RLS policies tested
- [ ] No security vulnerabilities

**Effort:** 15-20 days

---

## Phase 2: Workflow & Tasks (Weeks 4-6) 🔄

**Goal:** Implement stage-based workflow with automated task generation

### Deliverables
- ✅ Workflow engine: stage transitions, validation
- ✅ Task auto-generation per stage
- ✅ `task.service.ts` with assignment logic
- ✅ Stage visualization: progress stepper, stage cards
- ✅ Task list component with filtering
- ✅ Default workflow seeds (12 purchase stages)
- ✅ Matter activity log

### Workflow Stages
1. Client Entry
2. Quote Check
3. Client & Property Details
4. Financial Questionnaire
5. Financial Checks
6. Home Report Review
7. Establish Parameters
8. Offer Creation
9. Offer Approval
10. Client Acceptance
11. Offer Outcome
12. Conveyancing Allocation

### Success Criteria
- [ ] Matter progresses through stages
- [ ] Tasks auto-created on stage entry
- [ ] Can't progress without completing required tasks
- [ ] Activity timeline shows all actions
- [ ] Email notifications on stage transitions

**Effort:** 15-20 days

---

## Phase 3: Documents & Financial Questionnaire (Weeks 7-9) 📄

**Goal:** Complete document management and financial assessment

### Deliverables
- ✅ Supabase Storage integration (bucket + RLS)
- ✅ Document upload/download service
- ✅ Document versioning
- ✅ Upload modal with drag & drop
- ✅ Document library (grid/list view)
- ✅ Preview modal
- ✅ Financial Questionnaire multi-step form
- ✅ `financial-questionnaire.service.ts`
- ✅ Affordability calculator integration
- ✅ ADS detection logic
- ✅ PDF export of questionnaire responses
- ✅ Home Report handling

### Document Types
- Home Reports
- Financial Questionnaires
- Offer Letters
- ID Documents
- Bank Statements
- Mortgage in Principle

### Success Criteria
- [ ] Can upload documents to matters
- [ ] Documents stored in Supabase Storage
- [ ] Can complete financial questionnaire
- [ ] Affordability warnings displayed
- [ ] ADS liability correctly detected
- [ ] Can download/preview documents

**Effort:** 15-20 days

---

## Phase 4: Offer Management (Weeks 10-12) 📝

**Goal:** Complete offer creation, approval, and tracking workflow

### Deliverables
- ✅ `offer.service.ts` with full CRUD
- ✅ Offer creation form (written + verbal)
- ✅ Approval workflow: solicitor → negotiator → client
- ✅ Client acceptance page (public link with token)
- ✅ Offer PDF generation template
- ✅ Auto-population from matter data
- ✅ Verbal offer logging
- ✅ Counter-offer tracking
- ✅ Agent response logging
- ✅ Email notifications at each approval step

### Offer States
1. **Draft** - Being prepared
2. **Pending Solicitor** - Awaiting solicitor signature
3. **Pending Negotiator** - Awaiting negotiator approval
4. **Pending Client** - Awaiting client acceptance
5. **Submitted** - Sent to selling agent
6. **Accepted** - Agent accepted
7. **Rejected** - Agent rejected
8. **Withdrawn** - Client withdrew

### Success Criteria
- [ ] Can create written and verbal offers
- [ ] Approval workflow functions correctly
- [ ] Client can accept via secure link
- [ ] Offer PDFs generated correctly
- [ ] All outcomes tracked properly
- [ ] Notifications sent at each step

**Effort:** 15-20 days

---

## Phase 5: Fee Earner Allocation (Weeks 13-15) 👥

**Goal:** Intelligent workload-based allocation system

### Deliverables
- ✅ Fee earner settings UI (capacity, specialization)
- ✅ `fee-earner.service.ts`
- ✅ Availability calendar (monthly/weekly views)
- ✅ Block out dates UI (holidays, training, sick)
- ✅ Holiday management
- ✅ Recurring patterns
- ✅ Workload calculation function (real-time)
- ✅ Auto-assignment algorithm
- ✅ Manual assignment UI with recommendations
- ✅ Per-fee-earner workload dashboard
- ✅ Team workload overview
- ✅ Capacity visualization (charts)
- ✅ Assignment notifications

### Allocation Logic
```
Auto-Assignment Priority:
1. Is fee earner available? (not on holiday)
2. Within capacity? (< max concurrent matters)
3. Within weekly limit? (< max new matters per week)
4. Specialization match? (matter type, value range)
5. Lowest current workload
6. Assignment priority score
7. Fair distribution (round-robin)
```

### Success Criteria
- [ ] Can set fee earner availability
- [ ] Can block out holidays
- [ ] Workload calculated in real-time
- [ ] Auto-assignment suggests appropriate fee earner
- [ ] Manual assignment shows recommendations
- [ ] Workload balanced across team
- [ ] Notifications sent on assignment

**Effort:** 15-20 days

---

## Phase 6: Reminders & Notifications (Weeks 16-17) 🔔

**Goal:** Automated reminder system for due dates and closing dates

### Deliverables
- ✅ Reminder engine (cron job/scheduled function)
- ✅ Query overdue/upcoming tasks
- ✅ Query upcoming closing dates
- ✅ Email templates (task reminder, closing date, overdue)
- ✅ Notification preferences (user settings)
- ✅ Opt-in/opt-out options
- ✅ Dashboard alerts (overdue tasks, upcoming deadlines)
- ✅ Matters requiring attention widget

### Notification Triggers
- **Closing Date:** 7, 3, 1 days before
- **Task Due Date:** 3, 1 days before
- **Overdue Tasks:** Daily digest
- **Stage Transitions:** Immediate
- **Document Uploaded:** Immediate
- **Offer Pending Approval:** Immediate + daily reminders
- **Matter Assigned:** Immediate

### Success Criteria
- [ ] Reminders sent 7/3/1 days before closing date
- [ ] Task reminders sent based on due date
- [ ] Overdue tasks flagged
- [ ] Users can configure notification preferences
- [ ] Dashboard shows actionable alerts

**Effort:** 10 days

---

## Phase 7: Client Portal & Acceptance (Weeks 18-19) 🌐

**Goal:** Client-facing portal for offer acceptance and updates

### Deliverables
- ✅ Public routes: `/portal/[token]`
- ✅ Client matter view (summary, stage, documents)
- ✅ Offer acceptance page with click-to-accept
- ✅ Security: token generation, expiry, IP logging
- ✅ Email integration: "View your matter" link
- ✅ Offer acceptance confirmation email
- ✅ Contact form within portal
- ✅ Mobile responsive design

### Security Features
- Secure token generation (UUID v4 + HMAC)
- Token expiry (30 days)
- IP address logging for all actions
- Rate limiting on acceptance endpoint
- No authentication required (token-based)

### Success Criteria
- [ ] Client can view matter via secure link
- [ ] Client can accept offer with one click
- [ ] Acceptance logged with timestamp and IP
- [ ] Secure and tokenized (no auth required)
- [ ] Mobile responsive
- [ ] Works on all modern browsers

**Effort:** 10 days

---

## Phase 8: Reporting & Analytics (Weeks 20-22) 📊

**Goal:** Business intelligence and performance metrics

### Deliverables
- ✅ Matters by stage report (funnel visualization)
- ✅ Average time per stage analysis
- ✅ Conversion rate tracking (quote → matter → completion)
- ✅ Fee earner performance report
- ✅ Document completion rates
- ✅ Task completion rates
- ✅ Executive dashboard (high-level metrics)
- ✅ Manager dashboard (team performance)
- ✅ Fee earner dashboard (personal metrics)
- ✅ CSV export of reports
- ✅ PDF export of dashboards
- ✅ Date range, fee earner, matter type filters

### Key Metrics
- **Pipeline:** Matters by stage (Kanban-style)
- **Velocity:** Average days per stage
- **Bottlenecks:** Stages with longest duration
- **Conversion:** % of quotes that become matters
- **Completion:** % of matters that complete
- **Workload:** Matters per fee earner
- **Efficiency:** Tasks completed on time %
- **Documents:** % of required documents uploaded

### Success Criteria
- [ ] Can view all key metrics
- [ ] Reports accurate and performant (< 5s load)
- [ ] Can export data (CSV, PDF)
- [ ] Visualizations clear and useful
- [ ] Helps identify bottlenecks
- [ ] Stakeholders can make data-driven decisions

**Effort:** 15 days

---

## Dependencies Between Phases

```
Phase 1 (Foundation)
    ↓
Phase 2 (Workflow & Tasks)
    ↓
Phase 3 (Documents) ←→ Phase 4 (Offers)
    ↓                       ↓
Phase 5 (Fee Earner Allocation)
    ↓
Phase 6 (Reminders) ←→ Phase 7 (Client Portal)
    ↓
Phase 8 (Reporting & Analytics)
```

**Notes:**
- Phases 3 & 4 can run in parallel after Phase 2
- Phases 6 & 7 can run in parallel after Phase 5
- Phase 8 requires all previous phases complete

---

## Quick Start: Which Phase to Begin?

### Start with Phase 1 if:
- ✅ You want to build the complete system
- ✅ You have 5-6 months timeline
- ✅ You want maximum flexibility

### Start with Phase 2 if:
- ⚠️ You already have client/matter tables
- ⚠️ You only need workflow automation
- ⚠️ **Not recommended** - Phase 1 foundation is critical

### Start with Phase 4 if:
- ⚠️ You only need offer management
- ⚠️ **Not recommended** - requires Phase 1-2 foundation

---

## Post-Phase 8: Future Roadmap

### Short-term (3-6 months post-launch)
- Search functionality (global search across matters)
- Bulk operations (bulk assign, bulk stage transition)
- Custom fields per tenant
- Email templates customization
- SMS notifications

### Medium-term (6-12 months)
- Integration with Amaquis (back-office system)
- Land Registry API integration (Scotland)
- Address lookup API
- Calendar sync (Google, Outlook)
- WhatsApp notifications

### Long-term (12+ months)
- AI document extraction
- Email parsing and auto-filing
- Predictive analytics (ML completion times)
- Mobile apps (iOS, Android)
- API marketplace
- White-label solution

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scope creep | High | High | Strict phase boundaries, no feature additions mid-phase |
| Technical debt | Medium | High | Code reviews, testing at each phase |
| User adoption | Medium | High | Training materials, change management |
| Performance issues | Low | Medium | Load testing before production |
| Security vulnerabilities | Low | Critical | Security audit before launch |
| Third-party API changes | Low | Medium | Abstraction layer for integrations |

---

## Success Metrics (Overall)

### Technical Metrics
- [ ] 100% table coverage with RLS policies
- [ ] < 2s page load times
- [ ] < 500ms API response times
- [ ] 95%+ uptime
- [ ] Zero critical security vulnerabilities

### Business Metrics
- [ ] 50%+ reduction in time to create offer
- [ ] 80%+ task completion rate
- [ ] 90%+ user satisfaction score
- [ ] 100% of matters tracked in system
- [ ] 30%+ reduction in missed deadlines

### User Adoption Metrics
- [ ] 100% of fee earners using system daily
- [ ] 80%+ of clients using portal
- [ ] < 5 support tickets per week post-launch
- [ ] 90%+ of offers created via system

---

## Resource Requirements

### Development Team
- **1x Senior Full-Stack Developer** (Lead)
- **1x Mid-Level Developer** (Support)
- **0.5x UI/UX Designer** (Part-time)
- **0.5x QA Engineer** (Part-time)

### Infrastructure
- Supabase (existing)
- SendGrid (existing)
- Vercel hosting (existing)
- No additional costs

### Training & Change Management
- User training sessions (2 hours)
- Video tutorials (10-15 videos)
- Documentation (user guide)
- Support during first month

---

## Getting Started

### Step 1: Approve Specification
- [ ] Review full specification document
- [ ] Provide feedback on any changes
- [ ] Sign off on approach

### Step 2: Set Up Project
- [ ] Create project board (Kanban)
- [ ] Set up git branch: `feature/purchase-workflow`
- [ ] Schedule kick-off meeting

### Step 3: Begin Phase 1
- [ ] Create database migrations
- [ ] Generate TypeScript types
- [ ] Implement RLS policies
- [ ] Build basic service layer

### Step 4: Weekly Check-ins
- Review progress
- Demo completed work
- Adjust timeline if needed
- Gather feedback

---

**Questions?**

Contact project lead or refer to full specification:
`/docs/PURCHASE_CLIENT_WORKFLOW_SPEC.md`

---

**Last Updated:** 2025-11-20
**Version:** 1.0
**Status:** Ready for Review
