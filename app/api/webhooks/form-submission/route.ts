import { NextRequest, NextResponse } from 'next/server'
import { processFormSubmission, type FormSubmissionData } from '@/services/form-submission.service'

/**
 * POST /api/webhooks/form-submission
 *
 * Webhook endpoint for receiving form submissions from external sources
 * (n8n, Typeform, Google Forms, etc.)
 *
 * Authentication: API key or webhook secret
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization')
    const webhookSecret = process.env.FORM_WEBHOOK_SECRET

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid webhook secret' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Extract tenant ID from body or query params
    const { searchParams } = new URL(request.url)
    const tenantId = body.tenant_id || searchParams.get('tenant_id')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!body.first_name || !body.last_name) {
      return NextResponse.json(
        { error: 'first_name and last_name are required' },
        { status: 400 }
      )
    }

    // Build form submission data
    const formData: FormSubmissionData = {
      // Form metadata
      form_id: body.form_id,
      form_name: body.form_name,
      form_type: body.form_type,
      submission_date: body.submission_date || new Date().toISOString(),
      source_url: body.source_url,

      // Client information
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      client_type: body.client_type,

      // Property information
      property_address: body.property_address,
      property_city: body.property_city,
      property_postcode: body.property_postcode,
      property_type: body.property_type,
      purchase_price: body.purchase_price ? parseFloat(body.purchase_price) : undefined,

      // Transaction details
      transaction_type: body.transaction_type,
      is_first_time_buyer: body.is_first_time_buyer === true || body.is_first_time_buyer === 'true',
      is_additional_property: body.is_additional_property === true || body.is_additional_property === 'true',

      // Additional fields
      notes: body.notes,

      // Auto-enrollment
      auto_enroll_campaigns: body.auto_enroll_campaigns !== false,
    }

    // Process the form submission
    const result = await processFormSubmission(tenantId, formData)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          client_id: result.client_id,
          property_id: result.property_id,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        client_id: result.client_id,
        property_id: result.property_id,
        quote_id: result.quote_id,
        enrolled_campaigns: result.enrolled_campaigns,
      },
    })
  } catch (error: any) {
    console.error('Error processing form submission webhook:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/webhooks/form-submission
 *
 * Returns webhook documentation and example payload
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenant_id')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'
  const webhookUrl = `${baseUrl}/api/webhooks/form-submission${tenantId ? `?tenant_id=${tenantId}` : ''}`

  return NextResponse.json({
    webhook_url: webhookUrl,
    method: 'POST',
    authentication: 'Bearer token in Authorization header',
    required_fields: ['first_name', 'last_name', 'tenant_id'],
    optional_fields: [
      'email',
      'phone',
      'property_address',
      'property_city',
      'property_postcode',
      'purchase_price',
      'transaction_type',
      'is_first_time_buyer',
      'is_additional_property',
      'form_id',
      'form_name',
      'form_type',
      'source_url',
      'notes',
      'auto_enroll_campaigns',
    ],
    example_payload: {
      tenant_id: 'your-tenant-id',
      form_id: 'typeform-abc123',
      form_name: 'Conveyancing Quote Request',
      form_type: 'conveyancing',
      source_url: 'https://yourfirm.co.uk/get-quote',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@example.com',
      phone: '07700900123',
      client_type: 'individual',
      property_address: '123 High Street',
      property_city: 'Edinburgh',
      property_postcode: 'EH1 1AA',
      property_type: 'residential',
      purchase_price: 250000,
      transaction_type: 'purchase',
      is_first_time_buyer: true,
      is_additional_property: false,
      notes: 'Looking to complete by end of March',
      auto_enroll_campaigns: true,
    },
    example_response: {
      success: true,
      message: 'Successfully created client, property, quote, and enrolled in 2 campaigns',
      data: {
        client_id: 'uuid-here',
        property_id: 'uuid-here',
        quote_id: 'uuid-here',
        enrolled_campaigns: 2,
      },
    },
  })
}
