'use client'

import { useState, useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FormField {
  id: string
  field_name: string
  field_label: string
  field_type: string
  placeholder?: string
  help_text?: string
  is_required: boolean
  display_order: number
  width: 'full' | 'half' | 'third' | 'quarter'
  affects_pricing: boolean
  pricing_field_type?: string | null
  options?: FormFieldOption[]
}

interface FormFieldOption {
  id: string
  option_label: string
  option_value: string
  has_fee: boolean
  fee_amount: number
  display_order: number
}

interface PricingRule {
  id: string
  rule_name: string
  rule_code: string
  fee_type: 'fixed' | 'tiered' | 'per_item' | 'percentage' | 'conditional'
  fixed_amount?: number
  percentage_rate?: number
  per_item_amount?: number
  category: string
  display_order: number
  tiers?: PricingTier[]
}

interface PricingTier {
  id: string
  tier_name: string
  min_value: number
  max_value: number | null
  tier_fee: number
  display_order: number
}

interface FormTemplateEditorProps {
  formId?: string
  initialData?: {
    template: any
    fields: any[]
    pricingRules: any[]
  }
}

export function FormTemplateEditor({ formId, initialData }: FormTemplateEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // Basic form info
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [visibility, setVisibility] = useState<'global' | 'firm_specific'>(
    'global'
  )
  const [isMultiStep, setIsMultiStep] = useState(false)
  const [enableLBTT, setEnableLBTT] = useState(true)
  const [enableFees, setEnableFees] = useState(true)

  // Fields
  const [fields, setFields] = useState<FormField[]>([])
  const [expandedField, setExpandedField] = useState<string | null>(null)

  // Pricing rules
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [expandedRule, setExpandedRule] = useState<string | null>(null)

  // Initialize form data when editing
  useEffect(() => {
    if (initialData) {
      const { template, fields: initialFields, pricingRules: initialRules } = initialData

      setFormName(template.name || '')
      setFormSlug(template.slug || '')
      setFormDescription(template.description || '')
      setVisibility(template.visibility || 'global')
      setIsMultiStep(template.is_multi_step || false)
      setEnableLBTT(template.enable_lbtt_calculation || false)
      setEnableFees(template.enable_fee_calculation || false)

      // Map fields to component format
      const mappedFields = initialFields.map((field: any) => ({
        id: field.id,
        field_name: field.field_name,
        field_label: field.field_label,
        field_type: field.field_type,
        placeholder: field.placeholder,
        help_text: field.help_text,
        is_required: field.is_required,
        display_order: field.display_order,
        width: field.width,
        affects_pricing: field.affects_pricing,
        pricing_field_type: field.pricing_field_type,
        options: field.options || field.form_field_options || [],
      }))
      setFields(mappedFields)

      // Map pricing rules to component format
      const mappedRules = initialRules.map((rule: any) => ({
        id: rule.id,
        rule_name: rule.rule_name,
        rule_code: rule.rule_code,
        fee_type: rule.fee_type,
        fixed_amount: rule.fixed_amount,
        percentage_rate: rule.percentage_rate,
        per_item_amount: rule.per_item_amount,
        category: rule.category,
        display_order: rule.display_order,
        tiers: rule.tiers || rule.form_pricing_tiers || [],
      }))
      setPricingRules(mappedRules)
    }
  }, [initialData])

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormName(name)
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormSlug(slug)
  }

  // Add new field
  const addField = () => {
    const newField: FormField = {
      id: `temp-${Date.now()}`,
      field_name: `field_${fields.length + 1}`,
      field_label: 'New Field',
      field_type: 'text',
      is_required: false,
      display_order: fields.length,
      width: 'full',
      affects_pricing: false,
      options: [],
    }
    setFields([...fields, newField])
    setExpandedField(newField.id)
  }

  // Remove field
  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id))
  }

  // Update field
  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  // Add pricing rule
  const addPricingRule = (feeType: PricingRule['fee_type']) => {
    const newRule: PricingRule = {
      id: `temp-${Date.now()}`,
      rule_name: 'New Fee',
      rule_code: `fee_${pricingRules.length + 1}`,
      fee_type: feeType,
      category: 'legal_fees',
      display_order: pricingRules.length,
      fixed_amount: feeType === 'fixed' ? 0 : undefined,
      percentage_rate: feeType === 'percentage' ? 0 : undefined,
      per_item_amount: feeType === 'per_item' ? 0 : undefined,
      tiers: feeType === 'tiered' ? [] : undefined,
    }
    setPricingRules([...pricingRules, newRule])
    setExpandedRule(newRule.id)
  }

  // Save form template
  const handleSave = async () => {
    setSaving(true)
    try {
      const url = formId ? `/api/admin/forms/${formId}` : '/api/admin/forms'
      const method = formId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formName,
          slug: formSlug,
          description: formDescription,
          visibility: visibility,
          is_multi_step: isMultiStep,
          enable_lbtt_calculation: enableLBTT,
          enable_fee_calculation: enableFees,
          fields: fields,
          pricing_rules: pricingRules,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save form template')
      }

      const data = await response.json()
      console.log('Form template saved:', data)

      alert(formId ? 'Form template updated successfully!' : 'Form template created successfully!')
      router.push('/admin/forms')
      router.refresh()
    } catch (error) {
      console.error('Error saving form:', error)
      alert(`Error saving form template: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Basic Information
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="form-name">Form Name *</Label>
            <Input
              id="form-name"
              value={formName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Scottish Residential Purchase"
            />
          </div>

          <div>
            <Label htmlFor="form-slug">URL Slug *</Label>
            <Input
              id="form-slug"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="e.g., scottish-residential-purchase"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL-friendly identifier for this form
            </p>
          </div>

          <div>
            <Label htmlFor="form-description">Description</Label>
            <Textarea
              id="form-description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief description of this form"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="visibility">Visibility *</Label>
            <Select value={visibility} onValueChange={setVisibility as any}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  Global (Available to all firms)
                </SelectItem>
                <SelectItem value="firm_specific">
                  Firm-Specific (Assign to specific firms)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="multi-step">Multi-Step Form</Label>
                <p className="text-xs text-gray-500">
                  Break form into multiple pages
                </p>
              </div>
              <Switch
                id="multi-step"
                checked={isMultiStep}
                onCheckedChange={setIsMultiStep}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-lbtt">Enable LBTT Calculation</Label>
                <p className="text-xs text-gray-500">
                  Calculate Land and Buildings Transaction Tax
                </p>
              </div>
              <Switch
                id="enable-lbtt"
                checked={enableLBTT}
                onCheckedChange={setEnableLBTT}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-fees">Enable Fee Calculation</Label>
                <p className="text-xs text-gray-500">
                  Calculate legal fees based on pricing rules
                </p>
              </div>
              <Switch
                id="enable-fees"
                checked={enableFees}
                onCheckedChange={setEnableFees}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Form Fields */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Form Fields</h2>
          <Button onClick={addField} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No fields yet. Click "Add Field" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{field.field_label}</span>
                        <Badge variant="outline" className="text-xs">
                          {field.field_type}
                        </Badge>
                        {field.is_required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                        {field.affects_pricing && (
                          <Badge variant="secondary" className="text-xs">
                            Affects Pricing
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {field.field_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedField(
                          expandedField === field.id ? null : field.id
                        )
                      }
                    >
                      {expandedField === field.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {expandedField === field.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Field Label</Label>
                        <Input
                          value={field.field_label}
                          onChange={(e) =>
                            updateField(field.id, {
                              field_label: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Field Name (code)</Label>
                        <Input
                          value={field.field_name}
                          onChange={(e) =>
                            updateField(field.id, {
                              field_name: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Field Type</Label>
                        <Select
                          value={field.field_type}
                          onValueChange={(value) =>
                            updateField(field.id, { field_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="currency">Currency</SelectItem>
                            <SelectItem value="textarea">Textarea</SelectItem>
                            <SelectItem value="select">Select/Dropdown</SelectItem>
                            <SelectItem value="radio">Radio Buttons</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="yes_no">Yes/No</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="address">Address</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Width</Label>
                        <Select
                          value={field.width}
                          onValueChange={(value: any) =>
                            updateField(field.id, { width: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Width</SelectItem>
                            <SelectItem value="half">Half Width</SelectItem>
                            <SelectItem value="third">Third Width</SelectItem>
                            <SelectItem value="quarter">
                              Quarter Width
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Placeholder Text</Label>
                      <Input
                        value={field.placeholder || ''}
                        onChange={(e) =>
                          updateField(field.id, { placeholder: e.target.value })
                        }
                        placeholder="e.g., Enter property address"
                      />
                    </div>

                    <div>
                      <Label>Help Text</Label>
                      <Input
                        value={field.help_text || ''}
                        onChange={(e) =>
                          updateField(field.id, { help_text: e.target.value })
                        }
                        placeholder="Additional instructions for the user"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Required Field</Label>
                      <Switch
                        checked={field.is_required}
                        onCheckedChange={(checked: boolean) =>
                          updateField(field.id, { is_required: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Affects Pricing</Label>
                        <p className="text-xs text-gray-500">
                          This field is used in fee calculations
                        </p>
                      </div>
                      <Switch
                        checked={field.affects_pricing}
                        onCheckedChange={(checked: boolean) =>
                          updateField(field.id, { affects_pricing: checked })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pricing Rules */}
      {enableFees && (
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Pricing Rules
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure default pricing that firms can customize
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => addPricingRule('fixed')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Fixed Fee
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addPricingRule('tiered')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tiered Fee
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addPricingRule('per_item')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Per-Item Fee
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addPricingRule('percentage')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Percentage Fee
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addPricingRule('conditional')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Conditional Fee
              </Button>
            </div>
          </div>

          {pricingRules.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-t">
              <p>
                No pricing rules yet. Add fees using the buttons above.
              </p>
            </div>
          ) : (
            <div className="space-y-3 border-t pt-4">
              {pricingRules.map((rule) => (
                <div
                  key={rule.id}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rule.rule_name}</span>
                          <Badge className="text-xs">{rule.fee_type}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {rule.rule_code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedRule(
                            expandedRule === rule.id ? null : rule.id
                          )
                        }
                      >
                        {expandedRule === rule.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setPricingRules(
                            pricingRules.filter((r) => r.id !== rule.id)
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {expandedRule === rule.id && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Rule Name</Label>
                          <Input
                            value={rule.rule_name}
                            onChange={(e) => {
                              setPricingRules(
                                pricingRules.map((r) =>
                                  r.id === rule.id
                                    ? { ...r, rule_name: e.target.value }
                                    : r
                                )
                              )
                            }}
                          />
                        </div>
                        <div>
                          <Label>Rule Code</Label>
                          <Input
                            value={rule.rule_code}
                            onChange={(e) => {
                              setPricingRules(
                                pricingRules.map((r) =>
                                  r.id === rule.id
                                    ? { ...r, rule_code: e.target.value }
                                    : r
                                )
                              )
                            }}
                          />
                        </div>
                      </div>

                      {rule.fee_type === 'fixed' && (
                        <div>
                          <Label>Fixed Amount (£)</Label>
                          <Input
                            type="number"
                            value={rule.fixed_amount || 0}
                            onChange={(e) => {
                              setPricingRules(
                                pricingRules.map((r) =>
                                  r.id === rule.id
                                    ? {
                                        ...r,
                                        fixed_amount: parseFloat(
                                          e.target.value
                                        ),
                                      }
                                    : r
                                )
                              )
                            }}
                          />
                        </div>
                      )}

                      {rule.fee_type === 'percentage' && (
                        <div>
                          <Label>Percentage Rate (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={
                              rule.percentage_rate
                                ? rule.percentage_rate * 100
                                : 0
                            }
                            onChange={(e) => {
                              setPricingRules(
                                pricingRules.map((r) =>
                                  r.id === rule.id
                                    ? {
                                        ...r,
                                        percentage_rate:
                                          parseFloat(e.target.value) / 100,
                                      }
                                    : r
                                )
                              )
                            }}
                          />
                        </div>
                      )}

                      {rule.fee_type === 'per_item' && (
                        <div>
                          <Label>Per Item Amount (£)</Label>
                          <Input
                            type="number"
                            value={rule.per_item_amount || 0}
                            onChange={(e) => {
                              setPricingRules(
                                pricingRules.map((r) =>
                                  r.id === rule.id
                                    ? {
                                        ...r,
                                        per_item_amount: parseFloat(
                                          e.target.value
                                        ),
                                      }
                                    : r
                                )
                              )
                            }}
                          />
                        </div>
                      )}

                      {rule.fee_type === 'tiered' && (
                        <div className="space-y-2">
                          <Label>Pricing Tiers</Label>
                          <p className="text-xs text-gray-500">
                            Define tiers based on property value ranges
                          </p>
                          {/* TODO: Add tiered pricing UI */}
                          <div className="p-4 bg-gray-50 rounded text-sm text-gray-600">
                            Tiered pricing configuration coming soon...
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button variant="outline" onClick={() => router.push('/admin/forms')}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saving || !formName || !formSlug}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Form Template'}
          </Button>
        </div>
      </div>
    </div>
  )
}
