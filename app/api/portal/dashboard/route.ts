import { NextResponse } from 'next/server'
import { getClientDashboardData } from '@/lib/services/client-portal.service'

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

    const data = await getClientDashboardData(clientId, tenantId)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/portal/dashboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
