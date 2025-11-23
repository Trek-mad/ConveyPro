import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const supabase = await createClient()

    const { data: demoRequest, error } = await supabase
      .from('demo_requests')
      .insert({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone,
        company_name: body.company_name,
        company_size: body.company_size,
        message: body.message,
        preferred_date: body.preferred_date,
        lead_source: body.lead_source || 'website',
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // In production, send email notification to sales team

    return NextResponse.json(
      {
        success: true,
        message: 'Demo request submitted successfully',
        request: demoRequest,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/marketing/demo-request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
