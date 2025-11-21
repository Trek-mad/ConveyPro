'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import type { Task, Matter } from '@/types'

interface OverdueTask extends Task {
  matter: Matter
}

interface UpcomingTask extends Task {
  matter: Matter
  days_until_due: number
}

interface UpcomingClosingDate {
  matter: Matter
  days_until_closing: number
}

interface MatterRequiringAttention extends Matter {
  reason: string
  priority_score: number
}

/**
 * Get all overdue tasks for a tenant
 */
export async function getOverdueTasks(tenantId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(
      `
      *,
      matter:matters(*)
    `
    )
    .eq('tenant_id', tenantId)
    .neq('status', 'completed')
    .lt('due_date', today)
    .is('deleted_at', null)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching overdue tasks:', error)
    return { error: error.message }
  }

  return { tasks: tasks as OverdueTask[] }
}

/**
 * Get upcoming tasks (within specified days)
 */
export async function getUpcomingTasks(tenantId: string, daysAhead: number = 7) {
  const user = await requireAuth()
  const supabase = await createClient()

  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + daysAhead)

  const todayStr = today.toISOString().split('T')[0]
  const futureDateStr = futureDate.toISOString().split('T')[0]

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(
      `
      *,
      matter:matters(*)
    `
    )
    .eq('tenant_id', tenantId)
    .neq('status', 'completed')
    .gte('due_date', todayStr)
    .lte('due_date', futureDateStr)
    .is('deleted_at', null)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching upcoming tasks:', error)
    return { error: error.message }
  }

  // Calculate days until due
  const tasksWithDays = (tasks as OverdueTask[]).map((task) => {
    const dueDate = new Date(task.due_date!)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      ...task,
      days_until_due: diffDays,
    }
  })

  return { tasks: tasksWithDays as UpcomingTask[] }
}

/**
 * Get upcoming closing dates (within specified days)
 */
export async function getUpcomingClosingDates(
  tenantId: string,
  daysAhead: number = 7
) {
  const user = await requireAuth()
  const supabase = await createClient()

  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + daysAhead)

  const todayStr = today.toISOString().split('T')[0]
  const futureDateStr = futureDate.toISOString().split('T')[0]

  const { data: matters, error } = await supabase
    .from('matters')
    .select('*')
    .eq('tenant_id', tenantId)
    .in('status', ['new', 'active'])
    .not('closing_date', 'is', null)
    .gte('closing_date', todayStr)
    .lte('closing_date', futureDateStr)
    .is('deleted_at', null)
    .order('closing_date', { ascending: true })

  if (error) {
    console.error('Error fetching upcoming closing dates:', error)
    return { error: error.message }
  }

  // Calculate days until closing
  const mattersWithDays = (matters as Matter[]).map((matter) => {
    const closingDate = new Date(matter.closing_date!)
    const diffTime = closingDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      matter,
      days_until_closing: diffDays,
    }
  })

  return { closingDates: mattersWithDays as UpcomingClosingDate[] }
}

/**
 * Get matters requiring attention
 * Criteria:
 * - Overdue tasks
 * - No activity in 7+ days
 * - Missing critical documents
 * - Unassigned fee earner
 * - Closing date within 7 days but stage not advanced
 */
