# Changelog

All notable changes to ConveyPro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### ✅ Completed - 2025-11-16

#### Email Integration - Fully Tested & Working
- **SendGrid Email Delivery** ✅ TESTED & CONFIRMED WORKING
  - Successfully sends quote emails with PDF attachments
  - From email: `paul@lexovaai.com`
  - Test recipient: `paul@lexovaai.com`
  - Response status: 202 (Accepted)
  - Comprehensive logging added for debugging
  - File: `lib/email/service.ts`

#### UX Improvements
- **Removed Confusing Duplicate "Send to Client" Button**
  - Actions card now only shows for quotes with `status='sent'`
  - Draft quotes show only ONE "Send to Client" button (top right)
  - Added "Status Management" heading to Actions card for clarity
  - Added helper text directing users to correct button
  - Renamed "Move to Draft" → "Revert to Draft"
  - File: `components/quotes/quote-actions.tsx`
  - Commit: `86e2aa2`

### Fixed - 2025-11-16

#### Next.js 15 Compatibility
- **Fixed params/searchParams async requirements**
  - `app/api/quotes/[id]/pdf/route.ts` - Await params
  - `app/api/quotes/[id]/send/route.ts` - Await params
  - `app/(dashboard)/quotes/page.tsx` - Await searchParams
  - `app/(dashboard)/quotes/[id]/page.tsx` - Await params
  - `app/(dashboard)/quotes/new/page.tsx` - Await searchParams

#### Critical Bug Fixes
- **Fixed quote detail page 404 errors**
  - Removed broken `created_by_user:profiles(*)` join
  - Actual column name is `created_by`, not `created_by_user`
  - File: `services/quote.service.ts:327`
  - This bug was causing ALL quote detail pages to fail silently

### Added - 2025-11-15

#### Core Features
- Multi-tenant architecture with RLS policies
- Quote management system (create, view, edit)
- SendGrid email integration with PDF attachments
- PDF quote generation with @react-pdf/renderer
- Property management system
- Team/tenant management
- User authentication via Supabase

## Testing Notes

**Email Sending - Nov 16, 2025**
```
Terminal output confirmed:
📧 Sending email via SendGrid...
  From: paul@lexovaai.com
  To: paul@lexovaai.com
  Subject: Conveyancing Quote Q00004-25 from Test
  Has attachments: true
  API Key (first 10 chars): SG.L1im-_X...
✅ Email sent successfully!
  SendGrid response status: 202
  To: paul@lexovaai.com
```

User confirmed: "yes i got it, you are amazing"

## Known Issues

### Dev Server Caching (Non-blocking)
- Turbopack may aggressively cache components during development
- **Workaround**: Restart computer or kill all node processes + delete `.next` folder
- Does not affect production builds
- Code changes are correct in repository

---

## Version History

- **v0.1.0** - Initial development (Nov 2025)
  - Core quote system
  - Email integration
  - Multi-tenant support
