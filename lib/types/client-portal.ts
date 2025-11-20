// =====================================================
// PHASE 9: CLIENT PORTAL TYPES
// =====================================================

export interface ClientUser {
  id: string
  client_id: string
  email: string
  password_hash?: string
  first_name: string
  last_name: string
  phone?: string
  avatar_url?: string
  email_verified: boolean
  email_verified_at?: string
  phone_verified: boolean
  two_factor_enabled: boolean
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface MagicLink {
  id: string
  client_user_id: string
  token: string
  token_hash: string
  purpose: 'login' | 'verification' | 'password_reset'
  expires_at: string
  used_at?: string
  created_at: string
}

export interface ClientSession {
  id: string
  client_user_id: string
  session_token: string
  expires_at: string
  ip_address?: string
  user_agent?: string
  device_type?: string
  browser?: string
  location?: string
  is_active: boolean
  last_activity_at: string
  created_at: string
}

export interface ClientMessage {
  id: string
  client_id: string
  tenant_id: string
  sender_type: 'client' | 'staff'
  sender_id: string
  subject?: string
  message_text: string
  attachments: Array<{
    name: string
    url: string
    type: string
  }>
  parent_message_id?: string
  thread_id?: string
  is_read: boolean
  read_at?: string
  is_archived: boolean
  created_at: string
}

export interface ClientPreferences {
  id: string
  client_id: string
  tenant_id: string
  email_marketing: boolean
  email_notifications: boolean
  email_reminders: boolean
  email_newsletters: boolean
  sms_notifications: boolean
  sms_reminders: boolean
  preferred_contact_method: 'email' | 'phone' | 'sms' | 'portal'
  marketing_consent_date?: string
  marketing_consent_ip?: string
  gdpr_consent_date?: string
  created_at: string
  updated_at: string
}

export interface ClientDocument {
  id: string
  client_id: string
  tenant_id: string
  document_name: string
  document_type: 'id' | 'proof_of_address' | 'contract' | 'other'
  file_path: string
  file_size_bytes?: number
  mime_type?: string
  quote_id?: string
  description?: string
  tags: string[]
  is_verified: boolean
  verified_by?: string
  verified_at?: string
  uploaded_by: string
  created_at: string
}

export interface ConsultationBooking {
  id: string
  client_id: string
  tenant_id: string
  booking_type: 'phone' | 'video' | 'in_person'
  scheduled_at: string
  duration_minutes: number
  assigned_to?: string
  client_notes?: string
  reason?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  confirmation_sent_at?: string
  reminder_sent_at?: string
  staff_notes?: string
  follow_up_required: boolean
  created_at: string
  updated_at: string
}

// API Request/Response types
export interface MagicLinkRequest {
  email: string
  purpose?: 'login' | 'verification'
}

export interface VerifyMagicLinkRequest {
  token: string
}

export interface SendMessageRequest {
  recipient_type: 'client' | 'staff'
  subject?: string
  message_text: string
  parent_message_id?: string
}

export interface UpdatePreferencesRequest {
  email_marketing?: boolean
  email_notifications?: boolean
  email_reminders?: boolean
  email_newsletters?: boolean
  sms_notifications?: boolean
  sms_reminders?: boolean
  preferred_contact_method?: 'email' | 'phone' | 'sms' | 'portal'
}

export interface CreateBookingRequest {
  booking_type: 'phone' | 'video' | 'in_person'
  scheduled_at: string
  duration_minutes?: number
  client_notes?: string
  reason?: string
}

export interface ClientDashboardData {
  client: any
  quotes: any[]
  messages: ClientMessage[]
  documents: ClientDocument[]
  bookings: ConsultationBooking[]
  preferences: ClientPreferences
}
