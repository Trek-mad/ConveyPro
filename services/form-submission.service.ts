import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { calculateQuote } from '@/lib/calculators'
import { findMatchingCampaigns, enrollClientInCampaigns } from './campaign-enrollment.service'

type Client = Database['public']['Tables']['clients']['Row']
type Property = Database['public']['Tables']['properties']['Row']
type Quote = Database['public']['Tables']['quotes']['Row']

/**
 * Form submission data structure
 * This represents the data coming from external forms (n8n, Typeform, etc.)
 */
export interface FormSubmissionData {
  // Form metadata
  form_id?: string
  form_name?: string
  form_type?: 'conveyancing' | 'wills' | 'power_of_attorney' | 'estate_planning' | 'remortgage'
  submission_date?: string
  source_url?: string

  // Client information
  first_name: string
  last_name: string
  email?: string
  phone?: string
  client_type?: 'individual' | 'couple' | 'business' | 'estate'

  // Property information
  property_address?: string
  property_city?: string
  property_postcode?: string
  property_type?: 'residential' | 'commercial'
  purchase_price?: number

  // Transaction details
  transaction_type?: 'purchase' | 'sale' | 'remortgage' | 'transfer_of_equity'
  is_first_time_buyer?: boolean
  is_additional_property?: boolean

  // Additional fields
  notes?: string

  // Auto-enrollment preferences
  auto_enroll_campaigns?: boolean
}

/**
 * Result of processing a form submission
 */
export interface FormSubmissionResult {
  success: boolean
  error?: string
  client_id?: string
  property_id?: string
  quote_id?: string
  enrolled_campaigns?: number
  message?: string
}

/**
 * Detect life stage from form type and data
 */
function detectLifeStage(formData: FormSubmissionData): string | null {
  // If form type indicates life stage
  if (formData.form_type === 'wills' && formData.is_first_time_buyer) {
    return 'first-time-buyer'
  }

  if (formData.is_first_time_buyer) {
    return 'first-time-buyer'
  }

  // Based on transaction type and property info
  if (formData.transaction_type === 'purchase') {
    if (formData.is_additional_property) {
      return 'investor'
    }
    // Default to moving-up for purchases
    return 'moving-up'
  }

  if (formData.transaction_type === 'remortgage') {
    return 'remortgage'
  }

  if (formData.form_type === 'estate_planning') {
    return 'retired'
  }

  // Default
  return null
}

/**
 * Detect source from form metadata
 */
function detectSource(formData: FormSubmissionData): string {
  if (formData.source_url) {
    if (formData.source_url.includes('facebook')) return 'marketing'
    if (formData.source_url.includes('google')) return 'marketing'
    if (formData.source_url.includes('instagram')) return 'marketing'
  }

  if (formData.form_name?.toLowerCase().includes('referral')) {
    return 'referral'
  }

  // Default to website
  return 'website'
}

/**
 * Create a client from form submission data
 */
async function createClientFromForm(
  tenantId: string,
  formData: FormSubmissionData
): Promise<{ client: Client | null; error?: string }> {
  const supabase = createServiceRoleClient()

  // Check if client already exists by email
  if (formData.email) {
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('email', formData.email)
      .single()

    if (existingClient) {
      return { client: existingClient }
    }
  }

  // Create new client
  const lifeStage = detectLifeStage(formData)
  const source = detectSource(formData)

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      tenant_id: tenantId,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email || null,
      phone: formData.phone || null,
      life_stage: lifeStage,
      client_type: formData.client_type || 'individual',
      source: source,
      tags: formData.form_type ? [formData.form_type] : null,
      notes: formData.notes || null,
    })
    .select()
    .single()

  if (error) {
    return { client: null, error: error.message }
  }

  return { client }
}

/**
 * Create a property from form submission data
 */
async function createPropertyFromForm(
  tenantId: string,
  formData: FormSubmissionData
): Promise<{ property: Property | null; error?: string }> {
  // Skip if no property data
  if (!formData.property_address && !formData.purchase_price) {
    return { property: null }
  }

  const supabase = createServiceRoleClient()

  const { data: property, error} = await supabase
    .from('properties')
    .insert({
      tenant_id: tenantId,
      address_line1: formData.property_address || 'TBC',
      address_line2: null,
      city: formData.property_city || 'Edinburgh',
      postcode: formData.property_postcode || 'EH1 1AA',
      country: 'Scotland',
      property_type: formData.property_type || 'residential',
      purchase_price: formData.purchase_price || null,
    })
    .select()
    .single()

  if (error) {
    return { property: null, error: error.message }
  }

  return { property }
}

/**
 * Create a quote from form submission data
 */
