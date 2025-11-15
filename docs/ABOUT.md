# ConveyPro

> **Intelligent Scottish Conveyancing Quote Platform with Cross-Selling Automation**

Transform one-off conveyancing clients into lifetime relationships through smart quote generation and automated educational email sequences.

---

## 📋 Table of Contents

- [Overview](#overview)
- [What Does It Do?](#what-does-it-do)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Branch Strategy](#branch-strategy)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [Support](#support)

---

## Overview

**ConveyPro** is a white-label SaaS platform built for Scottish solicitor firms that:

1. **Generates professional conveyancing quotes** with instant LBTT calculations
2. **Provides full admin control** so solicitors can customize fees and branding
3. **Automates cross-selling** through intelligent email sequences that convert conveyancing clients into Wills, POA, and Executry clients

### Business Model

- **Target Market:** Scottish solicitor firms (3-20 staff)
- **Pricing:** £200-300/month per firm
- **Revenue Model:** SaaS subscription + optional add-ons
- **ROI for Clients:** 45%+ revenue increase through cross-selling

### Development Phases

- **Phase 1 (Weeks 1-6):** Core Platform MVP - Quote forms, LBTT calculator, admin dashboard
- **Phase 2 (Weeks 7-10):** Advanced Form Builder - Visual builder, conditional logic, dynamic pricing
- **Phase 3 (Weeks 11-16):** Cross-Selling Engine - Email sequences, client classification, analytics

---

## What Does It Do?

### For Solicitor Firms

**Quote Generation:**
- Staff dashboard for solicitors and agents
- Take client details (phone, in-person, email)
- Input details into quote form
- Instant LBTT (Land and Buildings Transaction Tax) calculation
- Automatic legal fee breakdown
- Attach additional documents (T&Cs, service guides, brochures)
- Preview before sending
- Professional branded PDF quote generated
- Email delivery directly to client with all attachments

**Admin Dashboard:**
- Customize legal fees (tiered pricing)
- Update branding (logo, colors)
- Manage staff users
- View all quotes and clients
- Track conversion rates

**Cross-Selling Automation:**
- Identifies upsell opportunities (Wills, POA, Executry)
- Sends educational email sequences at optimal times
- Tracks conversions and lifetime value
- Increases average client value from £1,200 → £2,350+

### For FunkyFig (You)

**Super Admin Form Builder:**
- Visual drag-drop form builder (no code)
- Conditional logic engine
- Deploy custom forms per client instantly
- Update LBTT rates globally with one click
- A/B test form variations

**Scalability:**
- One update applies to 100+ firms
- No custom development per client
- Each firm gets exactly what they need
- Monthly recurring revenue

### For End Users (Homebuyers)

- Solicitor/agent gathers their details (phone call, in-person, email)
- Receive professional branded PDF quote via email
- Quote includes full LBTT breakdown and fee details
- May include additional documents (T&Cs, service guides, etc.)
- Clear pricing, no surprises
- Receive helpful educational emails during conveyancing

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** React Hook Form + Zod
- **State:** Zustand + React Query

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Magic Links)
- **Storage:** Supabase Storage
- **API:** Next.js API Routes

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase Cloud (Frankfurt - GDPR)
- **CDN:** Cloudflare
- **Email:** SendGrid
- **Payments:** Stripe

### Development
- **Version Control:** GitHub
- **CI/CD:** GitHub Actions
- **Testing:** Vitest + Playwright
- **Monitoring:** Sentry + PostHog
- **IDE:** Claude Code (Web)

---

## Getting Started

### Prerequisites

- **Node.js:** v20 or higher
- **npm:** v10 or higher
- **GitHub Account:** With access to this repository
- **Supabase Account:** Free tier sufficient for development
- **Vercel Account:** Free tier sufficient for development

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/funkyfig/conveypro.git
   cd conveypro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your credentials:
   - Supabase URL and keys
   - SendGrid API key
   - Other service credentials

4. **Start local Supabase**
   ```bash
   npx supabase start
   ```

5. **Run database migrations**
   ```bash
   npx supabase db push
   ```

6. **Generate TypeScript types**
   ```bash
   npm run db:types
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to `http://localhost:3000`

### First Time Setup Checklist

- [ ] GitHub repository cloned
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Supabase project created
- [ ] Database migrated
- [ ] Development server running
- [ ] Can access localhost:3000

---

## Project Structure

```
conveypro/
├── .github/
│   └── workflows/          # GitHub Actions (CI/CD)
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/       # Authentication pages
│   │   ├── (dashboard)/  # Admin dashboard
│   │   ├── (public)/     # Public quote forms
│   │   └── api/          # API routes
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── quote/        # Quote form components
│   │   ├── dashboard/    # Dashboard components
│   │   └── settings/     # Settings components
│   ├── lib/              # Utilities and helpers
│   │   ├── supabase/     # Supabase client
│   │   ├── calculations/ # LBTT & fee calculations
│   │   ├── pdf/          # PDF generation
│   │   └── email/        # Email templates
│   └── types/            # TypeScript types
├── supabase/
│   ├── migrations/        # Database migrations
│   └── functions/         # Edge functions
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── docs/                  # Documentation
└── package.json
```

---

## Development Workflow

### Daily Workflow

1. **Start of Day**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-feature-branch
   npm run dev
   ```

2. **During Development**
   - Write code
   - Write tests
   - Run tests: `npm test`
   - Commit frequently with clear messages

3. **End of Day**
   ```bash
   git add .
   git commit -m "feat: descriptive commit message"
   git push origin your-feature-branch
   ```

### Commit Message Format

Use conventional commits:

```
feat: add LBTT calculation for residential properties
fix: correct fee calculation for properties over £1M
docs: update README with setup instructions
test: add unit tests for quote generation
refactor: simplify conditional logic in form builder
chore: update dependencies
```

### Code Quality Checks

Before committing:

```bash
npm run lint              # ESLint
npm run type-check        # TypeScript
npm run format            # Prettier
npm run test              # All tests
```

---

## Branch Strategy

### **CRITICAL: Never Work on Main!**

We follow a strict branching strategy with backups at every milestone.

### Branch Structure

```
main (PROTECTED - Production)
├── develop (PROTECTED - Integration)
├── phase-1-mvp (Active Development)
│   ├── phase-1-backup-1 (LOCKED)
│   ├── phase-1-backup-2 (LOCKED)
│   └── phase-1-final (LOCKED)
├── phase-2-form-builder (Future)
└── phase-3-cross-selling (Future)
```

### Creating a New Phase Branch

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create phase branch
git checkout -b phase-1-mvp
git push -u origin phase-1-mvp
```

### Creating Backup Points

After completing major milestones:

```bash
# Create backup branch
git checkout -b phase-1-backup-1-auth-complete
git push -u origin phase-1-backup-1-auth-complete

# Lock on GitHub:
# Settings → Branches → Add rule: phase-1-backup-*
# Enable: Require pull request reviews

# Continue working on main phase branch
git checkout phase-1-mvp
```

### Merging to Develop

```bash
# Ensure all tests pass
npm run test:all

# Create PR: phase-1-mvp → develop
gh pr create --base develop --head phase-1-mvp \
  --title "Phase 1: Core Platform MVP" \
  --body "Complete Phase 1 implementation"

# After PR approved and merged
git checkout develop
git pull origin develop
```

### Merging to Main (Production)

```bash
# Create final backup of phase
git checkout phase-1-mvp
git checkout -b phase-1-final
git push -u origin phase-1-final

# Lock phase-1-final on GitHub (never allow changes)

# Create PR: develop → main
gh pr create --base main --head develop \
  --title "Deploy Phase 1 to Production" \
  --body "Production-ready Phase 1"

# After deployment, tag release
git checkout main
git pull origin main
git tag -a v1.0.0-phase1 -m "Phase 1: Core Platform MVP"
git push origin v1.0.0-phase1

# Create main backup
git checkout -b main-backup-phase1-complete
git push -u origin main-backup-phase1-complete
```

### Branch Protection Rules

**Main Branch:**
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Require linear history

**Develop Branch:**
- ✅ Require pull request reviews
- ✅ Require status checks to pass

**Backup Branches (phase-*-backup-*):**
- ✅ Locked after creation (no one can push)

---

## Deployment

### Environments

- **Development:** `http://localhost:3000`
- **Staging:** `https://conveypro-git-develop.vercel.app`
- **Production:** `https://conveypro.co.uk`

### Automatic Deployments

GitHub Actions automatically deploys:

- **Every push to `main`** → Production
- **Every push to `develop`** → Staging
- **Every PR** → Preview deployment

### Manual Deployment

```bash
# Deploy to production (requires Vercel CLI)
vercel --prod

# Deploy preview
vercel
```

### Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SENDGRID_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_APP_URL`

---

## Testing

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/
│   ├── calculations/
│   │   ├── lbtt.test.ts
│   │   └── fees.test.ts
│   └── utils/
│       └── validation.test.ts
├── integration/
│   ├── api/
│   │   ├── quotes.test.ts
│   │   └── clients.test.ts
│   └── database/
│       └── rls.test.ts
└── e2e/
    ├── quote-flow.spec.ts
    ├── admin-dashboard.spec.ts
    └── settings.spec.ts
```

### Writing Tests

**Unit Test Example:**
```typescript
import { calculateLBTT } from '@/lib/calculations/lbtt'

describe('LBTT Calculator', () => {
  it('calculates standard residential LBTT correctly', () => {
    const result = calculateLBTT({
      propertyPrice: 250000,
      rateType: 'residential',
      date: new Date('2024-01-01')
    })
    
    expect(result.totalTax).toBe(2100)
  })
})
```

**E2E Test Example:**
```typescript
import { test, expect } from '@playwright/test'

test('user can generate a quote', async ({ page }) => {
  await page.goto('/quote')
  await page.fill('[name="propertyPrice"]', '250000')
  await page.click('button:has-text("Generate Quote")')
  await expect(page.locator('text=£2,100')).toBeVisible()
})
```

---

## Database Management

### Migrations

```bash
# Create new migration
npx supabase migration new migration_name

# Run migrations locally
npx supabase db push

# Run migrations on remote
npx supabase db push --db-url <remote-url>

# Reset database (DEV ONLY!)
npx supabase db reset
```

### Generating Types

After schema changes:

```bash
npm run db:types
```

This updates `src/types/database.types.ts` with latest schema.

### Seed Data

```bash
npm run db:seed
```

Creates test organizations, users, and sample data.

---

## Contributing

### Code Style

- **TypeScript:** Strict mode enabled
- **ESLint:** Enforce code quality
- **Prettier:** Auto-format on save
- **Imports:** Absolute imports using `@/` prefix

### Pull Request Process

1. Create feature branch from `develop`
2. Write code + tests
3. Ensure all tests pass
4. Create PR with clear description
5. Wait for review
6. Address feedback
7. Merge after approval

### Review Checklist

- [ ] Code follows style guide
- [ ] Tests written and passing
- [ ] TypeScript types correct
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Environment variables documented
- [ ] Performance considered
- [ ] Security reviewed

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check API health
curl https://conveypro.co.uk/api/health

# Check database connection
npm run db:health
```

### Logs

- **Application Logs:** Vercel Dashboard
- **Error Tracking:** Sentry
- **Analytics:** PostHog
- **Database:** Supabase Dashboard

### Backup Schedule

**Automated:**
- Database: Daily (Supabase)
- Code: Every push (GitHub)
- Branch backups: After each milestone

**Manual:**
- Create backup before major changes
- Download database backup monthly
- Export analytics quarterly

---

## Troubleshooting

### Common Issues

**Issue: Supabase RLS blocking queries**
```typescript
// Solution: Set organization context
await supabase.rpc('set_config', {
  config_name: 'app.current_organization_id',
  config_value: organizationId
})
```

**Issue: Next.js not rebuilding**
```bash
rm -rf .next
npm run dev
```

**Issue: Database migration fails**
```bash
npx supabase db reset
npx supabase db push
```

**Issue: TypeScript errors after schema change**
```bash
npm run db:types
```

**Issue: Tests failing locally but passing on CI**
- Check environment variables
- Ensure database is seeded
- Clear test cache: `npm run test:clean`

### Getting Help

1. **Check Documentation:** `/docs` folder
2. **Search Issues:** GitHub Issues
3. **Ask Team:** Slack #conveypro channel
4. **Check Logs:** Sentry + Vercel

---

## Security

### Best Practices

- ✅ Never commit `.env` files
- ✅ Use environment variables for secrets
- ✅ Enable RLS on all tables
- ✅ Validate all user input (Zod schemas)
- ✅ Use parameterized queries (Supabase client)
- ✅ Audit log all sensitive actions
- ✅ Rate limit API endpoints

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Email: security@funkyfig.com

---

## Performance

### Goals

- **First Contentful Paint:** < 1s
- **Time to Interactive:** < 3s
- **API Response Time:** < 200ms (p95)
- **Database Query Time:** < 50ms (p95)

### Optimization Checklist

- [ ] Images optimized (next/image)
- [ ] Code split (React.lazy)
- [ ] Database indexes on query fields
- [ ] API routes cached appropriately
- [ ] Static pages generated at build time
- [ ] CSS purged (Tailwind)

---

## Useful Commands

### Development

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run type-check       # Check TypeScript
```

### Testing

```bash
npm test                 # Run all tests
npm run test:unit        # Unit tests
npm run test:e2e         # E2E tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Database

```bash
npm run db:start         # Start local Supabase
npm run db:stop          # Stop local Supabase
npm run db:reset         # Reset database
npm run db:push          # Run migrations
npm run db:types         # Generate types
npm run db:seed          # Seed test data
```

### Git

```bash
git checkout -b <branch>           # Create branch
git push -u origin <branch>        # Push new branch
git merge <branch>                 # Merge branch
git tag -a <tag> -m <message>      # Create tag
git push origin --tags             # Push tags
```

---

## Project Roadmap

### Phase 1: Core Platform MVP (Weeks 1-6) ✅
- [x] Multi-tenant architecture
- [x] Authentication & authorization
- [x] Quote form with LBTT calculator
- [x] Admin dashboard
- [x] Fee structure management
- [x] PDF generation
- [ ] **TARGET LAUNCH:** Week 6

### Phase 2: Form Builder (Weeks 7-10) 🚧
- [ ] Visual drag-drop builder
- [ ] Conditional logic engine
- [ ] Dynamic pricing rules
- [ ] LBTT rate management
- [ ] Per-client customization
- [ ] **TARGET LAUNCH:** Week 10

### Phase 3: Cross-Selling (Weeks 11-16) 📋
- [ ] Client classification
- [ ] Email sequence builder
- [ ] Conversion tracking
- [ ] Analytics dashboard
- [ ] Appointment booking
- [ ] **TARGET LAUNCH:** Week 16

---

## Success Metrics

### Phase 1
- 5 solicitor firms onboarded
- 100+ quotes generated
- 99.9% uptime
- < 200ms API response time
- £1,500 MRR

### Phase 2
- 10+ custom form templates created
- 50% reduction in onboarding time
- £3,000 MRR

### Phase 3
- 80% cross-selling adoption
- 15% cross-sell conversion rate
- £3,000+ additional revenue per firm
- £30,000+ total MRR

---

## License

**Proprietary Software**

Copyright © 2024 FunkyFig Automation. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## Contact

**FunkyFig Automation**
- **Email:** paul@funkyfig.com
- **Website:** https://funkyfig.com
- **Location:** Glasgow, Scotland

**Project Lead:** Paul  
**Development:** Claude Code + GitHub

---

## Acknowledgments

Built with:
- Next.js by Vercel
- Supabase
- shadcn/ui
- Tailwind CSS
- Claude (Anthropic)

---

## Quick Links

- **Documentation:** `/docs`
- **API Docs:** `/docs/API.md`
- **Deployment Guide:** `/docs/DEPLOYMENT.md`
- **Branch Strategy:** `/docs/BRANCHING.md`
- **Complete Spec:** `ConveyPro-COMPLETE-SPEC.md`

---

**Version:** 1.0.0  
**Last Updated:** November 14, 2024  
**Status:** Ready for Phase 1 Development 🚀
