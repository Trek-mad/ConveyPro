# Demo Data Seeder

Creates realistic demo data for ConveyPro Analytics Dashboard and Client Management.

## What It Creates

- **15 Clients** across different life stages:
  - 5 First-Time Buyers
  - 4 Moving Up (growing families)
  - 3 Investors (portfolio/commercial)
  - 3 Downsizing/Retired

- **15 Properties** linked to quotes

- **17 Quotes** with various statuses:
  - 8 Accepted (£67,900 total revenue)
  - 3 Sent (pipeline)
  - 2 Draft (work in progress)
  - 2 Declined (funnel drop-off)

## Features

- **Realistic data** spanning 6 months for impressive analytics charts
- **Cross-sell opportunities** - some clients have used multiple services (will, POA, estate planning)
- **Diverse scenarios** - FTB, investors, downsizing, commercial properties
- **Complete funnel** - shows draft → sent → accepted → declined conversion rates

## Prerequisites

1. **Supabase setup** - Migrations must be run first
2. **Environment variables** - Must have `.env.local` with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. **Active tenant** - At least one tenant must exist in database

## Usage

### Step 1: Install Dependencies

```bash
npm install
```

This will install `tsx` (TypeScript executor) as a dev dependency.

### Step 2: Run the Seeder

```bash
npm run seed
```

Or directly:

```bash
npx tsx scripts/seed-demo-data.ts
```

### Step 3: View Results

Visit these pages to see the demo data:
- `/analytics` - Revenue charts, conversion funnel, cross-sell performance
- `/clients` - Client list with life stage segmentation
- `/clients/[id]` - Individual client with cross-sell opportunities
- `/quotes` - Quote pipeline

## Expected Output

```
🌱 Starting demo data seed...

✓ Using tenant: Demo Law Firm (uuid-here)

📋 Creating clients...
✓ Created 15 clients

🏠 Creating properties...
✓ Created 15 properties

💼 Creating quotes...
✓ Created 17 quotes

📊 Demo Data Summary:

   Clients: 15
   - First-Time Buyers: 5
   - Moving Up: 4
   - Investors: 3
   - Downsizing/Retired: 3

   Properties: 15

   Quotes: 17
   - Accepted: 8
   - Sent: 3
   - Draft: 2
   - Declined: 2

   Total Revenue (Accepted): £67,900

✅ Demo data seeded successfully!
   Visit /analytics and /clients to see the results.
```

## Cross-Sell Examples

The seed creates several clients who have purchased additional services:

- **Emily Chen** - Purchase + Will (£750 cross-sell)
- **David Fraser** - Purchase + Sale + Will (repeat client)
- **Margaret Robertson** - Sale + Will + POA + Estate Planning (full service)
- **Andrew MacLeod** - Purchase + Sale + POA
- **Linda Patel** - Purchase + Estate Planning

This demonstrates the Phase 3 cross-selling potential in the Analytics Dashboard.

## Troubleshooting

### Error: "Missing environment variables"

Ensure `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Error: "No tenant found"

Create a tenant first by:
1. Signing up at `/auth/signup`
2. Completing onboarding
3. Then run the seed script

### Error: "foreign key constraint"

Run migrations first:
```bash
# Ensure clients migration is run
# Migration: supabase/migrations/20241116000000_create_clients_table.sql
```

## Re-running the Seed

The seed script will create **duplicate data** if run multiple times. To reset:

1. **Delete all demo data** (optional - run in Supabase SQL Editor):
```sql
-- Delete quotes for demo clients
DELETE FROM quotes WHERE client_id IN (
  SELECT id FROM clients WHERE email LIKE '%@email.com'
);

-- Delete demo clients
DELETE FROM clients WHERE email LIKE '%@email.com';

-- Delete demo properties
DELETE FROM properties WHERE address_line1 IN (
  '34 Leith Walk', '12 Woodlands Road', '56 South Bridge',
  '89 Dumbarton Road', '23 Nicolson Street', '45 Ravelston Dykes',
  '78 Hyndland Road', '12 Blackford Avenue', '34 Dowanside Road',
  '67 Gorgie Road', '45 Maryhill Road', '89 Commercial Street',
  '23 Bruntsfield Place', '56 Park Circus', '12 Dean Park Crescent'
);
```

2. **Re-run seed**:
```bash
npm run seed
```

## Notes

- All client emails end with `@email.com` for easy identification
- Phone numbers use the fictional UK range: `07700 900xxx`
- Addresses are real Scottish locations but fictional property numbers
- Dates span the last 6 months for trend visualization
- LBTT amounts are calculated using realistic Scottish tax rates
