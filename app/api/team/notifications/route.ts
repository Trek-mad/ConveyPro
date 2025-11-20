import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationStats,
} from '@/lib/services/team-collaboration.service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const action = searchParams.get('action')

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (action === 'stats') {
      const { stats, error } = await getNotificationStats(user.id)
      if (error) {
        return NextResponse.json({ error }, { status: 500 })
      }
      return NextResponse.json({ stats })
    }

    const { notifications, error } = await getNotifications(user.id, unreadOnly)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error in GET /api/team/notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (body.action === 'mark_all_read') {
      const { error } = await markAllNotificationsAsRead(user.id)
      if (error) {
        return NextResponse.json({ error }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    if (body.action === 'mark_read' && body.notification_id) {
      const { notification, error } = await markNotificationAsRead(
        body.notification_id
      )
      if (error) {
        return NextResponse.json({ error }, { status: 500 })
      }
      return NextResponse.json({ notification })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in PATCH /api/team/notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
