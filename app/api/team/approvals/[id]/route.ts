import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  approveRejectRequest,
  addApprovalComment,
} from '@/lib/services/team-collaboration.service'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (body.action === 'approve' || body.action === 'reject') {
      const { request: approvalRequest, error } = await approveRejectRequest(
        id,
        {
          decision: body.action === 'approve' ? 'approved' : 'rejected',
          decision_note: body.decision_note,
        }
      )

      if (error) {
        return NextResponse.json({ error }, { status: 500 })
      }

      return NextResponse.json({ request: approvalRequest })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in PATCH /api/team/approvals/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get tenant ID
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    // Add comment
    const { comment, error } = await addApprovalComment(
      id,
      membership.tenant_id,
      body.comment_text,
      body.is_internal
    )

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/team/approvals/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