export async function getMattersRequiringAttention(tenantId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const sevenDaysAhead = new Date()
  sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7)

  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
  const sevenDaysAheadStr = sevenDaysAhead.toISOString().split('T')[0]
  const today = new Date().toISOString().split('T')[0]

  // Get all active matters
  const { data: matters, error: mattersError } = await supabase
    .from('matters')
    .select('*')
    .eq('tenant_id', tenantId)
    .in('status', ['new', 'active'])
    .is('deleted_at', null)

  if (mattersError) {
    console.error('Error fetching matters:', mattersError)
    return { error: mattersError.message }
  }

  const mattersRequiringAttention: MatterRequiringAttention[] = []

  for (const matter of matters as Matter[]) {
    let reason = ''
    let priorityScore = 0

    // Check for unassigned fee earner (high priority)
    if (!matter.assigned_fee_earner_id) {
      reason = 'No fee earner assigned'
      priorityScore = 90
    }

    // Check for overdue tasks
    const { data: overdueTasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('matter_id', matter.id)
      .neq('status', 'completed')
      .lt('due_date', today)
      .is('deleted_at', null)

    if (overdueTasks && overdueTasks.length > 0) {
      reason = reason
        ? `${reason}, ${overdueTasks.length} overdue task(s)`
        : `${overdueTasks.length} overdue task(s)`
      priorityScore = Math.max(priorityScore, 80)
    }

    // Check for no recent activity
    if (matter.updated_at) {
      const updatedDate = new Date(matter.updated_at)
      if (updatedDate < sevenDaysAgo) {
        reason = reason ? `${reason}, No activity in 7+ days` : 'No activity in 7+ days'
        priorityScore = Math.max(priorityScore, 50)
      }
    }

    // Check for closing date within 7 days but still in early stages
    if (matter.closing_date) {
      const closingDate = new Date(matter.closing_date)
      const today = new Date()
      const diffTime = closingDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays <= 7 && diffDays > 0) {
        // Check if still in early stages
        const earlyStages = [
          'client_entry',
          'quote_check',
          'client_details',
          'financial_checks',
        ]
        if (matter.current_stage && earlyStages.includes(matter.current_stage)) {
          reason = reason
            ? `${reason}, Closing in ${diffDays} day(s) but still in early stage`
            : `Closing in ${diffDays} day(s) but still in early stage`
          priorityScore = Math.max(priorityScore, 95)
        }
      }
    }

    // Check for high priority matters with no recent progress
    if (matter.priority === 'urgent' || matter.priority === 'high') {
      if (matter.updated_at) {
        const updatedDate = new Date(matter.updated_at)
        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

        if (updatedDate < threeDaysAgo) {
          reason = reason
            ? `${reason}, High priority with no recent progress`
            : 'High priority with no recent progress'
          priorityScore = Math.max(priorityScore, 70)
        }
      }
    }

    if (reason) {
      mattersRequiringAttention.push({
        ...matter,
        reason,
        priority_score: priorityScore,
      })
    }
  }

  // Sort by priority score descending
  mattersRequiringAttention.sort((a, b) => b.priority_score - a.priority_score)

  return { matters: mattersRequiringAttention }
}

/**
 * Get summary of all alerts for a tenant
 */
export async function getAlertsSummary(tenantId: string) {
  const user = await requireAuth()

  const [overdueTasksResult, upcomingTasksResult, closingDatesResult, attentionResult] =
    await Promise.all([
      getOverdueTasks(tenantId),
      getUpcomingTasks(tenantId, 7),
      getUpcomingClosingDates(tenantId, 7),
      getMattersRequiringAttention(tenantId),
    ])

  return {
    overdueTasks: 'tasks' in overdueTasksResult ? overdueTasksResult.tasks : [],
    upcomingTasks: 'tasks' in upcomingTasksResult ? upcomingTasksResult.tasks : [],
    upcomingClosingDates:
      'closingDates' in closingDatesResult ? closingDatesResult.closingDates : [],
    mattersRequiringAttention:
      'matters' in attentionResult ? attentionResult.matters : [],
    summary: {
      overdueTasksCount:
        'tasks' in overdueTasksResult ? overdueTasksResult.tasks.length : 0,
      upcomingTasksCount:
        'tasks' in upcomingTasksResult ? upcomingTasksResult.tasks.length : 0,
      upcomingClosingDatesCount:
        'closingDates' in closingDatesResult ? closingDatesResult.closingDates.length : 0,
      mattersRequiringAttentionCount:
        'matters' in attentionResult ? attentionResult.matters.length : 0,
    },
  }
}

/**
 * Get tasks due for reminder notification
 * Returns tasks that are due in 7, 3, or 1 day(s)
 */
export async function getTasksDueForReminder(tenantId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const today = new Date()
  const dates = [1, 3, 7].map((days) => {
    const date = new Date()
    date.setDate(today.getDate() + days)
    return date.toISOString().split('T')[0]
  })

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(
      `
      *,
      matter:matters(*),
      assigned_to_user:profiles!tasks_assigned_to_fkey(*)
    `
    )
    .eq('tenant_id', tenantId)
    .neq('status', 'completed')
    .in('due_date', dates)
    .is('deleted_at', null)

  if (error) {
    console.error('Error fetching tasks due for reminder:', error)
    return { error: error.message }
  }

  return { tasks: tasks as (Task & { matter: Matter })[] }
}

/**
 * Get closing dates due for reminder notification
 * Returns matters with closing dates in 7, 3, or 1 day(s)
 */
export async function getClosingDatesDueForReminder(tenantId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const today = new Date()
  const dates = [1, 3, 7].map((days) => {
    const date = new Date()
    date.setDate(today.getDate() + days)
    return date.toISOString().split('T')[0]
  })

  const { data: matters, error } = await supabase
    .from('matters')
    .select('*')
    .eq('tenant_id', tenantId)
    .in('status', ['new', 'active'])
    .in('closing_date', dates)
    .is('deleted_at', null)

  if (error) {
    console.error('Error fetching closing dates due for reminder:', error)
    return { error: error.message }
  }

  return { matters: matters as Matter[] }
}
