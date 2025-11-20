'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface FormField {
  id: string
  field_name: string
  field_label: string
  field_type: string
  placeholder?: string
  help_text?: string
  is_required: boolean
  width: 'full' | 'half' | 'third' | 'quarter'
  options?: Array<{
    option_label: string
    option_value: string
    has_fee: boolean
    fee_amount: number
  }>
}

interface DynamicFormRendererProps {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void
  submitButtonText?: string
}

export function DynamicFormRenderer({
  fields,
  onSubmit,
  submitButtonText = 'Submit',
}: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
    // Clear error when field is updated
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      if (field.is_required && !formData[field.field_name]) {
        newErrors[field.field_name] = `${field.field_label} is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.field_name] || ''
    const error = errors[field.field_name]

    const widthClass = {
      full: 'col-span-12',
      half: 'col-span-12 md:col-span-6',
      third: 'col-span-12 md:col-span-4',
      quarter: 'col-span-12 md:col-span-3',
    }[field.width]

    return (
      <div key={field.id} className={widthClass}>
        <div className="space-y-2">
          <Label htmlFor={field.field_name}>
            {field.field_label}
            {field.is_required && <span className="text-red-500 ml-1">*</span>}
          </Label>

          {/* Text Input */}
          {['text', 'email', 'phone', 'number', 'currency'].includes(
            field.field_type
          ) && (
            <Input
              id={field.field_name}
              name={field.field_name}
              type={
                field.field_type === 'currency' || field.field_type === 'number'
                  ? 'number'
                  : field.field_type
              }
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleChange(field.field_name, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
          )}

          {/* Textarea */}
          {field.field_type === 'textarea' && (
            <Textarea
              id={field.field_name}
              name={field.field_name}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleChange(field.field_name, e.target.value)}
              rows={4}
              className={error ? 'border-red-500' : ''}
            />
          )}

          {/* Select/Dropdown */}
          {field.field_type === 'select' && (
            <Select
              value={value}
              onValueChange={(val) => handleChange(field.field_name, val)}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder || 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.option_value} value={option.option_value}>
                    {option.option_label}
                    {option.has_fee && option.fee_amount > 0 && (
                      <span className="text-xs text-gray-500 ml-2">
                        (+£{option.fee_amount.toFixed(2)})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Yes/No Radio */}
          {field.field_type === 'yes_no' && (
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.field_name}
                  value="yes"
                  checked={value === 'yes'}
                  onChange={(e) =>
                    handleChange(field.field_name, e.target.value)
                  }
                  className="h-4 w-4"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.field_name}
                  value="no"
                  checked={value === 'no'}
                  onChange={(e) =>
                    handleChange(field.field_name, e.target.value)
                  }
                  className="h-4 w-4"
                />
                <span>No</span>
              </label>
            </div>
          )}

          {/* Date */}
          {field.field_type === 'date' && (
            <Input
              id={field.field_name}
              name={field.field_name}
              type="date"
              value={value}
              onChange={(e) => handleChange(field.field_name, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
          )}

          {/* Help Text */}
          {field.help_text && (
            <p className="text-xs text-gray-500">{field.help_text}</p>
          )}

          {/* Error Message */}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-12 gap-6">
        {fields.map((field) => renderField(field))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" size="lg">
          {submitButtonText}
        </Button>
      </div>
    </form>
  )
}
