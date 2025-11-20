import { NextResponse } from 'next/server'
import { getSubscriptionPlans } from '@/lib/services/billing.service'

export async function GET(request: Request) {
  try {
    const { plans, error } = await getSubscriptionPlans()

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error in GET /api/billing/plans:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