async function createQuoteFromForm(
  tenantId: string,
  clientId: string,
  propertyId: string | null,
  formData: FormSubmissionData
): Promise<{ quote: Quote | null; error?: string }> {
  const supabase = createServiceRoleClient()

  // Generate quote number
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6)
  const tenantPrefix = tenantId.substring(0, 4)
  const quoteNumber = `Q-${tenantPrefix}-${timestamp}-${random}`

  // Calculate fees based on purchase price
  const transactionValue = formData.purchase_price || 200000
  const transactionType = formData.transaction_type || 'purchase'

  // Calculate LBTT and fees
  const calculation = calculateQuote({
    purchasePrice: transactionValue,
    transactionType,
    isFirstTimeBuyer: formData.is_first_time_buyer || false,
    isAdditionalProperty: formData.is_additional_property || false,
  })

  const { data: quote, error } = await supabase
    .from('quotes')
    .insert({
      tenant_id: tenantId,
      client_id: clientId,
      property_id: propertyId,
      quote_number: quoteNumber,
      client_name: `${formData.first_name} ${formData.last_name}`,
      client_email: formData.email || null,
      client_phone: formData.phone || null,
      transaction_type: transactionType,
      transaction_value: transactionValue,
      base_fee: calculation.fees.baseFee,
      disbursements: calculation.fees.disbursements,
      vat_amount: calculation.fees.vat,
      total_amount: calculation.fees.total,
      lbtt_amount: calculation.lbtt.totalLBTT,
      status: 'draft', // Start as draft, firm can review and send
      is_first_time_buyer: formData.is_first_time_buyer || false,
      is_additional_property: formData.is_additional_property || false,
      notes: formData.notes || null,
    })
    .select()
    .single()

  if (error) {
    return { quote: null, error: error.message }
  }

  return { quote }
}

/**
 * Process a complete form submission
 *
 * This is the main entry point for form automation.
 * It creates client, property, and quote from form data.
 * Optionally enrolls client in matching campaigns.
 */
export async function processFormSubmission(
  tenantId: string,
  formData: FormSubmissionData
): Promise<FormSubmissionResult> {
  try {
    // Step 1: Create or get existing client
    const { client, error: clientError } = await createClientFromForm(
      tenantId,
      formData
    )

    if (clientError || !client) {
      return {
        success: false,
        error: clientError || 'Failed to create client',
      }
    }

    // Step 2: Create property (if property data provided)
    const { property, error: propertyError } = await createPropertyFromForm(
      tenantId,
      formData
    )

    if (propertyError) {
      return {
        success: false,
        error: propertyError,
        client_id: client.id,
      }
    }

    // Step 3: Create quote
    const { quote, error: quoteError } = await createQuoteFromForm(
      tenantId,
      client.id,
      property?.id || null,
      formData
    )

    if (quoteError || !quote) {
      return {
        success: false,
        error: quoteError || 'Failed to create quote',
        client_id: client.id,
        property_id: property?.id,
      }
    }

    // Step 4: Optional - Auto-enroll in matching campaigns
    let enrolledCount = 0
    if (formData.auto_enroll_campaigns !== false) {
      // Auto-enroll by default
      try {
        const matchingCampaigns = await findMatchingCampaigns(client.id, tenantId)

        if (matchingCampaigns.campaigns && matchingCampaigns.campaigns.length > 0) {
          // Enroll in all matching campaigns
          const matchingCampaignIds = matchingCampaigns.campaigns
            .filter(c => c.matches_criteria)
            .map(c => c.id)

          if (matchingCampaignIds.length > 0) {
            const enrollResult = await enrollClientInCampaigns(
              client.id,
              matchingCampaignIds,
              tenantId
            )
            enrolledCount = enrollResult.enrolled_count || 0
          }
        }
      } catch (enrollError) {
        // Don't fail the whole submission if enrollment fails
        console.error('Campaign enrollment failed:', enrollError)
      }
    }

    return {
      success: true,
      client_id: client.id,
      property_id: property?.id,
      quote_id: quote.id,
      enrolled_campaigns: enrolledCount,
      message: `Successfully created client, ${property ? 'property, ' : ''}quote${enrolledCount > 0 ? `, and enrolled in ${enrolledCount} campaigns` : ''}`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error processing form submission',
    }
  }
}

/**
 * Get submission statistics for a tenant
 */
export async function getFormSubmissionStats(tenantId: string) {
  const supabase = await createClient()

  // Get clients created in last 30 days from form submissions
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentClients, error } = await supabase
    .from('clients')
    .select('id, source, created_at')
    .eq('tenant_id', tenantId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .eq('source', 'website')

  if (error) {
    return {
      total_submissions: 0,
      recent_submissions: 0,
      conversion_rate: 0,
    }
  }

  return {
    total_submissions: recentClients.length,
    recent_submissions: recentClients.length,
    conversion_rate: 0, // TODO: Calculate from quotes accepted
  }
}
