// =====================================================
// PHASE 9: CLIENT PORTAL SERVICE
// =====================================================

import { createClient } from '@/lib/supabase/server'
import type {
  ClientUser,
  MagicLink,
  ClientMessage,
  ClientPreferences,
  ClientDocument,
  ConsultationBooking,
  MagicLinkRequest,
  SendMessageRequest,
  UpdatePreferencesRequest,
  CreateBookingRequest,
} from '@/lib/types/client-portal'

// =====================================================
// AUTHENTICATION
// =====================================================

export async function createClientUser(
  clientId: string,
  email: string,
  firstName: string,
  lastName: string,
  phone?: string
) {
  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from('client_users')
    .insert({
      client_id: clientId,
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, user: null }
  }

  return { user: user as ClientUser, error: null }
}

export async function sendMagicLink(email: string, purpose: 'login' | 'verification' = 'login') {
  const supabase = await createClient()

  // Find client user
  const { data: user, error: userError } = await supabase
    .from('client_users')
    .select('id')
    .eq('email', email)
    .eq('is_active', true)
    .single()

  if (userError || !user) {
    return { error: 'User not found or inactive', link: null }
  }

  // Generate magic link token (using database function)
  const { data, error } = await supabase.rpc('generate_magic_link', {
    p_client_user_id: user.id,
    p_purpose: purpose,
    p_expires_in_minutes: 60,
  })

  if (error) {
    return { error: error.message, link: null }
  }

  // In production, send email with the magic link
  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/portal/auth/verify?token=${data}`

  return { link: magicLink, error: null }
}

export async function verifyMagicLink(token: string) {
  const supabase = await createClient()

  // Hash the token
  const { data: hashData, error: hashError } = await supabase.rpc('digest', {
    data: token,
    type: 'sha256',
  })

  if (hashError) {
    return { error: 'Invalid token', user: null }
  }

  // Find magic link
  const { data: magicLink, error: linkError } = await supabase
    .from('magic_links')
    .select('*, client_user:client_user_id(*)')
    .eq('token_hash', hashData)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (linkError || !magicLink) {
    return { error: 'Invalid or expired token', user: null }
  }

  // Mark as used
  await supabase
    .from('magic_links')
    .update({ used_at: new Date().toISOString() })
    .eq('id', magicLink.id)

  return { user: magicLink.client_user as any, error: null }
}

// =====================================================
// DASHBOARD
// =====================================================

export async function getClientDashboardData(clientId: string, tenantId: string) {
  const supabase = await createClient()

  // Get client details
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  // Get quotes
  const { data: quotes } = await supabase
    .from('quotes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  // Get messages
  const { data: messages } = await supabase
    .from('client_messages')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get documents
  const { data: documents } = await supabase
    .from('client_documents')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false})

  // Get bookings
  const { data: bookings } = await supabase
    .from('consultation_bookings')
    .select('*')
    .eq('client_id', clientId)
    .order('scheduled_at', { ascending: true })

  // Get preferences
  const { data: preferences } = await supabase
    .from('client_preferences')
    .select('*')
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId)
    .single()

  return {
    client,
    quotes: quotes || [],
    messages: messages || [],
    documents: documents || [],
    bookings: bookings || [],
    preferences,
  }
}

// =====================================================
// MESSAGING
// =====================================================

export async function getClientMessages(clientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('client_messages')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, messages: [] }
  }

  return { messages: data as ClientMessage[], error: null }
}

export async function sendClientMessage(
  clientId: string,
  tenantId: string,
  senderType: 'client' | 'staff',
  senderId: string,
  data: SendMessageRequest
) {
  const supabase = await createClient()

  const { data: message, error } = await supabase
    .from('client_messages')
    .insert({
      client_id: clientId,
      tenant_id: tenantId,
      sender_type: senderType,
      sender_id: senderId,
      subject: data.subject,
      message_text: data.message_text,
      parent_message_id: data.parent_message_id,
      thread_id: data.parent_message_id || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, message: null }
  }

  return { message: message as ClientMessage, error: null }
}

// =====================================================
// PREFERENCES
// =====================================================

export async function getClientPreferences(clientId: string, tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('client_preferences')
    .select('*')
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId)
    .single()

  if (error) {
    return { error: error.message, preferences: null }
  }

  return { preferences: data as ClientPreferences, error: null }
}

export async function updateClientPreferences(
  clientId: string,
  tenantId: string,
  updates: UpdatePreferencesRequest
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('client_preferences')
    .upsert({
      client_id: clientId,
      tenant_id: tenantId,
      ...updates,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, preferences: null }
  }

  return { preferences: data as ClientPreferences, error: null }
}

// =====================================================
// BOOKINGS
// =====================================================

export async function createConsultationBooking(
  clientId: string,
  tenantId: string,
  data: CreateBookingRequest
) {
  const supabase = await createClient()

  const { data: booking, error } = await supabase
    .from('consultation_bookings')
    .insert({
      client_id: clientId,
      tenant_id: tenantId,
      ...data,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, booking: null }
  }

  return { booking: booking as ConsultationBooking, error: null }
}

export async function getClientBookings(clientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consultation_bookings')
    .select('*')
    .eq('client_id', clientId)
    .order('scheduled_at', { ascending: true })

  if (error) {
    return { error: error.message, bookings: [] }
  }

  return { bookings: data as ConsultationBooking[], error: null }
}
