# Changelog

All notable changes to ConveyPro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-phase-1] - 2024-11-16

**Phase 1 MVP Complete** 🎉

### Git Tags & Branches
- **Tag:** `v1.0-phase-1` (main branch)
- **Tag:** `phase-1-mvp-complete` (feature branch)
- **Branch:** `claude/phase-1-mvp-0151jSm8PvAf8MqE51ryMAwW` (locked)
- **Main:** Protected branch (requires PRs)

### Pull Requests Merged
- **PR #4:** Phase 1 MVP Complete - LBTT Calculator & Email Fixes (12 commits)
- **PR #5:** Codex Build Fixes - Status Icons & Formatting (1 commit)

### Added
- ✅ LBTT (Land and Buildings Transaction Tax) calculator
  - Scottish 2025-26 tax bands (0%, 2%, 5%, 10%, 12%)
  - First-time buyer relief (£175k nil-rate band)
  - Additional Dwelling Supplement (8% flat rate)
  - Mutually exclusive FTB/ADS checkboxes
  - Real-time calculation and breakdown display
- ✅ Fee calculator with tiered structure
- ✅ Email quote sending with PDF attachment
- ✅ PDF generation for quotes
- ✅ Auth layout for login/signup flows
- ✅ Missing quote status icons (pending, expired, cancelled)
- ✅ RLS recursion fix migration for tenant onboarding
- ✅ Comprehensive documentation (LBTT-CALCULATOR.md)

### Fixed

#### Next.js 15/16 Compatibility Fixes
- **Dynamic Routes:** Fixed async params in 7 page routes
  - `app/(dashboard)/quotes/[id]/page.tsx`
  - `app/(dashboard)/quotes/[id]/edit/page.tsx`
  - `app/(dashboard)/properties/[id]/page.tsx`
  - `app/(dashboard)/properties/[id]/edit/page.tsx`
  - `app/(dashboard)/quotes/new/page.tsx`
  - `app/(dashboard)/quotes/page.tsx`
  - `app/(dashboard)/properties/page.tsx`
- **API Routes:** Fixed async params in 2 API routes
  - `app/api/quotes/[id]/send/route.ts`
  - `app/api/quotes/[id]/pdf/route.ts`
- **Component Syntax:** Fixed QuotePDF rendering (function call vs JSX)

#### Database & Types
- **Supabase Types:** Added `Relationships: []` to all 7 tables
  - Fixed GenericSchema constraint violation
  - Resolves `profiles.update()` type errors
  - Tables: tenant_settings, feature_flags, tenants, profiles, tenant_memberships, properties, quotes
- **RLS Policies:** Fixed infinite recursion in tenant_memberships INSERT policy
  - Migration: `20241115200000_fix_tenant_memberships_recursion.sql`
  - Allows first owner membership creation during onboarding
  - Prevents "infinite recursion detected" error

#### Critical Bug Fixes
- **Quote Detail 404:** Removed broken `created_by_user:profiles(*)` join (commit 066a8dd)
- **Email Sending:** Fixed Next.js 16 async params in send/pdf routes (commit e0c87de)
- **Auth Layout:** Restored missing `app/(auth)/layout.tsx` (commit c770c25)
- **Settings Page:** Removed unused imports causing build errors (commit 540f24b)
- **Type Assertions:** Added proper type handling for firm settings role prop
- **Property Edit:** Fixed params.id usage in JSX links

### Technical Debt Resolved
- All TypeScript compilation errors fixed
- Production build passes (`npm run build` ✅)
- All Supabase type issues resolved
- No runtime errors in development or production

### Documentation
- Updated PROJECT-ROADMAP.md (Phase 1 marked complete)
- Created LBTT-CALCULATOR.md (comprehensive implementation guide)
- Updated CHANGELOG.md with all fixes and features

### Commits Summary
- 13 commits total in Phase 1
- All commits merged to main via PRs
- Clean git history maintained

---

## [Unreleased]

### Added
- LBTT (Land and Buildings Transaction Tax) calculator with Scottish 2025-26 rates
- Fee calculator with tiered conveyancing fee structure
- Auto-calculation in quote forms
- Real-time LBTT breakdown display
- First-time buyer relief (extended nil-rate band £145k → £175k)
- Additional Dwelling Supplement (8% ADS)
- Mutually exclusive checkboxes for first-time buyer and ADS options
- Comprehensive LBTT calculator documentation (docs/LBTT-CALCULATOR.md)

### Fixed

#### [2024-11-16] Quote Detail Page 404 Errors - Critical Bug Fix

**Commit:** `066a8dd`

**Symptoms:**
- ALL quote detail pages were failing with 404 errors
- Clicking the eye icon in the Actions column on quotes page resulted in "Quote not found"
- Quote detail pages at `/quotes/[id]` were completely broken

**Root Cause:**
- Wrong column reference in Supabase query
- `services/quote.service.ts:327` had `created_by_user:profiles(*)` join
- This column doesn't exist in the database schema
- Supabase query failed, returning null/error, which was treated as "not found"

**Discovery:**
- Found while testing quote viewing functionality
- Error only occurred when trying to view quote details
- Quotes list page worked fine (no profiles join)

**Fix:**
- Removed the broken `created_by_user:profiles(*)` join from `getQuote()` function
- Query now only joins `property:properties(*)` and `tenant:tenants(*)`
- Both of these relationships exist and work correctly

**Files Changed:**
- `services/quote.service.ts` (line 327)

**Impact:**
- ✅ Quote detail pages now load correctly
- ✅ Action icons in quotes table work
- ✅ Users can view full quote information
- ✅ Edit and send quote functionality restored

