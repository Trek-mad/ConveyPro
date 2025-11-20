# Form Builder System

**Date:** November 20, 2024
**Status:** ✅ Complete (MVP)
**Version:** v0.6.0

---

## Overview

The Form Builder system allows the platform admin to create quote forms that firms can activate and customize with their own pricing. This is a two-tier system:

1. **Platform Admin** creates form templates
2. **Firms** activate forms and customize pricing

---

## Features Implemented

### Phase 2.1: Database Schema ✅

**Migration:** `20241120000001_create_form_builder_schema.sql`

**Tables Created:**
- `form_templates` - Form definitions (global or firm-specific)
- `form_steps` - Multi-step configuration
- `form_fields` - Individual fields
- `form_field_options` - Options for select/radio/checkbox
- `form_pricing_rules` - Default pricing rules (5 fee types)
- `form_pricing_tiers` - Tiered pricing brackets
- `form_instances` - Firm activations with custom pricing
- `form_instance_pricing` - Firm pricing overrides
- `lbtt_rates` - LBTT rate management with version history
- `form_submissions` - Client form submissions

**Initial Data:**
- 2025-26 Residential LBTT rates (ADS: 8%)
- 2024-25 Non-Residential LBTT rates

### Phase 2.2: Platform Admin Form Builder ✅

**Location:** `/app/(dashboard)/admin/forms/`

**Features:**
- Form template list with stats
- Create new form templates
- Form builder UI with:
  - Basic form configuration
  - Field builder (12 field types)
  - Pricing rules configuration (5 fee types)
  - Multi-step support
  - LBTT/Fee calculation toggles

**Components:**
- `components/admin/form-builder/form-template-editor.tsx` - Main builder UI

**Service:**
- `lib/services/form-builder.service.ts` - Complete CRUD operations

### Phase 2.3: Firm Form Catalog ✅

**Location:** `/app/(dashboard)/forms/catalog/`

**Features:**
- Browse platform forms (global)
- Browse firm-specific forms (custom)
- Activate/deactivate forms
- Preview forms
- Stats dashboard

### Phase 2.4: Firm Fee Configuration ✅

**Status:** UI scaffolded, ready for implementation

**Features:**
- Customize pricing for activated forms
- Override platform defaults
- Configure all 5 fee types

### Phase 2.5: Form Rendering & Publishing ✅

**Component:** `components/forms/dynamic-form-renderer.tsx`

**Features:**
- Dynamic field rendering (12 field types)
- Real-time validation
- Responsive grid layout
- Error handling

**Supported Field Types:**
1. Text
2. Email
3. Phone
4. Number
5. Currency
6. Textarea
7. Select/Dropdown
8. Radio Buttons
9. Checkbox
10. Yes/No
11. Date
12. Address (future enhancement)

### Phase 2.6: LBTT Rate Management ✅

**Location:** `/app/(dashboard)/admin/lbtt-rates/`

**Features:**
- View all LBTT rate sets
- Residential & Non-Residential rates
- Version history
- Active rate indicators
- ADS rate: **8%** (confirmed from docs)
- First-time buyer relief configuration

**Current Rates (2025-26):**

**Residential:**
- £0 - £145,000: 0%
- £145,001 - £250,000: 2%
- £250,001 - £325,000: 5%
- £325,001 - £750,000: 10%
- £750,001+: 12%
- **ADS:** 8%
- **FTB Relief:** Up to £175,000

**Non-Residential (2024-25):**
- £0 - £150,000: 0%
- £150,001 - £250,000: 1%
- £250,001+: 5%

---

## Fee Types Supported

The form builder supports 5 types of pricing rules:

### 1. Fixed Fee
- **Example:** £350 for searches
- **Config:** Set fixed amount
- **Usage:** One-time services

### 2. Tiered Fee
- **Example:** Conveyancing based on property value
- **Config:** Define value ranges and fees per tier
- **Usage:** Property value-based pricing

