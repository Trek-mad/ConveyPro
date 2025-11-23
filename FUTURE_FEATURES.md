# Future Features & Product Roadmap

## Client & Property Creation Flow (Future Implementation)

### Current State
- Clients and properties are created manually through separate forms
- Quotes can be linked to properties and clients
- Campaign enrollment requires clients to have been created first

### Planned Implementation

**Form Builder Integration:**

When firms use the form builder system, client information will be collected through forms (e.g., property purchase forms, conveyancing intake forms). Upon form submission:

1. **Automatic Client Creation**
   - Extract client details from form fields (name, email, phone, address)
   - Create client record in `clients` table
   - Set appropriate `life_stage` based on form type (first-time buyer, investor, etc.)
   - Populate `services_used` field with current service

2. **Automatic Property Creation**
   - Extract property details from form fields (address, property type, purchase price)
   - Create property record in `properties` table
   - Link property to the newly created client

3. **Quote Generation**
   - Automatically generate quote based on form data
   - Link quote to both client and property
   - Set appropriate service type and fees

4. **Campaign Enrollment Trigger**
   - When quote is accepted (via form notification or manual action)
   - Trigger campaign enrollment modal or auto-enroll based on rules
   - Client receives targeted cross-sell emails

### Benefits

**Streamlined Workflow:**
- No duplicate data entry
- Clients and properties created automatically from intake forms
- Reduces manual work for staff
- Ensures data consistency

**Better Campaign Targeting:**
- Life stage automatically set based on form type
- Services used tracked from first interaction
- Immediate campaign enrollment opportunities

**Integration Points:**

```
Form Submission → Client Creation → Property Creation → Quote Generation → Quote Acceptance → Campaign Enrollment → Email Queue
```

### Implementation Notes

**Database Changes Needed:**
- Add `source_form_id` to clients table to track origin
- Add `form_submission_id` to properties table
- Link form submissions to created entities

**Service Layer:**
```typescript
// services/form-submission.service.ts

async function processFormSubmission(formData) {
  // 1. Create client
  const client = await createClientFromForm(formData)

  // 2. Create property
  const property = await createPropertyFromForm(formData, client.id)

  // 3. Create quote
  const quote = await createQuoteFromForm(formData, client.id, property.id)

  // 4. Check for auto-enrollment triggers
  await checkCampaignTriggers(client, 'form_submission')

  return { client, property, quote }
}
```

**Form Field Mapping:**

| Form Field | Client Field | Property Field |
|------------|--------------|----------------|
| First Name | first_name | - |
| Last Name | last_name | - |
| Email | email | - |
| Phone | phone | - |
| Property Address | address_line1 | address |
| City | city | city |
| Postcode | postcode | postcode |
| Property Type | - | property_type |
| Purchase Price | - | purchase_price |
| Service Type | services_used[] | - |

**Life Stage Detection:**

```typescript
function determineLifeStage(formType: string): string {
  const stageMapping = {
    'first-time-buyer-conveyancing': 'first_time_buyer',
    'second-home-purchase': 'moving_up',
    'investment-property': 'investor',
    'downsizing-sale': 'downsizing',
    'retirement-conveyancing': 'retired'
  }

  return stageMapping[formType] || null
}
```

### Related Features

**Campaign Triggers (Phase 4):**
- Auto-enroll based on form type
- Set enrollment delay (e.g., 7 days after form submission)
- Target specific services for cross-sell

**Form Builder Enhancements:**
- Add "Enable Campaign Enrollment" checkbox to forms
- Select default campaign for form submissions
- Customize enrollment timing per form

### Priority: Phase 4 or 5

This feature should be implemented after:
- ✅ Phase 1: Core conveyancing platform
- ✅ Phase 2: Form builder and demo features
- ✅ Phase 3: Campaign system and email automation
- ⏳ Phase 4: Campaign triggers and automation rules
- ⏳ Phase 5: Form-to-client/property automation ← **THIS**

### Technical Debt Notes

**Current Workaround:**
- Clients must be created manually before quote acceptance
- Campaign enrollment only works if client record exists
- Forms collect data but don't auto-create entities

**When Implementing:**
- Update quote acceptance flow to handle newly created clients
- Ensure campaign matching works with auto-created client data
- Add form submission tracking to audit trail
- Consider duplicate detection (email/phone matching)
- Handle partial form submissions (incomplete data)

---

## Other Future Features

### Phase 4: Advanced Campaign Features
- Campaign triggers based on quote events
- Auto-enrollment rules editor
- A/B testing for email templates
- Advanced analytics dashboard
- ROI tracking per campaign

### Phase 5: Client Portal
- Clients can view quotes online
- Accept quotes digitally
- Upload documents via form
- Track conveyancing progress

### Phase 6: Integrations
- SendGrid advanced features (A/B testing, send time optimization)
- CRM integrations (Salesforce, HubSpot)
- Document automation (DocuSign, PandaDoc)
- Payment processing (Stripe for retainers)

---

*Last Updated: 2025-11-19*
*Document Version: 1.0*
