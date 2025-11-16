import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Client = Database['public']['Tables']['clients']['Row']
type ClientInsert = Database['public']['Tables']['clients']['Insert']
type ClientUpdate = Database['public']['Tables']['clients']['Update']

/**
 * Get all clients for a tenant
 */
export async function getClients(tenantId: string) {
  const supabase = await createSupabaseClient()

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    return { error: error.message }
  }

  return { clients }
}

/**
 * Get a single client by ID
 */
export async function getClient(clientId: string) {
  const supabase = await createSupabaseClient()

  const { data: client, error } = await supabase
    .from('clients')
    .select(`
      *,
      quotes:quotes(*)
    `)
    .eq('id', clientId)
    .is('deleted_at', null)
    .single()

  if (error) {
    console.error('Error fetching client:', error)
    return { error: error.message }
  }

  return { client }
}

/**
 * Create a new client
 */
export async function createClient(data: ClientInsert) {
  const supabase = await createSupabaseClient()

  const { data: client, error } = await supabase
    .from('clients')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error creating client:', error)
    return { error: error.message }
  }

  return { client }
}

/**
 * Update a client
 */
export async function updateClient(clientId: string, data: ClientUpdate) {
  const supabase = await createSupabaseClient()

  const { data: client, error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', clientId)
    .select()
    .single()

  if (error) {
    console.error('Error updating client:', error)
    return { error: error.message }
  }

  return { client }
}

/**
 * Soft delete a client
 */
export async function deleteClient(clientId: string) {
  const supabase = await createSupabaseClient()

  const { error } = await supabase
    .from('clients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', clientId)

  if (error) {
    console.error('Error deleting client:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Search clients by name or email
 */
export async function searchClients(tenantId: string, query: string) {
  const supabase = await createSupabaseClient()

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error searching clients:', error)
    return { error: error.message }
  }

  return { clients }
}

/**
 * Get client statistics
 */
export async function getClientStats(clientId: string) {
  const supabase = await createSupabaseClient()

  // Get quotes count and total value
  const { data: quotes, error } = await supabase
    .from('quotes')
    .select('status, total_amount')
    .eq('client_id', clientId)
    .is('deleted_at', null)

  if (error) {
    console.error('Error fetching client stats:', error)
    return { error: error.message }
  }

  const stats = {
    totalQuotes: quotes?.length || 0,
    acceptedQuotes: quotes?.filter((q) => q.status === 'accepted').length || 0,
    totalValue: quotes
      ?.filter((q) => q.status === 'accepted')
      .reduce((sum, q) => sum + Number(q.total_amount), 0) || 0,
  }

  return { stats }
}
