import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkData() {
  console.log('🔍 Checking database...\n')

  // Check all tenants
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name')

  console.log('📋 Tenants in database:')
  tenants?.forEach(t => {
    console.log(`   - ${t.name} (${t.id})`)
  })
  console.log()

  // Check clients per tenant
  for (const tenant of tenants || []) {
    const { data: clients, count } = await supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenant.id)

    const { data: quotes } = await supabase
      .from('quotes')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenant.id)

    const { data: properties } = await supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenant.id)

    console.log(`Tenant: ${tenant.name}`)
    console.log(`   Clients: ${clients?.length || 0}`)
    console.log(`   Properties: ${properties?.length || 0}`)
    console.log(`   Quotes: ${quotes?.length || 0}`)
    console.log()
  }
}

checkData()
