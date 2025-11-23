/**
 * Form Builder Service
 * Handles all form template CRUD operations
 */

import { createClient } from '@/lib/supabase/server'

// =====================================================
// TYPES
// =====================================================

export interface FormTemplate {
  id: string
  name: string
  slug: string
  description: string | null
  visibility: 'global' | 'firm_specific'
  allowed_tenant_ids: string[]
  is_multi_step: boolean
  enable_lbtt_calculation: boolean
  enable_fee_calculation: boolean
  success_message: string
  submit_button_text: string
  status: 'draft' | 'published' | 'archived'
  is_active: boolean
  created_by_platform_admin: boolean
  version: number
  created_at: string
  updated_at: string
}

export interface FormStep {
  id: string
  form_template_id: string
  step_number: number
  title: string
  description: string | null
  display_order: number
  conditional_logic: any
}

export interface FormField {
  id: string
  form_template_id: string
  form_step_id: string | null
  field_name: string
  field_label: string
  field_type: string
  placeholder: string | null
  help_text: string | null
  default_value: string | null
  is_required: boolean
  validation_rules: any
  display_order: number
  width: 'full' | 'half' | 'third' | 'quarter'
  conditional_logic: any
  affects_pricing: boolean
  pricing_field_type: string | null
}

export interface FormFieldOption {
  id: string
  form_field_id: string
  option_label: string
  option_value: string
  display_order: number
  is_default: boolean
  has_fee: boolean
  fee_amount: number
}

export interface FormPricingRule {
  id: string
  form_template_id: string
  rule_name: string
  rule_code: string
  description: string | null
  fee_type: 'fixed' | 'tiered' | 'per_item' | 'percentage' | 'conditional'
  fixed_amount: number
  percentage_rate: number
  percentage_of_field: string | null
  per_item_amount: number
  quantity_field: string | null
  condition_field: string | null
  condition_operator: string | null
  condition_value: string | null
  display_order: number
  show_on_quote: boolean
  category: string
}

export interface FormPricingTier {
  id: string
  pricing_rule_id: string
  tier_name: string
  min_value: number
  max_value: number | null
  tier_fee: number
  display_order: number
}

export interface LBTTRate {
  id: string
  rate_set_name: string
  effective_from: string
  effective_until: string | null
  property_type: 'residential' | 'non_residential'
  rate_bands: any
  ads_rate: number
  ftb_relief_enabled: boolean
  ftb_relief_threshold: number
  ftb_rate_bands: any
  is_active: boolean
  is_platform_default: boolean
  source_reference: string | null
  notes: string | null
}

// =====================================================
// FORM TEMPLATES
// =====================================================

export async function getFormTemplates() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_templates')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching form templates:', error)
    return { error: error.message, templates: [] }
  }

  return { templates: data as FormTemplate[], error: null }
}

export async function getFormTemplate(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_templates')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    console.error('Error fetching form template:', error)
    return { error: error.message, template: null }
  }

  return { template: data as FormTemplate, error: null }
}

/**
 * Get complete form template with all related data (fields, options, pricing rules, tiers)
 */
export async function getCompleteFormTemplate(id: string) {
  const supabase = await createClient()

  // Get form template
  const { data: template, error: templateError } = await supabase
    .from('form_templates')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (templateError) {
    console.error('Error fetching form template:', templateError)
    return { error: templateError.message, data: null }
  }

  // Get form fields with options
  const { data: fields, error: fieldsError } = await supabase
    .from('form_fields')
    .select(`
      *,
      form_field_options (*)
    `)
    .eq('form_template_id', id)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })

  if (fieldsError) {
    console.error('Error fetching form fields:', fieldsError)
    return { error: fieldsError.message, data: null }
  }

  // Get pricing rules with tiers
  const { data: pricingRules, error: rulesError } = await supabase
    .from('form_pricing_rules')
    .select(`
      *,
      form_pricing_tiers (*)
    `)
    .eq('form_template_id', id)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })

  if (rulesError) {
    console.error('Error fetching pricing rules:', rulesError)
    return { error: rulesError.message, data: null }
  }

  return {
    data: {
      template: template as FormTemplate,
      fields: (fields || []).map((field: any) => ({
        ...field,
        options: field.form_field_options || [],
      })),
      pricingRules: (pricingRules || []).map((rule: any) => ({
        ...rule,
        tiers: rule.form_pricing_tiers || [],
      })),
    },
    error: null,
  }
}

export async function createFormTemplate(template: Partial<FormTemplate>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_templates')
    .insert(template as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating form template:', error)
    return { error: error.message, template: null }
  }

  return { template: data as FormTemplate, error: null }
}

export async function updateFormTemplate(
  id: string,
  updates: Partial<FormTemplate>
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating form template:', error)
    return { error: error.message, template: null }
  }

  return { template: data as FormTemplate, error: null }
}

export async function deleteFormTemplate(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('form_templates')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting form template:', error)
    return { error: error.message }
  }

  return { error: null }
}

