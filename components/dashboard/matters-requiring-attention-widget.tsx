'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getMattersRequiringAttention } from '@/services/reminder.service'
import type { Matter } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2, CheckCircle, ArrowRight } from 'lucide-react'

interface MatterRequiringAttention extends Matter {
  reason: string
  priority_score: number
}

interface MattersRequiringAttentionWidgetProps {
  tenantId: string
  maxDisplay?: number
}

export function MattersRequiringAttentionWidget({
  tenantId,
  maxDisplay = 5,
}: MattersRequiringAttentionWidgetProps) {
  const [matters, setMatters] = useState<MatterRequiringAttention[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMatters()
  }, [tenantId])

  async function loadMatters() {
    setIsLoading(true)
    const result = await getMattersRequiringAttention(tenantId)

    if ('matters' in result) {
      setMatters(result.matters)
    }
    setIsLoading(false)
  }

  function getAttentionLevel(priorityScore: number) {
    if (priorityScore >= 90) {
      return {
        label: 'Critical',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: '🚨',
      }
    } else if (priorityScore >= 70) {
      return {
        label: 'High',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: '⚠️',
      }
    } else {
      return {
        label: 'Medium',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: '⚡',
      }
    }
  }

  function getPriorityColor(priority: string) {
    const colors: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800',
    }
    return colors[priority] || colors.normal
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-orange-100 p-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Matters Requiring Attention</h3>
            <p className="text-sm text-gray-500">{matters.length} matters need review</p>
          </div>
        </div>
        {matters.length > 0 && (
          <Link href="/matters?filter=requiring-attention">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {matters.length === 0 ? (
        <div className="py-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-3 text-sm font-semibold text-gray-900">
            All Matters on Track
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No matters currently require immediate attention
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {matters.slice(0, maxDisplay).map((matter) => {
            const attentionLevel = getAttentionLevel(matter.priority_score)

            return (
              <Link key={matter.id} href={`/matters/${matter.id}`} className="block">
                <div
                  className={`rounded-lg border-2 p-4 transition-all hover:shadow-md ${attentionLevel.color}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-lg">{attentionLevel.icon}</span>
                        <h4 className="font-semibold text-gray-900">
                          {matter.matter_number}
                        </h4>
                        <Badge className={getPriorityColor(matter.priority || 'normal')}>
                          {matter.priority || 'normal'}
                        </Badge>
                        <Badge variant="outline" className="border-gray-400">
                          {attentionLevel.label}
                        </Badge>
                      </div>

                      <div className="mb-2 space-y-1">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Stage:</span>{' '}
                          {matter.current_stage
                            ?.replace(/_/g, ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </div>
                        {matter.purchase_price && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Value:</span> £
                            {Number(matter.purchase_price).toLocaleString('en-GB')}
                          </div>
                        )}
                        {matter.closing_date && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Closing:</span>{' '}
                            {new Date(matter.closing_date).toLocaleDateString('en-GB')}
                          </div>
                        )}
                      </div>

                      <div className="rounded bg-white/50 px-3 py-2">
                        <p className="text-sm font-medium text-gray-800">{matter.reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}

          {matters.length > maxDisplay && (
            <div className="pt-2 text-center">
              <Link href="/matters?filter=requiring-attention">
                <Button variant="outline" size="sm">
                  View {matters.length - maxDisplay} More Matter
                  {matters.length - maxDisplay !== 1 ? 's' : ''}
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
