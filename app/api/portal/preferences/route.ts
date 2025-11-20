import { NextResponse } from 'next/server'
import {
  getClientPreferences,
  updateClientPreferences,
} from '@/lib/services/client-portal.service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')
    const tenantId = searchParams.get('tenant_id')

    if (!clientId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing client_id or tenant_id' },
        { status: 400 }
      )
    }

    const { preferences, error } = await getClientPreferences(clientId, tenantId)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Error in GET /api/portal/preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    const { preferences, error } = await updateClientPreferences(
      body.client_id,
      body.tenant_id,
      body
    )

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Error in PATCH /api/portal/preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
