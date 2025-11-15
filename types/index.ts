import { Database } from './database'

// Database table types
export type TenantSetting = Database['public']['Tables']['tenant_settings']['Row']
export type TenantSettingInsert = Database['public']['Tables']['tenant_settings']['Insert']
export type TenantSettingUpdate = Database['public']['Tables']['tenant_settings']['Update']

export type FeatureFlag = Database['public']['Tables']['feature_flags']['Row']
export type FeatureFlagInsert = Database['public']['Tables']['feature_flags']['Insert']
export type FeatureFlagUpdate = Database['public']['Tables']['feature_flags']['Update']

// Audit fields interface - to be added to all tables
export interface AuditFields {
  created_at: string
  updated_at: string
  created_by: string | null
  deleted_at?: string | null // For soft deletes
}

// Application-specific types

export interface Tenant {
  id: string
  name: string
  subdomain: string
  // Additional fields to be added in Phase 2+
}

export interface User {
  id: string
  email: string
  tenant_id: string
  role: 'admin' | 'user'
  // Additional fields to be added in Phase 2+
}

// TODO: Add quote, property, and other domain types in future phases
