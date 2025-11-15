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
      // TODO: Add additional tables as they are created in future phases
      // quotes: { ... }
      // properties: { ... }
      // users: { ... }
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
