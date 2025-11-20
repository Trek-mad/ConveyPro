import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // Insert form template
    const { data: template, error: templateError } = await supabase
      .from('form_templates')
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description,
        visibility: body.visibility,
        is_multi_step: body.is_multi_step,
        enable_lbtt_calculation: body.enable_lbtt_calculation,
        enable_fee_calculation: body.enable_fee_calculation,
        status: 'published',
        is_active: true,
      })
      .select()
      .single()

    if (templateError) {
      console.error('Error creating form template:', templateError)
      return NextResponse.json({ error: templateError.message }, { status: 500 })
    }

    // Insert fields if any
    if (body.fields && body.fields.length > 0) {
      const fieldsToInsert = body.fields.map((field: any, index: number) => ({
        form_template_id: template.id,
        field_name: field.field_name,
        field_label: field.field_label,
        field_type: field.field_type,
        placeholder: field.placeholder || null,
        help_text: field.help_text || null,
        is_required: field.is_required,
        display_order: index,
        width: field.width,
        affects_pricing: field.affects_pricing,
        pricing_field_type: field.pricing_field_type || null,
      }))

      const { error: fieldsError } = await supabase
        .from('form_fields')
        .insert(fieldsToInsert)

      if (fieldsError) {
        console.error('Error creating form fields:', fieldsError)
        // Don't fail completely, just log it
      }
    }

    // Insert pricing rules if any
    if (body.pricing_rules && body.pricing_rules.length > 0) {
      const rulesToInsert = body.pricing_rules.map((rule: any, index: number) => ({
        form_template_id: template.id,
        rule_name: rule.rule_name,
        rule_code: rule.rule_code,
        fee_type: rule.fee_type,
        fixed_amount: rule.fixed_amount || null,
        percentage_rate: rule.percentage_rate || null,
        per_item_amount: rule.per_item_amount || null,
        category: rule.category || 'legal_fees',
        display_order: index,
        show_on_quote: true,
      }))

      const { error: rulesError } = await supabase
        .from('form_pricing_rules')
        .insert(rulesToInsert)

      if (rulesError) {
        console.error('Error creating pricing rules:', rulesError)
        // Don't fail completely, just log it
      }
    }

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('Error in POST /api/admin/forms:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
