# ConveyPro - Scottish Conveyancing Quote Platform

Multi-tenant SaaS platform for Scottish solicitor firms with intelligent cross-selling automation

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS v3
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Form Handling**: React Hook Form + Zod
- **State Management**: TanStack React Query
- **Icons**: Lucide React

## Project Structure

```
ConveyPro/
├── app/                    # Next.js App Router pages
├── components/
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase/          # Supabase client configuration
│   └── utils/             # Utility functions (analytics, jobs)
├── hooks/                 # Custom React hooks
├── services/              # API services and business logic
├── types/                 # TypeScript type definitions
├── supabase/
│   └── migrations/        # Database migrations
└── public/                # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### 1. Clone and Install

```bash
git clone https://github.com/Trek-mad/ConveyPro.git
cd ConveyPro
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Get your Supabase credentials from: https://app.supabase.com/project/_/settings/api

### 3. Database Setup

Run migrations in your Supabase project:

1. Go to Supabase Dashboard → SQL Editor
2. Run the migrations in order from `supabase/migrations/`
   - `20241114000001_create_tenant_settings.sql`
   - `20241114000002_create_feature_flags.sql`

Alternatively, use Supabase CLI:

```bash
npx supabase db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Phase 1 Infrastructure

### Database Tables

**tenant_settings**
- Flexible key-value storage for tenant configuration
- JSONB values support complex nested structures
- Unique constraint per tenant + key

**feature_flags**
- Per-tenant feature toggles
- Enables gradual rollouts and A/B testing
- Optional metadata for rollout configuration

### Utility Functions (Placeholders)

**Analytics** (`lib/utils/analytics.ts`)
- `emitAnalyticsEvent()` - Track custom events
- `trackPageView()` - Track page views
- `trackUserAction()` - Track user actions

**Background Jobs** (`lib/utils/jobs.ts`)
- `enqueueBackgroundJob()` - Queue async tasks
- `scheduleJob()` - Schedule jobs for specific time
- `enqueueEmail()` - Queue email sending
- `enqueueNotification()` - Queue notifications

> **Note**: These are placeholder implementations. Full functionality will be added in Phase 2+.

### Audit Fields Pattern

All tables include standard audit fields:
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update (auto-updated via trigger)
- `created_by` - User ID of creator
- `deleted_at` - For soft deletes (to be added)

## Development Roadmap

### ✅ Phase 1 - Foundation (Current)
- Next.js 14 setup with TypeScript
- Supabase integration
- Foundational database tables
- Utility placeholders

### 🚧 Phase 2 - Core Features (Planned)
- User authentication and tenant management
- Quote creation and management
- Property data handling
- Analytics implementation
- Background job queue

### 📋 Phase 3+ - Advanced Features (Future)
- Cross-sell automation
- Notification system
- Advanced analytics dashboard
- Email integration
- PDF generation

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## Contributing

This is a private project. Contact the project owner for contribution guidelines.

## License

Proprietary - All rights reserved
