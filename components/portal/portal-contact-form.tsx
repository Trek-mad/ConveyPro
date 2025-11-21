/**
 * Portal Contact Form Component
 * Phase 12.7 - Client Portal
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquare, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface PortalContactFormProps {
  token: string
  clientName?: string
}

export function PortalContactForm({ token, clientName }: PortalContactFormProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/portal/${token}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: subject || 'Message from Client Portal',
          message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setIsSubmitted(true)
      setSubject('')
      setMessage('')

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="mb-2 flex items-center text-xl font-semibold text-gray-900">
          <MessageSquare className="mr-2 h-5 w-5 text-primary" />
          Contact Your Solicitor
        </h2>
        <p className="text-gray-600">
          Have a question about your matter? Send us a message and we'll get back to you as soon as possible.
        </p>
      </div>

      {isSubmitted && (
        <div className="mb-6 rounded-lg border border-green-300 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="font-medium text-green-900">Message sent successfully!</p>
          </div>
          <p className="mt-1 text-sm text-green-800">
            Your solicitor will review your message and respond shortly.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="font-medium text-red-900">Failed to send message</p>
          </div>
          <p className="mt-1 text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="subject">Subject (Optional)</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Question about closing date"
            disabled={isSubmitting}
            maxLength={200}
          />
        </div>

        <div>
          <Label htmlFor="message">
            Message <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            required
            disabled={isSubmitting}
            rows={8}
            maxLength={5000}
            className="resize-none"
          />
          <p className="mt-1 text-sm text-gray-500">
            {message.length}/5000 characters
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting || !message.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Sending Message...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Send Message
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Your message will be added to your matter activity log and your solicitor will be notified. For urgent matters, please call your solicitor directly.
        </p>
      </div>
    </Card>
  )
}
