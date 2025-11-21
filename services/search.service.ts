'use server'

import { createClient } from '@/lib/supabase/server'

// ============================================================================
// TYPES
// ============================================================================

export interface SearchFilters {
  entity_types?: ('matter' | 'client' | 'task' | 'document')[]
  fee_earner_id?: string
  stage_id?: string
  status?: string
  date_from?: string
  date_to?: string
  matter_id?: string
}

export interface MatterSearchResult {
  id: string
  matter_number: string
  property_address: string
  purchase_price: number | null
  status: string
  stage_name: string | null
  client_name: string
  fee_earner_name: string | null
  created_at: string
  entity_type: 'matter'
}

export interface ClientSearchResult {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  mobile: string | null
  created_at: string
  entity_type: 'client'
}

export interface TaskSearchResult {
  id: string
  title: string
  description: string | null
  status: string
  due_date: string | null
  matter_number: string
  property_address: string
  assigned_to_name: string | null
  created_at: string
  entity_type: 'task'
}

export interface DocumentSearchResult {
  id: string
  file_name: string
  document_type: string
  file_size: number
  matter_number: string
  property_address: string
  uploaded_by_name: string | null
  created_at: string
  entity_type: 'document'
}

export type SearchResult =
  | MatterSearchResult
  | ClientSearchResult
  | TaskSearchResult
  | DocumentSearchResult

export interface SearchResponse {
  results: SearchResult[]
  total_count: number
  matters_count: number
  clients_count: number
  tasks_count: number
  documents_count: number
}

export interface SavedSearch {
  id: string
  user_id: string
  name: string
  query: string
  filters: SearchFilters
  created_at: string
}

// ============================================================================
// GLOBAL SEARCH
// ============================================================================

