'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
  type NotificationPreferences,
} from '@/services/notification-preferences.service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Bell, Clock, Mail, AlertCircle, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'

const preferencesSchema = z.object({
  email_enabled: z.boolean(),
  task_reminders: z.boolean(),
  closing_date_reminders: z.boolean(),
  overdue_task_alerts: z.boolean(),
  matter_assignment_notifications: z.boolean(),
  offer_notifications: z.boolean(),
  document_verification_notifications: z.boolean(),
  reminder_frequency: z.enum(['daily', 'immediately', 'weekly']),
  quiet_hours_enabled: z.boolean(),
  quiet_hours_start: z.string(),
  quiet_hours_end: z.string(),
})

type PreferencesFormValues = z.infer<typeof preferencesSchema>

export function NotificationPreferencesForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      email_enabled: true,
      task_reminders: true,
      closing_date_reminders: true,
      overdue_task_alerts: true,
      matter_assignment_notifications: true,
      offer_notifications: true,
      document_verification_notifications: true,
      reminder_frequency: 'immediately',
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
    },
  })

  useEffect(() => {
    loadPreferences()
  }, [])

  async function loadPreferences() {
    setIsLoading(true)
    const result = await getNotificationPreferences()

    if ('preferences' in result) {
      form.reset(result.preferences)
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    }
    setIsLoading(false)
  }

  async function onSubmit(values: PreferencesFormValues) {
    setIsSubmitting(true)

    const result = await updateNotificationPreferences(values)

    if ('error' in result) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Notification preferences updated successfully',
      })
      router.refresh()
    }

    setIsSubmitting(false)
  }

  async function handleReset() {
    setIsSubmitting(true)

    const result = await resetNotificationPreferences()

    if ('error' in result) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Notification preferences reset to defaults',
      })
      loadPreferences()
      router.refresh()
    }

    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </Card>
    )
  }

  const emailEnabled = form.watch('email_enabled')

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Notification Preferences
            </h3>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Manage how and when you receive notifications
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Master Toggle */}
          <div>
            <FormField
              control={form.control}
              name="email_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <FormLabel className="text-base font-semibold">
                        Email Notifications
                      </FormLabel>
                    </div>
                    <FormDescription>
                      Enable or disable all email notifications
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-900">Notification Types</h4>
              {!emailEnabled && (
                <Badge variant="secondary" className="text-xs">
                  Disabled - Enable email notifications
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="task_reminders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Task Reminders</FormLabel>
                      <FormDescription className="text-xs">
                        Get reminders before task due dates
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!emailEnabled}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closing_date_reminders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Closing Date Reminders</FormLabel>
                      <FormDescription className="text-xs">
                        Get reminders before matter closing dates
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!emailEnabled}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overdue_task_alerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Overdue Task Alerts</FormLabel>
                      <FormDescription className="text-xs">
                        Get alerts for overdue tasks
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!emailEnabled}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="matter_assignment_notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Matter Assignment Notifications</FormLabel>
                      <FormDescription className="text-xs">
                        Get notified when matters are assigned to you
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!emailEnabled}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offer_notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Offer Notifications</FormLabel>
                      <FormDescription className="text-xs">
                        Get notified about offer status changes
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!emailEnabled}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document_verification_notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Document Verification Notifications</FormLabel>
                      <FormDescription className="text-xs">
                        Get notified about document verification status
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!emailEnabled}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Reminder Frequency */}
          <div>
            <FormField
              control={form.control}
              name="reminder_frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!emailEnabled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="immediately">Immediately (real-time)</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often you want to receive reminder notifications
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="quiet_hours_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <FormLabel className="text-base font-semibold">
                        Quiet Hours
                      </FormLabel>
                    </div>
                    <FormDescription>
                      Suppress notifications during specific hours
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!emailEnabled}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('quiet_hours_enabled') && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="quiet_hours_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} disabled={!emailEnabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quiet_hours_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} disabled={!emailEnabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">About Reminders</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Task and closing date reminders are sent 7, 3, and 1 day(s) before the due date</li>
                  <li>• Overdue task alerts are sent daily at 9:00 AM</li>
                  <li>• Quiet hours apply to all notification types</li>
                  <li>• Critical notifications may bypass quiet hours</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Preferences
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}
