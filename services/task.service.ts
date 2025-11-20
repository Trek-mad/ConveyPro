'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth, hasRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { MatterTask, MatterTaskInsert, MatterTaskUpdate } from '@/types'

/**
 * Create a new task
 */
export async function createTask(
  data: MatterTaskInsert
): Promise<{ task: MatterTask } | { error: string }> {
  try {
    const user = await requireAuth()
    const canCreate = await hasRole(data.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canCreate) {
      return { error: 'Unauthorized to create tasks' }
    }

    const supabase = await createClient()

    const { data: task, error } = await supabase
      .from('matter_tasks')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${data.matter_id}`)
    return { task }
  } catch (error) {
    console.error('Unexpected error in createTask:', error)
    return { error: 'Failed to create task' }
  }
}

/**
 * Get tasks for a matter
 */
export async function getTasksForMatter(
  matterId: string,
  filters?: {
    stage?: string
    status?: MatterTask['status']
    assigned_to?: string
  }
): Promise<{ tasks: MatterTask[] } | { error: string }> {
  try {
    await requireAuth()
    const supabase = await createClient()

    let query = supabase
      .from('matter_tasks')
      .select('*')
      .eq('matter_id', matterId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (filters?.stage) {
      query = query.eq('stage', filters.stage)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }

    const { data: tasks, error } = await query

    if (error) {
      console.error('Error fetching tasks:', error)
      return { error: error.message }
    }

    return { tasks: tasks || [] }
  } catch (error) {
    console.error('Unexpected error in getTasksForMatter:', error)
    return { error: 'Failed to fetch tasks' }
  }
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  updates: MatterTaskUpdate
): Promise<{ task: MatterTask } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing task to check tenant
    const { data: existingTask, error: fetchError } = await supabase
      .from('matter_tasks')
      .select('tenant_id, matter_id')
      .eq('id', taskId)
      .single()

    if (fetchError || !existingTask) {
      return { error: 'Task not found' }
    }

    const canUpdate = await hasRole(existingTask.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canUpdate) {
      return { error: 'Unauthorized to update tasks' }
    }

    const { data: task, error } = await supabase
      .from('matter_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      console.error('Error updating task:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existingTask.matter_id}`)
    return { task }
  } catch (error) {
    console.error('Unexpected error in updateTask:', error)
    return { error: 'Failed to update task' }
  }
}

/**
 * Complete a task
 */
export async function completeTask(
  taskId: string
): Promise<{ task: MatterTask } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing task
    const { data: existingTask, error: fetchError } = await supabase
      .from('matter_tasks')
      .select('tenant_id, matter_id')
      .eq('id', taskId)
      .single()

    if (fetchError || !existingTask) {
      return { error: 'Task not found' }
    }

    const canComplete = await hasRole(existingTask.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canComplete) {
      return { error: 'Unauthorized' }
    }

    const { data: task, error } = await supabase
      .from('matter_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: user.id,
      })
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      console.error('Error completing task:', error)
      return { error: error.message }
    }

    // Note: Activity log handled by database trigger

    revalidatePath(`/matters/${existingTask.matter_id}`)
    return { task }
  } catch (error) {
    console.error('Unexpected error in completeTask:', error)
    return { error: 'Failed to complete task' }
  }
}

/**
 * Delete a task (soft delete)
 */
export async function deleteTask(
  taskId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing task
    const { data: existingTask, error: fetchError } = await supabase
      .from('matter_tasks')
      .select('tenant_id, matter_id')
      .eq('id', taskId)
      .single()

    if (fetchError || !existingTask) {
      return { error: 'Task not found' }
    }

    const canDelete = await hasRole(existingTask.tenant_id, [
      'owner',
      'admin',
      'manager',
    ])

    if (!canDelete) {
      return { error: 'Unauthorized to delete tasks' }
    }

    const { error } = await supabase
      .from('matter_tasks')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting task:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existingTask.matter_id}`)
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in deleteTask:', error)
    return { error: 'Failed to delete task' }
  }
}

/**
 * Assign a task to a user
 */
export async function assignTask(
  taskId: string,
  userId: string
): Promise<{ task: MatterTask } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing task
    const { data: existingTask, error: fetchError } = await supabase
      .from('matter_tasks')
      .select('tenant_id, matter_id')
      .eq('id', taskId)
      .single()

    if (fetchError || !existingTask) {
      return { error: 'Task not found' }
    }

    const canAssign = await hasRole(existingTask.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canAssign) {
      return { error: 'Unauthorized to assign tasks' }
    }

    const { data: task, error } = await supabase
      .from('matter_tasks')
      .update({
        assigned_to: userId,
        assigned_at: new Date().toISOString(),
        assigned_by: user.id,
      })
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      console.error('Error assigning task:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existingTask.matter_id}`)
    return { task }
  } catch (error) {
    console.error('Unexpected error in assignTask:', error)
    return { error: 'Failed to assign task' }
  }
}
