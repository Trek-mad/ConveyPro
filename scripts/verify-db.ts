/**
 * Quick database verification script
 * Tests connection and checks if Phase 2 tables exist
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyDatabase() {
  console.log('🔍 Verifying Supabase connection...\n')

  const tables = ['tenants', 'profiles', 'tenant_memberships', 'properties', 'quotes']

  for (const table of tables) {
    try {
      const { error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`)
      } else {
        console.log(`✅ ${table}: EXISTS (${count ?? 0} rows)`)
      }
    } catch (err) {
      console.log(`❌ ${table}: ERROR - ${err}`)
    }
  }

  console.log('\n✨ Verification complete!')
}

verifyDatabase()
