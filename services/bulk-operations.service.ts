'use server'

import { createClient } from '@/lib/supabase/server'
import { logActivity } from './activity-log.service'

// ============================================================================
// TYPES
// ============================================================================

export interface BulkOperationResult {
  success: boolean
  successful_ids: string[]
  failed_ids: string[]
  error_messages: { id: string; error: string }[]
  total_attempted: number
  total_successful: number
  total_failed: number
}

export interface BulkAssignmentData {
  fee_earner_id: string
  assigned_by: string
  tenant_id: string
}

export interface BulkStageTransitionData {
  new_stage_id: string
  user_id: string
  tenant_id: string
}

export interface BulkTaskCreationData {
  title: string
  description?: string
  due_date?: string
  assigned_to?: string
  priority?: string
  created_by: string
  tenant_id: string
}

export interface BulkStatusUpdateData {
  new_status: string
  user_id: string
  tenant_id: string
}

// ============================================================================
// BULK MATTER OPERATIONS
// ============================================================================

export async function bulkAssignFeeEarner(
  matter_ids: string[],
  data: BulkAssignmentData
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: false,
    successful_ids: [],
    failed_ids: [],
    error_messages: [],
    total_attempted: matter_ids.length,
    total_successful: 0,
    total_failed: 0
  }

  try {
    const supabase = await createClient()

    for (const matter_id of matter_ids) {
      try {
        // Update matter
        const { error: updateError } = await supabase
          .from('matters')
          .update({
            fee_earner_id: data.fee_earner_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', matter_id)
          .eq('tenant_id', data.tenant_id)

        if (updateError) throw updateError

        // Log activity
        await logActivity({
          tenant_id: data.tenant_id,
          matter_id,
          user_id: data.assigned_by,
          activity_type: 'fee_earner_assigned',
          description: `Fee earner assigned via bulk operation`,
          metadata: { fee_earner_id: data.fee_earner_id, bulk_operation: true }
        })

        result.successful_ids.push(matter_id)
        result.total_successful++
      } catch (error) {
        result.failed_ids.push(matter_id)
        result.total_failed++
        result.error_messages.push({
          id: matter_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    result.success = result.total_failed === 0
    return result
  } catch (error) {
    console.error('Bulk assign fee earner error:', error)
    result.failed_ids = matter_ids
    result.total_failed = matter_ids.length
    return result
  }
}

export async function bulkUpdateMatterStage(
  matter_ids: string[],
  data: BulkStageTransitionData
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: false,
    successful_ids: [],
    failed_ids: [],
    error_messages: [],
    total_attempted: matter_ids.length,
    total_successful: 0,
    total_failed: 0
  }

  try {
    const supabase = await createClient()

    for (const matter_id of matter_ids) {
      try {
        // Update matter stage
        const { error: updateError } = await supabase
          .from('matters')
          .update({
            stage_id: data.new_stage_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', matter_id)
          .eq('tenant_id', data.tenant_id)

        if (updateError) throw updateError

        // Log activity
        await logActivity({
          tenant_id: data.tenant_id,
          matter_id,
          user_id: data.user_id,
          activity_type: 'stage_changed',
          description: `Stage updated via bulk operation`,
          metadata: { new_stage_id: data.new_stage_id, bulk_operation: true }
        })

        result.successful_ids.push(matter_id)
        result.total_successful++
      } catch (error) {
        result.failed_ids.push(matter_id)
        result.total_failed++
        result.error_messages.push({
          id: matter_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    result.success = result.total_failed === 0
    return result
  } catch (error) {
    console.error('Bulk update matter stage error:', error)
    result.failed_ids = matter_ids
    result.total_failed = matter_ids.length
    return result
  }
}

export async function bulkUpdateMatterStatus(
  matter_ids: string[],
  data: BulkStatusUpdateData
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: false,
    successful_ids: [],
    failed_ids: [],
    error_messages: [],
    total_attempted: matter_ids.length,
    total_successful: 0,
    total_failed: 0
  }

  try {
    const supabase = await createClient()

    for (const matter_id of matter_ids) {
      try {
        const { error: updateError } = await supabase
          .from('matters')
          .update({
            status: data.new_status as any,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', matter_id)
          .eq('tenant_id', data.tenant_id)

        if (updateError) throw updateError

        await logActivity({
          tenant_id: data.tenant_id,
          matter_id,
          user_id: data.user_id,
          activity_type: 'status_changed',
          description: `Status updated to ${data.new_status} via bulk operation`,
          metadata: { new_status: data.new_status, bulk_operation: true }
        })

        result.successful_ids.push(matter_id)
        result.total_successful++
      } catch (error) {
        result.failed_ids.push(matter_id)
        result.total_failed++
        result.error_messages.push({
          id: matter_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    result.success = result.total_failed === 0
    return result
  } catch (error) {
    console.error('Bulk update matter status error:', error)
    result.failed_ids = matter_ids
    result.total_failed = matter_ids.length
    return result
  }
}

export async function bulkExportMatters(
  matter_ids: string[],
  tenant_id: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('matters')
      .select(`
        matter_number,
        purchase_price,
        status,
        closing_date,
        created_at,
        workflow_stages(stage_name),
        clients(first_name, last_name, email),
        profiles:assigned_fee_earner_id(first_name, last_name, email),
        properties:property_id(address_line1, address_line2, city, postcode)
      `)
      .in('id', matter_ids)
      .eq('tenant_id', tenant_id)

    if (error) throw error

    // Transform data for CSV export
    const exportData = data?.map(m => ({
      matter_number: m.matter_number,
      property_address: (m.properties as any)?.address_line1 || '',
      purchase_price: m.purchase_price,
      status: m.status,
      stage: (m.workflow_stages as any)?.stage_name || 'Unknown',
      client_name: (m.clients as any)
        ? `${(m.clients as any).first_name} ${(m.clients as any).last_name}`
        : 'Unknown',
      client_email: (m.clients as any)?.email || '',
      fee_earner: (m.profiles as any)
        ? `${(m.profiles as any).first_name} ${(m.profiles as any).last_name}`
        : 'Unassigned',
      fee_earner_email: (m.profiles as any)?.email || '',
      closing_date: m.closing_date || '',
      created_at: m.created_at
    }))

    return { success: true, data: exportData }
  } catch (error) {
    console.error('Bulk export matters error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export matters'
    }
  }
}

// ============================================================================
// BULK TASK OPERATIONS
// ============================================================================

export async function bulkCreateTasks(
  matter_ids: string[],
  data: BulkTaskCreationData
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: false,
    successful_ids: [],
    failed_ids: [],
    error_messages: [],
    total_attempted: matter_ids.length,
    total_successful: 0,
    total_failed: 0
  }

  try {
    const supabase = await createClient()

    for (const matter_id of matter_ids) {
      try {
        // Create task
        const { data: task, error: insertError } = await supabase
          .from('matter_tasks')
          .insert({
            tenant_id: data.tenant_id,
            matter_id,
            title: data.title,
            task_key: `TASK-${Date.now()}`,
            description: data.description,
            due_date: data.due_date,
            assigned_to: data.assigned_to,
            priority: (data.priority || 'normal') as any,
            status: 'pending' as any,
            created_by: data.created_by
          } as any)
          .select()
          .single()

        if (insertError) throw insertError

        // Log activity
        await logActivity({
          tenant_id: data.tenant_id,
          matter_id,
          user_id: data.created_by,
          activity_type: 'task_created',
          description: `Task "${data.title}" created via bulk operation`,
          metadata: { task_id: task.id, bulk_operation: true }
        })

        result.successful_ids.push(matter_id)
        result.total_successful++
      } catch (error) {
        result.failed_ids.push(matter_id)
        result.total_failed++
        result.error_messages.push({
          id: matter_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    result.success = result.total_failed === 0
    return result
  } catch (error) {
    console.error('Bulk create tasks error:', error)
    result.failed_ids = matter_ids
    result.total_failed = matter_ids.length
    return result
  }
}

export async function bulkUpdateTaskStatus(
  task_ids: string[],
  new_status: string,
  user_id: string,
  tenant_id: string
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: false,
    successful_ids: [],
    failed_ids: [],
    error_messages: [],
    total_attempted: task_ids.length,
    total_successful: 0,
    total_failed: 0
  }

  try {
    const supabase = await createClient()

    for (const task_id of task_ids) {
      try {
        // Get task to log activity
        const { data: task } = await supabase
          .from('matter_tasks')
          .select('matter_id, title')
          .eq('id', task_id)
          .single()

        // Update task
        const { error: updateError } = await supabase
          .from('matter_tasks')
          .update({
            status: new_status,
            completed_at: new_status === 'completed' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', task_id)
          .eq('tenant_id', tenant_id)

        if (updateError) throw updateError

        // Log activity
        if (task?.matter_id) {
          await logActivity({
            tenant_id,
            matter_id: task.matter_id,
            user_id,
            activity_type: 'task_updated',
            description: `Task "${task.title}" status updated to ${new_status} via bulk operation`,
            metadata: { task_id, new_status, bulk_operation: true }
          })
        }

        result.successful_ids.push(task_id)
        result.total_successful++
      } catch (error) {
        result.failed_ids.push(task_id)
        result.total_failed++
        result.error_messages.push({
          id: task_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    result.success = result.total_failed === 0
    return result
  } catch (error) {
    console.error('Bulk update task status error:', error)
    result.failed_ids = task_ids
    result.total_failed = task_ids.length
    return result
  }
}

export async function bulkAssignTasks(
  task_ids: string[],
  assignee_id: string,
  user_id: string,
  tenant_id: string
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: false,
    successful_ids: [],
    failed_ids: [],
    error_messages: [],
    total_attempted: task_ids.length,
    total_successful: 0,
    total_failed: 0
  }

  try {
    const supabase = await createClient()

    for (const task_id of task_ids) {
      try {
        // Get task to log activity
        const { data: task } = await supabase
          .from('matter_tasks')
          .select('matter_id, title')
          .eq('id', task_id)
          .single()

        // Update task
        const { error: updateError } = await supabase
          .from('matter_tasks')
          .update({
            assigned_to: assignee_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', task_id)
          .eq('tenant_id', tenant_id)

        if (updateError) throw updateError

        // Log activity
        if (task?.matter_id) {
          await logActivity({
            tenant_id,
            matter_id: task.matter_id,
            user_id,
            activity_type: 'task_assigned',
            description: `Task "${task.title}" assigned via bulk operation`,
            metadata: { task_id, assignee_id, bulk_operation: true }
          })
        }

        result.successful_ids.push(task_id)
        result.total_successful++
      } catch (error) {
        result.failed_ids.push(task_id)
        result.total_failed++
        result.error_messages.push({
          id: task_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    result.success = result.total_failed === 0
    return result
  } catch (error) {
    console.error('Bulk assign tasks error:', error)
    result.failed_ids = task_ids
    result.total_failed = task_ids.length
    return result
  }
}

// ============================================================================
// BULK DOCUMENT OPERATIONS
// ============================================================================

export async function bulkDeleteDocuments(
  document_ids: string[],
  user_id: string,
  tenant_id: string
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: false,
    successful_ids: [],
    failed_ids: [],
    error_messages: [],
    total_attempted: document_ids.length,
    total_successful: 0,
    total_failed: 0
  }

  try {
    const supabase = await createClient()

    for (const document_id of document_ids) {
      try {
        // Get document info before deleting
        const { data: doc } = await supabase
          .from('documents')
          .select('matter_id, file_name, storage_path')
          .eq('id', document_id)
          .single()

        if (!doc) throw new Error('Document not found')

        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([doc.storage_path])

        if (storageError) throw storageError

        // Delete from database
        const { error: deleteError } = await supabase
          .from('documents')
          .delete()
          .eq('id', document_id)
          .eq('tenant_id', tenant_id)

        if (deleteError) throw deleteError

        // Log activity
        if (doc.matter_id) {
          await logActivity({
            tenant_id,
            matter_id: doc.matter_id,
            user_id,
            activity_type: 'document_deleted',
            description: `Document "${doc.file_name}" deleted via bulk operation`,
            metadata: { document_id, bulk_operation: true }
          })
        }

        result.successful_ids.push(document_id)
        result.total_successful++
      } catch (error) {
        result.failed_ids.push(document_id)
        result.total_failed++
        result.error_messages.push({
          id: document_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    result.success = result.total_failed === 0
    return result
  } catch (error) {
    console.error('Bulk delete documents error:', error)
    result.failed_ids = document_ids
    result.total_failed = document_ids.length
    return result
  }
}
