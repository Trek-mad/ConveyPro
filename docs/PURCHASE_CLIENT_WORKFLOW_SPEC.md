# Purchase Client Workflow - Technical Specification

**Version:** 1.0
**Date:** 2025-11-20
**Status:** Planning

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Database Schema Design](#database-schema-design)
4. [Workflow States & Transitions](#workflow-states--transitions)
5. [Feature Requirements](#feature-requirements)
6. [Fee Earner Allocation System](#fee-earner-allocation-system)
7. [Integration Points](#integration-points)
8. [Implementation Phases](#implementation-phases)
9. [Technical Architecture](#technical-architecture)
10. [API Endpoints](#api-endpoints)

---

## Executive Summary

The Purchase Client Workflow system transforms ConveyPro from a quote-centric platform into a comprehensive purchase conveyancing management system. It introduces:

- **Client Management**: Dedicated client records with full relationship tracking
- **Matter Management**: End-to-end purchase transaction workflow
- **Task Automation**: Automated checklists and reminders based on workflow stages
- **Document Management**: Home reports, financial questionnaires, and offer documents
- **Fee Earner Allocation**: Workload-based assignment with availability calendar
- **Offer Management**: Verbal and written offer tracking with approval workflows

This specification outlines a **4-phase implementation** designed to deliver value incrementally while building toward a complete solution.

---

## System Overview

### Current State
- Quote-based system with embedded client data
- No formal workflow management
- No document storage
- No matter/case tracking
- No task management

### Target State
- **Clients**: Standalone entities with relationship history
- **Matters**: Purchase transactions with full lifecycle tracking
- **Workflows**: 12-stage purchase process with automated transitions
- **Documents**: Structured storage for home reports, questionnaires, offers
- **Tasks**: Automated checklists with reminders and assignments
- **Allocations**: Intelligent fee earner workload management

### Key Workflows

```
New Purchase Client → Quote Check → Client Details → Financial Checks
→ Home Report → Parameters → Offer Creation → Approval → Outcome
→ Conveyancing Allocation → Client Education → Completion
```

---

## Database Schema Design

### New Tables

#### 1. `clients`
Standalone client records (replaces embedded client data in quotes)

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Basic Information
  client_type TEXT NOT NULL DEFAULT 'individual', -- individual, couple, company
  title TEXT, -- Mr, Mrs, Ms, Dr, etc.
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_name TEXT,

  -- Contact Details
  email TEXT NOT NULL,
  phone TEXT,
  mobile TEXT,
  preferred_contact_method TEXT DEFAULT 'email', -- email, phone, mobile

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'Scotland',

  -- Additional Details
  date_of_birth DATE,
  national_insurance_number TEXT,
  passport_number TEXT,

  -- Metadata
  source TEXT, -- website, referral, repeat_client, etc.
  tags TEXT[], -- Array for categorization
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT clients_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_clients_tenant_id ON clients(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_email ON clients(tenant_id, email) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);
```

#### 2. `matters`
Purchase transaction cases

```sql
CREATE TABLE matters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Matter Identification
  matter_number TEXT NOT NULL UNIQUE, -- Auto-generated: M00001-25
  matter_type TEXT NOT NULL DEFAULT 'purchase', -- purchase, sale, remortgage, etc.
  status TEXT NOT NULL DEFAULT 'new', -- new, active, on_hold, completed, cancelled

  -- Relationships
  primary_client_id UUID REFERENCES clients(id),
  secondary_client_id UUID, -- For couples/joint purchases
  property_id UUID REFERENCES properties(id),
  quote_id UUID REFERENCES quotes(id),

  -- Workflow
  current_stage TEXT NOT NULL DEFAULT 'client_entry', -- See workflow stages
  current_stage_started_at TIMESTAMPTZ DEFAULT NOW(),

  -- Key Dates
  instruction_date DATE DEFAULT CURRENT_DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  closing_date DATE, -- Scottish specific

  -- Financial
  purchase_price DECIMAL(12,2),
  mortgage_amount DECIMAL(12,2),
  deposit_amount DECIMAL(12,2),
  ads_applicable BOOLEAN DEFAULT false, -- Additional Dwelling Supplement
  first_time_buyer BOOLEAN DEFAULT false,

  -- Parties
  selling_agent_name TEXT,
  selling_agent_email TEXT,
  selling_agent_phone TEXT,
  seller_solicitor_name TEXT,
  seller_solicitor_firm TEXT,
  seller_solicitor_email TEXT,

  -- Assignment
  assigned_fee_earner_id UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES profiles(id),

  -- Metadata
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  notes TEXT,
  internal_notes TEXT, -- Staff only
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT matters_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_matters_tenant_id ON matters(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_matters_status ON matters(tenant_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_matters_current_stage ON matters(current_stage);
CREATE INDEX idx_matters_assigned_fee_earner ON matters(assigned_fee_earner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_matters_closing_date ON matters(closing_date) WHERE deleted_at IS NULL AND closing_date IS NOT NULL;
CREATE UNIQUE INDEX idx_matters_matter_number ON matters(matter_number) WHERE deleted_at IS NULL;
```

#### 3. `workflow_stages`
Defines the purchase workflow stages

```sql
CREATE TABLE workflow_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = global default

  -- Stage Definition
  stage_key TEXT NOT NULL, -- client_entry, quote_check, etc.
  stage_name TEXT NOT NULL,
  stage_description TEXT,
  stage_order INTEGER NOT NULL,
  matter_type TEXT NOT NULL DEFAULT 'purchase',

  -- Automation
  auto_transition_conditions JSONB, -- Conditions for automatic progression
  required_tasks TEXT[], -- Task keys that must be completed

  -- Notifications
  entry_notification_template TEXT, -- Email template on stage entry
  exit_notification_template TEXT,
  reminder_days_before_due INTEGER[], -- [7, 3, 1] for reminders

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#3b82f6', -- For UI visualization
  icon TEXT, -- Lucide icon name
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT workflow_stages_unique_key FOREIGN KEY (tenant_id, stage_key, matter_type)
);

CREATE INDEX idx_workflow_stages_tenant ON workflow_stages(tenant_id, matter_type, stage_order);
CREATE UNIQUE INDEX idx_workflow_stages_key ON workflow_stages(COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000'::UUID), stage_key, matter_type);
```

#### 4. `matter_tasks`
Checklist tasks for each matter

```sql
CREATE TABLE matter_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Task Definition
  task_key TEXT, -- Links to template task (optional)
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT DEFAULT 'manual', -- manual, automated, approval

  -- Workflow
  stage TEXT NOT NULL, -- client_entry, quote_check, etc.
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, blocked, cancelled
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent

  -- Assignment
  assigned_to UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES profiles(id),

  -- Dates
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),

  -- Dependencies
  depends_on_task_ids UUID[], -- Can't start until these are complete
  blocks_stage_progression BOOLEAN DEFAULT false,

  -- Reminders
  reminder_sent_at TIMESTAMPTZ,
  reminder_days_before INTEGER DEFAULT 3,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_matter_tasks_matter ON matter_tasks(matter_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_matter_tasks_assigned ON matter_tasks(assigned_to, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_matter_tasks_due_date ON matter_tasks(due_date) WHERE deleted_at IS NULL AND status != 'completed';
CREATE INDEX idx_matter_tasks_stage ON matter_tasks(matter_id, stage);
```

#### 5. `documents`
Document storage and tracking

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Document Identity
  document_type TEXT NOT NULL, -- home_report, financial_questionnaire, offer_letter, id_document, etc.
  title TEXT NOT NULL,
  description TEXT,

  -- Relationships
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  property_id UUID REFERENCES properties(id),

  -- Storage
  storage_path TEXT NOT NULL, -- Supabase Storage path
  file_name TEXT NOT NULL,
  file_size INTEGER, -- bytes
  mime_type TEXT,

  -- Versioning
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES documents(id),
  is_latest_version BOOLEAN DEFAULT true,

  -- Status
  status TEXT DEFAULT 'uploaded', -- uploaded, verified, rejected, archived
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),

  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_documents_matter ON documents(matter_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_client ON documents(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_type ON documents(tenant_id, document_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_latest ON documents(matter_id, document_type, is_latest_version) WHERE deleted_at IS NULL;
```

#### 6. `offers`
Offer tracking (verbal and written)

```sql
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,

  -- Offer Details
  offer_number TEXT NOT NULL, -- Auto-generated: OFF00001-25
  offer_type TEXT NOT NULL DEFAULT 'written', -- verbal, written
  offer_amount DECIMAL(12,2) NOT NULL,
  offer_status TEXT NOT NULL DEFAULT 'draft', -- draft, pending_solicitor, pending_client, submitted, accepted, rejected, withdrawn

  -- Conditions
  closing_date DATE,
  entry_date DATE,
  conditions TEXT, -- Special conditions
  survey_required BOOLEAN DEFAULT true,

  -- Approval Workflow
  drafted_by UUID REFERENCES profiles(id),
  drafted_at TIMESTAMPTZ DEFAULT NOW(),

  solicitor_approved_by UUID REFERENCES profiles(id),
  solicitor_approved_at TIMESTAMPTZ,

  negotiator_approved_by UUID REFERENCES profiles(id),
  negotiator_approved_at TIMESTAMPTZ,

  client_accepted_at TIMESTAMPTZ,
  client_acceptance_ip TEXT, -- IP address for audit

  submitted_to_agent_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES profiles(id),

  -- Outcome
  agent_response TEXT, -- accepted, rejected, counter_offer
  agent_response_date DATE,
  agent_notes TEXT,

  rejection_reason TEXT,
  counter_offer_amount DECIMAL(12,2),

  -- Document
  document_id UUID REFERENCES documents(id),

  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_offers_matter ON offers(matter_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_offers_status ON offers(tenant_id, offer_status) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_offers_offer_number ON offers(offer_number) WHERE deleted_at IS NULL;
```

#### 7. `financial_questionnaires`
Financial assessment forms

```sql
CREATE TABLE financial_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id),

  -- Employment
  employment_status TEXT, -- employed, self_employed, retired, unemployed
  employer_name TEXT,
  occupation TEXT,
  annual_income DECIMAL(12,2),

  -- Additional Income
  additional_income_sources TEXT[], -- rental, investment, pension, etc.
  additional_income_amount DECIMAL(12,2),

  -- Savings & Assets
  savings_amount DECIMAL(12,2),
  investments_amount DECIMAL(12,2),
  other_assets_description TEXT,
  other_assets_value DECIMAL(12,2),

  -- Liabilities
  existing_mortgage_balance DECIMAL(12,2),
  credit_card_debt DECIMAL(12,2),
  loan_debts DECIMAL(12,2),
  other_liabilities_description TEXT,
  other_liabilities_amount DECIMAL(12,2),

  -- Property Sale (if applicable)
  selling_property BOOLEAN DEFAULT false,
  sale_property_address TEXT,
  expected_sale_proceeds DECIMAL(12,2),
  sale_status TEXT, -- not_started, marketed, under_offer, sold

  -- Mortgage Details
  mortgage_required BOOLEAN DEFAULT true,
  mortgage_amount_required DECIMAL(12,2),
  mortgage_in_principle BOOLEAN DEFAULT false,
  mortgage_lender TEXT,
  mortgage_broker_name TEXT,
  mortgage_broker_contact TEXT,

  -- Deposit
  deposit_source TEXT, -- savings, gift, sale_proceeds, inheritance
  deposit_amount DECIMAL(12,2),
  deposit_available_date DATE,

  -- ADS Check
  owns_other_properties BOOLEAN DEFAULT false,
  other_properties_count INTEGER DEFAULT 0,
  other_properties_details TEXT,
  ads_applicable BOOLEAN DEFAULT false,

  -- Verification
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_financial_questionnaires_matter ON financial_questionnaires(matter_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_financial_questionnaires_client ON financial_questionnaires(client_id) WHERE deleted_at IS NULL;
```

#### 8. `fee_earner_availability`
Calendar-based availability for workload allocation

```sql
CREATE TABLE fee_earner_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  fee_earner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Date Range
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Availability
  availability_type TEXT NOT NULL, -- available, holiday, sick, training, blocked
  is_available BOOLEAN DEFAULT true,

  -- Capacity (for available periods)
  max_new_matters_per_week INTEGER, -- NULL = use default
  current_workload INTEGER DEFAULT 0, -- Auto-calculated

  -- Details
  reason TEXT, -- For blocked/unavailable periods
  notes TEXT,

  -- Recurrence (future enhancement)
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB, -- { type: 'weekly', days: [1,3,5] }

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT fee_earner_availability_dates_check CHECK (end_date >= start_date)
);

CREATE INDEX idx_fee_earner_availability_fee_earner ON fee_earner_availability(fee_earner_id, start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_fee_earner_availability_dates ON fee_earner_availability(tenant_id, start_date, end_date) WHERE deleted_at IS NULL AND is_available = true;
```

#### 9. `fee_earner_settings`
Per-fee-earner configuration

```sql
CREATE TABLE fee_earner_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  fee_earner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Capacity
  max_concurrent_matters INTEGER DEFAULT 20,
  max_new_matters_per_week INTEGER DEFAULT 3,

  -- Specialization
  matter_types TEXT[] DEFAULT ARRAY['purchase', 'sale', 'remortgage'],
  max_transaction_value DECIMAL(12,2), -- NULL = no limit
  min_transaction_value DECIMAL(12,2), -- NULL = no minimum

  -- Auto-assignment
  accepts_auto_assignment BOOLEAN DEFAULT true,
  assignment_priority INTEGER DEFAULT 100, -- Higher = more priority

  -- Working Hours
  working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Monday, 7=Sunday
  working_hours_start TIME DEFAULT '09:00',
  working_hours_end TIME DEFAULT '17:00',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fee_earner_settings_unique UNIQUE (tenant_id, fee_earner_id)
);

CREATE INDEX idx_fee_earner_settings_tenant ON fee_earner_settings(tenant_id);
```

#### 10. `matter_activities`
Activity timeline/audit log for matters

```sql
CREATE TABLE matter_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Activity
  activity_type TEXT NOT NULL, -- stage_change, task_completed, document_uploaded, offer_submitted, etc.
  title TEXT NOT NULL,
  description TEXT,

  -- Context
  actor_id UUID REFERENCES profiles(id), -- Who performed the action
  actor_name TEXT, -- Cached for display

  -- Related Entities
  related_task_id UUID REFERENCES matter_tasks(id),
  related_document_id UUID REFERENCES documents(id),
  related_offer_id UUID REFERENCES offers(id),

  -- Changes (for audit)
  changes JSONB, -- { field: { old: ..., new: ... } }

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_matter_activities_matter ON matter_activities(matter_id, created_at DESC);
CREATE INDEX idx_matter_activities_type ON matter_activities(tenant_id, activity_type, created_at DESC);
```

---

## Workflow States & Transitions

### Purchase Workflow Stages

| Order | Stage Key | Stage Name | Auto-Transition | Key Actions |
|-------|-----------|------------|----------------|-------------|
| 1 | `client_entry` | Client Entry | No | Create client record, initiate matter |
| 2 | `quote_check` | Quote Check | Conditional | Check/create quote |
| 3 | `client_details` | Client & Property Details | No | Add selling agent, property address |
| 4 | `financial_questionnaire` | Financial Assessment | No | Complete financial questionnaire |
| 5 | `financial_checks` | Financial Verification | No | Verify affordability, check ADS |
| 6 | `home_report` | Home Report Review | No | Download HR, review condition, save |
| 7 | `establish_parameters` | Financial Parameters | No | Establish client parameters, set closing date |
| 8 | `offer_creation` | Offer Preparation | No | Agree offer price, create written offer |
| 9 | `offer_approval` | Offer Approvals | No | Solicitor sign-off, negotiator approval |
| 10 | `client_acceptance` | Client Acceptance | Conditional | Client click-to-accept |
| 11 | `offer_outcome` | Offer Outcome | No | Track acceptance/rejection, log verbal offers |
| 12 | `conveyancing_allocation` | Conveyancer Assignment | No | Allocate to conveyancer, send documents |

### State Transition Rules

```typescript
// Pseudo-code for transitions
const STAGE_TRANSITIONS = {
  client_entry: {
    next: 'quote_check',
    conditions: ['client_created', 'matter_created']
  },
  quote_check: {
    next: 'client_details',
    conditions: ['quote_exists_or_created'],
    autoTransition: true // If quote exists, auto-move
  },
  client_details: {
    next: 'financial_questionnaire',
    conditions: ['selling_agent_added', 'property_address_obtained']
  },
  financial_questionnaire: {
    next: 'financial_checks',
    conditions: ['questionnaire_completed']
  },
  financial_checks: {
    next: 'home_report',
    conditions: ['affordability_verified', 'ads_checked'],
    warnings: ['affordability_issue_flagged']
  },
  home_report: {
    next: 'establish_parameters',
    conditions: ['home_report_downloaded', 'home_report_reviewed']
  },
  establish_parameters: {
    next: 'offer_creation',
    conditions: ['parameters_established'],
    optional: ['closing_date_set']
  },
  offer_creation: {
    next: 'offer_approval',
    conditions: ['offer_price_agreed', 'offer_document_created']
  },
  offer_approval: {
    next: 'client_acceptance',
    conditions: ['solicitor_approved', 'negotiator_approved']
  },
  client_acceptance: {
    next: 'offer_outcome',
    conditions: ['client_accepted_or_rejected'],
    autoTransition: true // If accepted via click
  },
  offer_outcome: {
    next: 'conveyancing_allocation',
    conditions: ['outcome_logged', 'offer_submitted_to_agent'],
    alternatives: {
      rejected: 'offer_creation', // Loop back
      counter_offer: 'offer_creation'
    }
  },
  conveyancing_allocation: {
    next: null, // End of purchase workflow, moves to conveyancing
    conditions: ['conveyancer_allocated', 'documents_sent']
  }
}
```

### Task Templates per Stage

Each stage auto-generates tasks:

**Stage: client_entry**
- [ ] Create client record
- [ ] Create matter record
- [ ] Send welcome email to client

**Stage: quote_check**
- [ ] Check if quote exists
- [ ] Create quote if needed
- [ ] Link quote to matter

**Stage: client_details**
- [ ] Obtain selling agent name and email
- [ ] Obtain property address
- [ ] Create/link property record

**Stage: financial_questionnaire**
- [ ] Send financial questionnaire to client
- [ ] Client completes questionnaire
- [ ] Review and verify questionnaire

**Stage: financial_checks**
- [ ] Verify deposit + mortgage covers purchase price + fees
- [ ] Check Additional Dwelling Supplement (ADS) liability
- [ ] Flag any affordability concerns
- [ ] Review LBTT implications

**Stage: home_report**
- [ ] Request home report from selling agent
- [ ] Download and save home report
- [ ] Review property condition
- [ ] Flag any concerns to client

**Stage: establish_parameters**
- [ ] Confirm maximum offer amount
- [ ] Confirm closing date (if applicable)
- [ ] Set reminder for closing date (if set)

**Stage: offer_creation**
- [ ] Agree offer price with client
- [ ] Draft written offer document
- [ ] Send to solicitor for signature

**Stage: offer_approval**
- [ ] Solicitor signs offer
- [ ] Purchase negotiator approves release
- [ ] Send offer summary to client

**Stage: client_acceptance**
- [ ] Client clicks to accept offer
- [ ] Log client acceptance timestamp

**Stage: offer_outcome**
- [ ] Submit offer to selling agent (written or verbal)
- [ ] Log agent response
- [ ] Update matter status based on outcome

**Stage: conveyancing_allocation**
- [ ] Allocate to conveyancer
- [ ] Send offer letter to conveyancer
- [ ] Send home report to conveyancer
- [ ] Send financial questionnaire to conveyancer
- [ ] Send quote to conveyancer
- [ ] Copy staff for back-office (Amaquis) setup
- [ ] Send "Offer Accepted" email to client

---

## Feature Requirements

### 1. Client Management

**Features:**
- Create standalone client records
- Support individual, couple, and company clients
- Store multiple contact methods
- Track client source and tags
- View client matter history
- Merge duplicate clients
- Client search (name, email, phone)

**UI Components:**
- Client list with filters
- Client detail page
- Client creation form (multi-step)
- Client matter history timeline

### 2. Matter Management

**Features:**
- Create purchase matters
- Auto-generate matter numbers (M00001-25 format)
- Link clients, properties, quotes
- Track matter status and current stage
- View matter timeline
- Assign fee earners
- Set priority levels
- Add notes (public and internal)

**UI Components:**
- Matter dashboard (Kanban by stage)
- Matter list (table view)
- Matter detail page (tabs: Overview, Tasks, Documents, Timeline, Notes)
- Matter creation wizard

### 3. Workflow Automation

**Features:**
- Visual stage progression
- Auto-create stage-specific tasks
- Block stage progression until required tasks complete
- Automated email notifications on stage entry
- Stage transition validation
- Workflow customization per tenant

**UI Components:**
- Stage progress bar (visual stepper)
- Stage detail cards
- Workflow configuration UI (admin)

### 4. Task Management

**Features:**
- Auto-generated task checklists
- Manual task creation
- Task assignment
- Due dates and reminders
- Task dependencies
- Bulk task operations
- Task filtering (assigned to me, due today, overdue)

**UI Components:**
- Task list (grouped by stage)
- Task detail modal
- Task quick-add
- My Tasks dashboard widget

### 5. Document Management

**Features:**
- Document upload (drag & drop)
- Document categorization (home report, ID, etc.)
- Document versioning
- Document preview
- Document download
- Auto-link documents to matters
- Document checklist per stage

**UI Components:**
- Document library (grid/list view)
- Document upload modal
- Document preview modal
- Document version history

### 6. Offer Management

**Features:**
- Create verbal and written offers
- Multi-step approval workflow (solicitor → negotiator → client)
- Client click-to-accept functionality
- Counter-offer tracking
- Offer comparison (if multiple on same property)
- Auto-generate offer documents (PDF)
- Track offer outcomes

**UI Components:**
- Offer creation form
- Offer approval dashboard
- Client acceptance page (public link)
- Offer history per matter

### 7. Financial Questionnaire

**Features:**
- Digital questionnaire form
- Auto-calculate affordability
- ADS liability detection
- Integration with LBTT calculator
- Save responses to matter
- PDF export of responses

**UI Components:**
- Multi-step questionnaire form
- Financial summary dashboard
- Affordability warnings/flags

### 8. Fee Earner Allocation

**Features:**
- Calendar view of fee earner availability
- Block out holidays/training
- Set weekly/monthly capacity limits
- Auto-calculate current workload
- Manual assignment
- Auto-assignment based on availability
- Workload balancing algorithm
- Assignment notifications

**UI Components:**
- Fee earner calendar (monthly/weekly view)
- Availability blocking modal
- Workload dashboard per fee earner
- Assignment rules configuration

### 9. Reminders & Notifications

**Features:**
- Email reminders X days before due dates
- Closing date reminders
- Task due reminders
- Stage transition notifications
- Document request reminders
- Overdue task alerts

**Notification Triggers:**
- Task assigned
- Task due in 3/1 days
- Closing date in 7/3/1 days
- Offer pending approval
- Document uploaded
- Stage changed
- Matter assigned

### 10. Reporting & Analytics

**Features (Phase 4):**
- Matters by stage report
- Average time per stage
- Fee earner workload report
- Conversion funnel (quote → matter → completion)
- Completion rate by fee earner
- Document completion rates
- Task completion rates

---

## Fee Earner Allocation System

### Requirements

1. **Calendar Management**
   - Monthly and weekly calendar views
   - Block out dates (holidays, training, sick leave)
   - Recurring availability patterns
   - Public holidays integration (Scotland)

2. **Capacity Planning**
   - Set max concurrent matters per fee earner
   - Set max new matters per week
   - Real-time workload calculation
   - Visual capacity indicators (traffic lights: green/amber/red)

3. **Allocation Logic**
   - **Manual Assignment**: Admin selects fee earner from available list
   - **Auto-Assignment**: System suggests based on:
     - Current workload (lowest first)
     - Availability (not on holiday)
     - Specialization (matter type, value range)
     - Assignment priority score
     - Fair distribution (round-robin within capacity)

4. **Allocation Rules**
   - Fee earner can opt out of auto-assignment
   - Priority weighting (1-100, higher = preferred)
   - Matter type specialization filtering
   - Transaction value range filtering

### UI Flow

```
New Matter Created
  ↓
Admin clicks "Assign Fee Earner"
  ↓
System shows:
  - Fee Earner list with:
    ✓ Current workload (12/20 matters)
    ✓ New matters this week (2/3)
    ✓ Availability status (Available, Holiday until DD/MM, Training)
    ✓ Recommendation badge (Suggested)
  ↓
Admin selects fee earner OR clicks "Auto-Assign"
  ↓
System assigns and sends notification
```

### Workload Calculation

```typescript
// Real-time workload calculation
function calculateWorkload(feeEarnerId: UUID) {
  const activeMatters = await db.matters.count({
    where: {
      assigned_fee_earner_id: feeEarnerId,
      status: ['new', 'active'],
      deleted_at: null
    }
  })

  const thisWeek = startOfWeek(new Date())
  const newMattersThisWeek = await db.matters.count({
    where: {
      assigned_fee_earner_id: feeEarnerId,
      assigned_at: { gte: thisWeek }
    }
  })

  return {
    activeMatters,
    newMattersThisWeek,
    capacityUsed: activeMatters / settings.max_concurrent_matters,
    weeklyCapacityUsed: newMattersThisWeek / settings.max_new_matters_per_week
  }
}
```

---

## Integration Points

### 1. Existing Systems Integration

**Quotes System**
- Link existing quotes to new matters
- Create quotes from within matter workflow
- Auto-populate matter financial data from quote

**Properties System**
- Link existing properties to matters
- Create properties from within matter workflow
- Sync property updates to linked matters

**Profiles/Users**
- Assign fee earners to matters
- Track user activity on matters
- Role-based permissions (who can approve offers, assign matters, etc.)

**Tenants**
- Full multi-tenant isolation
- Per-tenant workflow customization
- Tenant-specific document templates

### 2. External Integrations (Phase 3+)

**Email Integration (SendGrid)**
- Workflow stage notifications
- Task reminders
- Offer communications
- Client acceptance emails

**Back-Office System (Amaquis)**
- Matter creation notification
- Document sync
- Status updates

**Calendar Integration**
- Closing date sync to Google/Outlook calendars
- Task due dates to calendars
- Fee earner availability sync

**Address Lookup API**
- Auto-populate property addresses
- Validate postcodes
- Retrieve property details

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)
**Goal:** Establish core data models and basic CRUD operations

**Deliverables:**
1. Database migrations for all tables
2. TypeScript types generation
3. RLS policies for all tables
4. Basic service layer (CRUD operations):
   - `client.service.ts`
   - `matter.service.ts`
   - `document.service.ts`
5. Basic UI components:
   - Client list & create form
   - Matter list & create form
   - Simple stage display
6. Auto-number generation (matter numbers, offer numbers)

**Success Criteria:**
- [ ] Can create clients
- [ ] Can create matters linked to clients
- [ ] Can view matter list
- [ ] All RLS policies tested
- [ ] No security vulnerabilities

**Estimated Effort:** 15-20 days

---

### Phase 2: Workflow & Tasks (Weeks 4-6)
**Goal:** Implement stage-based workflow with automated task generation

**Deliverables:**
1. Workflow engine:
   - Stage transition logic
   - Task auto-generation per stage
   - Validation before stage progression
2. Task management:
   - `task.service.ts`
   - Task list component
   - Task assignment
   - Task completion
3. Stage visualization:
   - Progress stepper component
   - Stage detail cards
   - Stage transition UI
4. Default workflow seeds:
   - 12 purchase stages
   - Task templates per stage
5. Matter activity log

**Success Criteria:**
- [ ] Matter progresses through stages
- [ ] Tasks auto-created on stage entry
- [ ] Can't progress without completing required tasks
- [ ] Activity timeline shows all actions
- [ ] Email notifications on stage transitions

**Estimated Effort:** 15-20 days

---

### Phase 3: Documents & Financial Questionnaire (Weeks 7-9)
**Goal:** Complete document management and financial assessment

**Deliverables:**
1. Supabase Storage integration:
   - Bucket setup with RLS
   - Upload/download service
   - Document versioning
2. Document components:
   - Upload modal (drag & drop)
   - Document library
   - Preview modal
   - Version history
3. Financial Questionnaire:
   - Multi-step form component
   - `financial-questionnaire.service.ts`
   - Affordability calculator integration
   - ADS detection logic
   - PDF export of responses
4. Home Report handling:
   - Upload and categorization
   - Link to property
   - Review checklist

**Success Criteria:**
- [ ] Can upload documents to matters
- [ ] Documents stored in Supabase Storage
- [ ] Can complete financial questionnaire
- [ ] Affordability warnings displayed
- [ ] ADS liability correctly detected
- [ ] Can download/preview documents

**Estimated Effort:** 15-20 days

---

### Phase 4: Offer Management (Weeks 10-12)
**Goal:** Complete offer creation, approval, and tracking workflow

**Deliverables:**
1. Offer system:
   - `offer.service.ts`
   - Offer creation form
   - Approval workflow (solicitor → negotiator → client)
   - Client acceptance page (public link with token)
2. Offer document generation:
   - PDF template for written offers
   - Auto-population from matter data
   - Document storage integration
3. Offer tracking:
   - Verbal offer logging
   - Counter-offer tracking
   - Agent response logging
4. Email notifications:
   - Offer pending approval
   - Client acceptance request
   - Offer outcome notifications

**Success Criteria:**
- [ ] Can create written and verbal offers
- [ ] Approval workflow functions correctly
- [ ] Client can accept via secure link
- [ ] Offer PDFs generated correctly
- [ ] All outcomes tracked properly
- [ ] Notifications sent at each step

**Estimated Effort:** 15-20 days

---

### Phase 5: Fee Earner Allocation (Weeks 13-15)
**Goal:** Intelligent workload-based allocation system

**Deliverables:**
1. Fee earner configuration:
   - Settings UI for capacity, specialization
   - `fee-earner.service.ts`
2. Availability calendar:
   - Monthly/weekly calendar views
   - Block out dates UI
   - Holiday management
   - Recurring patterns
3. Allocation engine:
   - Workload calculation function
   - Auto-assignment algorithm
   - Manual assignment UI with recommendations
4. Workload dashboard:
   - Per-fee-earner workload view
   - Team workload overview
   - Capacity visualization (charts)
5. Assignment notifications:
   - Email to assigned fee earner
   - Matter assignment activity log

**Success Criteria:**
- [ ] Can set fee earner availability
- [ ] Can block out holidays
- [ ] Workload calculated in real-time
- [ ] Auto-assignment suggests appropriate fee earner
- [ ] Manual assignment shows recommendations
- [ ] Workload balanced across team
- [ ] Notifications sent on assignment

**Estimated Effort:** 15-20 days

---

### Phase 6: Reminders & Notifications (Weeks 16-17)
**Goal:** Automated reminder system for due dates and closing dates

**Deliverables:**
1. Reminder engine:
   - Cron job or scheduled function
   - Query overdue/upcoming tasks
   - Query upcoming closing dates
2. Email templates:
   - Task reminder template
   - Closing date reminder template
   - Overdue task alert
3. Notification preferences:
   - User settings for notification frequency
   - Opt-in/opt-out options
4. Dashboard alerts:
   - Overdue tasks widget
   - Upcoming deadlines widget
   - Matters requiring attention

**Success Criteria:**
- [ ] Reminders sent 7/3/1 days before closing date
- [ ] Task reminders sent based on due date
- [ ] Overdue tasks flagged
- [ ] Users can configure notification preferences
- [ ] Dashboard shows actionable alerts

**Estimated Effort:** 10 days

---

### Phase 7: Client Portal & Acceptance (Weeks 18-19)
**Goal:** Client-facing portal for offer acceptance and updates

**Deliverables:**
1. Public routes:
   - `/portal/[token]` - Client matter view
   - `/portal/[token]/accept-offer` - Offer acceptance
2. Client portal features:
   - Matter summary
   - Current stage display
   - Uploaded documents (client-visible only)
   - Offer acceptance button
   - Contact form
3. Security:
   - Secure token generation
   - Token expiry
   - IP logging for acceptance
4. Email integration:
   - "View your matter" link in emails
   - Offer acceptance confirmation

**Success Criteria:**
- [ ] Client can view matter via secure link
- [ ] Client can accept offer with one click
- [ ] Acceptance logged with timestamp and IP
- [ ] Secure and tokenized (no auth required)
- [ ] Mobile responsive

**Estimated Effort:** 10 days

---

### Phase 8: Reporting & Analytics (Weeks 20-22)
**Goal:** Business intelligence and performance metrics

**Deliverables:**
1. Reports:
   - Matters by stage report
   - Average time per stage (funnel analysis)
   - Conversion rate (quote → matter → completion)
   - Fee earner performance report
   - Document completion rates
   - Task completion rates
2. Dashboards:
   - Executive dashboard (high-level metrics)
   - Manager dashboard (team performance)
   - Fee earner dashboard (personal metrics)
3. Exports:
   - CSV export of reports
   - PDF export of dashboards
4. Filters:
   - Date range filtering
   - Fee earner filtering
   - Matter type filtering

**Success Criteria:**
- [ ] Can view all key metrics
- [ ] Reports accurate and performant
- [ ] Can export data
- [ ] Visualizations clear and useful
- [ ] Helps identify bottlenecks

**Estimated Effort:** 15 days

---

## Technical Architecture

### Service Layer Pattern

All business logic in `/services/*.service.ts`:

```typescript
// services/matter.service.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth, hasRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createMatter(data: MatterInsert) {
  const user = await requireAuth()
  const canCreate = await hasRole(data.tenant_id, ['owner', 'admin', 'manager', 'member'])

  if (!canCreate) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  // Generate matter number
  const matterNumber = await generateMatterNumber(data.tenant_id)

  // Create matter
  const { data: matter, error } = await supabase
    .from('matters')
    .insert({
      ...data,
      matter_number: matterNumber,
      created_by: user.id,
      current_stage: 'client_entry'
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Auto-create initial tasks
  await createStageTasks(matter.id, 'client_entry')

  // Log activity
  await logActivity({
    matter_id: matter.id,
    activity_type: 'matter_created',
    title: 'Matter created',
    actor_id: user.id
  })

  revalidatePath('/matters')
  return { matter }
}

export async function transitionStage(matterId: UUID, toStage: string) {
  const user = await requireAuth()
  const matter = await getMatter(matterId)

  // Validate transition
  const canTransition = await validateStageTransition(matter, toStage)
  if (!canTransition.valid) {
    return { error: canTransition.reason }
  }

  // Update matter
  const { error } = await supabase
    .from('matters')
    .update({
      current_stage: toStage,
      current_stage_started_at: new Date(),
      updated_by: user.id
    })
    .eq('id', matterId)

  if (error) return { error: error.message }

  // Create tasks for new stage
  await createStageTasks(matterId, toStage)

  // Send notifications
  await sendStageTransitionEmail(matterId, toStage)

  // Log activity
  await logActivity({
    matter_id: matterId,
    activity_type: 'stage_changed',
    title: `Stage changed to ${toStage}`,
    actor_id: user.id,
    changes: { current_stage: { old: matter.current_stage, new: toStage } }
  })

  revalidatePath(`/matters/${matterId}`)
  return { success: true }
}
```

### Component Structure

```typescript
// app/(dashboard)/matters/[id]/page.tsx
export default async function MatterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const matter = await getMatter(id)

  if (!matter) notFound()

  return (
    <div>
      <MatterHeader matter={matter} />
      <MatterTabs matter={matter} />
    </div>
  )
}

// components/matters/matter-tabs.tsx
'use client'
export function MatterTabs({ matter }: { matter: Matter }) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <MatterOverview matter={matter} />
      </TabsContent>

      <TabsContent value="tasks">
        <MatterTaskList matterId={matter.id} />
      </TabsContent>

      {/* ... */}
    </Tabs>
  )
}
```

### Auto-Number Generation

```typescript
// lib/utils/auto-number.ts
export async function generateMatterNumber(tenantId: UUID): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2)
  const supabase = await createClient()

  // Get highest matter number for this tenant this year
  const { data } = await supabase
    .from('matters')
    .select('matter_number')
    .eq('tenant_id', tenantId)
    .like('matter_number', `M%${year}`)
    .order('matter_number', { ascending: false })
    .limit(1)

  let nextNumber = 1
  if (data && data.length > 0) {
    const lastNumber = parseInt(data[0].matter_number.split('-')[0].slice(1))
    nextNumber = lastNumber + 1
  }

  return `M${nextNumber.toString().padStart(5, '0')}-${year}`
}
```

### Workflow Validation

```typescript
// lib/workflow/validation.ts
export async function validateStageTransition(
  matter: Matter,
  toStage: string
): Promise<{ valid: boolean; reason?: string }> {
  const stageConfig = STAGE_TRANSITIONS[matter.current_stage]

  if (stageConfig.next !== toStage) {
    return { valid: false, reason: 'Invalid stage transition' }
  }

  // Check required tasks
  const incompleteTasks = await getIncompleteTasks(
    matter.id,
    matter.current_stage,
    { blocksProgression: true }
  )

  if (incompleteTasks.length > 0) {
    return {
      valid: false,
      reason: `${incompleteTasks.length} required tasks not completed`
    }
  }

  // Check custom conditions
  for (const condition of stageConfig.conditions) {
    const conditionMet = await checkCondition(matter, condition)
    if (!conditionMet.valid) {
      return { valid: false, reason: conditionMet.reason }
    }
  }

  return { valid: true }
}
```

---

## API Endpoints

### Server Actions (Primary API)

All mutations via server actions in `/services/`:

**Clients**
- `createClient(data)`
- `updateClient(id, data)`
- `deleteClient(id)`
- `getClient(id)`
- `listClients(tenantId, filters)`

**Matters**
- `createMatter(data)`
- `updateMatter(id, data)`
- `deleteMatter(id)`
- `getMatter(id)`
- `listMatters(tenantId, filters)`
- `transitionStage(matterId, toStage)`
- `assignFeeEarner(matterId, feeEarnerId)`

**Tasks**
- `createTask(data)`
- `updateTask(id, data)`
- `completeTask(id)`
- `deleteTask(id)`
- `listTasks(matterId, filters)`

**Documents**
- `uploadDocument(file, metadata)`
- `getDocument(id)`
- `listDocuments(matterId, filters)`
- `deleteDocument(id)`

**Offers**
- `createOffer(data)`
- `updateOffer(id, data)`
- `approveOffer(id, approverRole)`
- `submitOffer(id)`
- `logOfferOutcome(id, outcome)`

**Fee Earners**
- `setAvailability(feeEarnerId, startDate, endDate, type)`
- `getAvailableFeeEarners(date, matterType)`
- `calculateWorkload(feeEarnerId)`
- `autoAssignMatter(matterId)`

### API Routes (for external operations)

**Document Download**
- `GET /api/documents/[id]/download` - Stream document file

**Offer PDF Generation**
- `GET /api/offers/[id]/pdf` - Generate offer PDF

**Client Portal**
- `GET /api/portal/[token]` - Get matter via secure token
- `POST /api/portal/[token]/accept` - Accept offer via portal

**Webhooks (future)**
- `POST /api/webhooks/amaquis` - Receive updates from back-office
- `POST /api/webhooks/sendgrid` - Email delivery events

---

## Security Considerations

### Row Level Security (RLS)

All tables must have RLS policies:

```sql
-- Example: matters table RLS
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;

-- Users can only see matters for their tenant(s)
CREATE POLICY "Users can view matters in their tenant"
  ON matters FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

-- Only members+ can create matters
CREATE POLICY "Members can create matters"
  ON matters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_memberships
      WHERE tenant_id = matters.tenant_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

-- Only managers+ can delete matters
CREATE POLICY "Managers can delete matters"
  ON matters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tenant_memberships
      WHERE tenant_id = matters.tenant_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );
```

### Document Access Control

```sql
-- documents table RLS
CREATE POLICY "Users can view documents in their tenant matters"
  ON documents FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  );
```

### Client Portal Security

- Secure token generation (UUID v4 + HMAC)
- Token expiry (e.g., 30 days)
- IP logging for all actions
- No authentication required (token-based access)
- Rate limiting on acceptance endpoint

### Data Protection

- Soft deletes on all tables (`deleted_at`)
- Audit fields: `created_by`, `updated_by`, `created_at`, `updated_at`
- Activity log for all matter changes
- Encryption at rest (Supabase default)
- Encryption in transit (HTTPS)

---

## Testing Strategy

### Unit Tests
- Service layer functions
- Calculators (affordability, LBTT)
- Auto-number generation
- Workflow validation logic

### Integration Tests
- Database operations
- RLS policies
- Stage transitions
- Task auto-generation

### E2E Tests (Playwright)
- Complete matter workflow (entry to allocation)
- Offer approval workflow
- Client portal acceptance
- Fee earner assignment

### Manual Testing Checklist
- [ ] Create client and matter
- [ ] Progress through all stages
- [ ] Upload documents
- [ ] Complete financial questionnaire
- [ ] Create and approve offer
- [ ] Client accept offer
- [ ] Assign to fee earner
- [ ] Test all email notifications
- [ ] Test workload calculations
- [ ] Test RLS policies (multi-tenant isolation)

---

## Success Metrics

### Phase 1 (Foundation)
- [ ] 100% of tables created
- [ ] 100% of RLS policies passing
- [ ] Can create 10 test matters successfully

### Phase 2 (Workflow)
- [ ] Matter progresses through all 12 stages
- [ ] Tasks auto-created for each stage
- [ ] Activity log captures all actions

### Phase 3 (Documents)
- [ ] Can upload 10 documents to a matter
- [ ] Financial questionnaire calculates affordability correctly
- [ ] ADS detection works in all scenarios

### Phase 4 (Offers)
- [ ] Offer approval workflow completes in < 5 clicks
- [ ] Client acceptance works on mobile
- [ ] Offer PDFs generated correctly

### Phase 5 (Allocation)
- [ ] Workload calculations accurate
- [ ] Auto-assignment selects correct fee earner
- [ ] Calendar blocks respected

### Phase 6 (Reminders)
- [ ] 100% of closing date reminders sent
- [ ] Task reminders sent on schedule
- [ ] Zero missed reminders

### Phase 7 (Portal)
- [ ] Client portal loads in < 2s
- [ ] Offer acceptance tracked correctly
- [ ] Mobile responsive

### Phase 8 (Reporting)
- [ ] All reports load in < 5s
- [ ] Reports accurate vs manual count
- [ ] Exports work for all reports

---

## Appendices

### A. Glossary

- **ADS**: Additional Dwelling Supplement (Scottish tax on additional properties)
- **Fee Earner**: Solicitor/conveyancer handling matters
- **Home Report**: Property survey required in Scotland
- **LBTT**: Land and Buildings Transaction Tax (Scottish stamp duty)
- **Matter**: A legal case/transaction
- **Conveyancing**: Legal process of transferring property ownership

### B. Scottish Conveyancing Process

Purchase workflow is specific to Scottish law:
1. Home Reports mandatory before marketing
2. Closing dates common for competitive properties
3. Missives (contract) formed through offer and acceptance
4. LBTT payable instead of Stamp Duty
5. Registration with Registers of Scotland

### C. Comparison to Current System

| Feature | Current System | New System |
|---------|---------------|------------|
| Client Records | Embedded in quotes | Standalone table |
| Workflow | Manual, ad-hoc | 12-stage automated |
| Tasks | None | Auto-generated checklists |
| Documents | None | Structured storage |
| Offers | Manual emails | Approval workflow + tracking |
| Allocation | Manual | Workload-based with calendar |
| Reminders | Manual | Automated |
| Portal | None | Client-facing acceptance |

### D. Future Enhancements (Post-Phase 8)

- **AI Document Review**: Auto-extract data from home reports
- **Email Integration**: Parse incoming emails into matter timeline
- **WhatsApp Notifications**: Client updates via WhatsApp
- **Mobile App**: Native iOS/Android app for fee earners
- **Voice Commands**: "Alexa, what's my workload today?"
- **Predictive Analytics**: ML to predict completion times
- **Blockchain**: Immutable matter audit trail
- **API Marketplace**: Third-party integrations

---

## Conclusion

This specification provides a comprehensive roadmap for building the Purchase Client Workflow system. The **8-phase approach** ensures incremental delivery of value while building toward a complete solution.

**Total Estimated Timeline:** 20-22 weeks (5-6 months)
**Total Estimated Effort:** 110-130 developer days

Each phase is designed to be independently deployable, allowing for early user feedback and iterative improvement.

**Next Steps:**
1. Review and approve this specification
2. Prioritize phases based on business needs
3. Begin Phase 1 database design
4. Set up project tracking (Kanban board)
5. Schedule regular progress reviews

---

**Document Control:**
- **Author:** Claude (AI Assistant)
- **Reviewed By:** [Pending]
- **Approved By:** [Pending]
- **Last Updated:** 2025-11-20
- **Version:** 1.0
