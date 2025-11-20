import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    console.log('Updating form:', id, {
      name: body.name,
      fieldsCount: body.fields?.length || 0,
      pricingRulesCount: body.pricing_rules?.length || 0,
    })
    const supabase = await createClient()

    // Update form template
    const { data: template, error: templateError } = await supabase
      .from('form_templates')
      .update({
        name: body.name,
        slug: body.slug,
        description: body.description,
        visibility: body.visibility,
        is_multi_step: body.is_multi_step,
        enable_lbtt_calculation: body.enable_lbtt_calculation,
        enable_fee_calculation: body.enable_fee_calculation,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (templateError) {
      console.error('Error updating form template:', templateError)
      return NextResponse.json({ error: templateError.message }, { status: 500 })
    }

    // Delete existing fields and pricing rules
    await supabase.from('form_fields').delete().eq('form_template_id', id)
    await supabase.from('form_pricing_rules').delete().eq('form_template_id', id)

    // Insert new fields if any
    if (body.fields && body.fields.length > 0) {
      const fieldsToInsert = body.fields.map((field: any, index: number) => ({
        form_template_id: id,
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
        console.error('Error updating form fields:', fieldsError)
        return NextResponse.json(
          { error: `Form updated but fields failed to save: ${fieldsError.message}` },
          { status: 500 }
        )
      }
    }

    // Insert new pricing rules if any
    if (body.pricing_rules && body.pricing_rules.length > 0) {
      const rulesToInsert = body.pricing_rules.map((rule: any, index: number) => ({
        form_template_id: id,
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
        console.error('Error updating pricing rules:', rulesError)
        // Don't fail completely, just log it
      }
    }

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('Error in PUT /api/admin/forms/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Delete form template (cascade will delete fields and pricing rules)
    const { error } = await supabase
      .from('form_templates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting form template:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/forms/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
