import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Service key configured:', !!supabaseServiceKey)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkConnection() {
  // Try to fetch tenants
  const { data: tenants, error: tenantError } = await supabase
    .from('tenants')
    .select('*')

  console.log('\nTenants query:')
  console.log('Error:', tenantError)
  console.log('Data:', tenants)
  console.log('Count:', tenants?.length || 0)

  // Try to fetch users
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .limit(5)

  console.log('\nUsers query:')
  console.log('Error:', userError)
  console.log('Count:', users?.length || 0)
}

checkConnection()
