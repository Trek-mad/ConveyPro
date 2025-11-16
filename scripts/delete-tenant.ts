import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteTenant() {
  const tenantNameArg = process.argv[2]

  if (!tenantNameArg) {
    console.error('❌ Please provide a tenant name or ID to delete')
    console.error('Usage: npm run delete-tenant <tenant-name-or-id>')
    process.exit(1)
  }

  // Get all tenants
  const { data: allTenants, error: tenantError } = await supabase
    .from('tenants')
    .select('id, name')

  if (tenantError || !allTenants || allTenants.length === 0) {
    console.error('❌ No tenants found in database')
    process.exit(1)
  }

  // Find the tenant to delete
  const tenant = allTenants.find(
    t => t.name.toLowerCase() === tenantNameArg.toLowerCase() || t.id === tenantNameArg
  )

  if (!tenant) {
    console.error(`❌ Tenant "${tenantNameArg}" not found. Available tenants:`)
    allTenants.forEach(t => console.error(`   - ${t.name} (${t.id})`))
    process.exit(1)
  }

  console.log(`\n⚠️  WARNING: You are about to delete tenant "${tenant.name}"`)
  console.log(`   This will permanently delete:`)

  // Count data to be deleted
  const { data: quotes } = await supabase
    .from('quotes')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenant.id)

  const { data: properties } = await supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenant.id)

  const { data: clients } = await supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenant.id)

  console.log(`   - ${quotes?.length || 0} quotes`)
  console.log(`   - ${properties?.length || 0} properties`)
  console.log(`   - ${clients?.length || 0} clients`)
  console.log(`   - The tenant record itself`)
  console.log(`\nType "yes" to confirm deletion (any other input will cancel):`)

  // In a real interactive script, you'd wait for user input here
  // For now, we'll require the --confirm flag
  if (!process.argv.includes('--confirm')) {
    console.error('\n❌ Deletion cancelled. Use --confirm flag to proceed.')
    console.error(`   Example: npx tsx scripts/delete-tenant.ts "${tenant.name}" --confirm`)
    process.exit(1)
  }

  console.log('\n🗑️  Deleting tenant data...')

  // Delete in order (child records first due to foreign keys)
  await supabase.from('quotes').delete().eq('tenant_id', tenant.id)
  console.log('   ✓ Deleted quotes')

  await supabase.from('properties').delete().eq('tenant_id', tenant.id)
  console.log('   ✓ Deleted properties')

  await supabase.from('clients').delete().eq('tenant_id', tenant.id)
  console.log('   ✓ Deleted clients')

  // Delete tenant memberships
  await supabase.from('tenant_memberships').delete().eq('tenant_id', tenant.id)
  console.log('   ✓ Deleted tenant memberships')

  // Finally delete the tenant itself
  await supabase.from('tenants').delete().eq('id', tenant.id)
  console.log('   ✓ Deleted tenant record')

  console.log(`\n✅ Tenant "${tenant.name}" has been completely deleted`)
}

deleteTenant().catch((error) => {
  console.error('❌ Deletion failed:', error)
  process.exit(1)
})
