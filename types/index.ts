import { Database } from './database'

// Database table types
export type TenantSetting = Database['public']['Tables']['tenant_settings']['Row']
export type TenantSettingInsert = Database['public']['Tables']['tenant_settings']['Insert']
export type TenantSettingUpdate = Database['public']['Tables']['tenant_settings']['Update']

export type FeatureFlag = Database['public']['Tables']['feature_flags']['Row']
export type FeatureFlagInsert = Database['public']['Tables']['feature_flags']['Insert']
export type FeatureFlagUpdate = Database['public']['Tables']['feature_flags']['Update']

export type Tenant = Database['public']['Tables']['tenants']['Row']
export type TenantInsert = Database['public']['Tables']['tenants']['Insert']
export type TenantUpdate = Database['public']['Tables']['tenants']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type TenantMembership = Database['public']['Tables']['tenant_memberships']['Row']
export type TenantMembershipInsert = Database['public']['Tables']['tenant_memberships']['Insert']
export type TenantMembershipUpdate = Database['public']['Tables']['tenant_memberships']['Update']

export type Property = Database['public']['Tables']['properties']['Row']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']

export type Quote = Database['public']['Tables']['quotes']['Row']
export type QuoteInsert = Database['public']['Tables']['quotes']['Insert']
export type QuoteUpdate = Database['public']['Tables']['quotes']['Update']

// Audit fields interface - used across all tables
export interface AuditFields {
  created_at: string
  updated_at: string
  created_by: string | null
  deleted_at?: string | null // For soft deletes
}

// Enums and constants
export const TenantStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
} as const

export const SubscriptionTier = {
  TRIAL: 'trial',
  STANDARD: 'standard',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
} as const

export const MembershipRole = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const

export const MembershipStatus = {
  ACTIVE: 'active',
  INVITED: 'invited',
  SUSPENDED: 'suspended',
} as const

export const PropertyType = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  LAND: 'land',
  MIXED: 'mixed',
} as const

export const Tenure = {
  FREEHOLD: 'freehold',
  LEASEHOLD: 'leasehold',
  COMMONHOLD: 'commonhold',
} as const

export const QuoteStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const

export const TransactionType = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  REMORTGAGE: 'remortgage',
  TRANSFER_OF_EQUITY: 'transfer_of_equity',
} as const

// Extended types with relations
export interface QuoteWithRelations extends Quote {
  property?: Property | null
  tenant?: Tenant
  created_by_user?: Profile | null
}

export interface TenantMembershipWithUser extends TenantMembership {
  profile?: Profile
}

export interface PropertyWithQuotes extends Property {
  quotes?: Quote[]
}

// ============================================================================
// PURCHASE CLIENT WORKFLOW (Phase 12)
// ============================================================================

export * from './purchase-workflow'

// Purchase Workflow Constants
export const MatterType = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  REMORTGAGE: 'remortgage',
  TRANSFER_OF_EQUITY: 'transfer_of_equity',
} as const

export const MatterStatus = {
  NEW: 'new',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const MatterPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
  CANCELLED: 'cancelled',
} as const

export const TaskType = {
  MANUAL: 'manual',
  AUTOMATED: 'automated',
  APPROVAL: 'approval',
} as const

export const DocumentType = {
  HOME_REPORT: 'home_report',
  FINANCIAL_QUESTIONNAIRE: 'financial_questionnaire',
  OFFER_LETTER: 'offer_letter',
  ID_DOCUMENT: 'id_document',
  BANK_STATEMENT: 'bank_statement',
  MORTGAGE_IN_PRINCIPLE: 'mortgage_in_principle',
  SURVEY: 'survey',
  CONTRACT: 'contract',
  SEARCHES: 'searches',
  TITLE_DEED: 'title_deed',
  OTHER: 'other',
} as const

export const DocumentStatus = {
  UPLOADED: 'uploaded',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
} as const

export const OfferType = {
  VERBAL: 'verbal',
  WRITTEN: 'written',
} as const

export const OfferStatus = {
  DRAFT: 'draft',
  PENDING_SOLICITOR: 'pending_solicitor',
  PENDING_NEGOTIATOR: 'pending_negotiator',
  PENDING_CLIENT: 'pending_client',
  SUBMITTED: 'submitted',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const

export const EmploymentStatus = {
  EMPLOYED: 'employed',
  SELF_EMPLOYED: 'self_employed',
  RETIRED: 'retired',
  UNEMPLOYED: 'unemployed',
  STUDENT: 'student',
  OTHER: 'other',
} as const

export const DepositSource = {
  SAVINGS: 'savings',
  GIFT: 'gift',
  SALE_PROCEEDS: 'sale_proceeds',
  INHERITANCE: 'inheritance',
  INVESTMENT: 'investment',
  OTHER: 'other',
} as const

export const AvailabilityType = {
  AVAILABLE: 'available',
  HOLIDAY: 'holiday',
  SICK: 'sick',
  TRAINING: 'training',
  BLOCKED: 'blocked',
  REDUCED_CAPACITY: 'reduced_capacity',
} as const
