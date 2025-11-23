'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  createAvailabilityBlock,
  updateAvailabilityBlock,
  deleteAvailabilityBlock,
  getFeeEarnerAvailability,
} from '@/services/fee-earner-allocation.service'
import type { FeeEarnerAvailability } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Loader2, Plus, Trash2, Edit, AlertCircle } from 'lucide-react'
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

const blockFormSchema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  availability_type: z.enum(['holiday', 'sick', 'training', 'reduced_capacity']),
  notes: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.start_date)
  const end = new Date(data.end_date)
  return end >= start
}, {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
})

type BlockFormValues = z.infer<typeof blockFormSchema>

interface AvailabilityCalendarProps {
  feeEarnerId: string
  tenantId: string
}

const AVAILABILITY_TYPES = [
  { value: 'holiday', label: 'Holiday', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'sick', label: 'Sick Leave', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'training', label: 'Training', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'reduced_capacity', label: 'Reduced Capacity', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
]

export function AvailabilityCalendar({ feeEarnerId, tenantId }: AvailabilityCalendarProps) {
  const [blocks, setBlocks] = useState<FeeEarnerAvailability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingBlock, setEditingBlock] = useState<FeeEarnerAvailability | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<BlockFormValues>({
    resolver: zodResolver(blockFormSchema),
    defaultValues: {
      start_date: '',
      end_date: '',
      availability_type: 'holiday',
      notes: '',
    },
  })

  useEffect(() => {
    loadBlocks()
  }, [feeEarnerId])

  async function loadBlocks() {
    setIsLoading(true)
    const result = await getFeeEarnerAvailability(feeEarnerId)

    if ('availability' in result) {
      setBlocks(result.availability)
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    }
    setIsLoading(false)
  }

  function openCreateDialog() {
    setEditingBlock(null)
    form.reset({
      start_date: '',
      end_date: '',
      availability_type: 'holiday',
      notes: '',
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(block: FeeEarnerAvailability) {
    setEditingBlock(block)
    // Only use availability types that are valid for the form
    const validTypes: Array<'holiday' | 'sick' | 'training' | 'reduced_capacity'> = ['holiday', 'sick', 'training', 'reduced_capacity']
    const availabilityType = validTypes.includes(block.availability_type as any)
      ? (block.availability_type as 'holiday' | 'sick' | 'training' | 'reduced_capacity')
      : 'holiday'

    form.reset({
      start_date: block.start_date,
      end_date: block.end_date || block.start_date,
      availability_type: availabilityType,
      notes: block.notes || '',
    })
    setIsDialogOpen(true)
  }

  async function onSubmit(values: BlockFormValues) {
    setIsSubmitting(true)

    try {
      if (editingBlock) {
        // Update existing block
        const result = await updateAvailabilityBlock(editingBlock.id, {
          start_date: values.start_date,
          end_date: values.end_date,
          availability_type: values.availability_type,
          notes: values.notes || null,
        })

        if ('error' in result) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
          return
        }

        toast({
          title: 'Success',
          description: 'Availability block updated successfully',
        })
      } else {
        // Create new block
        const result = await createAvailabilityBlock({
          tenant_id: tenantId,
          fee_earner_id: feeEarnerId,
          start_date: values.start_date,
          end_date: values.end_date,
          availability_type: values.availability_type as 'holiday' | 'sick' | 'training' | 'reduced_capacity',
          notes: values.notes || null,
        })

        if ('error' in result) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
          return
        }

        toast({
          title: 'Success',
          description: 'Availability block created successfully',
        })
      }

      setIsDialogOpen(false)
      loadBlocks()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: 'Error',
        description: 'Failed to save availability block',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!blockToDelete) return

    setIsSubmitting(true)
    const result = await deleteAvailabilityBlock(blockToDelete)

    if ('error' in result) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    toast({
      title: 'Success',
      description: 'Availability block deleted successfully',
    })

    setDeleteDialogOpen(false)
    setBlockToDelete(null)
    setIsSubmitting(false)
    loadBlocks()
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  function calculateDuration(startDate: string, endDate: string | null) {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : start
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end days
    return diffDays
  }

  function getTypeConfig(type: string) {
    return AVAILABILITY_TYPES.find((t) => t.value === type) || AVAILABILITY_TYPES[0]
  }

  function isBlockActive(block: FeeEarnerAvailability) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(block.start_date)
    const endDate = block.end_date ? new Date(block.end_date) : startDate
    return startDate <= today && endDate >= today
  }

  function isBlockUpcoming(block: FeeEarnerAvailability) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(block.start_date)
    return startDate > today
  }

  // Group blocks by status
  const activeBlocks = blocks.filter(isBlockActive)
  const upcomingBlocks = blocks.filter(isBlockUpcoming)
  const pastBlocks = blocks.filter((b) => !isBlockActive(b) && !isBlockUpcoming(b))

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Availability Calendar</h3>
          <p className="text-sm text-gray-500">Manage time off and capacity blocks</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Block
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Blocks */}
          {activeBlocks.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <h4 className="text-sm font-semibold text-gray-900">Currently Unavailable</h4>
              </div>
              <div className="space-y-3">
                {activeBlocks.map((block) => {
                  const typeConfig = getTypeConfig(block.availability_type)
                  return (
                    <div
                      key={block.id}
                      className={`rounded-lg border-2 p-4 ${typeConfig.color}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-semibold">{typeConfig.label}</span>
                            <span className="text-xs font-normal">
                              ({calculateDuration(block.start_date, block.end_date)} days)
                            </span>
                          </div>
                          <div className="text-sm">
                            {formatDate(block.start_date)} - {formatDate(block.end_date)}
                          </div>
                          {block.notes && (
                            <div className="mt-2 text-sm opacity-90">{block.notes}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(block)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setBlockToDelete(block.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Upcoming Blocks */}
          {upcomingBlocks.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Upcoming</h4>
              <div className="space-y-3">
                {upcomingBlocks.map((block) => {
                  const typeConfig = getTypeConfig(block.availability_type)
                  return (
                    <div
                      key={block.id}
                      className={`rounded-lg border p-4 ${typeConfig.color}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-semibold">{typeConfig.label}</span>
                            <span className="text-xs font-normal">
                              ({calculateDuration(block.start_date, block.end_date)} days)
                            </span>
                          </div>
                          <div className="text-sm">
                            {formatDate(block.start_date)} - {formatDate(block.end_date)}
                          </div>
                          {block.notes && (
                            <div className="mt-2 text-sm opacity-90">{block.notes}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(block)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setBlockToDelete(block.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past Blocks */}
          {pastBlocks.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-500">Past</h4>
              <div className="space-y-2">
                {pastBlocks.map((block) => {
                  const typeConfig = getTypeConfig(block.availability_type)
                  return (
                    <div
                      key={block.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3 opacity-60"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm font-medium">{typeConfig.label}</span>
                            <span className="text-xs">
                              ({calculateDuration(block.start_date, block.end_date)} days)
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {formatDate(block.start_date)} - {formatDate(block.end_date)}
                          </div>
                          {block.notes && (
                            <div className="mt-1 text-xs text-gray-600">{block.notes}</div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setBlockToDelete(block.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {blocks.length === 0 && (
            <div className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No availability blocks</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add time off or capacity blocks to manage availability
              </p>
              <div className="mt-6">
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Block
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingBlock ? 'Edit Availability Block' : 'Add Availability Block'}
            </DialogTitle>
            <DialogDescription>
              {editingBlock
                ? 'Update the availability block details'
                : 'Add a new availability block for time off or reduced capacity'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="availability_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AVAILABILITY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional notes about this availability block
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingBlock ? 'Update Block' : 'Add Block'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Availability Block?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this availability block. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
