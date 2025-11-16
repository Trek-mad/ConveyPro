# ConveyPro - Project Roadmap

**Version:** 1.0  
**Last Updated:** November 14, 2024  
**Status:** Ready for Development

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Timeline](#timeline)
3. [MVP Features](#mvp-features)
4. [Phase 2 Features](#phase-2-features)
5. [Phase 3 Features](#phase-3-features)
6. [Post-MVP Enhancements](#post-mvp-enhancements)
7. [Success Metrics](#success-metrics)
8. [Dependencies](#dependencies)

---

## Overview

### Project Phases

```
├── MVP (Weeks 1-6)
│   ├── Core quote generation
│   ├── Document attachments
│   ├── Basic analytics
│   └── Essential workflow features
│
├── Phase 2 (Weeks 7-10)
│   ├── Visual form builder
│   ├── Conditional logic engine
│   ├── Dynamic pricing rules
│   └── LBTT rate management
│
├── Phase 3 (Weeks 11-16)
│   ├── Client classification
│   ├── Email sequence builder
│   ├── Conversion tracking
│   └── Advanced analytics
│
└── Post-MVP (Ongoing)
    ├── Quick wins (Phase 1.5)
    ├── Integration features
    ├── Advanced automation
    └── Enterprise features
```

---

## Timeline

### Overall Schedule

```
Week 1-6:   MVP Development → Launch
Week 7-10:  Phase 2 (Form Builder) → Launch
Week 11-16: Phase 3 (Cross-Selling) → Launch
Week 17+:   Post-MVP Enhancements (Ongoing)

Total to Full Platform: 16 weeks (4 months)
```

### Milestones

```
✅ Week 0:  Documentation Complete
🎯 Week 1:  Project Setup Complete
🎯 Week 2:  Core Quotes Working
🎯 Week 3:  Workflow Features Complete
🎯 Week 4:  Client Management Complete
🎯 Week 5:  Notifications Complete
🎯 Week 6:  MVP LAUNCHED 🚀
🎯 Week 10: Phase 2 LAUNCHED 🚀
🎯 Week 16: Phase 3 LAUNCHED 🚀
```

---

## MVP Features

### Priority Legend
- **P0** = Must have for launch (blocking)
- **P1** = Should have for launch (important)
- **P2** = Nice to have for launch (optional)

### Core Features (From Original Spec)

| Feature | Priority | Effort | Status |
|---------|----------|--------|--------|
| Multi-tenant architecture | P0 | L | ⬜ |
| Authentication & authorization | P0 | M | ⬜ |
| Quote form (staff dashboard) | P0 | L | ⬜ |
| LBTT calculator | P0 | M | ✅ |
| Fee calculator | P0 | M | ✅ |
| PDF generation | P0 | M | ⬜ |
| Document attachments | P0 | S | ⬜ |
| Email delivery | P0 | S | ⬜ |
| Admin dashboard | P0 | L | ⬜ |
| Organization settings | P0 | M | ⬜ |
| User management | P0 | M | ⬜ |
| Fee structure management | P0 | M | ⬜ |
| Basic analytics | P1 | M | ⬜ |

### New MVP Features (Enhanced)

| Feature | Priority | Effort | Status | Week |
|---------|----------|--------|--------|------|
| **Quote Status Tracking** | P0 | M | ⬜ | 3 |
| - Draft/Sent/Viewed/Accepted/Expired | P0 | S | ⬜ | 3 |
| - Status change logs | P0 | S | ⬜ | 3 |
| - Visual pipeline view | P1 | S | ⬜ | 3 |
| | | | | |
| **Quick Actions** | P0 | M | ⬜ | 3 |
| - Resend quote | P0 | S | ⬜ | 3 |
| - Duplicate quote | P0 | S | ⬜ | 3 |
| - Mark as Won/Lost | P0 | S | ⬜ | 3 |
| - Add internal note | P1 | S | ⬜ | 3 |
| - Set reminder | P1 | S | ⬜ | 3 |
| | | | | |
| **Search & Filters** | P0 | M | ⬜ | 3 |
| - Global search (quotes, clients, addresses) | P0 | M | ⬜ | 3 |
| - Filter by status | P0 | S | ⬜ | 3 |
| - Filter by date range | P0 | S | ⬜ | 3 |
| - Filter by staff member | P1 | S | ⬜ | 3 |
| - Filter by quote type | P1 | S | ⬜ | 3 |
| - Filter by property price range | P1 | S | ⬜ | 3 |
| - Saved filters | P2 | S | ⬜ | 3 |
| | | | | |
| **Client History** | P0 | M | ⬜ | 4 |
| - View all quotes per client | P0 | S | ⬜ | 4 |
| - View all services per client | P0 | S | ⬜ | 4 |
| - Activity timeline | P0 | M | ⬜ | 4 |
| - Client notes | P1 | S | ⬜ | 4 |
| - Lifetime value calculation | P1 | S | ⬜ | 4 |
| | | | | |
| **Email Notifications (Internal)** | P0 | M | ⬜ | 5 |
| - Quote viewed notification | P0 | S | ⬜ | 5 |
| - Quote accepted notification | P0 | S | ⬜ | 5 |
| - Quote expiring notification | P1 | S | ⬜ | 5 |
| - No response reminder | P1 | S | ⬜ | 5 |
| | | | | |
| **Quote Templates** | P1 | M | ⬜ | 3 |
| - Create templates | P1 | M | ⬜ | 3 |
| - Use templates | P1 | S | ⬜ | 3 |
| - Pre-fill common scenarios | P1 | S | ⬜ | 3 |
| | | | | |
| **Mobile Responsive** | P1 | M | ⬜ | 6 |
| - Dashboard view | P1 | S | ⬜ | 6 |
| - Quote list | P1 | S | ⬜ | 6 |
| - Quote details | P1 | S | ⬜ | 6 |
| - Quick actions | P1 | S | ⬜ | 6 |
| | | | | |
| **Automated Reminders** | P1 | M | ⬜ | 5 |
| - Follow-up reminders | P1 | S | ⬜ | 5 |
| - Expiry warnings | P1 | S | ⬜ | 5 |
| - Task dashboard widget | P1 | M | ⬜ | 5 |
| | | | | |
| **Quote Acceptance Button** | P2 | S | ⬜ | 5 |
| - Accept/decline links in email | P2 | S | ⬜ | 5 |
| - Client feedback form | P2 | S | ⬜ | 5 |
| | | | | |
| **Activity Log** | P2 | M | ⬜ | 4 |
| - Track all actions on quotes | P2 | M | ⬜ | 4 |
| - Audit trail | P2 | S | ⬜ | 4 |
| | | | | |
| **Bulk Actions** | P2 | S | ⬜ | 3 |
| - Select multiple quotes | P2 | S | ⬜ | 3 |
| - Bulk status change | P2 | S | ⬜ | 3 |
| - Bulk export | P2 | S | ⬜ | 3 |
| | | | | |
| **Quick Stats Widget** | P2 | S | ⬜ | 2 |
| - Today's stats | P2 | S | ⬜ | 2 |
| - This month stats | P2 | S | ⬜ | 2 |
| - Conversion rate | P2 | S | ⬜ | 2 |

### Analytics Enhancements

| Feature | Priority | Effort | Status | Week |
|---------|----------|--------|--------|------|
| **Date Range Selection** | P0 | M | ⬜ | 2 |
| - Quick presets (Today, Week, Month, etc.) | P0 | S | ⬜ | 2 |
| - Custom date ranges | P0 | S | ⬜ | 2 |
| - Date comparison (vs previous period) | P0 | M | ⬜ | 2 |
| - Multiple comparison types | P1 | S | ⬜ | 2 |
| | | | | |
| **Visual Comparisons** | P1 | M | ⬜ | 2 |
| - Side-by-side bar charts | P1 | S | ⬜ | 2 |
| - Overlapping line charts | P1 | S | ⬜ | 2 |
| - Percentage change indicators | P1 | S | ⬜ | 2 |
| - Trend arrows | P1 | S | ⬜ | 2 |
| | | | | |
| **Export Options** | P1 | S | ⬜ | 2 |
| - PDF reports | P1 | S | ⬜ | 2 |
| - Excel/CSV export | P1 | S | ⬜ | 2 |
| - Scheduled email reports | P2 | M | ⬜ | 5 |

---

## Phase 2 Features

### Form Builder (Weeks 7-10)

| Feature | Priority | Effort | Status |
|---------|----------|--------|--------|
| **Visual Form Builder** | P0 | L | ⬜ |
| - Drag and drop interface | P0 | L | ⬜ |
| - Field library | P0 | M | ⬜ |
| - Real-time preview | P0 | M | ⬜ |
| - Field configuration | P0 | M | ⬜ |
| | | | |
| **Conditional Logic Engine** | P0 | L | ⬜ |
| - IF/THEN rules | P0 | L | ⬜ |
| - Show/hide fields | P0 | M | ⬜ |
| - Field dependencies | P0 | M | ⬜ |
| - Calculation logic | P0 | M | ⬜ |
| - Testing interface | P1 | S | ⬜ |
| | | | |
| **Dynamic Pricing Rules** | P0 | L | ⬜ |
| - Complex fee structures | P0 | L | ⬜ |
| - Tiered pricing | P0 | M | ⬜ |
| - Percentage-based fees | P0 | M | ⬜ |
| - Conditional discounts | P1 | M | ⬜ |
| - Preview calculator | P1 | S | ⬜ |
| | | | |
| **LBTT Rate Management** | P0 | M | ⬜ |
| - Global rate editor | P0 | M | ⬜ |
| - Version control | P0 | M | ⬜ |
| - Effective dates | P0 | S | ⬜ |
| - Historical rates | P0 | S | ⬜ |
| - One-click updates | P0 | S | ⬜ |
| | | | |
| **Form Instance System** | P0 | M | ⬜ |
| - Template selection | P0 | S | ⬜ |
| - Organization assignment | P0 | S | ⬜ |
| - Customization per client | P0 | M | ⬜ |
| - Publishing workflow | P0 | M | ⬜ |
| - Version management | P1 | M | ⬜ |
| - A/B testing | P2 | L | ⬜ |
| | | | |
| **Client Form Builder** | P1 | M | ⬜ |
| - Simplified builder interface | P1 | M | ⬜ |
| - Limited field types | P1 | S | ⬜ |
| - Fee configuration only | P1 | S | ⬜ |
| - Enable per client | P1 | S | ⬜ |

---

## Phase 3 Features

### Cross-Selling Engine (Weeks 11-16)

| Feature | Priority | Effort | Status |
|---------|----------|--------|--------|
| **Client Classification** | P0 | M | ⬜ |
| - Automatic classification | P0 | M | ⬜ |
| - Client types (first-time buyer, etc.) | P0 | S | ⬜ |
| - Life stage detection | P0 | S | ⬜ |
| - Wealth indicators | P1 | S | ⬜ |
| - Manual override | P1 | S | ⬜ |
| | | | |
| **Cross-Sell Services** | P0 | M | ⬜ |
| - Service catalog | P0 | M | ⬜ |
| - Per-org configuration | P0 | M | ⬜ |
| - Pricing setup | P0 | S | ⬜ |
| - Target criteria | P0 | S | ⬜ |
| | | | |
| **Email Sequence Builder** | P0 | L | ⬜ |
| - Sequence creation | P0 | L | ⬜ |
| - Email editor | P0 | M | ⬜ |
| - Merge fields | P0 | M | ⬜ |
| - Trigger configuration | P0 | M | ⬜ |
| - Timing rules | P0 | M | ⬜ |
| - Testing interface | P1 | S | ⬜ |
| | | | |
| **Content Library** | P1 | M | ⬜ |
| - Upload content | P1 | M | ⬜ |
| - Tag & categorize | P1 | S | ⬜ |
| - Performance tracking | P1 | M | ⬜ |
| | | | |
| **Conversion Tracking** | P0 | M | ⬜ |
| - Funnel stages | P0 | M | ⬜ |
| - Email open tracking | P0 | S | ⬜ |
| - Link click tracking | P0 | S | ⬜ |
| - Appointment booking | P0 | M | ⬜ |
| - Revenue attribution | P0 | M | ⬜ |
| | | | |
| **Analytics Dashboard** | P0 | L | ⬜ |
| - Cross-sell performance | P0 | M | ⬜ |
| - Email sequence stats | P0 | M | ⬜ |
| - Conversion funnel | P0 | M | ⬜ |
| - ROI calculator | P0 | S | ⬜ |
| - Client LTV | P0 | S | ⬜ |
| | | | |
| **Appointment System** | P1 | M | ⬜ |
| - Calendar integration | P1 | M | ⬜ |
| - Booking flow | P1 | M | ⬜ |
| - Automated reminders | P1 | S | ⬜ |
| - No-show tracking | P2 | S | ⬜ |

---

## Post-MVP Enhancements

### Phase 1.5 - Quick Wins (After MVP Launch)

| Feature | Priority | Effort | Timeline |
|---------|----------|--------|----------|
| **SMS Notifications** | P1 | S | Week 7 |
| - SMS to clients | P1 | S | Week 7 |
| - Delivery confirmation | P1 | S | Week 7 |
| | | | |
| **WhatsApp Integration** | P1 | M | Week 8 |
| - Send quotes via WhatsApp | P1 | M | Week 8 |
| - Two-way messaging | P2 | M | Week 9 |
| | | | |
| **Video Quotes** | P2 | S | Week 8 |
| - Record video message | P2 | S | Week 8 |
| - Attach to quote email | P2 | S | Week 8 |
| | | | |
| **E-Signature** | P1 | M | Week 9 |
| - DocuSign integration | P1 | M | Week 9 |
| - Terms acceptance | P1 | S | Week 9 |
| - ID upload | P2 | S | Week 10 |
| | | | |
| **Client Portal** | P2 | L | Week 10-12 |
| - Client login | P2 | M | Week 10 |
| - View quotes | P2 | S | Week 10 |
| - Case progress | P2 | M | Week 11 |
| - Document upload | P2 | M | Week 11 |
| - Chat with solicitor | P2 | M | Week 12 |

### Integration Features (Weeks 13-20)

| Feature | Priority | Effort | Timeline |
|---------|----------|--------|----------|
| **Estate Agent Portal** | P1 | L | Week 13-15 |
| - Agent dashboard | P1 | L | Week 13 |
| - Direct referrals | P1 | M | Week 14 |
| - Commission tracking | P1 | M | Week 14 |
| - Reporting | P1 | S | Week 15 |
| | | | |
| **API Access** | P2 | L | Week 16-18 |
| - REST API | P2 | L | Week 16 |
| - Webhooks | P2 | M | Week 17 |
| - API documentation | P2 | M | Week 17 |
| - Rate limiting | P2 | S | Week 18 |
| | | | |
| **Practice Management Integration** | P2 | L | Week 19-20 |
| - Two-way sync | P2 | L | Week 19 |
| - Auto-create cases | P2 | M | Week 20 |

### Advanced Features (Weeks 21+)

| Feature | Priority | Effort | Timeline |
|---------|----------|--------|----------|
| **Multi-Language Support** | P2 | L | Week 21-22 |
| **Property Data Enrichment** | P2 | M | Week 23-24 |
| **AI Quote Recommendations** | P2 | L | Week 25-26 |
| **Predictive Analytics** | P2 | L | Week 27-28 |
| **Voice-to-Quote** | P2 | M | Week 29-30 |
| **Team Gamification** | P2 | M | Week 31-32 |

### Enterprise Features (Future)

| Feature | Priority | Effort | Timeline |
|---------|----------|--------|----------|
| **White-label Branding** | P2 | L | TBD |
| **Multi-office Support** | P2 | L | TBD |
| **Advanced Permissions** | P2 | M | TBD |
| **Compliance & Audit** | P2 | L | TBD |
| **SSO Integration** | P2 | M | TBD |

---

## Success Metrics

### MVP Launch (Week 6)

**Goals:**
- ✅ 5 solicitor firms onboarded
- ✅ 100+ quotes generated
- ✅ 99.9% uptime
- ✅ < 200ms API response time
- ✅ £1,500 MRR (5 firms @ £300/month)

**Key Metrics:**
- Quote generation time: < 8 minutes (vs 60 minutes manual)
- Staff adoption: 80%+ daily active usage
- Quote conversion rate: 60%+
- Client satisfaction: 4.5+ stars

### Phase 2 Launch (Week 10)

**Goals:**
- ✅ 10+ firms onboarded
- ✅ 10+ custom form templates created
- ✅ 50+ form instances deployed
- ✅ LBTT rates updated (tested)
- ✅ £3,000 MRR

**Key Metrics:**
- Form creation time: < 15 minutes
- Client onboarding time: 50% reduction
- Form customization adoption: 80%

### Phase 3 Launch (Week 16)

**Goals:**
- ✅ 15+ firms onboarded
- ✅ 80% cross-selling adoption
- ✅ 15% cross-sell conversion rate
- ✅ £3,000+ additional revenue per firm/month
- ✅ £6,000+ MRR

**Key Metrics:**
- Email open rate: 70%+
- Email click rate: 30%+
- Cross-sell conversion: 15%+
- Client LTV increase: 75%+ (£1,200 → £2,100+)

### Year 1 Goals (Week 52)

**Revenue:**
- ✅ 25+ firms onboarded
- ✅ £7,500+ MRR (base subscriptions)
- ✅ 90%+ retention rate
- ✅ £90,000+ ARR

**Product:**
- ✅ 500+ quotes per month (platform-wide)
- ✅ 100+ cross-sell conversions per month
- ✅ 50+ custom forms created
- ✅ 99.95% uptime

**Impact:**
- ✅ Firms save 10+ hours/week
- ✅ Firms increase revenue 45%+
- ✅ Average client LTV: £2,100+

---

## Dependencies

### Technical Dependencies

```
Phase 1 (MVP) → Phase 2 (Form Builder)
├── Database schema must be finalized
├── User authentication must be working
├── Quote system must be stable
└── Analytics foundation required

Phase 2 (Form Builder) → Phase 3 (Cross-Selling)
├── Form instance system required
├── Client classification needs form data
├── Email system needs triggers
└── Analytics needs more data points

Phase 3 → Post-MVP Enhancements
├── Core platform stable
├── Cross-selling foundation built
├── API structure defined
└── Integration points identified
```

### Business Dependencies

```
MVP Launch Requirements:
├── 2-3 beta clients identified
├── Pricing finalized
├── Marketing materials ready
├── Support process defined
└── Legal docs (T&Cs, Privacy Policy)

Phase 2 Launch Requirements:
├── MVP feedback incorporated
├── Form templates designed
├── Client training materials
└── 5+ paying clients

Phase 3 Launch Requirements:
├── Email content library created
├── Cross-sell service pricing
├── Case studies from Phase 1/2
└── 10+ paying clients
```

### External Dependencies

```
Services Required:
├── Supabase (Database) - Setup Week 1
├── Vercel (Hosting) - Setup Week 1
├── SendGrid (Email) - Setup Week 2
├── Stripe (Payments) - Setup Week 3
├── Sentry (Monitoring) - Setup Week 1
├── PostHog (Analytics) - Setup Week 2
└── Cloudflare (DNS) - Setup Week 3

APIs Required:
├── Address lookup API - Week 2
├── Land Registry (Scotland) - Phase 2
└── Calendar APIs (Google, Outlook) - Phase 3
```

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database performance issues | High | Low | Proper indexing, connection pooling |
| Third-party API downtime | Medium | Medium | Fallback options, caching |
| Security vulnerability | High | Low | Regular audits, automated scanning |
| Scaling issues | Medium | Low | Load testing, auto-scaling |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low client adoption | High | Medium | Beta program, early feedback |
| Competitor launches similar | Medium | Low | Speed to market, unique features |
| LBTT rate changes | Low | High | Quick update system built-in |
| Legal/compliance issues | High | Low | Legal review, audit trail |

---

## Next Steps

### Immediate (This Week)

1. ✅ Complete all documentation
2. ⬜ Create GitHub repository
3. ⬜ Set up development environment
4. ⬜ Configure CI/CD pipeline
5. ⬜ Begin Week 1 development

### Short-term (Next 2 Weeks)

1. ⬜ Complete project setup
2. ⬜ Implement database schema
3. ⬜ Build authentication
4. ⬜ Create basic UI components
5. ⬜ First backup checkpoint

### Medium-term (Weeks 3-6)

1. ⬜ Complete all MVP features
2. ⬜ Internal testing
3. ⬜ Beta client onboarding
4. ⬜ Bug fixes and polish
5. ⬜ MVP launch

---

**Version Control:**
- Document Version: 1.1
- Last Review: 2024-11-16
- Next Review: After MVP launch
- Owner: Paul @ FunkyFig Automation

**Recent Completions:**
- ✅ LBTT Calculator (November 16, 2024) - See [LBTT-CALCULATOR.md](./LBTT-CALCULATOR.md)
- ✅ Fee Calculator (November 16, 2024) - See [LBTT-CALCULATOR.md](./LBTT-CALCULATOR.md)

---

**Related Documents:**
- [MVP Features](./MVP-FEATURES.md)
- [Post-MVP Features](./POST-MVP-FEATURES.md)
- [Development Checklist](./DEVELOPMENT-CHECKLIST.md)
- [Database Schema](./DATABASE-SCHEMA.md)
- [LBTT Calculator Implementation](./LBTT-CALCULATOR.md)


+---
+
+## ✅ Phase-1-MVP Technical Implementation (for Claude)
+_This section outlines developer tasks tailored for Claude to execute on the `phase-1-mvp` branch._
+
+### Auth & Environment Setup
+- [ ] Remove `@supabase/auth-helpers-nextjs` and add `@supabase/ssr`
+- [ ] Implement `lib/supabase/server.ts` using `createServerClient` with cookies
+- [ ] Implement `lib/supabase/client.ts` using `createBrowserClient` for Client Components
+- [ ] Add runtime validation of environment variables in `lib/env.ts` (Zod) and fail build if missing
+- [ ] Configure Next.js middleware (or route handler) to handle Supabase session token refresh per doc recommendations
+
+### Multi-Step Form System
+- [ ] Port existing HTML/JS wizard into React functional component in `app/(dashboard)/quotes/new/page.tsx`
+- [ ] Use `react-hook-form` + `zod` for validation; disallow “Next” until validations pass
+- [ ] Use shadcn/ui components (`Form`, `Input`, `RadioGroup`, `Button`, `Card`) for consistent design
+- [ ] Implement `useReducer` (or similar) to manage `currentStep`, `formPath`, and branching logic
+- [ ] Refactor LBTT logic into `lib/lbtt.ts` (pure TS function) and import client- and server-side
+
+### API & Data Persistence
+- [ ] Create `POST /api/forms/submit` route:
+  - Validate payload via Zod
+  - Insert into Supabase `form_responses` and `form_field_values` tables
+  - Recompute LBTT server-side and return canonical totals
+- [ ] Write minimal unit tests for `lib/lbtt.ts` covering standard bands, first-time buyer relief, additional property supplement
+- [ ] Ensure “Submit” flow disables the button, displays feedback, and handles errors gracefully (no `alert()`; inline messages)
+
+### Database Schema Preparation (Phase-1)
+- [ ] Create Supabase table `form_responses` with fields:
+  - `id`, `form_key`, `created_at`, `staff_first_name`, `staff_last_name`, `client_email`, `client_phone`, `price`, `lbtt_standard`, `lbtt_ads`, `lbtt_total`, etc.
+- [ ] Create Supabase table `form_field_values` with fields:
+  - `id`, `response_id` (FK → `form_responses`), `field_name`, `field_value` (JSONB)
+- [ ] Ensure basic indexing and tenant-aware columns if multi-tenant support is required later
+
+### UI/UX & Delivery
+- [ ] Replace all `alert()` calls with inline error messaging components
+- [ ] Update progress bar logic: calculate width based on `formPath.length` rather than absolute step number
+- [ ] Add responsive styling tweaks for mobile (buttons, spacing) per brand guidelines
+- [ ] Commit initial scaffold with clear commit messages (`chore(init): …`, `feat(form): …`) following the branch strategy
+
+### Branching & Deployment
+- [ ] Ensure all work occurs on `phase-1-mvp` branch
+- [ ] Once tasks above compile and pass basic QA, open a PR from `phase-1-mvp` → `develop` for internal review
+- [ ] After review and smoke test, merge `develop` → `main`, tag version `v0.1.0-mvp`
+
+---
+
+## What’s Not Covered in Phase-1
+- Form builder UI for creating/editing templates
+- Fully dynamic form definitions from database
+- Analytics dashboard, notifications, client portal
+*(These are reserved for future phases and remain out of scope for this sprint.)*

---

### ✅ Foundational Infrastructure (added Nov 2025)

To ensure long-term scalability and avoid refactoring later, the following lightweight scaffolding has been added in **Phase 1 (MVP)**:

- **tenant_settings** – per-tenant JSON configuration for branding, email, and domain.
- **feature_flags** – per-tenant feature toggle table.
- **Audit fields** – `created_at`, `updated_at`, `deleted_at`, `created_by` on all core tables.
- **Utility hooks**
  - `lib/utils/analytics.ts → emitAnalyticsEvent()` (no-op placeholder)
  - `lib/utils/jobs.ts → enqueueBackgroundJob()` (no-op placeholder)

**Purpose:**  
Provides a clean, extensible foundation for future modules like cross-selling, analytics, notifications, and background processing.  
These changes introduce **zero runtime overhead** and ensure smooth progression into Phases 2–5.


# ConveyPro - Project Roadmap

**Version:** 1.0  
**Last Updated:** November 14, 2024  
**Status:** Ready for Development

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Timeline](#timeline)
3. [MVP Features](#mvp-features)
4. [Phase 2 Features](#phase-2-features)
5. [Phase 3 Features](#phase-3-features)
6. [Post-MVP Enhancements](#post-mvp-enhancements)
7. [Success Metrics](#success-metrics)
8. [Dependencies](#dependencies)

---

## Overview

### Project Phases

```
├── MVP (Weeks 1-6)
│   ├── Core quote generation
│   ├── Document attachments
│   ├── Basic analytics
│   └── Essential workflow features
│
├── Phase 2 (Weeks 7-10)
│   ├── Visual form builder
│   ├── Conditional logic engine
│   ├── Dynamic pricing rules
│   └── LBTT rate management
│
├── Phase 3 (Weeks 11-16)
│   ├── Client classification
│   ├── Email sequence builder
│   ├── Conversion tracking
│   └── Advanced analytics
│
└── Post-MVP (Ongoing)
    ├── Quick wins (Phase 1.5)
    ├── Integration features
    ├── Advanced automation
    └── Enterprise features
```

---

## Timeline

### Overall Schedule

```
Week 1-6:   MVP Development → Launch
Week 7-10:  Phase 2 (Form Builder) → Launch
Week 11-16: Phase 3 (Cross-Selling) → Launch
Week 17+:   Post-MVP Enhancements (Ongoing)

Total to Full Platform: 16 weeks (4 months)
```

### Milestones

```
✅ Week 0:  Documentation Complete
🎯 Week 1:  Project Setup Complete
🎯 Week 2:  Core Quotes Working
🎯 Week 3:  Workflow Features Complete
🎯 Week 4:  Client Management Complete
🎯 Week 5:  Notifications Complete
🎯 Week 6:  MVP LAUNCHED 🚀
🎯 Week 10: Phase 2 LAUNCHED 🚀
🎯 Week 16: Phase 3 LAUNCHED 🚀
```

---

## MVP Features

### Priority Legend
- **P0** = Must have for launch (blocking)
- **P1** = Should have for launch (important)
- **P2** = Nice to have for launch (optional)

### Core Features (From Original Spec)

| Feature | Priority | Effort | Status |
|---------|----------|--------|--------|
| Multi-tenant architecture | P0 | L | ⬜ |
| Authentication & authorization | P0 | M | ⬜ |
| Quote form (staff dashboard) | P0 | L | ⬜ |
| LBTT calculator | P0 | M | ✅ |
| Fee calculator | P0 | M | ✅ |
| PDF generation | P0 | M | ⬜ |
| Document attachments | P0 | S | ⬜ |
| Email delivery | P0 | S | ⬜ |
| Admin dashboard | P0 | L | ⬜ |
| Organization settings | P0 | M | ⬜ |
| User management | P0 | M | ⬜ |
| Fee structure management | P0 | M | ⬜ |
| Basic analytics | P1 | M | ⬜ |

### New MVP Features (Enhanced)

| Feature | Priority | Effort | Status | Week |
|---------|----------|--------|--------|------|
| **Quote Status Tracking** | P0 | M | ⬜ | 3 |
| - Draft/Sent/Viewed/Accepted/Expired | P0 | S | ⬜ | 3 |
| - Status change logs | P0 | S | ⬜ | 3 |
| - Visual pipeline view | P1 | S | ⬜ | 3 |
| | | | | |
| **Quick Actions** | P0 | M | ⬜ | 3 |
| - Resend quote | P0 | S | ⬜ | 3 |
| - Duplicate quote | P0 | S | ⬜ | 3 |
| - Mark as Won/Lost | P0 | S | ⬜ | 3 |
| - Add internal note | P1 | S | ⬜ | 3 |
| - Set reminder | P1 | S | ⬜ | 3 |
| | | | | |
| **Search & Filters** | P0 | M | ⬜ | 3 |
| - Global search (quotes, clients, addresses) | P0 | M | ⬜ | 3 |
| - Filter by status | P0 | S | ⬜ | 3 |
| - Filter by date range | P0 | S | ⬜ | 3 |
| - Filter by staff member | P1 | S | ⬜ | 3 |
| - Filter by quote type | P1 | S | ⬜ | 3 |
| - Filter by property price range | P1 | S | ⬜ | 3 |
| - Saved filters | P2 | S | ⬜ | 3 |
| | | | | |
| **Client History** | P0 | M | ⬜ | 4 |
| - View all quotes per client | P0 | S | ⬜ | 4 |
| - View all services per client | P0 | S | ⬜ | 4 |
| - Activity timeline | P0 | M | ⬜ | 4 |
| - Client notes | P1 | S | ⬜ | 4 |
| - Lifetime value calculation | P1 | S | ⬜ | 4 |
| | | | | |
| **Email Notifications (Internal)** | P0 | M | ⬜ | 5 |
| - Quote viewed notification | P0 | S | ⬜ | 5 |
| - Quote accepted notification | P0 | S | ⬜ | 5 |
| - Quote expiring notification | P1 | S | ⬜ | 5 |
| - No response reminder | P1 | S | ⬜ | 5 |
| | | | | |
| **Quote Templates** | P1 | M | ⬜ | 3 |
| - Create templates | P1 | M | ⬜ | 3 |
| - Use templates | P1 | S | ⬜ | 3 |
| - Pre-fill common scenarios | P1 | S | ⬜ | 3 |
| | | | | |
| **Mobile Responsive** | P1 | M | ⬜ | 6 |
| - Dashboard view | P1 | S | ⬜ | 6 |
| - Quote list | P1 | S | ⬜ | 6 |
| - Quote details | P1 | S | ⬜ | 6 |
| - Quick actions | P1 | S | ⬜ | 6 |
| | | | | |
| **Automated Reminders** | P1 | M | ⬜ | 5 |
| - Follow-up reminders | P1 | S | ⬜ | 5 |
| - Expiry warnings | P1 | S | ⬜ | 5 |
| - Task dashboard widget | P1 | M | ⬜ | 5 |
| | | | | |
| **Quote Acceptance Button** | P2 | S | ⬜ | 5 |
| - Accept/decline links in email | P2 | S | ⬜ | 5 |
| - Client feedback form | P2 | S | ⬜ | 5 |
| | | | | |
| **Activity Log** | P2 | M | ⬜ | 4 |
| - Track all actions on quotes | P2 | M | ⬜ | 4 |
| - Audit trail | P2 | S | ⬜ | 4 |
| | | | | |
| **Bulk Actions** | P2 | S | ⬜ | 3 |
| - Select multiple quotes | P2 | S | ⬜ | 3 |
| - Bulk status change | P2 | S | ⬜ | 3 |
| - Bulk export | P2 | S | ⬜ | 3 |
| | | | | |
| **Quick Stats Widget** | P2 | S | ⬜ | 2 |
| - Today's stats | P2 | S | ⬜ | 2 |
| - This month stats | P2 | S | ⬜ | 2 |
| - Conversion rate | P2 | S | ⬜ | 2 |

### Analytics Enhancements

| Feature | Priority | Effort | Status | Week |
|---------|----------|--------|--------|------|
| **Date Range Selection** | P0 | M | ⬜ | 2 |
| - Quick presets (Today, Week, Month, etc.) | P0 | S | ⬜ | 2 |
| - Custom date ranges | P0 | S | ⬜ | 2 |
| - Date comparison (vs previous period) | P0 | M | ⬜ | 2 |
| - Multiple comparison types | P1 | S | ⬜ | 2 |
| | | | | |
| **Visual Comparisons** | P1 | M | ⬜ | 2 |
| - Side-by-side bar charts | P1 | S | ⬜ | 2 |
| - Overlapping line charts | P1 | S | ⬜ | 2 |
| - Percentage change indicators | P1 | S | ⬜ | 2 |
| - Trend arrows | P1 | S | ⬜ | 2 |
| | | | | |
| **Export Options** | P1 | S | ⬜ | 2 |
| - PDF reports | P1 | S | ⬜ | 2 |
| - Excel/CSV export | P1 | S | ⬜ | 2 |
| - Scheduled email reports | P2 | M | ⬜ | 5 |

---

## Phase 2 Features

### Form Builder (Weeks 7-10)

| Feature | Priority | Effort | Status |
|---------|----------|--------|--------|
| **Visual Form Builder** | P0 | L | ⬜ |
| - Drag and drop interface | P0 | L | ⬜ |
| - Field library | P0 | M | ⬜ |
| - Real-time preview | P0 | M | ⬜ |
| - Field configuration | P0 | M | ⬜ |
| | | | |
| **Conditional Logic Engine** | P0 | L | ⬜ |
| - IF/THEN rules | P0 | L | ⬜ |
| - Show/hide fields | P0 | M | ⬜ |
| - Field dependencies | P0 | M | ⬜ |
| - Calculation logic | P0 | M | ⬜ |
| - Testing interface | P1 | S | ⬜ |
| | | | |
| **Dynamic Pricing Rules** | P0 | L | ⬜ |
| - Complex fee structures | P0 | L | ⬜ |
| - Tiered pricing | P0 | M | ⬜ |
| - Percentage-based fees | P0 | M | ⬜ |
| - Conditional discounts | P1 | M | ⬜ |
| - Preview calculator | P1 | S | ⬜ |
| | | | |
| **LBTT Rate Management** | P0 | M | ⬜ |
| - Global rate editor | P0 | M | ⬜ |
| - Version control | P0 | M | ⬜ |
| - Effective dates | P0 | S | ⬜ |
| - Historical rates | P0 | S | ⬜ |
| - One-click updates | P0 | S | ⬜ |
| | | | |
| **Form Instance System** | P0 | M | ⬜ |
| - Template selection | P0 | S | ⬜ |
| - Organization assignment | P0 | S | ⬜ |
| - Customization per client | P0 | M | ⬜ |
| - Publishing workflow | P0 | M | ⬜ |
| - Version management | P1 | M | ⬜ |
| - A/B testing | P2 | L | ⬜ |
| | | | |
| **Client Form Builder** | P1 | M | ⬜ |
| - Simplified builder interface | P1 | M | ⬜ |
| - Limited field types | P1 | S | ⬜ |
| - Fee configuration only | P1 | S | ⬜ |
| - Enable per client | P1 | S | ⬜ |

---

## Phase 3 Features

### Cross-Selling Engine (Weeks 11-16)

| Feature | Priority | Effort | Status |
|---------|----------|--------|--------|
| **Client Classification** | P0 | M | ⬜ |
| - Automatic classification | P0 | M | ⬜ |
| - Client types (first-time buyer, etc.) | P0 | S | ⬜ |
| - Life stage detection | P0 | S | ⬜ |
| - Wealth indicators | P1 | S | ⬜ |
| - Manual override | P1 | S | ⬜ |
| | | | |
| **Cross-Sell Services** | P0 | M | ⬜ |
| - Service catalog | P0 | M | ⬜ |
| - Per-org configuration | P0 | M | ⬜ |
| - Pricing setup | P0 | S | ⬜ |
| - Target criteria | P0 | S | ⬜ |
| | | | |
| **Email Sequence Builder** | P0 | L | ⬜ |
| - Sequence creation | P0 | L | ⬜ |
| - Email editor | P0 | M | ⬜ |
| - Merge fields | P0 | M | ⬜ |
| - Trigger configuration | P0 | M | ⬜ |
| - Timing rules | P0 | M | ⬜ |
| - Testing interface | P1 | S | ⬜ |
| | | | |
| **Content Library** | P1 | M | ⬜ |
| - Upload content | P1 | M | ⬜ |
| - Tag & categorize | P1 | S | ⬜ |
| - Performance tracking | P1 | M | ⬜ |
| | | | |
| **Conversion Tracking** | P0 | M | ⬜ |
| - Funnel stages | P0 | M | ⬜ |
| - Email open tracking | P0 | S | ⬜ |
| - Link click tracking | P0 | S | ⬜ |
| - Appointment booking | P0 | M | ⬜ |
| - Revenue attribution | P0 | M | ⬜ |
| | | | |
| **Analytics Dashboard** | P0 | L | ⬜ |
| - Cross-sell performance | P0 | M | ⬜ |
| - Email sequence stats | P0 | M | ⬜ |
| - Conversion funnel | P0 | M | ⬜ |
| - ROI calculator | P0 | S | ⬜ |
| - Client LTV | P0 | S | ⬜ |
| | | | |
| **Appointment System** | P1 | M | ⬜ |
| - Calendar integration | P1 | M | ⬜ |
| - Booking flow | P1 | M | ⬜ |
| - Automated reminders | P1 | S | ⬜ |
| - No-show tracking | P2 | S | ⬜ |

---

## Post-MVP Enhancements

### Phase 1.5 - Quick Wins (After MVP Launch)

| Feature | Priority | Effort | Timeline |
|---------|----------|--------|----------|
| **SMS Notifications** | P1 | S | Week 7 |
| - SMS to clients | P1 | S | Week 7 |
| - Delivery confirmation | P1 | S | Week 7 |
| | | | |
| **WhatsApp Integration** | P1 | M | Week 8 |
| - Send quotes via WhatsApp | P1 | M | Week 8 |
| - Two-way messaging | P2 | M | Week 9 |
| | | | |
| **Video Quotes** | P2 | S | Week 8 |
| - Record video message | P2 | S | Week 8 |
| - Attach to quote email | P2 | S | Week 8 |
| | | | |
| **E-Signature** | P1 | M | Week 9 |
| - DocuSign integration | P1 | M | Week 9 |
| - Terms acceptance | P1 | S | Week 9 |
| - ID upload | P2 | S | Week 10 |
| | | | |
| **Client Portal** | P2 | L | Week 10-12 |
| - Client login | P2 | M | Week 10 |
| - View quotes | P2 | S | Week 10 |
| - Case progress | P2 | M | Week 11 |
| - Document upload | P2 | M | Week 11 |
| - Chat with solicitor | P2 | M | Week 12 |

### Integration Features (Weeks 13-20)

| Feature | Priority | Effort | Timeline |
|---------|----------|--------|----------|
| **Estate Agent Portal** | P1 | L | Week 13-15 |
| - Agent dashboard | P1 | L | Week 13 |
| - Direct referrals | P1 | M | Week 14 |
| - Commission tracking | P1 | M | Week 14 |
| - Reporting | P1 | S | Week 15 |
| | | | |
| **API Access** | P2 | L | Week 16-18 |
| - REST API | P2 | L | Week 16 |
| - Webhooks | P2 | M | Week 17 |
| - API documentation | P2 | M | Week 17 |
| - Rate limiting | P2 | S | Week 18 |
| | | | |
| **Practice Management Integration** | P2 | L | Week 19-20 |
| - Two-way sync | P2 | L | Week 19 |
| - Auto-create cases | P2 | M | Week 20 |

### Advanced Features (Weeks 21+)

| Feature | Priority | Effort | Timeline |
|---------|----------|--------|----------|
| **Multi-Language Support** | P2 | L | Week 21-22 |
| **Property Data Enrichment** | P2 | M | Week 23-24 |
| **AI Quote Recommendations** | P2 | L | Week 25-26 |
| **Predictive Analytics** | P2 | L | Week 27-28 |
| **Voice-to-Quote** | P2 | M | Week 29-30 |
| **Team Gamification** | P2 | M | Week 31-32 |

### Enterprise Features (Future)

| Feature | Priority | Effort | Timeline |
|---------|----------|--------|----------|
| **White-label Branding** | P2 | L | TBD |
| **Multi-office Support** | P2 | L | TBD |
| **Advanced Permissions** | P2 | M | TBD |
| **Compliance & Audit** | P2 | L | TBD |
| **SSO Integration** | P2 | M | TBD |

---

## Success Metrics

### MVP Launch (Week 6)

**Goals:**
- ✅ 5 solicitor firms onboarded
- ✅ 100+ quotes generated
- ✅ 99.9% uptime
- ✅ < 200ms API response time
- ✅ £1,500 MRR (5 firms @ £300/month)

**Key Metrics:**
- Quote generation time: < 8 minutes (vs 60 minutes manual)
- Staff adoption: 80%+ daily active usage
- Quote conversion rate: 60%+
- Client satisfaction: 4.5+ stars

### Phase 2 Launch (Week 10)

**Goals:**
- ✅ 10+ firms onboarded
- ✅ 10+ custom form templates created
- ✅ 50+ form instances deployed
- ✅ LBTT rates updated (tested)
- ✅ £3,000 MRR

**Key Metrics:**
- Form creation time: < 15 minutes
- Client onboarding time: 50% reduction
- Form customization adoption: 80%

### Phase 3 Launch (Week 16)

**Goals:**
- ✅ 15+ firms onboarded
- ✅ 80% cross-selling adoption
- ✅ 15% cross-sell conversion rate
- ✅ £3,000+ additional revenue per firm/month
- ✅ £6,000+ MRR

**Key Metrics:**
- Email open rate: 70%+
- Email click rate: 30%+
- Cross-sell conversion: 15%+
- Client LTV increase: 75%+ (£1,200 → £2,100+)

### Year 1 Goals (Week 52)

**Revenue:**
- ✅ 25+ firms onboarded
- ✅ £7,500+ MRR (base subscriptions)
- ✅ 90%+ retention rate
- ✅ £90,000+ ARR

**Product:**
- ✅ 500+ quotes per month (platform-wide)
- ✅ 100+ cross-sell conversions per month
- ✅ 50+ custom forms created
- ✅ 99.95% uptime

**Impact:**
- ✅ Firms save 10+ hours/week
- ✅ Firms increase revenue 45%+
- ✅ Average client LTV: £2,100+

---

## Dependencies

### Technical Dependencies

```
Phase 1 (MVP) → Phase 2 (Form Builder)
├── Database schema must be finalized
├── User authentication must be working
├── Quote system must be stable
└── Analytics foundation required

Phase 2 (Form Builder) → Phase 3 (Cross-Selling)
├── Form instance system required
├── Client classification needs form data
├── Email system needs triggers
└── Analytics needs more data points

Phase 3 → Post-MVP Enhancements
├── Core platform stable
├── Cross-selling foundation built
├── API structure defined
└── Integration points identified
```

### Business Dependencies

```
MVP Launch Requirements:
├── 2-3 beta clients identified
├── Pricing finalized
├── Marketing materials ready
├── Support process defined
└── Legal docs (T&Cs, Privacy Policy)

Phase 2 Launch Requirements:
├── MVP feedback incorporated
├── Form templates designed
├── Client training materials
└── 5+ paying clients

Phase 3 Launch Requirements:
├── Email content library created
├── Cross-sell service pricing
├── Case studies from Phase 1/2
└── 10+ paying clients
```

### External Dependencies

```
Services Required:
├── Supabase (Database) - Setup Week 1
├── Vercel (Hosting) - Setup Week 1
├── SendGrid (Email) - Setup Week 2
├── Stripe (Payments) - Setup Week 3
├── Sentry (Monitoring) - Setup Week 1
├── PostHog (Analytics) - Setup Week 2
└── Cloudflare (DNS) - Setup Week 3

APIs Required:
├── Address lookup API - Week 2
├── Land Registry (Scotland) - Phase 2
└── Calendar APIs (Google, Outlook) - Phase 3
```

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database performance issues | High | Low | Proper indexing, connection pooling |
| Third-party API downtime | Medium | Medium | Fallback options, caching |
| Security vulnerability | High | Low | Regular audits, automated scanning |
| Scaling issues | Medium | Low | Load testing, auto-scaling |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low client adoption | High | Medium | Beta program, early feedback |
| Competitor launches similar | Medium | Low | Speed to market, unique features |
| LBTT rate changes | Low | High | Quick update system built-in |
| Legal/compliance issues | High | Low | Legal review, audit trail |

---

## Next Steps

### Immediate (This Week)

1. ✅ Complete all documentation
2. ⬜ Create GitHub repository
3. ⬜ Set up development environment
4. ⬜ Configure CI/CD pipeline
5. ⬜ Begin Week 1 development

### Short-term (Next 2 Weeks)

1. ⬜ Complete project setup
2. ⬜ Implement database schema
3. ⬜ Build authentication
4. ⬜ Create basic UI components
5. ⬜ First backup checkpoint

### Medium-term (Weeks 3-6)

1. ⬜ Complete all MVP features
2. ⬜ Internal testing
3. ⬜ Beta client onboarding
4. ⬜ Bug fixes and polish
5. ⬜ MVP launch

---

**Version Control:**
- Document Version: 1.1
- Last Review: 2024-11-16
- Next Review: After MVP launch
- Owner: Paul @ FunkyFig Automation

**Recent Completions:**
- ✅ LBTT Calculator (November 16, 2024) - See [LBTT-CALCULATOR.md](./LBTT-CALCULATOR.md)
- ✅ Fee Calculator (November 16, 2024) - See [LBTT-CALCULATOR.md](./LBTT-CALCULATOR.md)

---

**Related Documents:**
- [MVP Features](./MVP-FEATURES.md)
- [Post-MVP Features](./POST-MVP-FEATURES.md)
- [Development Checklist](./DEVELOPMENT-CHECKLIST.md)
- [Database Schema](./DATABASE-SCHEMA.md)
- [LBTT Calculator Implementation](./LBTT-CALCULATOR.md)


+---
+
+## ✅ Phase-1-MVP Technical Implementation (for Claude)
+_This section outlines developer tasks tailored for Claude to execute on the `phase-1-mvp` branch._
+
+### Auth & Environment Setup
+- [ ] Remove `@supabase/auth-helpers-nextjs` and add `@supabase/ssr`
+- [ ] Implement `lib/supabase/server.ts` using `createServerClient` with cookies
+- [ ] Implement `lib/supabase/client.ts` using `createBrowserClient` for Client Components
+- [ ] Add runtime validation of environment variables in `lib/env.ts` (Zod) and fail build if missing
+- [ ] Configure Next.js middleware (or route handler) to handle Supabase session token refresh per doc recommendations
+
+### Multi-Step Form System
+- [ ] Port existing HTML/JS wizard into React functional component in `app/(dashboard)/quotes/new/page.tsx`
+- [ ] Use `react-hook-form` + `zod` for validation; disallow “Next” until validations pass
+- [ ] Use shadcn/ui components (`Form`, `Input`, `RadioGroup`, `Button`, `Card`) for consistent design
+- [ ] Implement `useReducer` (or similar) to manage `currentStep`, `formPath`, and branching logic
+- [ ] Refactor LBTT logic into `lib/lbtt.ts` (pure TS function) and import client- and server-side
+
+### API & Data Persistence
+- [ ] Create `POST /api/forms/submit` route:
+  - Validate payload via Zod
+  - Insert into Supabase `form_responses` and `form_field_values` tables
+  - Recompute LBTT server-side and return canonical totals
+- [ ] Write minimal unit tests for `lib/lbtt.ts` covering standard bands, first-time buyer relief, additional property supplement
+- [ ] Ensure “Submit” flow disables the button, displays feedback, and handles errors gracefully (no `alert()`; inline messages)
+
+### Database Schema Preparation (Phase-1)
+- [ ] Create Supabase table `form_responses` with fields:
+  - `id`, `form_key`, `created_at`, `staff_first_name`, `staff_last_name`, `client_email`, `client_phone`, `price`, `lbtt_standard`, `lbtt_ads`, `lbtt_total`, etc.
+- [ ] Create Supabase table `form_field_values` with fields:
+  - `id`, `response_id` (FK → `form_responses`), `field_name`, `field_value` (JSONB)
+- [ ] Ensure basic indexing and tenant-aware columns if multi-tenant support is required later
+
+### UI/UX & Delivery
+- [ ] Replace all `alert()` calls with inline error messaging components
+- [ ] Update progress bar logic: calculate width based on `formPath.length` rather than absolute step number
+- [ ] Add responsive styling tweaks for mobile (buttons, spacing) per brand guidelines
+- [ ] Commit initial scaffold with clear commit messages (`chore(init): …`, `feat(form): …`) following the branch strategy
+
+### Branching & Deployment
+- [ ] Ensure all work occurs on `phase-1-mvp` branch
+- [ ] Once tasks above compile and pass basic QA, open a PR from `phase-1-mvp` → `develop` for internal review
+- [ ] After review and smoke test, merge `develop` → `main`, tag version `v0.1.0-mvp`
+
+---
+
+## What’s Not Covered in Phase-1
+- Form builder UI for creating/editing templates
+- Fully dynamic form definitions from database
+- Analytics dashboard, notifications, client portal
+*(These are reserved for future phases and remain out of scope for this sprint.)*

---

⏳ Deferred Items (Phase 2+)

These items were evaluated during Phase 1 but intentionally deferred until later phases to avoid premature schema design or speculative engineering:

❌ cross_sell_json

Requirements are not final

May need relational tables instead of a single JSON field

Deferred until cross-sell logic is fully defined

❌ notifications

Architecture undecided (email, in-app, queue, external provider)

Depends on user-facing workflow yet to be built

❌ analytics_events table

Hook (emitAnalyticsEvent) added in Phase 1

Storage schema deferred until analytics strategy chosen
(Supabase vs Posthog vs Mixpanel)

Why deferred?

Avoids future migrations

Requirements unclear until later modules

Lets Phase 1 remain focused and minimal
