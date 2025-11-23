// @ts-nocheck
/**
 * Quote Service
 *
 * Business logic for quote and property management
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth, hasRole } from '@/lib/auth'
import type {
  Quote,
  QuoteInsert,
  QuoteUpdate,
  Property,
  PropertyInsert,
  PropertyUpdate,
  QuoteWithRelations,
} from '@/types'
import { revalidatePath } from 'next/cache'
import { enqueueEmail } from '@/lib/utils/jobs'

/**
 * Create a new property
 */
export async function createProperty(
  data: Omit<PropertyInsert, 'created_by'>
): Promise<{ property: Property } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Verify user has access to this tenant
    const canCreate = await hasRole(data.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canCreate) {
      return { error: 'Unauthorized' }
    }

    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        ...data,
        created_by: user.id,
      })
      .select()
      .single()

    if (error || !property) {
      return { error: error?.message || 'Failed to create property' }
    }

    revalidatePath('/')
    return { property }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update a property
 */
export async function updateProperty(
  propertyId: string,
  data: PropertyUpdate
): Promise<{ property: Property } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get the property to find tenant_id
    const { data: existingProperty } = await supabase
      .from('properties')
      .select('tenant_id')
      .eq('id', propertyId)
      .single()

    if (!existingProperty) {
      return { error: 'Property not found' }
    }

    // Verify user has access
    const canUpdate = await hasRole(existingProperty.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canUpdate) {
      return { error: 'Unauthorized' }
    }

    const { data: property, error } = await supabase
      .from('properties')
      .update(data)
      .eq('id', propertyId)
      .select()
      .single()

    if (error || !property) {
      return { error: error?.message || 'Failed to update property' }
    }

    revalidatePath('/')
    return { property }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get properties for a tenant
 */
export async function getProperties(
  tenantId: string
): Promise<{ properties: Property[] } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Verify user has access
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return { error: 'Unauthorized' }
    }

    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      return { error: error.message }
    }

    return { properties: properties || [] }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get a single property by ID
 */
export async function getProperty(
  propertyId: string,
  tenantId: string
): Promise<{ property: Property } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Verify user has access
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return { error: 'Unauthorized' }
    }

    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single()

    if (error || !property) {
      return { error: error?.message || 'Property not found' }
    }

    return { property }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create a new quote
 */
export async function createQuote(
  data: Omit<QuoteInsert, 'created_by' | 'quote_number'>
): Promise<{ quote: Quote } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Verify user has access to this tenant
    const canCreate = await hasRole(data.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canCreate) {
      return { error: 'Unauthorized' }
    }

    const { data: quote, error } = await supabase
      .from('quotes')
      .insert({
        ...data,
        created_by: user.id,
      })
      .select()
      .single()

    if (error || !quote) {
      return { error: error?.message || 'Failed to create quote' }
    }

    revalidatePath('/')
    return { quote }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update a quote
 */
export async function updateQuote(
  quoteId: string,
  data: QuoteUpdate
): Promise<{ quote: Quote } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get the quote to find tenant_id
    const { data: existingQuote } = await supabase
      .from('quotes')
      .select('tenant_id, status')
      .eq('id', quoteId)
      .single()

    if (!existingQuote) {
      return { error: 'Quote not found' }
    }

    // Prevent editing sent/accepted quotes (business rule)
    if (['sent', 'accepted'].includes(existingQuote.status)) {
      return { error: 'Cannot edit sent or accepted quotes' }
    }

    // Verify user has access
    const canUpdate = await hasRole(existingQuote.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canUpdate) {
      return { error: 'Unauthorized' }
    }

    const { data: quote, error } = await supabase
      .from('quotes')
      .update(data)
      .eq('id', quoteId)
      .select()
      .single()

    if (error || !quote) {
      return { error: error?.message || 'Failed to update quote' }
    }

    revalidatePath('/')
    return { quote }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get a quote by ID with related data
 */
