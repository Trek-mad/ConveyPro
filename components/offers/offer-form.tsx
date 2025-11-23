'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createOffer } from '@/services/offer.service'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

const offerFormSchema = z.object({
  offer_type: z.enum(['verbal', 'written']),
  offer_amount: z.string().min(1, 'Offer amount is required'),
  closing_date: z.string().optional(),
  entry_date: z.string().optional(),
  conditions: z.string().optional(),
  survey_required: z.boolean(),
  notes: z.string().optional(),
})

type OfferFormValues = z.infer<typeof offerFormSchema>

interface OfferFormProps {
  matterId: string
  tenantId: string
  purchasePrice?: number
}

export function OfferForm({ matterId, tenantId, purchasePrice }: OfferFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      offer_type: 'written',
      offer_amount: purchasePrice ? purchasePrice.toString() : '',
      closing_date: '',
      entry_date: '',
      conditions: '',
      survey_required: true,
      notes: '',
    },
  })

  async function onSubmit(values: OfferFormValues) {
    setIsSubmitting(true)

    try {
      const result = await createOffer({
        tenant_id: tenantId,
        matter_id: matterId,
        offer_type: values.offer_type,
        offer_amount: parseFloat(values.offer_amount),
        offer_status: 'draft',
        closing_date: values.closing_date || null,
        entry_date: values.entry_date || null,
        conditions: values.conditions || null,
        survey_required: values.survey_required,
        notes: values.notes || null,
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
        description: 'Offer created successfully',
      })

      form.reset()
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: 'Error',
        description: 'Failed to create offer',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Offer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Offer</DialogTitle>
          <DialogDescription>
            Create a verbal or written offer for this matter. The offer will go through
            an approval workflow.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Offer Type */}
            <FormField
              control={form.control}
              name="offer_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select offer type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="verbal">Verbal Offer</SelectItem>
                      <SelectItem value="written">Written Offer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Verbal offers are made by phone; written offers are formal documents.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Offer Amount */}
            <FormField
              control={form.control}
              name="offer_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Amount (£)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 250000"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The amount being offered for the property.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Closing Date */}
            <FormField
              control={form.control}
              name="closing_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Closing Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Scottish specific - the date by which offers must be submitted.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Entry Date */}
            <FormField
              control={form.control}
              name="entry_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    The proposed date for taking entry to the property.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Survey Required */}
            <FormField
              control={form.control}
              name="survey_required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Survey Required</FormLabel>
                    <FormDescription>
                      Whether the offer is conditional on a satisfactory survey.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Conditions */}
            <FormField
              control={form.control}
              name="conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conditions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Subject to satisfactory survey, mortgage approval..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Any special conditions or requirements for the offer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any internal notes about this offer..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    These notes are for internal use only and won't be shared with the
                    client.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Offer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