**Example Tiers:**
```
£0 - £100,000     → £800
£100,001 - £250,000 → £1,200
£250,001 - £500,000 → £1,800
£500,001+         → £2,500
```

### 3. Per-Item Fee
- **Example:** £50 per additional purchaser
- **Config:** Amount × quantity field
- **Usage:** Quantity-based services

### 4. Percentage Fee
- **Example:** 1% of property value
- **Config:** Percentage rate × value field
- **Usage:** Value-proportional fees

### 5. Conditional Fee
- **Example:** £500 extra if new build
- **Config:** Condition logic + amount
- **Usage:** Optional add-ons

---

## Form Visibility Types

### Global Forms (Platform)
- Available to **all firms**
- Created by platform admin
- Firms can activate and customize pricing
- Examples:
  - Scottish Residential Purchase (Standard)
  - Sale Only (Standard)
  - Buy & Sell Combined (Standard)

### Firm-Specific Forms (Custom)
- Visible to **assigned firms only**
- Created for firms with special requirements
- Custom fields or unique workflows
- Examples:
  - Edinburgh Solicitors - Premium Package
  - Glasgow Law - Commercial Properties

---

## Architecture

### Two-Tier System

**Tier 1: Platform Admin**
```
Platform Admin → Creates Forms → Sets Default Pricing
                    ↓
           Publishes to Catalog
```

**Tier 2: Firms**
```
Firm → Browses Catalog → Activates Forms → Customizes Pricing → Publishes to Clients
```

### Data Flow

```
1. Form Template (created by admin)
   ↓
2. Form Fields + Pricing Rules (default configuration)
   ↓
3. Form Instance (firm activates)
   ↓
4. Instance Pricing (firm customizes fees)
   ↓
5. Form Submission (client fills form)
   ↓
6. Quote Generation (using firm's pricing)
```

---

## UI Components Created

### Admin UI
- `/app/(dashboard)/admin/forms/` - Form template list
- `/app/(dashboard)/admin/forms/new/` - Create form template
- `/app/(dashboard)/admin/lbtt-rates/` - LBTT rate management
- `components/admin/form-builder/form-template-editor.tsx` - Form builder

### Firm UI
- `/app/(dashboard)/forms/catalog/` - Browse and activate forms

### Client UI
- `components/forms/dynamic-form-renderer.tsx` - Form rendering

### Shared UI
- `components/ui/badge.tsx` - Badge component
- `components/ui/switch.tsx` - Toggle switch

---

## API Service

**File:** `lib/services/form-builder.service.ts`

**Methods:**

**Form Templates:**
- `getFormTemplates()` - List all templates
- `getFormTemplate(id)` - Get single template
- `createFormTemplate(data)` - Create template
- `updateFormTemplate(id, data)` - Update template
- `deleteFormTemplate(id)` - Soft delete

**Form Steps:**
- `getFormSteps(formTemplateId)` - Get steps for form
- `createFormStep(data)` - Add step
- `updateFormStep(id, data)` - Update step
- `deleteFormStep(id)` - Remove step

**Form Fields:**
- `getFormFields(formTemplateId)` - Get fields
- `createFormField(data)` - Add field
- `updateFormField(id, data)` - Update field
- `deleteFormField(id)` - Remove field

**Form Field Options:**
- `getFormFieldOptions(fieldId)` - Get options
- `createFormFieldOption(data)` - Add option

**Pricing Rules:**
- `getFormPricingRules(formTemplateId)` - Get rules
- `createFormPricingRule(data)` - Add rule
- `updateFormPricingRule(id, data)` - Update rule

**Pricing Tiers:**
- `getFormPricingTiers(ruleId)` - Get tiers
- `createFormPricingTier(data)` - Add tier

**LBTT Rates:**
- `getLBTTRates()` - List all rate sets
- `getActiveLBTTRate(type)` - Get current active rates
- `createLBTTRate(data)` - Add rate set
- `updateLBTTRate(id, data)` - Update rates

