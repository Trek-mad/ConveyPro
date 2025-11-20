'use client'

import { useState, useEffect } from 'react'
import { Check, Circle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface OnboardingChecklistProps {
  tenantId: string
}

export function OnboardingChecklist({ tenantId }: OnboardingChecklistProps) {
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/onboarding?action=progress')
      const data = await response.json()
      setProgress(data.progress)
    } catch (error) {
      console.error('Failed to fetch onboarding progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const markComplete = async (itemKey: string) => {
    try {
      await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_checklist',
          item_key: itemKey,
          completed: true,
        }),
      })

      // Refresh progress
      fetchProgress()
    } catch (error) {
      console.error('Failed to update checklist:', error)
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!progress) {
    return null
  }

  const checklist = progress.onboarding.checklist

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Get Started with ConveyPro</CardTitle>
            <CardDescription>
              Complete these steps to set up your account
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {progress.progress_percentage}%
            </p>
            <p className="text-xs text-gray-500">Complete</p>
          </div>
        </div>
        <Progress value={progress.progress_percentage} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-3">
        <ChecklistItem
          completed={checklist.profile_completed}
          title="Complete Your Profile"
          description="Add your firm details and contact information"
          action="/settings/firm"
          onComplete={() => markComplete('profile_completed')}
        />

        <ChecklistItem
          completed={checklist.team_invited}
          title="Invite Your Team"
          description="Add team members to collaborate"
          action="/team"
          onComplete={() => markComplete('team_invited')}
        />

        <ChecklistItem
          completed={checklist.first_quote_created}
          title="Create Your First Quote"
          description="Generate a conveyancing quote"
          action="/quotes/new"
          onComplete={() => markComplete('first_quote_created')}
        />

        <ChecklistItem
          completed={checklist.branding_customized}
          title="Customize Your Branding"
          description="Upload logo and set colors"
          action="/settings/branding"
          onComplete={() => markComplete('branding_customized')}
        />

        <ChecklistItem
          completed={checklist.form_created}
          title="Create a Quote Form"
          description="Build a custom form for your website"
          action="/admin/forms/new"
          onComplete={() => markComplete('form_created')}
        />

        <ChecklistItem
          completed={checklist.campaign_created}
          title="Set Up a Campaign"
          description="Create your first email campaign"
          action="/campaigns/new"
          onComplete={() => markComplete('campaign_created')}
        />
      </CardContent>
    </Card>
  )
}

interface ChecklistItemProps {
  completed: boolean
  title: string
  description: string
  action: string
  onComplete: () => void
}

function ChecklistItem({
  completed,
  title,
  description,
  action,
  onComplete,
}: ChecklistItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0 mt-1">
        {completed ? (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        ) : (
          <Circle className="w-6 h-6 text-gray-300" />
        )}
      </div>

      <div className="flex-1">
        <h3 className={`font-medium ${completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      {!completed && (
        <Button variant="ghost" size="sm" asChild>
          <a href={action}>Start</a>
        </Button>
      )}
    </div>
  )
}
