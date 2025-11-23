'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { upsertFeeEarnerSettings, getFeeEarnerSettings } from '@/services/fee-earner-allocation.service'
import type { FeeEarnerSettings } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const settingsFormSchema = z.object({
  max_concurrent_matters: z.string().min(1, 'Required'),
  max_new_matters_per_week: z.string().min(1, 'Required'),
  matter_types: z.array(z.string()),
  max_transaction_value: z.string().optional(),
  min_transaction_value: z.string().optional(),
  accepts_auto_assignment: z.boolean(),
  assignment_priority: z.string().min(1, 'Required'),
  working_days: z.array(z.number()).min(1, 'Select at least one working day'),
  working_hours_start: z.string().min(1, 'Required'),
  working_hours_end: z.string().min(1, 'Required'),
})

type SettingsFormValues = z.infer<typeof settingsFormSchema>

interface FeeEarnerSettingsFormProps {
  feeEarnerId: string
  tenantId: string
  currentSettings?: FeeEarnerSettings | null
}

const MATTER_TYPES = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'sale', label: 'Sale' },
  { value: 'remortgage', label: 'Remortgage' },
  { value: 'transfer', label: 'Transfer of Title' },
]

const WORKING_DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
]

export function FeeEarnerSettingsForm({
  feeEarnerId,
  tenantId,
  currentSettings,
}: FeeEarnerSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMatterTypes, setSelectedMatterTypes] = useState<string[]>(currentSettings?.matter_types || [])
  const [selectedWorkingDays, setSelectedWorkingDays] = useState<number[]>(
    currentSettings?.working_days || [1, 2, 3, 4, 5]
  )
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      max_concurrent_matters: currentSettings?.max_concurrent_matters?.toString() || '10',
      max_new_matters_per_week: currentSettings?.max_new_matters_per_week?.toString() || '3',
      matter_types: currentSettings?.matter_types || [],
      max_transaction_value: currentSettings?.max_transaction_value?.toString() || '',
      min_transaction_value: currentSettings?.min_transaction_value?.toString() || '',
      accepts_auto_assignment: currentSettings?.accepts_auto_assignment ?? true,
      assignment_priority: currentSettings?.assignment_priority?.toString() || '5',
      working_days: currentSettings?.working_days || [1, 2, 3, 4, 5],
      working_hours_start: currentSettings?.working_hours_start || '09:00',
      working_hours_end: currentSettings?.working_hours_end || '17:00',
    },
  })

  async function onSubmit(values: SettingsFormValues) {
    setIsSubmitting(true)

    try {
      const result = await upsertFeeEarnerSettings({
        tenant_id: tenantId,
        fee_earner_id: feeEarnerId,
        max_concurrent_matters: parseInt(values.max_concurrent_matters),
        max_new_matters_per_week: parseInt(values.max_new_matters_per_week),
        matter_types: selectedMatterTypes,
        max_transaction_value: values.max_transaction_value
          ? parseFloat(values.max_transaction_value)
          : null,
        min_transaction_value: values.min_transaction_value
          ? parseFloat(values.min_transaction_value)
          : null,
        accepts_auto_assignment: values.accepts_auto_assignment,
        assignment_priority: parseInt(values.assignment_priority),
        working_days: selectedWorkingDays,
        working_hours_start: values.working_hours_start,
        working_hours_end: values.working_hours_end,
        metadata: {},
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
        description: 'Fee earner settings updated successfully',
      })

      router.refresh()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleMatterType = (type: string) => {
    setSelectedMatterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const toggleWorkingDay = (day: number) => {
    setSelectedWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  return (
    <Card className="p-6">
      <h3 className="mb-6 text-lg font-semibold text-gray-900">Fee Earner Settings</h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Capacity Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Capacity Settings</h4>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="max_concurrent_matters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Concurrent Matters</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>Total active matters at once</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_new_matters_per_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max New Matters Per Week</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>New matter intake limit</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Matter Type Preferences */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Matter Type Preferences</h4>
            <FormDescription>Select matter types to handle (leave empty for all)</FormDescription>

            <div className="grid grid-cols-2 gap-3">
              {MATTER_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => toggleMatterType(type.value)}
                  className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                    selectedMatterTypes.includes(type.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Value Limits */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Transaction Value Limits</h4>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="min_transaction_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Value (£)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="No minimum" {...field} />
                    </FormControl>
                    <FormDescription>Optional minimum</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_transaction_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Value (£)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="No maximum" {...field} />
                    </FormControl>
                    <FormDescription>Optional maximum</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Assignment Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Assignment Settings</h4>

            <FormField
              control={form.control}
              name="accepts_auto_assignment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Accept Auto-Assignment</FormLabel>
                    <FormDescription>
                      Allow automatic matter assignment based on capacity
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignment_priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Priority (1-10)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="10" {...field} />
                  </FormControl>
                  <FormDescription>
                    Higher priority = more likely to receive auto-assignments
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Working Hours</h4>

            <div>
              <FormLabel>Working Days</FormLabel>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {WORKING_DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWorkingDay(day.value)}
                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                      selectedWorkingDays.includes(day.value)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="working_hours_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="working_hours_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}