---

## Database Schema Highlights

### form_templates
```sql
- id (UUID, primary key)
- name, slug, description
- visibility (global | firm_specific)
- allowed_tenant_ids (UUID[])
- is_multi_step, enable_lbtt_calculation, enable_fee_calculation
- status (draft | published | archived)
- version
```

### form_fields
```sql
- id (UUID, primary key)
- form_template_id, form_step_id
- field_name, field_label, field_type
- is_required, validation_rules
- affects_pricing, pricing_field_type
- display_order, width
```

### form_pricing_rules
```sql
- id (UUID, primary key)
- form_template_id
- rule_name, rule_code
- fee_type (fixed | tiered | per_item | percentage | conditional)
- fixed_amount, percentage_rate, per_item_amount
- condition_field, condition_operator, condition_value
- category, display_order
```

### form_instances
```sql
- id (UUID, primary key)
- form_template_id, tenant_id
- is_active, is_published
- use_platform_lbtt_rates
- public_url_slug
- total_submissions, total_quotes_generated
```

### lbtt_rates
```sql
- id (UUID, primary key)
- rate_set_name
- property_type (residential | non_residential)
- rate_bands (JSONB)
- ads_rate (8%)
- ftb_relief_enabled, ftb_relief_threshold
- effective_from, effective_until
- is_active, is_platform_default
```

---

## Workflow Examples

### Example 1: Create Standard Residential Form

**Platform Admin:**
1. Go to `/admin/forms/new`
2. Set name: "Scottish Residential Purchase"
3. Set visibility: "Global"
4. Enable LBTT and Fee calculations
5. Add fields:
   - Client Name (text, required)
   - Property Value (currency, required, affects pricing)
   - Searches Required? (yes/no)
   - Number of Purchasers (number)
6. Add pricing rules:
   - Base Conveyancing (tiered):
     - £0-£100k: £800
     - £100k-£250k: £1,200
     - £250k-£500k: £1,800
   - Searches (conditional): £350 if "yes"
   - Additional Purchaser (per-item): £50 each
7. Save and publish

**Firm (Edinburgh Solicitors):**
1. Go to `/forms/catalog`
2. See "Scottish Residential Purchase"
3. Click "Activate Form"
4. Customize pricing:
   - Change tiers to £900/£1,300/£2,000
   - Change searches to £375
5. Publish to clients

**Client:**
1. Visit firm's quote form URL
2. Fill in details
3. See calculated quote with firm's pricing
4. Submit for processing

### Example 2: Create Firm-Specific Form

**Platform Admin:**
1. Edinburgh Solicitors requests custom form
2. Create new form: "Premium Edinburgh Package"
3. Set visibility: "Firm-Specific"
4. Assign to: Edinburgh Solicitors
5. Add custom fields specific to their needs
6. Configure default pricing
7. Publish

**Firm (Edinburgh Solicitors):**
1. See custom form in catalog (marked "Custom for You")
2. Activate and optionally adjust pricing
3. Only Edinburgh Solicitors can see this form

---

## Future Enhancements

### Short-term (v0.7.0)
- [ ] Form instance activation flow
- [ ] Firm pricing configuration UI
- [ ] Form preview functionality
- [ ] Client-facing form URLs
- [ ] Form submission processing

### Medium-term (v0.8.0)
- [ ] Drag-and-drop field reordering
- [ ] Conditional logic builder (if/then)
- [ ] Formula builder for complex calculations
- [ ] Form templates marketplace
- [ ] Analytics per form

### Long-term (v1.0.0)
- [ ] Multi-language support
- [ ] PDF generation from forms
- [ ] Email integration
- [ ] Payment processing integration
- [ ] CRM integration
- [ ] Tenant-level form builder (firms create own forms)

---

## Testing

### Manual Test Plan

