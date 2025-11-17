import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('Checking quotes table schema...\n')

  // Try to fetch one quote to see what columns come back
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Sample quote structure:', data?.[0] ? Object.keys(data[0]) : 'No quotes found')
  }

  // Try to insert a minimal test quote to see what happens
  console.log('\nTesting insert with minimal quote...')
  const testQuote = {
    tenant_id: '0bc2f210-7fe5-4290-89ae-aebb17865240',
    quote_number: 'TEST-001',
    transaction_type: 'purchase',
    transaction_value: 100000,
    client_name: 'Test Client',
    base_fee: 1000,
    disbursements: 500,
    vat_amount: 300,
    total_amount: 1800,
    status: 'draft'
  }

  const { error: insertError } = await supabase
    .from('quotes')
    .insert([testQuote])

  if (insertError) {
    console.error('Insert error:', insertError.message)
  } else {
    console.log('Test insert successful!')
    // Clean up
    await supabase.from('quotes').delete().eq('quote_number', 'TEST-001')
  }
}

checkSchema()
