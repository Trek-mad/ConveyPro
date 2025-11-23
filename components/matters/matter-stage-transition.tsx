'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { transitionMatterStage } from '@/services/matter.service'
import { completeTask } from '@/services/task.service'

interface MatterStageTransitionProps {
  matterId: string
  currentStage: string
  children: React.ReactNode
}

export function MatterStageTransition({
  matterId,
  currentStage,
  children,
}: MatterStageTransitionProps) {
  const router = useRouter()

  const handleStageTransition = async (newStage: string) => {
    try {
      const result = await transitionMatterStage(matterId, newStage)

      if ('error' in result) {
        console.error('Stage transition error:', result.error)
        alert(`Error: ${result.error}`)
        return
      }

      console.log(`Matter moved to ${newStage.replace('_', ' ')}`)
      router.refresh()
    } catch (error) {
      console.error('Stage transition error:', error)
      alert('Failed to transition stage')
    }
  }

  const handleTaskComplete = async (taskId: string) => {
    try {
      const result = await completeTask(taskId)

      if ('error' in result) {
        console.error('Task completion error:', result.error)
        alert(`Error: ${result.error}`)
        return
      }

      console.log('Task completed')
      router.refresh()
    } catch (error) {
      console.error('Task completion error:', error)
      alert('Failed to complete task')
    }
  }

  // Clone children and inject handlers
  const childrenWithProps = React.cloneElement(
    children as React.ReactElement,
    {
      onStageTransition: handleStageTransition,
      onTaskComplete: handleTaskComplete,
    } as any
  )

  return <>{childrenWithProps}</>
}
