'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth, hasRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { Offer, OfferInsert, OfferUpdate } from '@/types'

/**
 * Generate offer number (OFF00001-25 format)
 */
async function generateOfferNumber(tenantId: string): Promise<string> {
  const supabase = await createClient()
  const year = new Date().getFullYear().toString().slice(-2)

  // Use the database function to generate offer number
  const { data, error } = await supabase.rpc('generate_offer_number', {
    p_tenant_id: tenantId,
  })

  if (error) {
    console.error('Error generating offer number:', error)
    // Fallback: generate manually
    const { data: offers } = await supabase
      .from('offers')
      .select('offer_number')
      .eq('tenant_id', tenantId)
      .like('offer_number', `OFF%${year}`)
      .order('offer_number', { ascending: false })
      .limit(1)

    let nextNumber = 1
    if (offers && offers.length > 0) {
      const lastNumber = parseInt(offers[0].offer_number.split('-')[0].slice(3))
      nextNumber = lastNumber + 1
    }

    return `OFF${nextNumber.toString().padStart(5, '0')}-${year}`
  }

  return data
}

/**
 * Create a new offer
 */
export async function createOffer(
  data: Omit<OfferInsert, 'id' | 'offer_number'>
): Promise<{ offer: Offer } | { error: string }> {
  try {
    const user = await requireAuth()
    const canCreate = await hasRole(data.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canCreate) {
      return { error: 'Unauthorized to create offers' }
    }

    const supabase = await createClient()

    // Generate offer number
    const offerNumber = await generateOfferNumber(data.tenant_id)

    // Create offer
    const offerData: OfferInsert = {
      ...data,
      offer_number: offerNumber,
      drafted_by: user.id,
      drafted_at: new Date().toISOString(),
      metadata: data.metadata || {},
    }

    const { data: offer, error } = await supabase
      .from('offers')
      .insert(offerData)
      .select()
      .single()

    if (error) {
      console.error('Error creating offer:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${data.matter_id}`)
    return { offer }
  } catch (error) {
    console.error('Unexpected error in createOffer:', error)
    return { error: 'Failed to create offer' }
  }
}

/**
 * Get offers for a matter
 */
export async function getOffersForMatter(
  matterId: string
): Promise<{ offers: Offer[] } | { error: string }> {
  try {
    await requireAuth()
    const supabase = await createClient()

    const { data: offers, error } = await supabase
      .from('offers')
      .select('*')
      .eq('matter_id', matterId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching offers:', error)
      return { error: error.message }
    }

    return { offers: offers || [] }
  } catch (error) {
    console.error('Unexpected error in getOffersForMatter:', error)
    return { error: 'Failed to fetch offers' }
  }
}

/**
 * Get a single offer by ID
 */
export async function getOffer(
  offerId: string
): Promise<{ offer: Offer } | { error: string }> {
  try {
    await requireAuth()
    const supabase = await createClient()

    const { data: offer, error } = await supabase
      .from('offers')
      .select('*')
      .eq('id', offerId)
      .is('deleted_at', null)
      .single()

    if (error || !offer) {
      return { error: 'Offer not found' }
    }

    return { offer }
  } catch (error) {
    console.error('Unexpected error in getOffer:', error)
    return { error: 'Failed to fetch offer' }
  }
}

/**
 * Update an offer
 */
export async function updateOffer(
  offerId: string,
  updates: OfferUpdate
): Promise<{ offer: Offer } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing offer
    const { data: existing, error: fetchError } = await supabase
      .from('offers')
      .select('tenant_id, matter_id')
      .eq('id', offerId)
      .single()

    if (fetchError || !existing) {
      return { error: 'Offer not found' }
    }

    const canUpdate = await hasRole(existing.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canUpdate) {
      return { error: 'Unauthorized to update offers' }
    }

    const { data: offer, error } = await supabase
      .from('offers')
      .update(updates)
      .eq('id', offerId)
      .select()
      .single()

    if (error) {
      console.error('Error updating offer:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existing.matter_id}`)
    return { offer }
  } catch (error) {
    console.error('Unexpected error in updateOffer:', error)
    return { error: 'Failed to update offer' }
  }
}

/**
 * Approve offer as solicitor
 */
export async function approveBySolicitor(
  offerId: string
): Promise<{ offer: Offer } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing offer
    const { data: existing, error: fetchError } = await supabase
      .from('offers')
      .select('tenant_id, matter_id, offer_status')
      .eq('id', offerId)
      .single()

    if (fetchError || !existing) {
      return { error: 'Offer not found' }
    }

    // Check if user can approve (must be manager+ role)
    const canApprove = await hasRole(existing.tenant_id, [
      'owner',
      'admin',
      'manager',
    ])

    if (!canApprove) {
      return { error: 'Unauthorized to approve offers' }
    }

    // Verify offer is in correct status
    if (existing.offer_status !== 'draft' && existing.offer_status !== 'pending_solicitor') {
      return { error: 'Offer not in correct status for solicitor approval' }
    }

    // Update offer (status will auto-transition to pending_negotiator via trigger)
    const { data: offer, error } = await supabase
      .from('offers')
      .update({
        solicitor_approved_by: user.id,
        solicitor_approved_at: new Date().toISOString(),
      })
      .eq('id', offerId)
      .select()
      .single()

    if (error) {
      console.error('Error approving offer:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existing.matter_id}`)
    return { offer }
  } catch (error) {
    console.error('Unexpected error in approveBySolicitor:', error)
    return { error: 'Failed to approve offer' }
  }
}

/**
 * Approve offer as negotiator
 */
export async function approveByNegotiator(
  offerId: string
): Promise<{ offer: Offer } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing offer
    const { data: existing, error: fetchError } = await supabase
      .from('offers')
      .select('tenant_id, matter_id, offer_status')
      .eq('id', offerId)
      .single()

    if (fetchError || !existing) {
      return { error: 'Offer not found' }
    }

    // Check if user can approve (must be manager+ role)
    const canApprove = await hasRole(existing.tenant_id, [
      'owner',
      'admin',
      'manager',
    ])

    if (!canApprove) {
      return { error: 'Unauthorized to approve offers' }
    }

    // Verify offer is in correct status
    if (existing.offer_status !== 'pending_negotiator') {
      return { error: 'Offer not in correct status for negotiator approval' }
    }

    // Update offer (status will auto-transition to pending_client via trigger)
    const { data: offer, error } = await supabase
      .from('offers')
      .update({
        negotiator_approved_by: user.id,
        negotiator_approved_at: new Date().toISOString(),
      })
      .eq('id', offerId)
      .select()
      .single()

    if (error) {
      console.error('Error approving offer:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existing.matter_id}`)
    return { offer }
  } catch (error) {
    console.error('Unexpected error in approveByNegotiator:', error)
    return { error: 'Failed to approve offer' }
  }
}

/**
 * Client accepts offer (called from public acceptance portal)
 */
export async function acceptOfferByClient(
  offerId: string,
  clientIp: string
): Promise<{ offer: Offer } | { error: string }> {
  try {
    // NOTE: No auth check - this is a public endpoint accessed via secure token
    const supabase = await createClient()

    // Get existing offer
    const { data: existing, error: fetchError } = await supabase
      .from('offers')
      .select('matter_id, offer_status')
      .eq('id', offerId)
      .single()

    if (fetchError || !existing) {
      return { error: 'Offer not found' }
    }

    // Verify offer is in correct status
    if (existing.offer_status !== 'pending_client') {
      return { error: 'Offer not ready for client acceptance' }
    }

    // Update offer
    const { data: offer, error } = await supabase
      .from('offers')
      .update({
        client_accepted_at: new Date().toISOString(),
        client_acceptance_ip: clientIp,
      })
      .eq('id', offerId)
      .select()
      .single()

    if (error) {
      console.error('Error accepting offer:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existing.matter_id}`)
    return { offer }
  } catch (error) {
    console.error('Unexpected error in acceptOfferByClient:', error)
    return { error: 'Failed to accept offer' }
  }
}

/**
 * Submit offer to selling agent
 */
export async function submitOfferToAgent(
  offerId: string
): Promise<{ offer: Offer } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing offer
    const { data: existing, error: fetchError } = await supabase
      .from('offers')
      .select('tenant_id, matter_id, offer_status, client_accepted_at')
      .eq('id', offerId)
      .single()

    if (fetchError || !existing) {
      return { error: 'Offer not found' }
    }

    const canSubmit = await hasRole(existing.tenant_id, [
      'owner',
      'admin',
      'manager',
    ])

    if (!canSubmit) {
      return { error: 'Unauthorized to submit offers' }
    }

    // Verify client has accepted
    if (!existing.client_accepted_at) {
      return { error: 'Client must accept offer before submission' }
    }

    // Update offer
    const { data: offer, error } = await supabase
      .from('offers')
      .update({
        offer_status: 'submitted',
        submitted_to_agent_at: new Date().toISOString(),
        submitted_by: user.id,
      })
      .eq('id', offerId)
      .select()
      .single()

    if (error) {
      console.error('Error submitting offer:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existing.matter_id}`)
    return { offer }
  } catch (error) {
    console.error('Unexpected error in submitOfferToAgent:', error)
    return { error: 'Failed to submit offer' }
  }
}

/**
 * Log agent response to offer
 */
export async function logAgentResponse(
  offerId: string,
  response: 'accepted' | 'rejected' | 'counter_offer',
  data: {
    agent_notes?: string
    rejection_reason?: string
    counter_offer_amount?: number
  }
): Promise<{ offer: Offer } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing offer
    const { data: existing, error: fetchError } = await supabase
      .from('offers')
      .select('tenant_id, matter_id, offer_status')
      .eq('id', offerId)
      .single()

    if (fetchError || !existing) {
      return { error: 'Offer not found' }
    }

    const canLog = await hasRole(existing.tenant_id, [
      'owner',
      'admin',
      'manager',
    ])

    if (!canLog) {
      return { error: 'Unauthorized to log agent responses' }
    }

    // Verify offer has been submitted
    if (existing.offer_status !== 'submitted') {
      return { error: 'Offer must be submitted before logging response' }
    }

    // Determine new status
    let newStatus: Offer['offer_status'] = 'submitted'
    if (response === 'accepted') newStatus = 'accepted'
    else if (response === 'rejected') newStatus = 'rejected'
    else if (response === 'counter_offer') newStatus = 'rejected' // Counter-offers also mark as rejected

    // Update offer
    const { data: offer, error } = await supabase
      .from('offers')
      .update({
        offer_status: newStatus,
        agent_response: response,
        agent_response_date: new Date().toISOString().split('T')[0],
        agent_notes: data.agent_notes || null,
        rejection_reason: data.rejection_reason || null,
        counter_offer_amount: data.counter_offer_amount || null,
      })
      .eq('id', offerId)
      .select()
      .single()

    if (error) {
      console.error('Error logging agent response:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existing.matter_id}`)
    return { offer }
  } catch (error) {
    console.error('Unexpected error in logAgentResponse:', error)
    return { error: 'Failed to log agent response' }
  }
}

/**
 * Withdraw an offer
 */
export async function withdrawOffer(
  offerId: string
): Promise<{ offer: Offer } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing offer
    const { data: existing, error: fetchError } = await supabase
      .from('offers')
      .select('tenant_id, matter_id')
      .eq('id', offerId)
      .single()

    if (fetchError || !existing) {
      return { error: 'Offer not found' }
    }

    const canWithdraw = await hasRole(existing.tenant_id, [
      'owner',
      'admin',
      'manager',
    ])

    if (!canWithdraw) {
      return { error: 'Unauthorized to withdraw offers' }
    }

    // Update offer
    const { data: offer, error } = await supabase
      .from('offers')
      .update({
        offer_status: 'withdrawn',
      })
      .eq('id', offerId)
      .select()
      .single()

    if (error) {
      console.error('Error withdrawing offer:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existing.matter_id}`)
    return { offer }
  } catch (error) {
    console.error('Unexpected error in withdrawOffer:', error)
    return { error: 'Failed to withdraw offer' }
  }
}

/**
 * Delete an offer (soft delete)
 */
export async function deleteOffer(
  offerId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing offer
    const { data: existing, error: fetchError } = await supabase
      .from('offers')
      .select('tenant_id, matter_id')
      .eq('id', offerId)
      .single()

    if (fetchError || !existing) {
      return { error: 'Offer not found' }
    }

    const canDelete = await hasRole(existing.tenant_id, [
      'owner',
      'admin',
      'manager',
    ])

    if (!canDelete) {
      return { error: 'Unauthorized to delete offers' }
    }

    // Soft delete
    const { error } = await supabase
      .from('offers')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', offerId)

    if (error) {
      console.error('Error deleting offer:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existing.matter_id}`)
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in deleteOffer:', error)
    return { error: 'Failed to delete offer' }
  }
}
