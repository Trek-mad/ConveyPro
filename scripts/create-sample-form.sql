-- Sample Scottish Residential Purchase Form with Fields
-- Run this entire script in Supabase SQL Editor

DO $$
DECLARE
  form_id UUID;
BEGIN
  -- Insert form template
  INSERT INTO public.form_templates (
    name,
    slug,
    description,
    visibility,
    is_multi_step,
    enable_lbtt_calculation,
    enable_fee_calculation,
    status,
    is_active
  ) VALUES (
    'Scottish Residential Purchase (Sample)',
    'scottish-residential-purchase-sample',
    'Complete conveyancing quote for residential property purchase in Scotland',
    'global',
    false,
    true,
    true,
    'published',
    true
  )
  RETURNING id INTO form_id;

  -- Insert fields
  INSERT INTO public.form_fields (
    form_template_id,
    field_name,
    field_label,
    field_type,
    placeholder,
    help_text,
    is_required,
    display_order,
    width,
    affects_pricing,
    pricing_field_type
  ) VALUES
    (
      form_id,
      'client_name',
      'Client Name',
      'text',
      'e.g., John Smith',
      'Full name of the purchaser',
      true,
      0,
      'full',
      false,
      null
    ),
    (
      form_id,
      'client_email',
      'Email Address',
      'email',
      'your@email.com',
      'We''ll send your quote to this address',
      true,
      1,
      'half',
      false,
      null
    ),
    (
      form_id,
      'client_phone',
      'Phone Number',
      'phone',
      '07XXX XXXXXX',
      null,
      true,
      2,
      'half',
      false,
      null
    ),
    (
      form_id,
      'property_address',
      'Property Address',
      'textarea',
      'Full property address',
      'Enter the complete address of the property you wish to purchase',
      true,
      3,
      'full',
      false,
      null
    ),
    (
      form_id,
      'property_value',
      'Property Purchase Price',
      'currency',
      '250000',
      'The agreed purchase price',
      true,
      4,
      'half',
      true,
      'property_value'
    ),
    (
      form_id,
      'is_first_time_buyer',
      'First Time Buyer?',
      'yes_no',
      null,
      'May affect LBTT calculation',
      true,
      5,
      'half',
      true,
      'condition'
    ),
    (
      form_id,
      'requires_mortgage',
      'Do you require a mortgage?',
      'yes_no',
      null,
      null,
      true,
      6,
      'half',
      false,
      null
    ),
    (
      form_id,
      'number_of_purchasers',
      'Number of Purchasers',
      'number',
      '1',
      'Total number of people purchasing the property',
      true,
      7,
      'half',
      true,
      'quantity'
    );

  -- Insert pricing rules
  INSERT INTO public.form_pricing_rules (
    form_template_id,
    rule_name,
    rule_code,
    fee_type,
    fixed_amount,
    percentage_rate,
    per_item_amount,
    category,
    display_order,
    show_on_quote
  ) VALUES
    (
      form_id,
      'Standard Conveyancing Fee',
      'conveyancing_base',
      'fixed',
      1200.00,
      null,
      null,
      'legal_fees',
      0,
      true
    ),
    (
      form_id,
      'Property Searches',
      'searches',
      'fixed',
      350.00,
      null,
      null,
      'disbursements',
      1,
      true
    ),
    (
      form_id,
      'Additional Purchaser Fee',
      'additional_purchaser',
      'per_item',
      null,
      null,
      75.00,
      'legal_fees',
      2,
      true
    ),
    (
      form_id,
      'Registration Fee',
      'registration',
      'fixed',
      150.00,
      null,
      null,
      'disbursements',
      3,
      true
    );

  RAISE NOTICE 'Sample form created successfully with ID: %', form_id;
END $$;
