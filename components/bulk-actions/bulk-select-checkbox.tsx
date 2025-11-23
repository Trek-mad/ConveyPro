'use client'

import { Checkbox } from '@/components/ui/checkbox'

interface BulkSelectCheckboxProps {
  id: string
  checked: boolean
  onCheckedChange: (id: string, checked: boolean) => void
}

export default function BulkSelectCheckbox({
  id,
  checked,
  onCheckedChange
}: BulkSelectCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(checkedState: boolean | 'indeterminate') => onCheckedChange(id, checkedState === true)}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    />
  )
}