**Before:**
```typescript
const { data: quote, error } = await supabase
  .from('quotes')
  .select(`
    *,
    property:properties(*),
    tenant:tenants(*),
    created_by_user:profiles(*)  // ❌ BROKEN - doesn't exist
  `)
```

**After:**
```typescript
const { data: quote, error } = await supabase
  .from('quotes')
  .select(`
    *,
    property:properties(*),
    tenant:tenants(*)  // ✅ WORKS
  `)
```

---

#### [2024-11-16] Next.js 15 Async Params in Dynamic Routes

**Commits:** `ca7891a`, `00e1bc7`

**Problem:**
- Next.js 15 made `params` and `searchParams` async Promises
- Dynamic routes `[id]` were accessing params synchronously
- Caused 404 errors and runtime errors

**Fixed Files:**
- `app/(dashboard)/quotes/[id]/page.tsx`
- `app/(dashboard)/quotes/[id]/edit/page.tsx`
- `app/(dashboard)/properties/[id]/page.tsx`
- `app/(dashboard)/properties/[id]/edit/page.tsx`
- `app/(dashboard)/quotes/new/page.tsx`
- `app/(dashboard)/quotes/page.tsx`
- `app/(dashboard)/properties/page.tsx`

**Solution:**
Changed `params: { id: string }` to `params: Promise<{ id: string }>` and added `await`:
```typescript
// Before
export default async function Page({ params }: PageProps) {
  const result = await getQuote(params.id)
}

// After
export default async function Page({ params }: PageProps) {
  const { id } = await params
  const result = await getQuote(id)
}
```

---

#### [2024-11-16] Email Sending & PDF Generation Broken - Critical Bug Fix

**Commit:** `e0c87de`

**Symptoms:**
- Email sending completely broken - "Send Quote" button failed silently
- PDF generation also failing
- These features worked yesterday before Next.js 15 migration

**Root Cause:**
- API routes also need async params in Next.js 15 (not just page routes)
- `/app/api/quotes/[id]/send/route.ts` - Email sending endpoint
- `/app/api/quotes/[id]/pdf/route.ts` - PDF generation endpoint
- Both were using synchronous `params: { id: string }` instead of async

**Discovery:**
- User reported emails not sending after today's fixes
- Realized API routes were missed in the Next.js 15 async params migration

**Fix:**
Changed API route params from synchronous to async:

```typescript
// Before
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const quoteResult = await getQuote(params.id)
}

// After
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const quoteResult = await getQuote(id)
}
```

**Files Changed:**
- `app/api/quotes/[id]/send/route.ts` (lines 12, 21, 87)
- `app/api/quotes/[id]/pdf/route.ts` (lines 10, 19)

**Impact:**
- ✅ Email sending now works correctly
- ✅ PDF generation restored
- ✅ Quote workflow fully functional end-to-end

**Note:** This was the final piece of the Next.js 15 migration. All dynamic routes (pages AND API routes) now properly handle async params.

---

#### [2024-11-16] Settings Layout Unused Imports

**Commit:** `540f24b`

**Problem:**
- `app/(dashboard)/settings/layout.tsx` imported `usePathname` (client hook)
- Layout is a server component (`async function`)
- Build error: "You're importing a component that needs usePathname"

**Solution:**
- Removed unused `usePathname` import
- Removed unused `Link` import
- `SettingsNav` component already uses `'use client'` directive correctly

---

#### [2024-11-16] LBTT Calculator Implementation Fixes

**Commits:** `1174ef8`, `a334d04`, `995f731`, `691e1e9`

**1. TypeScript Export Conflict**
- Problem: Duplicate `formatCurrency` exports from `lbtt.ts` and `fees.ts`
- Fix: Made both functions internal (removed export keyword)
- Result: Module imports work correctly

**2. ADS Rate Incorrect**
- Problem: ADS was 6% (should be 8%)
- Fix: Updated `ADS_RATE` from 0.06 to 0.08
- Result: £200k property shows £16,000 ADS (was £12,000)

**3. First-Time Buyer Calculation Wrong**
- Problem: Only worked for properties ≤ £175k, incorrectly subtracted £175k threshold
- Fix: Implemented proper extended nil-rate band system with `FIRST_TIME_BUYER_BANDS`
- Result: £200k property shows £500 LBTT for first-time buyers (£25k @ 2%)

**4. Mutual Exclusion Missing**
- Problem: Could select both first-time buyer and ADS simultaneously
- Fix: Added disabled states and onChange handlers to enforce mutual exclusion
- Result: Selecting one option disables and unchecks the other

---

#### [2024-11-16] Duplicate Content in Documentation

**Commit:** `5dea518`

**Problem:**
- `docs/PROJECT-ROADMAP.md` had entire document duplicated (1,322 lines instead of 651)
- Made file difficult to read and maintain

**Fix:**
- Removed duplicate content starting at line 654
- File now properly ends at line 651

---

## [Previous Sessions]

### Session Progress
- Implemented multi-tenant architecture
- Set up authentication and authorization
- Created quote management system
- Implemented properties management
- Added team management
- Implemented PDF generation
- Added email sending functionality
- Set up analytics dashboard foundation

For detailed history, see `SESSION-PROGRESS.md` and git commit history.

---

## Notes

### Known Issues
- None currently blocking functionality

### Upcoming Features
- Search functionality across quotes and clients
- Enhanced analytics dashboard
- Quote templates
- Automated email notifications
- Client portal

### Breaking Changes
- None

---

**Documentation Updated:** 2024-11-16
**Last Reviewed:** 2024-11-16
