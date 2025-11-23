/**
 * Portal Token Service
 * Handles secure tokenized access for client portal
 * Phase 12.7 - Client Portal
 */

// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import type {
  ClientPortalToken,
  ClientPortalTokenInsert,
  TokenValidationResult,
  PortalMatterView,
} from '@/types'

const TOKEN_EXPIRY_DAYS = 30
const TOKEN_SECRET = process.env.PORTAL_TOKEN_SECRET || 'default-secret-change-in-production'

/**
 * Generate a secure portal token for a matter
 */
export async function generatePortalToken(data: {
  matter_id: string
  client_id: string
  tenant_id: string
  purpose?: string
  expires_in_days?: number
}): Promise<{ success: boolean; token?: ClientPortalToken; url?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // Generate unique token (UUID v4)
    const token = crypto.randomUUID()

    // Generate HMAC hash for additional security
    const tokenHash = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(token)
      .digest('hex')

    // Calculate expiry date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (data.expires_in_days || TOKEN_EXPIRY_DAYS))

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Insert token
    const { data: portalToken, error } = await supabase
      .from('client_portal_tokens')
      .insert({
        tenant_id: data.tenant_id,
        matter_id: data.matter_id,
        client_id: data.client_id,
        token,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        purpose: data.purpose || 'matter_view',
        is_active: true,
        created_by: user?.id,
      } as ClientPortalTokenInsert)
      .select()
      .single()

    if (error) {
      console.error('Error creating portal token:', error)
      return {
        success: false,
        error: 'Failed to create portal token',
      }
    }

    // Generate portal URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const portalUrl = `${baseUrl}/portal/${token}`

    return {
      success: true,
      token: portalToken,
      url: portalUrl,
    }
  } catch (err) {
    console.error('Error in generatePortalToken:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Validate a portal token and return matter details
 */
export async function validatePortalToken(
  token: string,
  ipAddress?: string
): Promise<TokenValidationResult> {
  try {
    const supabase = await createClient()

    // Call database function to validate and track access
    const { data, error } = await supabase.rpc('get_matter_by_portal_token', {
      p_token: token,
      p_ip_address: ipAddress || null,
    })

    if (error || !data || data.length === 0) {
      return {
        isValid: false,
        error: 'Invalid or expired token',
      }
    }

    const tokenData = data[0]

    if (!tokenData.is_valid) {
      return {
        isValid: false,
        error: tokenData.error_message || 'Token validation failed',
      }
    }

    // Fetch full matter details with relations
    const { data: matter, error: matterError } = await supabase
      .from('matters')
      .select(
        `
        *,
        primary_client:clients!matters_primary_client_id_fkey(*),
        secondary_client:clients!matters_secondary_client_id_fkey(*),
        property:properties(*),
        tenant:tenants(*),
        workflow_stage:workflow_stages!matters_current_stage_fkey(*)
      `
      )
      .eq('id', tokenData.matter_id)
      .eq('deleted_at', null)
      .single()

    if (matterError || !matter) {
      return {
        isValid: false,
        error: 'Matter not found',
      }
    }

    // Fetch client details
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', tokenData.client_id)
      .eq('deleted_at', null)
      .single()

    // Fetch tenant details
    const { data: tenant } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tokenData.tenant_id)
      .single()

    // Fetch token record
    const { data: tokenRecord } = await supabase
      .from('client_portal_tokens')
      .select('*')
      .eq('token', token)
      .eq('deleted_at', null)
      .single()

    return {
      isValid: true,
      matter,
      client: client || undefined,
      tenant: tenant || undefined,
      token: tokenRecord || undefined,
    }
  } catch (err) {
    console.error('Error in validatePortalToken:', err)
    return {
      isValid: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Get portal matter view (client-safe data only)
 */
export async function getPortalMatterView(token: string): Promise<{
  success: boolean
  matter?: PortalMatterView
  error?: string
}> {
  try {
    const validation = await validatePortalToken(token)

    if (!validation.isValid || !validation.matter) {
      return {
        success: false,
        error: validation.error || 'Invalid token',
      }
    }

    const supabase = await createClient()

    // Fetch documents (client-visible only)
    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('matter_id', validation.matter.id)
      .eq('status', 'verified') // Only show verified documents to clients
      .eq('deleted_at', null)
      .order('created_at', { ascending: false })

    // Fetch current offer (if any)
    const { data: currentOffer } = await supabase
      .from('offers')
      .select('*')
      .eq('matter_id', validation.matter.id)
      .eq('offer_status', 'pending_client')
      .eq('deleted_at', null)
      .single()

    // Construct portal matter view
    const portalMatter: PortalMatterView = {
      ...validation.matter,
      documents: documents || [],
      current_offer: currentOffer || null,
    }

    return {
      success: true,
      matter: portalMatter,
    }
  } catch (err) {
    console.error('Error in getPortalMatterView:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Log offer acceptance via portal
 */
export async function acceptOfferViaPortal(data: {
  token: string
  offer_id: string
  ip_address?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Validate token
    const validation = await validatePortalToken(data.token, data.ip_address)

    if (!validation.isValid || !validation.matter || !validation.token) {
      return {
        success: false,
        error: 'Invalid or expired token',
      }
    }

    // Verify offer belongs to this matter
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .eq('id', data.offer_id)
      .eq('matter_id', validation.matter.id)
      .eq('deleted_at', null)
      .single()

    if (offerError || !offer) {
      return {
        success: false,
        error: 'Offer not found',
      }
    }

    // Check if offer is in correct status
    if (offer.offer_status !== 'pending_client') {
      return {
        success: false,
        error: 'Offer is not pending client acceptance',
      }
    }

    // Update offer status
    const { error: updateError } = await supabase
      .from('offers')
      .update({
        offer_status: 'accepted',
        client_accepted_at: new Date().toISOString(),
        client_acceptance_ip: data.ip_address || null,
      })
      .eq('id', data.offer_id)

    if (updateError) {
      console.error('Error updating offer:', updateError)
      return {
        success: false,
        error: 'Failed to accept offer',
      }
    }

    // Log acceptance in token record
    const { error: tokenError } = await supabase.rpc('log_portal_offer_acceptance', {
      p_token_id: validation.token.id,
      p_ip_address: data.ip_address || null,
    })

    if (tokenError) {
      console.error('Error logging token acceptance:', tokenError)
      // Don't fail the operation if logging fails
    }

    // Log activity
    await supabase.from('matter_activities').insert({
      matter_id: validation.matter.id,
      tenant_id: validation.matter.tenant_id,
      activity_type: 'offer_accepted',
      title: 'Client Accepted Offer',
      description: `Client accepted offer via portal (IP: ${data.ip_address || 'unknown'})`,
      related_offer_id: data.offer_id,
      metadata: {
        acceptance_method: 'portal',
        token_id: validation.token.id,
        ip_address: data.ip_address,
      },
    })

    return {
      success: true,
    }
  } catch (err) {
    console.error('Error in acceptOfferViaPortal:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Revoke a portal token
 */
export async function revokePortalToken(
  token_id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('client_portal_tokens')
      .update({
        is_active: false,
      })
      .eq('id', token_id)

    if (error) {
      console.error('Error revoking token:', error)
      return {
        success: false,
        error: 'Failed to revoke token',
      }
    }

    return {
      success: true,
    }
  } catch (err) {
    console.error('Error in revokePortalToken:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Revoke all portal tokens for a matter
 */
export async function revokeMatterPortalTokens(
  matter_id: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('revoke_matter_portal_tokens', {
      p_matter_id: matter_id,
    })

    if (error) {
      console.error('Error revoking matter tokens:', error)
      return {
        success: false,
        error: 'Failed to revoke tokens',
      }
    }

    return {
      success: true,
      count: data || 0,
    }
  } catch (err) {
    console.error('Error in revokeMatterPortalTokens:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Get all portal tokens for a matter
 */
export async function getMatterPortalTokens(
  matter_id: string
): Promise<{ success: boolean; tokens?: ClientPortalToken[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('client_portal_tokens')
      .select('*')
      .eq('matter_id', matter_id)
      .eq('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tokens:', error)
      return {
        success: false,
        error: 'Failed to fetch tokens',
      }
    }

    return {
      success: true,
      tokens: data || [],
    }
  } catch (err) {
    console.error('Error in getMatterPortalTokens:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Submit contact form message from portal
 */
export async function submitPortalContactForm(data: {
  token: string
  message: string
  subject?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const validation = await validatePortalToken(data.token)

    if (!validation.isValid || !validation.matter || !validation.client) {
      return {
        success: false,
        error: 'Invalid or expired token',
      }
    }

    const supabase = await createClient()

    // Log as matter activity
    await supabase.from('matter_activities').insert({
      matter_id: validation.matter.id,
      tenant_id: validation.matter.tenant_id,
      activity_type: 'portal_message',
      title: data.subject || 'Client Message from Portal',
      description: data.message,
      actor_name: `${validation.client.first_name} ${validation.client.last_name}`,
      metadata: {
        source: 'portal',
        client_id: validation.client.id,
      },
    })

    // TODO: Send email notification to assigned fee earner or admin
    // This would integrate with email service (e.g., Resend)

    return {
      success: true,
    }
  } catch (err) {
    console.error('Error in submitPortalContactForm:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}
