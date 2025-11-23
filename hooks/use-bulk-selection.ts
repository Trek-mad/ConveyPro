'use client'

import { useState, useCallback } from 'react'

export function useBulkSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    )
  }, [])

  const toggleAll = useCallback((ids: string[]) => {
    setSelectedIds(prev =>
      prev.length === ids.length ? [] : ids
    )
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const isSelected = useCallback((id: string) => {
    return selectedIds.includes(id)
  }, [selectedIds])

  const isAllSelected = useCallback((ids: string[]) => {
    return ids.length > 0 && selectedIds.length === ids.length
  }, [selectedIds])

  return {
    selectedIds,
    toggleSelection,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected
  }
}