// =====================================================
// FORM STEPS
// =====================================================

export async function getFormSteps(formTemplateId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_steps')
    .select('*')
    .eq('form_template_id', formTemplateId)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching form steps:', error)
    return { error: error.message, steps: [] }
  }

  return { steps: data as FormStep[], error: null }
}

export async function createFormStep(step: Partial<FormStep>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_steps')
    .insert(step as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating form step:', error)
    return { error: error.message, step: null }
  }

  return { step: data as FormStep, error: null }
}

export async function updateFormStep(id: string, updates: Partial<FormStep>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_steps')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating form step:', error)
    return { error: error.message, step: null }
  }

  return { step: data as FormStep, error: null }
}

export async function deleteFormStep(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('form_steps')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting form step:', error)
    return { error: error.message }
  }

  return { error: null }
}

// =====================================================
// FORM FIELDS
// =====================================================

export async function getFormFields(formTemplateId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_template_id', formTemplateId)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching form fields:', error)
    return { error: error.message, fields: [] }
  }

  return { fields: data as FormField[], error: null }
}

export async function createFormField(field: Partial<FormField>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_fields')
    .insert(field as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating form field:', error)
    return { error: error.message, field: null }
  }

  return { field: data as FormField, error: null }
}

export async function updateFormField(id: string, updates: Partial<FormField>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_fields')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating form field:', error)
    return { error: error.message, field: null }
  }

  return { field: data as FormField, error: null }
}

export async function deleteFormField(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('form_fields')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting form field:', error)
    return { error: error.message }
  }

  return { error: null }
}

// =====================================================
// FORM FIELD OPTIONS
// =====================================================

export async function getFormFieldOptions(formFieldId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_field_options')
    .select('*')
    .eq('form_field_id', formFieldId)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching form field options:', error)
    return { error: error.message, options: [] }
  }

  return { options: data as FormFieldOption[], error: null }
}

export async function createFormFieldOption(option: Partial<FormFieldOption>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_field_options')
    .insert(option as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating form field option:', error)
    return { error: error.message, option: null }
  }

  return { option: data as FormFieldOption, error: null }
}

// =====================================================
// FORM PRICING RULES
// =====================================================

export async function getFormPricingRules(formTemplateId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_pricing_rules')
    .select('*')
    .eq('form_template_id', formTemplateId)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching form pricing rules:', error)
    return { error: error.message, rules: [] }
  }

  return { rules: data as FormPricingRule[], error: null }
}

export async function createFormPricingRule(rule: Partial<FormPricingRule>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_pricing_rules')
    .insert(rule as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating form pricing rule:', error)
    return { error: error.message, rule: null }
  }

  return { rule: data as FormPricingRule, error: null }
}

export async function updateFormPricingRule(
  id: string,
  updates: Partial<FormPricingRule>
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_pricing_rules')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating form pricing rule:', error)
    return { error: error.message, rule: null }
  }

  return { rule: data as FormPricingRule, error: null }
}

// =====================================================
// FORM PRICING TIERS
// =====================================================

export async function getFormPricingTiers(pricingRuleId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_pricing_tiers')
    .select('*')
    .eq('pricing_rule_id', pricingRuleId)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching form pricing tiers:', error)
    return { error: error.message, tiers: [] }
  }

  return { tiers: data as FormPricingTier[], error: null }
}

export async function createFormPricingTier(tier: Partial<FormPricingTier>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_pricing_tiers')
    .insert(tier as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating form pricing tier:', error)
    return { error: error.message, tier: null }
  }

  return { tier: data as FormPricingTier, error: null }
}

// =====================================================
// LBTT RATES
// =====================================================

export async function getLBTTRates() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lbtt_rates')
    .select('*')
    .is('deleted_at', null)
    .order('effective_from', { ascending: false })

  if (error) {
    console.error('Error fetching LBTT rates:', error)
    return { error: error.message, rates: [] }
  }

  return { rates: data as LBTTRate[], error: null }
}

export async function getActiveLBTTRate(propertyType: 'residential' | 'non_residential' = 'residential') {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lbtt_rates')
    .select('*')
    .eq('property_type', propertyType)
    .eq('is_active', true)
    .eq('is_platform_default', true)
    .is('deleted_at', null)
    .single()

  if (error) {
    console.error('Error fetching active LBTT rate:', error)
    return { error: error.message, rate: null }
  }

  return { rate: data as LBTTRate, error: null }
}

export async function createLBTTRate(rate: Partial<LBTTRate>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lbtt_rates')
    .insert(rate as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating LBTT rate:', error)
    return { error: error.message, rate: null }
  }

  return { rate: data as LBTTRate, error: null }
}

export async function updateLBTTRate(id: string, updates: Partial<LBTTRate>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lbtt_rates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating LBTT rate:', error)
    return { error: error.message, rate: null }
  }

  return { rate: data as LBTTRate, error: null }
}