export async function globalSearch(
  query: string,
  tenant_id: string,
  filters?: SearchFilters,
  limit: number = 50
): Promise<{ success: boolean; data?: SearchResponse; error?: string }> {
  try {
    const supabase = await createClient()
    const searchTerm = `%${query.toLowerCase()}%`

    const entityTypes = filters?.entity_types || ['matter', 'client', 'task', 'document']
    const results: SearchResult[] = []
    let mattersCount = 0
    let clientsCount = 0
    let tasksCount = 0
    let documentsCount = 0

    // Search Matters
    if (entityTypes.includes('matter')) {
      let mattersQuery = supabase
        .from('matters')
        .select(`
          id,
          matter_number,
          property_address,
          purchase_price,
          status,
          created_at,
          workflow_stages(stage_name),
          clients(first_name, last_name),
          profiles:fee_earner_id(first_name, last_name)
        `)
        .eq('tenant_id', tenant_id)
        .or(`matter_number.ilike.${searchTerm},property_address.ilike.${searchTerm}`)

      if (filters?.fee_earner_id) {
        mattersQuery = mattersQuery.eq('fee_earner_id', filters.fee_earner_id)
      }
      if (filters?.stage_id) {
        mattersQuery = mattersQuery.eq('stage_id', filters.stage_id)
      }
      if (filters?.status) {
        mattersQuery = mattersQuery.eq('status', filters.status)
      }
      if (filters?.date_from) {
        mattersQuery = mattersQuery.gte('created_at', filters.date_from)
      }
      if (filters?.date_to) {
        mattersQuery = mattersQuery.lte('created_at', filters.date_to)
      }

      const { data: matters, error: mattersError } = await mattersQuery.limit(limit)

      if (mattersError) throw mattersError

      if (matters) {
        mattersCount = matters.length
        results.push(...matters.map(m => ({
          id: m.id,
          matter_number: m.matter_number,
          property_address: m.property_address,
          purchase_price: m.purchase_price,
          status: m.status,
          stage_name: (m.workflow_stages as any)?.stage_name || null,
          client_name: (m.clients as any)
            ? `${(m.clients as any).first_name} ${(m.clients as any).last_name}`
            : 'Unknown',
          fee_earner_name: (m.profiles as any)
            ? `${(m.profiles as any).first_name} ${(m.profiles as any).last_name}`
            : null,
          created_at: m.created_at,
          entity_type: 'matter' as const
        })))
      }
    }

    // Search Clients
    if (entityTypes.includes('client')) {
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email, phone, mobile, created_at')
        .eq('tenant_id', tenant_id)
        .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .limit(limit)

      if (clientsError) throw clientsError

      if (clients) {
        clientsCount = clients.length
        results.push(...clients.map(c => ({
          ...c,
          entity_type: 'client' as const
        })))
      }
    }

    // Search Tasks
    if (entityTypes.includes('task')) {
      let tasksQuery = supabase
        .from('matter_tasks')
        .select(`
          id,
          title,
          description,
          status,
          due_date,
          created_at,
          matters(matter_number, property_address),
          profiles:assigned_to(first_name, last_name)
        `)
        .eq('tenant_id', tenant_id)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)

      if (filters?.matter_id) {
        tasksQuery = tasksQuery.eq('matter_id', filters.matter_id)
      }
      if (filters?.status) {
        tasksQuery = tasksQuery.eq('status', filters.status)
      }
      if (filters?.fee_earner_id) {
        tasksQuery = tasksQuery.eq('assigned_to', filters.fee_earner_id)
      }
      if (filters?.date_from) {
        tasksQuery = tasksQuery.gte('due_date', filters.date_from)
      }
      if (filters?.date_to) {
        tasksQuery = tasksQuery.lte('due_date', filters.date_to)
      }

      const { data: tasks, error: tasksError } = await tasksQuery.limit(limit)

      if (tasksError) throw tasksError

      if (tasks) {
        tasksCount = tasks.length
        results.push(...tasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          due_date: t.due_date,
          matter_number: (t.matters as any)?.matter_number || 'Unknown',
          property_address: (t.matters as any)?.property_address || 'Unknown',
          assigned_to_name: (t.profiles as any)
            ? `${(t.profiles as any).first_name} ${(t.profiles as any).last_name}`
            : null,
          created_at: t.created_at,
          entity_type: 'task' as const
        })))
      }
    }

    // Search Documents
    if (entityTypes.includes('document')) {
      let documentsQuery = supabase
        .from('documents')
        .select(`
          id,
          file_name,
          document_type,
          file_size,
          created_at,
          matters(matter_number, property_address),
          profiles:uploaded_by(first_name, last_name)
        `)
        .eq('tenant_id', tenant_id)
        .ilike('file_name', searchTerm)

      if (filters?.matter_id) {
        documentsQuery = documentsQuery.eq('matter_id', filters.matter_id)
      }
      if (filters?.date_from) {
        documentsQuery = documentsQuery.gte('created_at', filters.date_from)
      }
      if (filters?.date_to) {
        documentsQuery = documentsQuery.lte('created_at', filters.date_to)
      }

      const { data: documents, error: documentsError } = await documentsQuery.limit(limit)

      if (documentsError) throw documentsError

      if (documents) {
        documentsCount = documents.length
        results.push(...documents.map(d => ({
          id: d.id,
          file_name: d.file_name,
          document_type: d.document_type,
          file_size: d.file_size,
          matter_number: (d.matters as any)?.matter_number || 'Unknown',
          property_address: (d.matters as any)?.property_address || 'Unknown',
          uploaded_by_name: (d.profiles as any)
            ? `${(d.profiles as any).first_name} ${(d.profiles as any).last_name}`
            : null,
          created_at: d.created_at,
          entity_type: 'document' as const
        })))
      }
    }

    // Sort by created_at descending
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return {
      success: true,
      data: {
        results: results.slice(0, limit),
        total_count: results.length,
        matters_count: mattersCount,
        clients_count: clientsCount,
        tasks_count: tasksCount,
        documents_count: documentsCount
      }
    }
  } catch (error) {
    console.error('Global search error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform search'
    }
  }
}

// ============================================================================
// SAVED SEARCHES
// ============================================================================

export async function saveSearch(
  user_id: string,
  name: string,
  query: string,
  filters: SearchFilters
): Promise<{ success: boolean; data?: SavedSearch; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('saved_searches')
      .insert({
        user_id,
        name,
        query,
        filters
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Save search error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save search'
    }
  }
}

export async function getSavedSearches(
  user_id: string
): Promise<{ success: boolean; data?: SavedSearch[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Get saved searches error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get saved searches'
    }
  }
}

export async function deleteSavedSearch(
  search_id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', search_id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Delete saved search error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete saved search'
    }
  }
}

// ============================================================================
// RECENT SEARCHES
// ============================================================================

export async function saveRecentSearch(
  user_id: string,
  query: string,
  tenant_id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Insert or update recent search
    const { error } = await supabase
      .from('recent_searches')
      .upsert({
        user_id,
        query,
        tenant_id,
        searched_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,query'
      })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Save recent search error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save recent search'
    }
  }
}

export async function getRecentSearches(
  user_id: string,
  limit: number = 10
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('recent_searches')
      .select('query')
      .eq('user_id', user_id)
      .order('searched_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return { success: true, data: data?.map(r => r.query) || [] }
  } catch (error) {
    console.error('Get recent searches error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recent searches'
    }
  }
}
