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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          tenant_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          postcode: string | null
          country: string | null
          client_type: string | null
          life_stage: string | null
          source: string | null
          tags: string[] | null
          notes: string | null
          services_used: Json
          created_at: string
          updated_at: string
          created_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postcode?: string | null
          country?: string | null
          client_type?: string | null
          life_stage?: string | null
          source?: string | null
          tags?: string[] | null
          notes?: string | null
          services_used?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postcode?: string | null
          country?: string | null
          client_type?: string | null
          life_stage?: string | null
          source?: string | null
          tags?: string[] | null
          notes?: string | null
          services_used?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          id: string
          tenant_id: string
          property_id: string | null
          client_id: string | null
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
          client_id?: string | null
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
          client_id?: string | null
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
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          campaign_type: 'wills' | 'power_of_attorney' | 'estate_planning' | 'remortgage' | 'custom'
          status: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
          target_life_stages: string[] | null
          target_client_types: string[] | null
          target_services_used: string[] | null
          send_delay_days: number
          max_emails_per_campaign: number
          total_sent: number
          total_opened: number
          total_clicked: number
          total_converted: number
          estimated_revenue: number
          created_by: string | null
          created_at: string
          updated_at: string
          started_at: string | null
          ended_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          campaign_type: 'wills' | 'power_of_attorney' | 'estate_planning' | 'remortgage' | 'custom'
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
          target_life_stages?: string[] | null
          target_client_types?: string[] | null
          target_services_used?: string[] | null
          send_delay_days?: number
          max_emails_per_campaign?: number
          total_sent?: number
          total_opened?: number
          total_clicked?: number
          total_converted?: number
          estimated_revenue?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
          started_at?: string | null
          ended_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          campaign_type?: 'wills' | 'power_of_attorney' | 'estate_planning' | 'remortgage' | 'custom'
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
          target_life_stages?: string[] | null
          target_client_types?: string[] | null
          target_services_used?: string[] | null
          send_delay_days?: number
          max_emails_per_campaign?: number
          total_sent?: number
          total_opened?: number
          total_clicked?: number
          total_converted?: number
          estimated_revenue?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
          started_at?: string | null
          ended_at?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          id: string
          tenant_id: string
          campaign_id: string | null
          name: string
          description: string | null
          sequence_order: number
          subject_line: string
          preview_text: string | null
          body_html: string
          body_text: string | null
          from_name: string | null
          from_email: string | null
          reply_to: string | null
          send_delay_days: number
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          campaign_id?: string | null
          name: string
          description?: string | null
          sequence_order?: number
          subject_line: string
          preview_text?: string | null
          body_html: string
          body_text?: string | null
          from_name?: string | null
          from_email?: string | null
          reply_to?: string | null
          send_delay_days?: number
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          campaign_id?: string | null
          name?: string
          description?: string | null
          sequence_order?: number
          subject_line?: string
          preview_text?: string | null
          body_html?: string
          body_text?: string | null
          from_name?: string | null
          from_email?: string | null
          reply_to?: string | null
          send_delay_days?: number
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaign_triggers: {
        Row: {
          id: string
          tenant_id: string
          campaign_id: string
          trigger_type: 'quote_accepted' | 'quote_sent' | 'client_created' | 'service_completed' | 'date_based' | 'manual'
          trigger_condition: Json | null
          is_active: boolean
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          campaign_id: string
          trigger_type: 'quote_accepted' | 'quote_sent' | 'client_created' | 'service_completed' | 'date_based' | 'manual'
          trigger_condition?: Json | null
          is_active?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          campaign_id?: string
          trigger_type?: 'quote_accepted' | 'quote_sent' | 'client_created' | 'service_completed' | 'date_based' | 'manual'
          trigger_condition?: Json | null
          is_active?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          id: string
          tenant_id: string
          campaign_id: string | null
          template_id: string | null
          client_id: string
          to_email: string
          to_name: string | null
          subject: string
          body_html: string
          body_text: string | null
          personalization_data: Json | null
          scheduled_for: string
          sent_at: string | null
          status: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled'
          error_message: string | null
          retry_count: number
          max_retries: number
          sendgrid_message_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          campaign_id?: string | null
          template_id?: string | null
          client_id: string
          to_email: string
          to_name?: string | null
          subject: string
          body_html: string
          body_text?: string | null
          personalization_data?: Json | null
          scheduled_for: string
          sent_at?: string | null
          status?: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled'
          error_message?: string | null
          retry_count?: number
          max_retries?: number
          sendgrid_message_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          campaign_id?: string | null
          template_id?: string | null
          client_id?: string
          to_email?: string
          to_name?: string | null
          subject?: string
          body_html?: string
          body_text?: string | null
          personalization_data?: Json | null
          scheduled_for?: string
          sent_at?: string | null
          status?: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled'
          error_message?: string | null
          retry_count?: number
          max_retries?: number
          sendgrid_message_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_history: {
        Row: {
          id: string
          tenant_id: string
          campaign_id: string | null
          template_id: string | null
          client_id: string
          queue_id: string | null
          to_email: string
          to_name: string | null
          subject: string
          sent_at: string
          opened_at: string | null
          open_count: number
          last_opened_at: string | null
          clicked_at: string | null
          click_count: number
          last_clicked_at: string | null
          converted_at: string | null
          conversion_value: number | null
          conversion_type: string | null
          bounced: boolean
          bounce_type: string | null
          unsubscribed: boolean
          unsubscribed_at: string | null
          sendgrid_message_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          campaign_id?: string | null
          template_id?: string | null
          client_id: string
          queue_id?: string | null
          to_email: string
          to_name?: string | null
          subject: string
          sent_at: string
          opened_at?: string | null
          open_count?: number
          last_opened_at?: string | null
          clicked_at?: string | null
          click_count?: number
          last_clicked_at?: string | null
          converted_at?: string | null
          conversion_value?: number | null
          conversion_type?: string | null
          bounced?: boolean
          bounce_type?: string | null
          unsubscribed?: boolean
          unsubscribed_at?: string | null
          sendgrid_message_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          campaign_id?: string | null
          template_id?: string | null
          client_id?: string
          queue_id?: string | null
          to_email?: string
          to_name?: string | null
          subject?: string
          sent_at?: string
          opened_at?: string | null
          open_count?: number
          last_opened_at?: string | null
          clicked_at?: string | null
          click_count?: number
          last_clicked_at?: string | null
          converted_at?: string | null
          conversion_value?: number | null
          conversion_type?: string | null
          bounced?: boolean
          bounce_type?: string | null
          unsubscribed?: boolean
          unsubscribed_at?: string | null
          sendgrid_message_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      campaign_subscribers: {
        Row: {
          id: string
          tenant_id: string
          campaign_id: string
          client_id: string
          status: 'active' | 'paused' | 'completed' | 'unsubscribed'
          current_email_sequence: number
          emails_sent: number
          emails_opened: number
          emails_clicked: number
          converted: boolean
          conversion_value: number | null
          enrolled_at: string
          completed_at: string | null
          unsubscribed_at: string | null
          enrollment_source: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          campaign_id: string
          client_id: string
          status?: 'active' | 'paused' | 'completed' | 'unsubscribed'
          current_email_sequence?: number
          emails_sent?: number
          emails_opened?: number
          emails_clicked?: number
          converted?: boolean
          conversion_value?: number | null
          enrolled_at?: string
          completed_at?: string | null
          unsubscribed_at?: string | null
          enrollment_source?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          campaign_id?: string
          client_id?: string
          status?: 'active' | 'paused' | 'completed' | 'unsubscribed'
          current_email_sequence?: number
          emails_sent?: number
          emails_opened?: number
          emails_clicked?: number
          converted?: boolean
          conversion_value?: number | null
          enrolled_at?: string
          completed_at?: string | null
          unsubscribed_at?: string | null
          enrollment_source?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaign_analytics: {
        Row: {
          id: string
          tenant_id: string
          campaign_id: string
          analytics_date: string
          emails_sent: number
          emails_delivered: number
          emails_opened: number
          emails_clicked: number
          emails_bounced: number
          conversions: number
          revenue_generated: number
          new_subscribers: number
          unsubscribers: number
          open_rate: number | null
          click_rate: number | null
          conversion_rate: number | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          campaign_id: string
          analytics_date: string
          emails_sent?: number
          emails_delivered?: number
          emails_opened?: number
          emails_clicked?: number
          emails_bounced?: number
          conversions?: number
          revenue_generated?: number
          new_subscribers?: number
          unsubscribers?: number
          open_rate?: number | null
          click_rate?: number | null
          conversion_rate?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          campaign_id?: string
          analytics_date?: string
          emails_sent?: number
          emails_delivered?: number
          emails_opened?: number
          emails_clicked?: number
          emails_bounced?: number
          conversions?: number
          revenue_generated?: number
          new_subscribers?: number
          unsubscribers?: number
          open_rate?: number | null
          click_rate?: number | null
          conversion_rate?: number | null
          created_at?: string
        }
        Relationships: []
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