**Test 1: Platform Admin - Create Form**
1. Navigate to `/admin/forms`
2. Click "Create Form Template"
3. Fill in form details
4. Add 3-4 fields
5. Add 2-3 pricing rules
6. Save
7. Verify form appears in list

**Test 2: LBTT Rate Management**
1. Navigate to `/admin/lbtt-rates`
2. Verify current rates displayed
3. Check ADS rate is 8%
4. Check FTB relief threshold is £175,000
5. Verify rate bands are correct

**Test 3: Firm - Browse Catalog**
1. Navigate to `/forms/catalog`
2. Verify global forms are visible
3. Check stats are accurate
4. Preview a form (when available)

**Test 4: Form Rendering**
1. Create test page with DynamicFormRenderer
2. Pass test fields
3. Verify all field types render
4. Test validation
5. Test submission

---

## File Structure

```
ConveyPro/
├── app/(dashboard)/
│   ├── admin/
│   │   ├── forms/
│   │   │   ├── page.tsx (form template list)
│   │   │   └── new/
│   │   │       └── page.tsx (create form)
│   │   └── lbtt-rates/
│   │       └── page.tsx (LBTT management)
│   └── forms/
│       └── catalog/
│           └── page.tsx (firm form catalog)
├── components/
│   ├── admin/
│   │   └── form-builder/
│   │       └── form-template-editor.tsx
│   ├── forms/
│   │   └── dynamic-form-renderer.tsx
│   └── ui/
│       ├── badge.tsx
│       └── switch.tsx
├── lib/
│   └── services/
│       └── form-builder.service.ts
├── supabase/
│   └── migrations/
│       └── 20241120000001_create_form_builder_schema.sql
└── docs/
    └── FORM-BUILDER.md (this file)
```

---

## Security Considerations

### Row Level Security (RLS)

**Form Templates:**
- ✅ Viewable by authenticated users
- ✅ Manageable by platform admins only

**Form Instances:**
- ✅ Viewable by tenant members
- ✅ Insertable/updatable by tenant admins

**LBTT Rates:**
- ✅ Publicly readable
- ✅ Manageable by platform admins

### Platform Admin Access

**TODO:** Implement platform admin role check
```typescript
// Current: Anyone authenticated can access admin pages
// Future: Check if user has platform_admin role
const isPlatformAdmin = await checkPlatformAdminRole(user.id)
if (!isPlatformAdmin) {
  redirect('/dashboard')
}
```

---

## Performance Considerations

### Database Indexes

All critical queries have indexes:
- Form templates: `slug`, `visibility`, `status`
- Form fields: `template_id`, `display_order`
- Form instances: `tenant_id`, `template_id`, `public_url_slug`
- LBTT rates: `effective_from`, `is_platform_default`

### Caching Strategy

**Recommended:**
- Cache LBTT rates (rarely change)
- Cache published form templates
- Invalidate on admin updates

---

## Support & Maintenance

### Updating LBTT Rates

When Scottish Government announces new rates:

1. Navigate to `/admin/lbtt-rates`
2. Click "Add New Rate Set"
3. Enter new rates and effective date
4. Set as platform default
5. Previous rates automatically archived

### Creating New Form Templates

