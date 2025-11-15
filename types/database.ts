export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenant_settings: {
        Row: {
          id: string
          tenant_id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      feature_flags: {
        Row: {
          id: string
          tenant_id: string
          flag_name: string
          enabled: boolean
          metadata: Json | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          flag_name: string
          enabled?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          flag_name?: string
          enabled?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          email: string | null
          phone: string | null
          website: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          postcode: string | null
          country: string | null
          status: 'active' | 'suspended' | 'cancelled'
          subscription_tier: 'trial' | 'standard' | 'professional' | 'enterprise' | null
          created_at: string
          updated_at: string
          created_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          email?: string | null
          phone?: string | null
          website?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postcode?: string | null
          country?: string | null
          status?: 'active' | 'suspended' | 'cancelled'
          subscription_tier?: 'trial' | 'standard' | 'professional' | 'enterprise' | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          email?: string | null
          phone?: string | null
          website?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postcode?: string | null
          country?: string | null
          status?: 'active' | 'suspended' | 'cancelled'
          subscription_tier?: 'trial' | 'standard' | 'professional' | 'enterprise' | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          deleted_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          job_title: string | null
          law_society_number: string | null
          email_notifications: boolean
          timezone: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          job_title?: string | null
          law_society_number?: string | null
          email_notifications?: boolean
          timezone?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          job_title?: string | null
          law_society_number?: string | null
          email_notifications?: boolean
          timezone?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      tenant_memberships: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
          status: 'active' | 'invited' | 'suspended'
          invited_by: string | null
          invitation_token: string | null
          invitation_expires_at: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
          status?: 'active' | 'invited' | 'suspended'
          invited_by?: string | null
          invitation_token?: string | null
          invitation_expires_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
          status?: 'active' | 'invited' | 'suspended'
          invited_by?: string | null
          invitation_token?: string | null
          invitation_expires_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          deleted_at?: string | null
        }
      }
      properties: {
        Row: {
          id: string
          tenant_id: string
          address_line1: string
          address_line2: string | null
          city: string
          postcode: string
          country: string | null
          property_type: 'residential' | 'commercial' | 'land' | 'mixed' | null
          tenure: 'freehold' | 'leasehold' | 'commonhold' | null
          bedrooms: number | null
          bathrooms: number | null
          floor_area_sqm: number | null
          estimated_value: number | null
          purchase_price: number | null
          title_number: string | null
          uprn: string | null
          metadata: Json
          created_at: string
          updated_at: string
          created_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          address_line1: string
          address_line2?: string | null
          city: string
          postcode: string
          country?: string | null
          property_type?: 'residential' | 'commercial' | 'land' | 'mixed' | null
          tenure?: 'freehold' | 'leasehold' | 'commonhold' | null
          bedrooms?: number | null
          bathrooms?: number | null
          floor_area_sqm?: number | null
          estimated_value?: number | null
          purchase_price?: number | null
          title_number?: string | null
          uprn?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          postcode?: string
          country?: string | null
          property_type?: 'residential' | 'commercial' | 'land' | 'mixed' | null
          tenure?: 'freehold' | 'leasehold' | 'commonhold' | null
          bedrooms?: number | null
          bathrooms?: number | null
          floor_area_sqm?: number | null
          estimated_value?: number | null
          purchase_price?: number | null
          title_number?: string | null
          uprn?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
          deleted_at?: string | null
        }
      }
      quotes: {
        Row: {
          id: string
          tenant_id: string
          property_id: string | null
          quote_number: string
          status: 'draft' | 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
          transaction_type: 'purchase' | 'sale' | 'remortgage' | 'transfer_of_equity'
          transaction_value: number
          client_name: string
          client_email: string | null
          client_phone: string | null
          base_fee: number
          disbursements: number
          vat_amount: number
          total_amount: number
          fee_breakdown: Json
          valid_until: string | null
          estimated_completion_weeks: number | null
          notes: string | null
          terms_and_conditions: string | null
          internal_notes: string | null
          cross_sell_opportunities: Json
          created_at: string
          updated_at: string
          created_by: string | null
          sent_at: string | null
          sent_by: string | null
          accepted_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          property_id?: string | null
          quote_number?: string
          status?: 'draft' | 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
          transaction_type: 'purchase' | 'sale' | 'remortgage' | 'transfer_of_equity'
          transaction_value: number
          client_name: string
          client_email?: string | null
          client_phone?: string | null
          base_fee: number
          disbursements?: number
          vat_amount?: number
          total_amount: number
          fee_breakdown?: Json
          valid_until?: string | null
          estimated_completion_weeks?: number | null
          notes?: string | null
          terms_and_conditions?: string | null
          internal_notes?: string | null
          cross_sell_opportunities?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
          sent_at?: string | null
          sent_by?: string | null
          accepted_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          property_id?: string | null
          quote_number?: string
          status?: 'draft' | 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
          transaction_type?: 'purchase' | 'sale' | 'remortgage' | 'transfer_of_equity'
          transaction_value?: number
          client_name?: string
          client_email?: string | null
          client_phone?: string | null
          base_fee?: number
          disbursements?: number
          vat_amount?: number
          total_amount?: number
          fee_breakdown?: Json
          valid_until?: string | null
          estimated_completion_weeks?: number | null
          notes?: string | null
          terms_and_conditions?: string | null
          internal_notes?: string | null
          cross_sell_opportunities?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
          sent_at?: string | null
          sent_by?: string | null
          accepted_at?: string | null
          deleted_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