export async function getQuote(
  quoteId: string
): Promise<{ quote: QuoteWithRelations } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: quote, error } = await supabase
      .from('quotes')
      .select(
        `
        *,
        property:properties(*),
        tenant:tenants(*)
      `
      )
      .eq('id', quoteId)
      .single()

    if (error || !quote) {
      return { error: error?.message || 'Quote not found' }
    }

    // Verify user has access to this quote's tenant
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('id')
      .eq('tenant_id', quote.tenant_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return { error: 'Unauthorized' }
    }

    return { quote: quote as unknown as QuoteWithRelations }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get quotes for a tenant
 */
export async function getQuotes(
  tenantId: string,
  filters?: {
    status?: Quote['status']
    transaction_type?: Quote['transaction_type']
  }
): Promise<{ quotes: Quote[] } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Verify user has access
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return { error: 'Unauthorized' }
    }

    let query = supabase
      .from('quotes')
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.transaction_type) {
      query = query.eq('transaction_type', filters.transaction_type)
    }

    const { data: quotes, error } = await query.order('created_at', {
      ascending: false,
    })

    if (error) {
      return { error: error.message }
    }

    return { quotes: quotes || [] }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send a quote to a client
 */
export async function sendQuote(
  quoteId: string
): Promise<{ quote: Quote } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get the quote
    const { data: existingQuote } = await supabase
      .from('quotes')
      .select('*, tenant:tenants(*)')
      .eq('id', quoteId)
      .single()

    if (!existingQuote) {
      return { error: 'Quote not found' }
    }

    // Verify user has access
    const canSend = await hasRole(existingQuote.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canSend) {
      return { error: 'Unauthorized' }
    }

    // Update quote status
    const { data: quote, error } = await supabase
      .from('quotes')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_by: user.id,
      })
      .eq('id', quoteId)
      .select()
      .single()

    if (error || !quote) {
      return { error: error?.message || 'Failed to send quote' }
    }

    // Send email to client
    if (quote.client_email) {
      await enqueueEmail(quote.client_email, 'quote_sent', {
        quoteNumber: quote.quote_number,
        clientName: quote.client_name,
        totalAmount: quote.total_amount,
        tenantName: (existingQuote.tenant as any)?.name || 'Your Solicitor',
      })
    }

    revalidatePath('/')
    return { quote }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Delete a quote (soft delete)
 */
export async function deleteQuote(
  quoteId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get the quote to find tenant_id
    const { data: existingQuote } = await supabase
      .from('quotes')
      .select('tenant_id, status')
      .eq('id', quoteId)
      .single()

    if (!existingQuote) {
      return { error: 'Quote not found' }
    }

    // Prevent deleting accepted quotes (business rule)
    if (existingQuote.status === 'accepted') {
      return { error: 'Cannot delete accepted quotes' }
    }

    // Verify user has permission (manager or above)
    const canDelete = await hasRole(existingQuote.tenant_id, [
      'owner',
      'admin',
      'manager',
    ])

    if (!canDelete) {
      return { error: 'Unauthorized' }
    }

    // Soft delete
    const { error } = await supabase
      .from('quotes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', quoteId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update quote status
 */
export async function updateQuoteStatus(
  quoteId: string,
  tenantId: string,
  newStatus: Quote['status']
): Promise<{ quote: Quote } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Verify user has access
    const canUpdate = await hasRole(tenantId, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canUpdate) {
      return { error: 'Unauthorized' }
    }

    // Build update object based on status
    const updates: any = {
      status: newStatus,
    }

    if (newStatus === 'sent') {
      updates.sent_at = new Date().toISOString()
      updates.sent_by = user.id
    } else if (newStatus === 'accepted') {
      updates.accepted_at = new Date().toISOString()
    }

    const { data: quote, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', quoteId)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error || !quote) {
      return { error: error?.message || 'Failed to update quote' }
    }

    revalidatePath('/')
    return { quote }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get quotes for a specific property
 */
export async function getQuotesByProperty(
  propertyId: string,
  tenantId: string
): Promise<{ quotes: Quote[] } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Verify user has access
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return { error: 'Unauthorized' }
    }

    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('property_id', propertyId)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      return { error: error.message }
    }

    return { quotes: quotes || [] }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