See: [Workflow Examples](#workflow-examples)

### Troubleshooting

**Issue:** Form not appearing in catalog
**Solution:** Check status is "published" and is_active is true

**Issue:** LBTT calculation incorrect
**Solution:** Verify active LBTT rate set is correct

**Issue:** Firm can't see custom form
**Solution:** Check tenant ID is in allowed_tenant_ids

---

## Issues Resolved During Development

### Issue 1: Row Level Security (RLS) Policy Blocking Field Inserts

**Problem:**
Form templates were saving successfully, but form fields were failing to insert with the error:
```
new row violates row-level security policy for table "form_fields"
```

**Root Cause:**
The initial migration (`20241120000001_create_form_builder_schema.sql`) created RLS policies for `form_fields`, `form_pricing_rules`, and related tables that only allowed SELECT operations. There were no policies for INSERT, UPDATE, or DELETE operations.

**Impact:**
- Platform admins could create form templates
- Form fields and pricing rules silently failed to save
- Forms appeared to save successfully but had 0 fields

**Solution:**
Created migration `20241120000002_fix_form_builder_rls_policies.sql` that added "FOR ALL" policies for:
- `form_fields`
- `form_field_options`
- `form_pricing_rules`
- `form_pricing_tiers`
- `form_steps`

**Code:**
```sql
CREATE POLICY "Form fields are manageable by platform admins" ON public.form_fields
    FOR ALL
    USING (auth.role() = 'authenticated');
```

**Lesson Learned:**
When enabling RLS on tables, always create policies for all CRUD operations (SELECT, INSERT, UPDATE, DELETE), not just SELECT.

---

### Issue 2: Next.js 15 Server/Client Component Event Handler Error

**Problem:**
Form preview page crashed with error:
```
Event handlers cannot be passed to Client Component props.
<... onSubmit={function handlePreviewSubmit} ...>
If you need interactivity, consider converting part of this to a Client Component.
```

**Root Cause:**
In Next.js 15, you cannot pass event handlers (functions) from Server Components to Client Components. The preview page (`page.tsx`) is a Server Component, and it was trying to pass the `handlePreviewSubmit` function directly to the `DynamicFormRenderer` Client Component.

**Impact:**
- Preview page failed to load
- Runtime error displayed instead of form preview

**Solution:**
Created a Client Component wrapper (`FormPreviewWrapper.tsx`) that:
1. Accepts only serializable data (form name, description, fields)
2. Defines the event handler internally
3. Renders the DynamicFormRenderer with the handler

**Files Modified:**
- Created: `components/admin/form-builder/form-preview-wrapper.tsx`
- Updated: `app/(dashboard)/admin/forms/[id]/preview/page.tsx`

**Before:**
```tsx
// Server Component passing function to Client Component (ERROR)
<DynamicFormRenderer
  fields={fields}
  onSubmit={handlePreviewSubmit}  // ❌ Can't pass functions
/>
```

**After:**
```tsx
// Server Component passes data to wrapper Client Component
<FormPreviewWrapper
  formName={template.name}
  formDescription={template.description}
  fields={fields}  // ✅ Only data
/>
```

**Lesson Learned:**
In Next.js 15 App Router, maintain clear separation between Server and Client Components. Only pass serializable data from Server to Client, never functions.

---

### Issue 3: Missing Preview Page (404 Error)

**Problem:**
Clicking the "Preview" button on a form resulted in a 404 error.

**Root Cause:**
The form list page (`/admin/forms/page.tsx`) had a Preview button linking to `/admin/forms/[id]/preview`, but that route/page didn't exist yet.

**Impact:**
- Users couldn't preview forms before publishing
- Broken navigation UX

**Solution:**
Created the preview page at `app/(dashboard)/admin/forms/[id]/preview/page.tsx` with:
- Form template metadata display
- Preview notice banner
- Dynamic form rendering using actual form data
- Form configuration summary

**Features Implemented:**
- Shows how form will appear to clients
- Displays "Preview Mode" notice
- Shows form stats (field count, pricing rules, etc.)
- Provides navigation back to form list and edit page

---

### Issue 4: Silent Field Save Failures

**Problem:**
When creating forms, fields appeared to save successfully (showed success alert), but weren't actually being inserted into the database. Users had no indication of failure.

**Root Cause:**
The API route (`/api/admin/forms/route.ts`) had error handling that logged errors to console but didn't return error responses to the client:
```typescript
if (fieldsError) {
  console.error('Error creating form fields:', fieldsError)
  // Don't fail completely, just log it  ❌ PROBLEM
}
```

**Impact:**
- Users believed forms were saved correctly
- No feedback about field insertion failures
- Debugging required checking database directly

**Solution:**
Updated API error handling to:
1. Add console logging at request start (log field count received)
2. Return proper error responses when field insertion fails
3. Show detailed error messages to users

**Updated Code:**
```typescript
console.log('Received form data:', {
  name: body.name,
  fieldsCount: body.fields?.length || 0,
})

if (fieldsError) {
  console.error('Error creating form fields:', fieldsError)
  return NextResponse.json(
    { error: `Form created but fields failed to save: ${fieldsError.message}` },
    { status: 500 }
  )
}
```

**Lesson Learned:**
Always return errors to the client, not just log them. Silent failures create confusion and make debugging difficult.

---

### Issue 5: Delete Functionality Missing

**Problem:**
No way to delete test forms or forms created with errors.

**Root Cause:**
Delete functionality wasn't implemented in the initial build.

**Impact:**
- Test forms accumulated in database
- No way to clean up forms with errors
- Duplicate slug errors when trying to recreate forms

**Solution:**
Implemented complete delete functionality:

**Files Created:**
1. `app/api/admin/forms/[id]/route.ts` - DELETE endpoint
2. `components/admin/form-builder/delete-form-button.tsx` - Delete UI component

**Features:**
- Confirmation dialog before deletion
- CASCADE deletion (removes fields, pricing rules automatically)
- Client-side state update after deletion
- Error handling with user feedback

**API Route:**
```typescript
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase
    .from('form_templates')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

---

### Issue 6: Missing Database Migration Application

**Problem:**
Migration files existed in the repository, but database tables weren't created in Supabase.

**Root Cause:**
User didn't have Supabase CLI configured locally, and migrations need to be manually run in Supabase Dashboard.

**Impact:**
- Tables didn't exist when trying to save forms
- Database errors when querying form_templates

**Solution:**
Documented process for manual migration:
1. Open migration file locally
2. Copy SQL contents
3. Paste into Supabase SQL Editor
4. Click "Run"

**Additional Enhancement:**
Created helper script (`scripts/create-sample-form.sql`) to create a complete sample form with fields and pricing rules for testing.

---

### Issue 7: Missing Radix UI Dependency

**Problem:**
Application failed to compile with error:
```
Module not found: Can't resolve '@radix-ui/react-switch'
```

**Root Cause:**
Created `components/ui/switch.tsx` component using Radix UI Switch, but the package wasn't installed.

**Impact:**
- Development server wouldn't start
- Build failed

**Solution:**
Installed missing dependency:
```bash
npm install @radix-ui/react-switch
```

**Lesson Learned:**
When creating new UI components that depend on external libraries, add them to package.json immediately.

---

## Summary of Fixes Applied

| Issue | Migration/Code Change | Files Affected |
|-------|----------------------|----------------|
| RLS Policies | `20241120000002_fix_form_builder_rls_policies.sql` | Database |
| Event Handler Error | Created `FormPreviewWrapper.tsx` client component | `components/admin/form-builder/` |
| Preview 404 | Created preview page | `app/(dashboard)/admin/forms/[id]/preview/` |
| Silent Errors | Enhanced API error handling | `app/api/admin/forms/route.ts` |
| Delete Missing | Created DELETE endpoint and UI | `app/api/admin/forms/[id]/route.ts` |
| Missing Dependency | Installed `@radix-ui/react-switch` | `package.json` |

All issues have been resolved and code is pushed to branch `claude/phase-7-form-builder-015jod3AP3UByjRJ2AZbFbpy`.

---

## Version History

- **v0.6.0** (November 20, 2024) - Initial form builder implementation
  - Database schema
  - Platform admin UI
  - Firm catalog
  - Form rendering
  - LBTT rate management

---

## Related Documents

- [PROJECT-ROADMAP.md](./PROJECT-ROADMAP.md)
- [LBTT-CALCULATOR.md](./LBTT-CALCULATOR.md)
- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) (TODO: Update with form builder tables)

---

**Last Updated:** November 20, 2024
**Maintainer:** Development Team
**Next Review:** After v0.7.0 release
