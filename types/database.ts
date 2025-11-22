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
          mobile: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          postcode: string | null
          country: string | null
          title: string | null
          company_name: string | null
          client_type: 'individual' | 'couple' | 'company' | 'estate' | 'business' | null
          preferred_contact_method: 'email' | 'phone' | 'mobile'
          date_of_birth: string | null
          national_insurance_number: string | null
          passport_number: string | null
          life_stage: string | null
          source: string | null
          tags: string[] | null
          notes: string | null
          services_used: Json
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          mobile?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postcode?: string | null
          country?: string | null
          title?: string | null
          company_name?: string | null
          client_type?: 'individual' | 'couple' | 'company' | 'estate' | 'business' | null
          preferred_contact_method?: 'email' | 'phone' | 'mobile'
          date_of_birth?: string | null
          national_insurance_number?: string | null
          passport_number?: string | null
          life_stage?: string | null
          source?: string | null
          tags?: string[] | null
          notes?: string | null
          services_used?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          mobile?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postcode?: string | null
          country?: string | null
          title?: string | null
          company_name?: string | null
          client_type?: 'individual' | 'couple' | 'company' | 'estate' | 'business' | null
          preferred_contact_method?: 'email' | 'phone' | 'mobile'
          date_of_birth?: string | null
          national_insurance_number?: string | null
          passport_number?: string | null
          life_stage?: string | null
          source?: string | null
          tags?: string[] | null
          notes?: string | null
          services_used?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
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
          delivered_at: string | null
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
          bounced_at: string | null
          bounce_reason: string | null
          bounce_type: string | null
          unsubscribed: boolean
          unsubscribed_at: string | null
          spam_reported_at: string | null
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
          delivered_at?: string | null
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
          bounced_at?: string | null
          bounce_reason?: string | null
          bounce_type?: string | null
          unsubscribed?: boolean
          unsubscribed_at?: string | null
          spam_reported_at?: string | null
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
          delivered_at?: string | null
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
          bounced_at?: string | null
          bounce_reason?: string | null
          bounce_type?: string | null
          unsubscribed?: boolean
          unsubscribed_at?: string | null
          spam_reported_at?: string | null
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
      matters: {
        Row: {
          id: string
          tenant_id: string
          matter_number: string
          matter_type: 'purchase' | 'sale' | 'remortgage' | 'transfer_of_equity'
          status: 'new' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          primary_client_id: string | null
          secondary_client_id: string | null
          property_id: string | null
          quote_id: string | null
          current_stage: string | null
          current_stage_started_at: string | null
          instruction_date: string | null
          target_completion_date: string | null
          actual_completion_date: string | null
          closing_date: string | null
          purchase_price: number | null
          mortgage_amount: number | null
          deposit_amount: number | null
          ads_applicable: boolean | null
          first_time_buyer: boolean | null
          selling_agent_name: string | null
          selling_agent_email: string | null
          selling_agent_phone: string | null
          seller_solicitor_name: string | null
          seller_solicitor_firm: string | null
          seller_solicitor_email: string | null
          assigned_fee_earner_id: string | null
          assigned_at: string | null
          assigned_by: string | null
          priority: 'low' | 'normal' | 'high' | 'urgent'
          notes: string | null
          internal_notes: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          matter_number: string
          matter_type: 'purchase' | 'sale' | 'remortgage' | 'transfer_of_equity'
          status?: 'new' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          primary_client_id?: string | null
          secondary_client_id?: string | null
          property_id?: string | null
          quote_id?: string | null
          current_stage?: string | null
          current_stage_started_at?: string | null
          instruction_date?: string | null
          target_completion_date?: string | null
          actual_completion_date?: string | null
          closing_date?: string | null
          purchase_price?: number | null
          mortgage_amount?: number | null
          deposit_amount?: number | null
          ads_applicable?: boolean | null
          first_time_buyer?: boolean | null
          selling_agent_name?: string | null
          selling_agent_email?: string | null
          selling_agent_phone?: string | null
          seller_solicitor_name?: string | null
          seller_solicitor_firm?: string | null
          seller_solicitor_email?: string | null
          assigned_fee_earner_id?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          notes?: string | null
          internal_notes?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          matter_number?: string
          matter_type?: 'purchase' | 'sale' | 'remortgage' | 'transfer_of_equity'
          status?: 'new' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          primary_client_id?: string | null
          secondary_client_id?: string | null
          property_id?: string | null
          quote_id?: string | null
          current_stage?: string | null
          current_stage_started_at?: string | null
          instruction_date?: string | null
          target_completion_date?: string | null
          actual_completion_date?: string | null
          closing_date?: string | null
          purchase_price?: number | null
          mortgage_amount?: number | null
          deposit_amount?: number | null
          ads_applicable?: boolean | null
          first_time_buyer?: boolean | null
          selling_agent_name?: string | null
          selling_agent_email?: string | null
          selling_agent_phone?: string | null
          seller_solicitor_name?: string | null
          seller_solicitor_firm?: string | null
          seller_solicitor_email?: string | null
          assigned_fee_earner_id?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          notes?: string | null
          internal_notes?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      workflow_stages: {
        Row: {
          id: string
          tenant_id: string | null
          stage_key: string
          stage_name: string
          stage_description: string | null
          stage_order: number
          matter_type: string
          auto_transition_conditions: Json | null
          required_task_keys: string[] | null
          entry_notification_template: string | null
          exit_notification_template: string | null
          reminder_days_before_due: number[] | null
          is_active: boolean
          color: string | null
          icon: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          stage_key: string
          stage_name: string
          stage_description?: string | null
          stage_order: number
          matter_type: string
          auto_transition_conditions?: Json | null
          required_task_keys?: string[] | null
          entry_notification_template?: string | null
          exit_notification_template?: string | null
          reminder_days_before_due?: number[] | null
          is_active?: boolean
          color?: string | null
          icon?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          stage_key?: string
          stage_name?: string
          stage_description?: string | null
          stage_order?: number
          matter_type?: string
          auto_transition_conditions?: Json | null
          required_task_keys?: string[] | null
          entry_notification_template?: string | null
          exit_notification_template?: string | null
          reminder_days_before_due?: number[] | null
          is_active?: boolean
          color?: string | null
          icon?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      matter_tasks: {
        Row: {
          id: string
          matter_id: string
          tenant_id: string
          task_key: string
          title: string
          description: string | null
          task_type: 'manual' | 'automated' | 'approval'
          stage: string
          status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          assigned_to: string | null
          assigned_at: string | null
          assigned_by: string | null
          due_date: string | null
          completed_at: string | null
          completed_by: string | null
          depends_on_task_ids: string[] | null
          blocks_stage_progression: boolean
          reminder_sent_at: string | null
          reminder_days_before: number | null
          metadata: Json | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          matter_id: string
          tenant_id: string
          task_key: string
          title: string
          description?: string | null
          task_type: 'manual' | 'automated' | 'approval'
          stage: string
          status?: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          assigned_to?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          due_date?: string | null
          completed_at?: string | null
          completed_by?: string | null
          depends_on_task_ids?: string[] | null
          blocks_stage_progression?: boolean
          reminder_sent_at?: string | null
          reminder_days_before?: number | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          matter_id?: string
          tenant_id?: string
          task_key?: string
          title?: string
          description?: string | null
          task_type?: 'manual' | 'automated' | 'approval'
          stage?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          assigned_to?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          due_date?: string | null
          completed_at?: string | null
          completed_by?: string | null
          depends_on_task_ids?: string[] | null
          blocks_stage_progression?: boolean
          reminder_sent_at?: string | null
          reminder_days_before?: number | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          tenant_id: string
          document_type: string
          title: string
          description: string | null
          matter_id: string | null
          client_id: string | null
          property_id: string | null
          storage_path: string
          file_name: string
          file_size: number
          mime_type: string
          version: number
          previous_version_id: string | null
          is_latest_version: boolean
          status: 'uploaded' | 'verified' | 'rejected' | 'archived'
          verified_at: string | null
          verified_by: string | null
          tags: string[] | null
          metadata: Json | null
          created_at: string
          updated_at: string
          uploaded_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          document_type: string
          title: string
          description?: string | null
          matter_id?: string | null
          client_id?: string | null
          property_id?: string | null
          storage_path: string
          file_name: string
          file_size: number
          mime_type: string
          version?: number
          previous_version_id?: string | null
          is_latest_version?: boolean
          status?: 'uploaded' | 'verified' | 'rejected' | 'archived'
          verified_at?: string | null
          verified_by?: string | null
          tags?: string[] | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          uploaded_by?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          document_type?: string
          title?: string
          description?: string | null
          matter_id?: string | null
          client_id?: string | null
          property_id?: string | null
          storage_path?: string
          file_name?: string
          file_size?: number
          mime_type?: string
          version?: number
          previous_version_id?: string | null
          is_latest_version?: boolean
          status?: 'uploaded' | 'verified' | 'rejected' | 'archived'
          verified_at?: string | null
          verified_by?: string | null
          tags?: string[] | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          uploaded_by?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          id: string
          tenant_id: string
          matter_id: string
          offer_number: string
          offer_type: 'verbal' | 'written'
          offer_amount: number
          offer_status: 'draft' | 'pending_solicitor' | 'pending_negotiator' | 'pending_client' | 'submitted' | 'accepted' | 'rejected' | 'withdrawn'
          closing_date: string | null
          entry_date: string | null
          conditions: string | null
          survey_required: boolean | null
          drafted_by: string | null
          drafted_at: string | null
          solicitor_approved_by: string | null
          solicitor_approved_at: string | null
          negotiator_approved_by: string | null
          negotiator_approved_at: string | null
          client_accepted_at: string | null
          client_acceptance_ip: string | null
          submitted_to_agent_at: string | null
          submitted_by: string | null
          agent_response: 'accepted' | 'rejected' | 'counter_offer' | null
          agent_response_date: string | null
          agent_notes: string | null
          rejection_reason: string | null
          counter_offer_amount: number | null
          document_id: string | null
          notes: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          matter_id: string
          offer_number: string
          offer_type: 'verbal' | 'written'
          offer_amount: number
          offer_status?: 'draft' | 'pending_solicitor' | 'pending_negotiator' | 'pending_client' | 'submitted' | 'accepted' | 'rejected' | 'withdrawn'
          closing_date?: string | null
          entry_date?: string | null
          conditions?: string | null
          survey_required?: boolean | null
          drafted_by?: string | null
          drafted_at?: string | null
          solicitor_approved_by?: string | null
          solicitor_approved_at?: string | null
          negotiator_approved_by?: string | null
          negotiator_approved_at?: string | null
          client_accepted_at?: string | null
          client_acceptance_ip?: string | null
          submitted_to_agent_at?: string | null
          submitted_by?: string | null
          agent_response?: 'accepted' | 'rejected' | 'counter_offer' | null
          agent_response_date?: string | null
          agent_notes?: string | null
          rejection_reason?: string | null
          counter_offer_amount?: number | null
          document_id?: string | null
          notes?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          matter_id?: string
          offer_number?: string
          offer_type?: 'verbal' | 'written'
          offer_amount?: number
          offer_status?: 'draft' | 'pending_solicitor' | 'pending_negotiator' | 'pending_client' | 'submitted' | 'accepted' | 'rejected' | 'withdrawn'
          closing_date?: string | null
          entry_date?: string | null
          conditions?: string | null
          survey_required?: boolean | null
          drafted_by?: string | null
          drafted_at?: string | null
          solicitor_approved_by?: string | null
          solicitor_approved_at?: string | null
          negotiator_approved_by?: string | null
          negotiator_approved_at?: string | null
          client_accepted_at?: string | null
          client_acceptance_ip?: string | null
          submitted_to_agent_at?: string | null
          submitted_by?: string | null
          agent_response?: 'accepted' | 'rejected' | 'counter_offer' | null
          agent_response_date?: string | null
          agent_notes?: string | null
          rejection_reason?: string | null
          counter_offer_amount?: number | null
          document_id?: string | null
          notes?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      financial_questionnaires: {
        Row: {
          id: string
          tenant_id: string
          matter_id: string
          client_id: string
          employment_status: string | null
          employer_name: string | null
          occupation: string | null
          annual_income: number | null
          additional_income_sources: string[] | null
          additional_income_amount: number | null
          savings_amount: number | null
          investments_amount: number | null
          other_assets_description: string | null
          other_assets_value: number | null
          existing_mortgage_balance: number | null
          credit_card_debt: number | null
          loan_debts: number | null
          other_liabilities_description: string | null
          other_liabilities_amount: number | null
          selling_property: boolean | null
          sale_property_address: string | null
          expected_sale_proceeds: number | null
          sale_status: string | null
          mortgage_required: boolean | null
          mortgage_amount_required: number | null
          mortgage_in_principle: boolean | null
          mortgage_lender: string | null
          mortgage_broker_name: string | null
          mortgage_broker_contact: string | null
          deposit_source: string | null
          deposit_amount: number | null
          deposit_available_date: string | null
          owns_other_properties: boolean | null
          other_properties_count: number | null
          other_properties_details: string | null
          ads_applicable: boolean | null
          completed_at: string | null
          completed_by: string | null
          verified_at: string | null
          verified_by: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          matter_id: string
          client_id: string
          employment_status?: string | null
          employer_name?: string | null
          occupation?: string | null
          annual_income?: number | null
          additional_income_sources?: string[] | null
          additional_income_amount?: number | null
          savings_amount?: number | null
          investments_amount?: number | null
          other_assets_description?: string | null
          other_assets_value?: number | null
          existing_mortgage_balance?: number | null
          credit_card_debt?: number | null
          loan_debts?: number | null
          other_liabilities_description?: string | null
          other_liabilities_amount?: number | null
          selling_property?: boolean | null
          sale_property_address?: string | null
          expected_sale_proceeds?: number | null
          sale_status?: string | null
          mortgage_required?: boolean | null
          mortgage_amount_required?: number | null
          mortgage_in_principle?: boolean | null
          mortgage_lender?: string | null
          mortgage_broker_name?: string | null
          mortgage_broker_contact?: string | null
          deposit_source?: string | null
          deposit_amount?: number | null
          deposit_available_date?: string | null
          owns_other_properties?: boolean | null
          other_properties_count?: number | null
          other_properties_details?: string | null
          ads_applicable?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          matter_id?: string
          client_id?: string
          employment_status?: string | null
          employer_name?: string | null
          occupation?: string | null
          annual_income?: number | null
          additional_income_sources?: string[] | null
          additional_income_amount?: number | null
          savings_amount?: number | null
          investments_amount?: number | null
          other_assets_description?: string | null
          other_assets_value?: number | null
          existing_mortgage_balance?: number | null
          credit_card_debt?: number | null
          loan_debts?: number | null
          other_liabilities_description?: string | null
          other_liabilities_amount?: number | null
          selling_property?: boolean | null
          sale_property_address?: string | null
          expected_sale_proceeds?: number | null
          sale_status?: string | null
          mortgage_required?: boolean | null
          mortgage_amount_required?: number | null
          mortgage_in_principle?: boolean | null
          mortgage_lender?: string | null
          mortgage_broker_name?: string | null
          mortgage_broker_contact?: string | null
          deposit_source?: string | null
          deposit_amount?: number | null
          deposit_available_date?: string | null
          owns_other_properties?: boolean | null
          other_properties_count?: number | null
          other_properties_details?: string | null
          ads_applicable?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      fee_earner_settings: {
        Row: {
          id: string
          tenant_id: string
          fee_earner_id: string
          max_concurrent_matters: number | null
          max_new_matters_per_week: number | null
          matter_types: string[] | null
          max_transaction_value: number | null
          min_transaction_value: number | null
          accepts_auto_assignment: boolean
          assignment_priority: number | null
          working_days: number[] | null
          working_hours_start: string | null
          working_hours_end: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          fee_earner_id: string
          max_concurrent_matters?: number | null
          max_new_matters_per_week?: number | null
          matter_types?: string[] | null
          max_transaction_value?: number | null
          min_transaction_value?: number | null
          accepts_auto_assignment?: boolean
          assignment_priority?: number | null
          working_days?: number[] | null
          working_hours_start?: string | null
          working_hours_end?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          fee_earner_id?: string
          max_concurrent_matters?: number | null
          max_new_matters_per_week?: number | null
          matter_types?: string[] | null
          max_transaction_value?: number | null
          min_transaction_value?: number | null
          accepts_auto_assignment?: boolean
          assignment_priority?: number | null
          working_days?: number[] | null
          working_hours_start?: string | null
          working_hours_end?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      fee_earner_availability: {
        Row: {
          id: string
          tenant_id: string
          fee_earner_id: string
          start_date: string
          end_date: string | null
          availability_type: 'available' | 'holiday' | 'sick' | 'training' | 'blocked' | 'reduced_capacity'
          is_available: boolean
          max_new_matters_per_week: number | null
          current_workload: number | null
          reason: string | null
          notes: string | null
          is_recurring: boolean
          recurrence_pattern: Json | null
          created_at: string
          updated_at: string
          created_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          fee_earner_id: string
          start_date: string
          end_date?: string | null
          availability_type: 'available' | 'holiday' | 'sick' | 'training' | 'blocked' | 'reduced_capacity'
          is_available?: boolean
          max_new_matters_per_week?: number | null
          current_workload?: number | null
          reason?: string | null
          notes?: string | null
          is_recurring?: boolean
          recurrence_pattern?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          fee_earner_id?: string
          start_date?: string
          end_date?: string | null
          availability_type?: 'available' | 'holiday' | 'sick' | 'training' | 'blocked' | 'reduced_capacity'
          is_available?: boolean
          max_new_matters_per_week?: number | null
          current_workload?: number | null
          reason?: string | null
          notes?: string | null
          is_recurring?: boolean
          recurrence_pattern?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      matter_activities: {
        Row: {
          id: string
          matter_id: string
          tenant_id: string
          activity_type: string
          title: string
          description: string | null
          actor_id: string | null
          actor_name: string | null
          related_task_id: string | null
          related_document_id: string | null
          related_offer_id: string | null
          changes: Json | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          matter_id: string
          tenant_id: string
          activity_type: string
          title: string
          description?: string | null
          actor_id?: string | null
          actor_name?: string | null
          related_task_id?: string | null
          related_document_id?: string | null
          related_offer_id?: string | null
          changes?: Json | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          matter_id?: string
          tenant_id?: string
          activity_type?: string
          title?: string
          description?: string | null
          actor_id?: string | null
          actor_name?: string | null
          related_task_id?: string | null
          related_document_id?: string | null
          related_offer_id?: string | null
          changes?: Json | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      client_portal_tokens: {
        Row: {
          id: string
          tenant_id: string
          matter_id: string | null
          client_id: string
          token: string
          token_hash: string
          expires_at: string
          is_active: boolean
          last_accessed_at: string | null
          access_count: number
          last_ip_address: string | null
          offer_accepted_at: string | null
          offer_acceptance_ip: string | null
          purpose: string | null
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          matter_id?: string | null
          client_id: string
          token: string
          token_hash: string
          expires_at: string
          is_active?: boolean
          last_accessed_at?: string | null
          access_count?: number
          last_ip_address?: string | null
          offer_accepted_at?: string | null
          offer_acceptance_ip?: string | null
          purpose?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          matter_id?: string | null
          client_id?: string
          token?: string
          token_hash?: string
          expires_at?: string
          is_active?: boolean
          last_accessed_at?: string | null
          access_count?: number
          last_ip_address?: string | null
          offer_accepted_at?: string | null
          offer_acceptance_ip?: string | null
          purpose?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          id: string
          user_id: string
          name: string
          query: string
          filters: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          query: string
          filters?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          query?: string
          filters?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      recent_searches: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          query: string
          searched_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          query: string
          searched_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          query?: string
          searched_at?: string
        }
        Relationships: []
      }
      form_templates: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          visibility: 'global' | 'firm_specific'
          allowed_tenant_ids: string[] | null
          is_multi_step: boolean
          enable_lbtt_calculation: boolean
          enable_fee_calculation: boolean
          success_message: string | null
          submit_button_text: string | null
          status: 'draft' | 'published' | 'archived'
          is_active: boolean
          created_by_platform_admin: boolean
          version: number
          created_at: string
          updated_at: string
          created_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          visibility?: 'global' | 'firm_specific'
          allowed_tenant_ids?: string[] | null
          is_multi_step?: boolean
          enable_lbtt_calculation?: boolean
          enable_fee_calculation?: boolean
          success_message?: string | null
          submit_button_text?: string | null
          status?: 'draft' | 'published' | 'archived'
          is_active?: boolean
          created_by_platform_admin?: boolean
          version?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          visibility?: 'global' | 'firm_specific'
          allowed_tenant_ids?: string[] | null
          is_multi_step?: boolean
          enable_lbtt_calculation?: boolean
          enable_fee_calculation?: boolean
          success_message?: string | null
          submit_button_text?: string | null
          status?: 'draft' | 'published' | 'archived'
          is_active?: boolean
          created_by_platform_admin?: boolean
          version?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      form_steps: {
        Row: {
          id: string
          form_template_id: string
          step_number: number
          title: string
          description: string | null
          display_order: number
          conditional_logic: Json | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          form_template_id: string
          step_number: number
          title: string
          description?: string | null
          display_order: number
          conditional_logic?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          form_template_id?: string
          step_number?: number
          title?: string
          description?: string | null
          display_order?: number
          conditional_logic?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      form_fields: {
        Row: {
          id: string
          form_template_id: string
          form_step_id: string | null
          field_name: string
          field_label: string
          field_type: string
          placeholder: string | null
          help_text: string | null
          default_value: string | null
          is_required: boolean
          validation_rules: Json | null
          display_order: number
          width: 'full' | 'half' | 'third' | 'quarter'
          conditional_logic: Json | null
          affects_pricing: boolean
          pricing_field_type: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          form_template_id: string
          form_step_id?: string | null
          field_name: string
          field_label: string
          field_type: string
          placeholder?: string | null
          help_text?: string | null
          default_value?: string | null
          is_required?: boolean
          validation_rules?: Json | null
          display_order: number
          width?: 'full' | 'half' | 'third' | 'quarter'
          conditional_logic?: Json | null
          affects_pricing?: boolean
          pricing_field_type?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          form_template_id?: string
          form_step_id?: string | null
          field_name?: string
          field_label?: string
          field_type?: string
          placeholder?: string | null
          help_text?: string | null
          default_value?: string | null
          is_required?: boolean
          validation_rules?: Json | null
          display_order?: number
          width?: 'full' | 'half' | 'third' | 'quarter'
          conditional_logic?: Json | null
          affects_pricing?: boolean
          pricing_field_type?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      form_field_options: {
        Row: {
          id: string
          form_field_id: string
          option_label: string
          option_value: string
          display_order: number
          is_default: boolean
          has_fee: boolean
          fee_amount: number | null
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          form_field_id: string
          option_label: string
          option_value: string
          display_order: number
          is_default?: boolean
          has_fee?: boolean
          fee_amount?: number | null
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          form_field_id?: string
          option_label?: string
          option_value?: string
          display_order?: number
          is_default?: boolean
          has_fee?: boolean
          fee_amount?: number | null
          created_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      form_pricing_rules: {
        Row: {
          id: string
          form_template_id: string
          rule_name: string
          rule_code: string
          description: string | null
          fee_type: 'fixed' | 'tiered' | 'per_item' | 'percentage' | 'conditional'
          fixed_amount: number | null
          percentage_rate: number | null
          percentage_of_field: string | null
          per_item_amount: number | null
          quantity_field: string | null
          condition_field: string | null
          condition_operator: string | null
          condition_value: string | null
          display_order: number
          show_on_quote: boolean
          category: 'legal_fees' | 'disbursements' | 'searches' | 'registration' | 'other'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          form_template_id: string
          rule_name: string
          rule_code: string
          description?: string | null
          fee_type: 'fixed' | 'tiered' | 'per_item' | 'percentage' | 'conditional'
          fixed_amount?: number | null
          percentage_rate?: number | null
          percentage_of_field?: string | null
          per_item_amount?: number | null
          quantity_field?: string | null
          condition_field?: string | null
          condition_operator?: string | null
          condition_value?: string | null
          display_order: number
          show_on_quote?: boolean
          category: 'legal_fees' | 'disbursements' | 'searches' | 'registration' | 'other'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          form_template_id?: string
          rule_name?: string
          rule_code?: string
          description?: string | null
          fee_type?: 'fixed' | 'tiered' | 'per_item' | 'percentage' | 'conditional'
          fixed_amount?: number | null
          percentage_rate?: number | null
          percentage_of_field?: string | null
          per_item_amount?: number | null
          quantity_field?: string | null
          condition_field?: string | null
          condition_operator?: string | null
          condition_value?: string | null
          display_order?: number
          show_on_quote?: boolean
          category?: 'legal_fees' | 'disbursements' | 'searches' | 'registration' | 'other'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      form_pricing_tiers: {
        Row: {
          id: string
          pricing_rule_id: string
          tier_name: string
          min_value: number
          max_value: number | null
          tier_fee: number
          display_order: number
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          pricing_rule_id: string
          tier_name: string
          min_value: number
          max_value?: number | null
          tier_fee: number
          display_order: number
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          pricing_rule_id?: string
          tier_name?: string
          min_value?: number
          max_value?: number | null
          tier_fee?: number
          display_order?: number
          created_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      form_instances: {
        Row: {
          id: string
          form_template_id: string
          tenant_id: string
          is_active: boolean
          custom_name: string | null
          custom_success_message: string | null
          custom_submit_button_text: string | null
          use_platform_lbtt_rates: boolean
          custom_lbtt_rates_id: string | null
          is_published: boolean
          public_url_slug: string | null
          total_submissions: number
          total_quotes_generated: number
          created_at: string
          updated_at: string
          activated_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          form_template_id: string
          tenant_id: string
          is_active?: boolean
          custom_name?: string | null
          custom_success_message?: string | null
          custom_submit_button_text?: string | null
          use_platform_lbtt_rates?: boolean
          custom_lbtt_rates_id?: string | null
          is_published?: boolean
          public_url_slug?: string | null
          total_submissions?: number
          total_quotes_generated?: number
          created_at?: string
          updated_at?: string
          activated_by?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          form_template_id?: string
          tenant_id?: string
          is_active?: boolean
          custom_name?: string | null
          custom_success_message?: string | null
          custom_submit_button_text?: string | null
          use_platform_lbtt_rates?: boolean
          custom_lbtt_rates_id?: string | null
          is_published?: boolean
          public_url_slug?: string | null
          total_submissions?: number
          total_quotes_generated?: number
          created_at?: string
          updated_at?: string
          activated_by?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      form_instance_pricing: {
        Row: {
          id: string
          form_instance_id: string
          pricing_rule_id: string
          custom_fixed_amount: number | null
          custom_percentage_rate: number | null
          custom_per_item_amount: number | null
          custom_tiers: Json | null
          is_enabled: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          form_instance_id: string
          pricing_rule_id: string
          custom_fixed_amount?: number | null
          custom_percentage_rate?: number | null
          custom_per_item_amount?: number | null
          custom_tiers?: Json | null
          is_enabled?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          form_instance_id?: string
          pricing_rule_id?: string
          custom_fixed_amount?: number | null
          custom_percentage_rate?: number | null
          custom_per_item_amount?: number | null
          custom_tiers?: Json | null
          is_enabled?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      lbtt_rates: {
        Row: {
          id: string
          rate_set_name: string
          effective_from: string
          effective_until: string | null
          property_type: 'residential' | 'non_residential'
          rate_bands: Json
          ads_rate: number | null
          ftb_relief_enabled: boolean
          ftb_relief_threshold: number | null
          ftb_rate_bands: Json | null
          is_active: boolean
          is_platform_default: boolean
          source_reference: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          rate_set_name: string
          effective_from: string
          effective_until?: string | null
          property_type: 'residential' | 'non_residential'
          rate_bands: Json
          ads_rate?: number | null
          ftb_relief_enabled?: boolean
          ftb_relief_threshold?: number | null
          ftb_rate_bands?: Json | null
          is_active?: boolean
          is_platform_default?: boolean
          source_reference?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          rate_set_name?: string
          effective_from?: string
          effective_until?: string | null
          property_type?: 'residential' | 'non_residential'
          rate_bands?: Json
          ads_rate?: number | null
          ftb_relief_enabled?: boolean
          ftb_relief_threshold?: number | null
          ftb_rate_bands?: Json | null
          is_active?: boolean
          is_platform_default?: boolean
          source_reference?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          id: string
          form_instance_id: string
          tenant_id: string
          quote_id: string | null
          submission_data: Json
          calculated_lbtt: Json | null
          calculated_fees: Json | null
          total_quote_amount: number | null
          client_name: string | null
          client_email: string | null
          client_phone: string | null
          status: 'submitted' | 'quote_generated' | 'quote_sent' | 'converted' | 'abandoned'
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          form_instance_id: string
          tenant_id: string
          quote_id?: string | null
          submission_data: Json
          calculated_lbtt?: Json | null
          calculated_fees?: Json | null
          total_quote_amount?: number | null
          client_name?: string | null
          client_email?: string | null
          client_phone?: string | null
          status?: 'submitted' | 'quote_generated' | 'quote_sent' | 'converted' | 'abandoned'
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          form_instance_id?: string
          tenant_id?: string
          quote_id?: string | null
          submission_data?: Json
          calculated_lbtt?: Json | null
          calculated_fees?: Json | null
          total_quote_amount?: number | null
          client_name?: string | null
          client_email?: string | null
          client_phone?: string | null
          status?: 'submitted' | 'quote_generated' | 'quote_sent' | 'converted' | 'abandoned'
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price_monthly: number
          price_yearly: number
          currency: string
          max_users: number | null
          max_quotes_per_month: number | null
          max_clients: number | null
          max_email_sends_per_month: number | null
          features: Json | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          stripe_product_id: string | null
          is_active: boolean
          is_popular: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price_monthly: number
          price_yearly: number
          currency?: string
          max_users?: number | null
          max_quotes_per_month?: number | null
          max_clients?: number | null
          max_email_sends_per_month?: number | null
          features?: Json | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          is_active?: boolean
          is_popular?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price_monthly?: number
          price_yearly?: number
          currency?: string
          max_users?: number | null
          max_quotes_per_month?: number | null
          max_clients?: number | null
          max_email_sends_per_month?: number | null
          features?: Json | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          is_active?: boolean
          is_popular?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenant_subscriptions: {
        Row: {
          id: string
          tenant_id: string
          plan_id: string
          billing_cycle: 'monthly' | 'yearly'
          status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'paused'
          trial_ends_at: string | null
          current_period_start: string
          current_period_end: string
          cancelled_at: string | null
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          quotes_used_this_period: number
          emails_sent_this_period: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          plan_id: string
          billing_cycle: 'monthly' | 'yearly'
          status?: 'trial' | 'active' | 'past_due' | 'cancelled' | 'paused'
          trial_ends_at?: string | null
          current_period_start: string
          current_period_end: string
          cancelled_at?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          quotes_used_this_period?: number
          emails_sent_this_period?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          plan_id?: string
          billing_cycle?: 'monthly' | 'yearly'
          status?: 'trial' | 'active' | 'past_due' | 'cancelled' | 'paused'
          trial_ends_at?: string | null
          current_period_start?: string
          current_period_end?: string
          cancelled_at?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          quotes_used_this_period?: number
          emails_sent_this_period?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          id: string
          tenant_id: string
          type: 'card' | 'bank_account'
          last4: string
          brand: string | null
          exp_month: number | null
          exp_year: number | null
          is_default: boolean
          stripe_payment_method_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          type: 'card' | 'bank_account'
          last4: string
          brand?: string | null
          exp_month?: number | null
          exp_year?: number | null
          is_default?: boolean
          stripe_payment_method_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          type?: 'card' | 'bank_account'
          last4?: string
          brand?: string | null
          exp_month?: number | null
          exp_year?: number | null
          is_default?: boolean
          stripe_payment_method_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          tenant_id: string
          subscription_id: string
          invoice_number: string
          amount_due: number
          amount_paid: number
          currency: string
          status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          invoice_date: string
          due_date: string
          paid_at: string | null
          stripe_invoice_id: string | null
          stripe_invoice_pdf: string | null
          line_items: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          subscription_id: string
          invoice_number: string
          amount_due: number
          amount_paid?: number
          currency: string
          status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          invoice_date: string
          due_date: string
          paid_at?: string | null
          stripe_invoice_id?: string | null
          stripe_invoice_pdf?: string | null
          line_items?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          subscription_id?: string
          invoice_number?: string
          amount_due?: number
          amount_paid?: number
          currency?: string
          status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          invoice_date?: string
          due_date?: string
          paid_at?: string | null
          stripe_invoice_id?: string | null
          stripe_invoice_pdf?: string | null
          line_items?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          id: string
          tenant_id: string
          subscription_id: string | null
          event_type: 'quote_created' | 'email_sent' | 'user_added' | 'client_added'
          quantity: number
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          subscription_id?: string | null
          event_type: 'quote_created' | 'email_sent' | 'user_added' | 'client_added'
          quantity?: number
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          subscription_id?: string | null
          event_type?: 'quote_created' | 'email_sent' | 'user_added' | 'client_added'
          quantity?: number
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      tenant_onboarding: {
        Row: {
          id: string
          tenant_id: string
          current_step: number
          is_completed: boolean
          completed_steps: Json | null
          checklist: Json | null
          email_course_day: number | null
          email_course_started_at: string | null
          email_course_completed_at: string | null
          sample_data_generated: boolean
          success_score: number | null
          time_to_first_quote_hours: number | null
          started_at: string
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          current_step?: number
          is_completed?: boolean
          completed_steps?: Json | null
          checklist?: Json | null
          email_course_day?: number | null
          email_course_started_at?: string | null
          email_course_completed_at?: string | null
          sample_data_generated?: boolean
          success_score?: number | null
          time_to_first_quote_hours?: number | null
          started_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          current_step?: number
          is_completed?: boolean
          completed_steps?: Json | null
          checklist?: Json | null
          email_course_day?: number | null
          email_course_started_at?: string | null
          email_course_completed_at?: string | null
          sample_data_generated?: boolean
          success_score?: number | null
          time_to_first_quote_hours?: number | null
          started_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      onboarding_walkthroughs: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          video_url: string | null
          steps: Json | null
          estimated_duration_minutes: number | null
          target_role: string[] | null
          trigger_event: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          video_url?: string | null
          steps?: Json | null
          estimated_duration_minutes?: number | null
          target_role?: string[] | null
          trigger_event?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          video_url?: string | null
          steps?: Json | null
          estimated_duration_minutes?: number | null
          target_role?: string[] | null
          trigger_event?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          company_name: string | null
          company_size: string | null
          message: string | null
          preferred_date: string | null
          lead_source: string | null
          lead_score: number | null
          status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'lost'
          assigned_to: string | null
          internal_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          company_name?: string | null
          company_size?: string | null
          message?: string | null
          preferred_date?: string | null
          lead_source?: string | null
          lead_score?: number | null
          status?: 'new' | 'contacted' | 'scheduled' | 'completed' | 'lost'
          assigned_to?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          company_name?: string | null
          company_size?: string | null
          message?: string | null
          preferred_date?: string | null
          lead_source?: string | null
          lead_score?: number | null
          status?: 'new' | 'contacted' | 'scheduled' | 'completed' | 'lost'
          assigned_to?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          tenant_id: string | null
          author_name: string
          author_title: string | null
          author_company: string | null
          author_photo_url: string | null
          testimonial_text: string
          rating: number | null
          result_achieved: string | null
          is_featured: boolean
          is_approved: boolean
          display_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          author_name: string
          author_title?: string | null
          author_company?: string | null
          author_photo_url?: string | null
          testimonial_text: string
          rating?: number | null
          result_achieved?: string | null
          is_featured?: boolean
          is_approved?: boolean
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          author_name?: string
          author_title?: string | null
          author_company?: string | null
          author_photo_url?: string | null
          testimonial_text?: string
          rating?: number | null
          result_achieved?: string | null
          is_featured?: boolean
          is_approved?: boolean
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          id: string
          tenant_id: string
          ticket_number: string
          subject: string
          description: string
          requester_id: string | null
          requester_email: string
          requester_name: string
          category: string | null
          priority: 'low' | 'normal' | 'high' | 'urgent'
          status: 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed'
          assigned_to: string | null
          first_response_at: string | null
          resolved_at: string | null
          closed_at: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          ticket_number: string
          subject: string
          description: string
          requester_id?: string | null
          requester_email: string
          requester_name: string
          category?: string | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed'
          assigned_to?: string | null
          first_response_at?: string | null
          resolved_at?: string | null
          closed_at?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          ticket_number?: string
          subject?: string
          description?: string
          requester_id?: string | null
          requester_email?: string
          requester_name?: string
          category?: string | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed'
          assigned_to?: string | null
          first_response_at?: string | null
          resolved_at?: string | null
          closed_at?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_ticket_messages: {
        Row: {
          id: string
          ticket_id: string
          sender_type: 'customer' | 'agent'
          sender_id: string | null
          sender_name: string
          message_text: string
          is_internal: boolean
          attachments: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_type: 'customer' | 'agent'
          sender_id?: string | null
          sender_name: string
          message_text: string
          is_internal?: boolean
          attachments?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          sender_type?: 'customer' | 'agent'
          sender_id?: string | null
          sender_name?: string
          message_text?: string
          is_internal?: boolean
          attachments?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      knowledge_base_articles: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          category: string | null
          tags: string[] | null
          meta_title: string | null
          meta_description: string | null
          is_published: boolean
          is_featured: boolean
          view_count: number
          helpful_count: number
          not_helpful_count: number
          author_id: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          category?: string | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          is_published?: boolean
          is_featured?: boolean
          view_count?: number
          helpful_count?: number
          not_helpful_count?: number
          author_id?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          category?: string | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          is_published?: boolean
          is_featured?: boolean
          view_count?: number
          helpful_count?: number
          not_helpful_count?: number
          author_id?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      feature_requests: {
        Row: {
          id: string
          tenant_id: string | null
          title: string
          description: string
          requester_id: string | null
          requester_email: string | null
          category: string | null
          status: 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined'
          vote_count: number
          estimated_effort: string | null
          planned_release: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          title: string
          description: string
          requester_id?: string | null
          requester_email?: string | null
          category?: string | null
          status?: 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined'
          vote_count?: number
          estimated_effort?: string | null
          planned_release?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          title?: string
          description?: string
          requester_id?: string | null
          requester_email?: string | null
          category?: string | null
          status?: 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined'
          vote_count?: number
          estimated_effort?: string | null
          planned_release?: string | null
          created_at?: string
          updated_at?: string
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
