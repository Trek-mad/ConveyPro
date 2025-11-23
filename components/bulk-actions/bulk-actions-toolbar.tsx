'use client'

import { useState } from 'react'
import { CheckSquare, X, Loader2, Users, GitBranch, FileText, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import {
  bulkAssignFeeEarner,
  bulkUpdateMatterStage,
  bulkUpdateMatterStatus,
  bulkExportMatters,
  type BulkOperationResult
} from '@/services/bulk-operations.service'
import { exportToCSV } from '@/lib/utils/csv'

interface BulkActionsToolbarProps {
  selectedIds: string[]
  onClearSelection: () => void
  entityType: 'matter' | 'task' | 'document'
  tenantId: string
  userId: string
  feeEarners?: { id: string; name: string }[]
  stages?: { id: string; name: string }[]
  onActionComplete?: () => void
}

export default function BulkActionsToolbar({
  selectedIds,
  onClearSelection,
  entityType,
  tenantId,
  userId,
  feeEarners = [],
  stages = [],
  onActionComplete
}: BulkActionsToolbarProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {})
  const [confirmMessage, setConfirmMessage] = useState('')

  if (selectedIds.length === 0) return null

  const handleConfirmedAction = async (action: () => Promise<void>, message: string) => {
    setConfirmMessage(message)
    setConfirmAction(() => action)
    setShowConfirmDialog(true)
  }

  const executeAction = async () => {
    setShowConfirmDialog(false)
    await confirmAction()
  }

  const handleBulkAssign = async (feeEarnerId: string) => {
    await handleConfirmedAction(
      async () => {
        setLoading(true)
        try {
          const result = await bulkAssignFeeEarner(selectedIds, {
            fee_earner_id: feeEarnerId,
            assigned_by: userId,
            tenant_id: tenantId
          })

          showResult(result, 'Fee earner assigned')
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to assign fee earner',
            variant: 'destructive'
          })
        } finally {
          setLoading(false)
        }
      },
      `Are you sure you want to assign ${selectedIds.length} matter(s) to this fee earner?`
    )
  }

  const handleBulkStageUpdate = async (stageId: string) => {
    await handleConfirmedAction(
      async () => {
        setLoading(true)
        try {
          const result = await bulkUpdateMatterStage(selectedIds, {
            new_stage_id: stageId,
            user_id: userId,
            tenant_id: tenantId
          })

          showResult(result, 'Stage updated')
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to update stage',
            variant: 'destructive'
          })
        } finally {
          setLoading(false)
        }
      },
      `Are you sure you want to update the stage for ${selectedIds.length} matter(s)?`
    )
  }

  const handleBulkStatusUpdate = async (status: string) => {
    await handleConfirmedAction(
      async () => {
        setLoading(true)
        try {
          const result = await bulkUpdateMatterStatus(selectedIds, {
            new_status: status,
            user_id: userId,
            tenant_id: tenantId
          })

          showResult(result, 'Status updated')
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to update status',
            variant: 'destructive'
          })
        } finally {
          setLoading(false)
        }
      },
      `Are you sure you want to update the status for ${selectedIds.length} matter(s) to "${status}"?`
    )
  }

  const handleBulkExport = async () => {
    setLoading(true)
    try {
      const result = await bulkExportMatters(selectedIds, tenantId)

      if (result.success && result.data) {
        const csv = exportToCSV(result.data, 'bulk-export')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `matters-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        toast({
          title: 'Success',
          description: `Exported ${selectedIds.length} matter(s) to CSV`
        })
      } else {
        throw new Error(result.error || 'Export failed')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export matters',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const showResult = (result: BulkOperationResult, action: string) => {
    if (result.success) {
      toast({
        title: 'Success',
        description: `${action} for ${result.total_successful} item(s)`
      })
      onClearSelection()
      onActionComplete?.()
    } else {
      toast({
        title: 'Partial Success',
        description: `${action} for ${result.total_successful} item(s). ${result.total_failed} failed.`,
        variant: 'destructive'
      })
    }
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-500" />
            <Badge variant="secondary">{selectedIds.length} selected</Badge>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {entityType === 'matter' && (
            <>
              {feeEarners.length > 0 && (
                <Select onValueChange={handleBulkAssign} disabled={loading}>
                  <SelectTrigger className="w-[180px]">
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Assign Fee Earner" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeEarners.map(fe => (
                      <SelectItem key={fe.id} value={fe.id}>
                        {fe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {stages.length > 0 && (
                <Select onValueChange={handleBulkStageUpdate} disabled={loading}>
                  <SelectTrigger className="w-[180px]">
                    <GitBranch className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Update Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select onValueChange={handleBulkStatusUpdate} disabled={loading}>
                <SelectTrigger className="w-[180px]">
                  <FileText className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </>
          )}

          <div className="h-6 w-px bg-gray-300" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>

          {loading && (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          )}
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
