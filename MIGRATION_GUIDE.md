# Database Migration Guide - Purchase Workflow

## Overview
The runtime database errors you're seeing are because the Purchase Workflow Phase 12 database tables haven't been created in your Supabase database yet. This guide will help you apply the required migrations.

## Error Details
The application is looking for these tables that don't exist:
- `public.matters` - Purchase transaction cases
- `public.matter_tasks` - Task management (referenced as "tasks" in the errors)
- `public.workflow_stages` - Workflow stage definitions
- `public.documents` - Document storage
- `public.offers` - Property offers
- `public.financial_questionnaires` - Financial information
- `public.fee_earner_settings` - Fee earner capacity management
- `public.matter_activities` - Activity log

## Migration Files Required
You need to apply these 9 migration files in order:

1. **20251120000001_enhance_clients_for_purchase_workflow.sql** - Adds fields to clients table
2. **20251120000002_create_matters_table.sql** - Creates matters table
3. **20251120000003_create_workflow_stages.sql** - Creates workflow stages
4. **20251120000004_create_matter_tasks.sql** - Creates matter tasks
5. **20251120000005_create_documents_table.sql** - Creates documents table
6. **20251120000006_create_offers_table.sql** - Creates offers table
7. **20251120000007_create_financial_questionnaires.sql** - Creates financial questionnaires
8. **20251120000008_create_fee_earner_tables.sql** - Creates fee earner tables
9. **20251120000009_create_matter_activities.sql** - Creates activity log

All files are located in: `/supabase/migrations/`

## Method 1: Apply via Supabase Dashboard (RECOMMENDED)

### Step 1: Access your Supabase project
1. Go to https://app.supabase.com
2. Select your ConveyPro project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Apply each migration file
For each migration file (in the order listed above):

1. Open the migration file in VS Code or your editor
2. Copy the entire SQL content
3. In Supabase SQL Editor, click **New query**
4. Paste the SQL content
5. Click **Run** (or press Ctrl+Enter)
6. Verify "Success. No rows returned" message appears
7. Repeat for the next file

### Step 3: Verify tables were created
Run this query in SQL Editor to verify all tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'matters',
    'matter_tasks',
    'matter_activities',
    'workflow_stages',
    'documents',
    'offers',
    'financial_questionnaires',
    'fee_earner_settings',
    'fee_earner_availability'
  )
ORDER BY table_name;
```

You should see all 9 tables listed.

## Method 2: Using Supabase CLI (if you have it installed)

```bash
# Navigate to project directory
cd /home/user/ConveyPro

# Login to Supabase
supabase login

# Link to your remote project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## After Migration

Once migrations are applied:

1. **Restart your dev server** (it's already running, but restart to clear any cached errors):
   ```bash
   # In your terminal where npm run dev is running:
   # Press Ctrl+C to stop
   # Then restart:
   npm run dev
   ```

2. **Refresh your browser** at http://localhost:3000

3. **Verify no more errors** - The console should not show:
   - "Could not find the table 'public.tasks'"
   - "Could not find the table 'public.matters'"

4. **Test the dashboard** - All widgets should load data without errors

## Troubleshooting

### Error: "relation already exists"
If you see this error, it means some tables already exist. This is safe - just continue with the next migration file.

### Error: "column already exists"
Similar to above, this is safe - the migration is idempotent and will skip existing columns.

### Error: "permission denied"
Make sure you're running the SQL as a user with sufficient permissions. In the Supabase dashboard, you should automatically have admin privileges.

### Still seeing errors after migration?
1. Verify your `.env.local` file has the correct Supabase project URL and keys
2. Check that you're connected to the correct Supabase project
3. Run the verification query above to confirm tables exist
4. Clear your browser cache and restart the dev server

## Migration Status Tracking

Create a checklist as you apply each migration:

- [ ] 20251120000001_enhance_clients_for_purchase_workflow.sql
- [ ] 20251120000002_create_matters_table.sql
- [ ] 20251120000003_create_workflow_stages.sql
- [ ] 20251120000004_create_matter_tasks.sql
- [ ] 20251120000005_create_documents_table.sql
- [ ] 20251120000006_create_offers_table.sql
- [ ] 20251120000007_create_financial_questionnaires.sql
- [ ] 20251120000008_create_fee_earner_tables.sql
- [ ] 20251120000009_create_matter_activities.sql

## Need Help?

If you encounter any issues during migration:
1. Check the error message carefully
2. Verify you're applying migrations in the correct order
3. Make sure you're connected to the correct Supabase project
4. Contact support with the specific error message

## What These Migrations Do

### Purchase Workflow Tables
The migrations create a complete 12-stage purchase conveyancing workflow system:

- **matters**: Core transaction cases with client, property, and financial details
- **workflow_stages**: 12-stage workflow configuration (client entry → conveyancing allocation)
- **matter_tasks**: Automated checklist tasks for each workflow stage
- **matter_activities**: Full audit trail and activity timeline
- **documents**: Secure document storage and verification
- **offers**: Property offer creation and approval workflow
- **financial_questionnaires**: Client financial assessment forms
- **fee_earner_settings**: Capacity management and workload balancing
- **fee_earner_availability**: Calendar-based availability tracking

All tables include:
- Row Level Security (RLS) policies for tenant data isolation
- Audit fields (created_at, updated_at, created_by, etc.)
- Soft deletes (deleted_at)
- Performance indexes
- Foreign key constraints for data integrity
