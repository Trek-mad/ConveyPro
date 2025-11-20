'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface DeleteFormButtonProps {
  formId: string
  formName: string
}

export function DeleteFormButton({ formId, formName }: DeleteFormButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${formName}"? This cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/forms/${formId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete form')
      }

      router.refresh()
    } catch (error) {
      alert(`Error deleting form: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  )
}
