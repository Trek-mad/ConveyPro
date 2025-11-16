/**
 * ConveyPro Demo Data Seeder
 *
 * Creates realistic clients, properties, and quotes for impressive analytics demo
 *
 * Usage:
 *   npx tsx scripts/seed-demo-data.ts
 *
 * Requirements:
 *   - User must be logged in (uses server-side Supabase client)
 *   - Run from project root directory
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDemoData() {
  console.log('🌱 Starting demo data seed...\n')

  // Get the first tenant (assuming test environment with one tenant)
  const { data: tenants, error: tenantError } = await supabase
    .from('tenants')
    .select('id, name')
    .limit(1)

  if (tenantError || !tenants || tenants.length === 0) {
    console.error('❌ No tenant found. Please create a tenant first.')
    process.exit(1)
  }

  const tenantId = tenants[0].id
  console.log(`✓ Using tenant: ${tenants[0].name} (${tenantId})\n`)

  // ============================================================================
  // CREATE CLIENTS
  // ============================================================================
  console.log('📋 Creating clients...')

  const clients = [
    // First-Time Buyers (5)
    {
      first_name: 'Sarah',
      last_name: 'Mitchell',
      email: 'sarah.mitchell@email.com',
      phone: '07700 900001',
      address_line1: '12 Park Avenue',
      city: 'Edinburgh',
      postcode: 'EH3 7AH',
      country: 'Scotland',
      client_type: 'couple',
      life_stage: 'first-time-buyer',
      services_used: ['purchase'],
      tags: ['first-time-buyer', 'young-professional'],
      notes: 'Referred by previous client. Looking for 2-bed flat in Leith.',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
    },
    {
      first_name: 'James',
      last_name: 'Thompson',
      email: 'j.thompson@email.com',
      phone: '07700 900002',
      address_line1: '45 Queen Street',
      city: 'Glasgow',
      postcode: 'G1 3DW',
      country: 'Scotland',
      client_type: 'individual',
      life_stage: 'first-time-buyer',
      services_used: ['purchase'],
      tags: ['first-time-buyer'],
      notes: 'First property. New to market guidance.',
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 4 months ago
    },
    {
      first_name: 'Emily',
      last_name: 'Chen',
      email: 'emily.chen@email.com',
      phone: '07700 900003',
      address_line1: '78 High Street',
      city: 'Edinburgh',
      postcode: 'EH1 1SR',
      country: 'Scotland',
      client_type: 'couple',
      life_stage: 'first-time-buyer',
      services_used: ['purchase', 'will'],
      tags: ['first-time-buyer', 'married'],
      notes: 'Recently married. Purchased will service after conveyancing.',
      created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(), // 5 months ago
    },
    {
      first_name: 'Michael',
      last_name: "O'Connor",
      email: 'michael.oconnor@email.com',
      phone: '07700 900004',
      address_line1: '23 George Square',
      city: 'Glasgow',
      postcode: 'G2 1DY',
      country: 'Scotland',
      client_type: 'individual',
      life_stage: 'first-time-buyer',
      services_used: ['purchase'],
      tags: ['first-time-buyer', 'remote-worker'],
      notes: 'Works remotely. Interested in suburban property.',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 2 months ago
    },
    {
      first_name: 'Sophie',
      last_name: 'Williams',
      email: 'sophie.w@email.com',
      phone: '07700 900005',
      address_line1: '156 Princes Street',
      city: 'Edinburgh',
      postcode: 'EH2 4AD',
      country: 'Scotland',
      client_type: 'couple',
      life_stage: 'first-time-buyer',
      services_used: [],
      tags: ['first-time-buyer'],
      notes: 'Currently viewing properties. Quote sent.',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
    },

    // Moving Up (4)
    {
      first_name: 'David',
      last_name: 'Fraser',
      email: 'david.fraser@email.com',
      phone: '07700 900011',
      address_line1: '89 Victoria Road',
      city: 'Edinburgh',
      postcode: 'EH6 5BU',
      country: 'Scotland',
      client_type: 'couple',
      life_stage: 'moving-up',
      services_used: ['purchase', 'sale', 'will'],
      tags: ['repeat-client', 'family'],
      notes: 'Third transaction with us. Growing family needs bigger home.',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      first_name: 'Rachel',
      last_name: 'Brown',
      email: 'rachel.brown@email.com',
      phone: '07700 900012',
      address_line1: '34 Bath Street',
      city: 'Glasgow',
      postcode: 'G2 4JP',
      country: 'Scotland',
      client_type: 'couple',
      life_stage: 'moving-up',
      services_used: ['purchase', 'sale'],
      tags: ['family', 'upsizing'],
      notes: 'Selling 2-bed, buying 4-bed. Second child on the way.',
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      first_name: 'Andrew',
      last_name: 'MacLeod',
      email: 'a.macleod@email.com',
      phone: '07700 900013',
      address_line1: '67 Morningside Road',
      city: 'Edinburgh',
      postcode: 'EH10 4AZ',
      country: 'Scotland',
      client_type: 'couple',
      life_stage: 'moving-up',
      services_used: ['purchase', 'sale', 'poa'],
      tags: ['repeat-client'],
      notes: 'Used our POA service for elderly parents.',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      first_name: 'Jennifer',
      last_name: 'Scott',
      email: 'jen.scott@email.com',
      phone: '07700 900014',
      address_line1: '12 Byres Road',
      city: 'Glasgow',
      postcode: 'G11 5JY',
      country: 'Scotland',
      client_type: 'couple',
      life_stage: 'moving-up',
      services_used: ['purchase'],
      tags: ['family'],
      notes: 'Moving to better school catchment area.',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // Investors (3)
    {
      first_name: 'Robert',
      last_name: 'Campbell',
      email: 'rob.campbell@email.com',
      phone: '07700 900021',
      address_line1: '45 Castle Street',
      city: 'Edinburgh',
      postcode: 'EH2 3BG',
      country: 'Scotland',
      client_type: 'business',
      life_stage: 'investor',
      services_used: ['purchase', 'purchase', 'remortgage'],
      tags: ['investor', 'portfolio', 'high-value'],
      notes: 'Property portfolio of 8 units. Regular client.',
      created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      first_name: 'Linda',
      last_name: 'Patel',
      email: 'linda.patel@email.com',
      phone: '07700 900022',
      address_line1: '123 Sauchiehall Street',
      city: 'Glasgow',
      postcode: 'G2 3EW',
      country: 'Scotland',
      client_type: 'individual',
      life_stage: 'investor',
      services_used: ['purchase', 'estate'],
      tags: ['investor', 'buy-to-let'],
      notes: 'Buy-to-let investor. Used estate planning service.',
      created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      first_name: 'Thomas',
      last_name: 'Anderson',
      email: 't.anderson@email.com',
      phone: '07700 900023',
      address_line1: '89 Lothian Road',
      city: 'Edinburgh',
      postcode: 'EH1 2DJ',
      country: 'Scotland',
      client_type: 'business',
      life_stage: 'investor',
      services_used: ['purchase'],
      tags: ['investor', 'commercial'],
      notes: 'Commercial property investor.',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // Downsizing/Retired (3)
    {
      first_name: 'Margaret',
      last_name: 'Robertson',
      email: 'margaret.r@email.com',
      phone: '07700 900031',
      address_line1: '56 Colinton Road',
      city: 'Edinburgh',
      postcode: 'EH10 5BT',
      country: 'Scotland',
      client_type: 'couple',
      life_stage: 'downsizing',
      services_used: ['sale', 'purchase', 'will', 'poa', 'estate'],
      tags: ['retired', 'downsizing', 'full-service'],
      notes: 'Full service client - conveyancing, will, POA, estate planning.',
      created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      first_name: 'John',
      last_name: 'Murray',
      email: 'john.murray@email.com',
      phone: '07700 900032',
      address_line1: '34 Great Western Road',
      city: 'Glasgow',
      postcode: 'G12 8HN',
      country: 'Scotland',
      client_type: 'couple',
      life_stage: 'retired',
      services_used: ['sale', 'will', 'estate'],
      tags: ['retired', 'estate-planning'],
      notes: 'Selling family home. Comprehensive estate planning.',
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      first_name: 'Elizabeth',
      last_name: 'Grant',
      email: 'liz.grant@email.com',
      phone: '07700 900033',
      address_line1: '78 Comely Bank',
      city: 'Edinburgh',
      postcode: 'EH4 1AW',
      country: 'Scotland',
      client_type: 'individual',
      life_stage: 'downsizing',
      services_used: ['sale', 'purchase'],
      tags: ['downsizing'],
      notes: 'Widowed. Moving to smaller flat.',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const { data: createdClients, error: clientError } = await supabase
    .from('clients')
    .insert(clients.map((c) => ({ ...c, tenant_id: tenantId })))
    .select()

  if (clientError) {
    console.error('❌ Error creating clients:', clientError.message)
    process.exit(1)
  }

  console.log(`✓ Created ${createdClients.length} clients\n`)

  // Create a map for easy lookup
  const clientMap = new Map(createdClients.map((c) => [c.email, c.id]))

  // ============================================================================
  // CREATE PROPERTIES
  // ============================================================================
  console.log('🏠 Creating properties...')

  const properties = [
    // First-Time Buyer Properties
    { address_line1: '34 Leith Walk', city: 'Edinburgh', postcode: 'EH6 5BR', country: 'Scotland', property_type: 'residential', bedrooms: 2, purchase_price: 185000, created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
    { address_line1: '12 Woodlands Road', city: 'Glasgow', postcode: 'G3 6UR', country: 'Scotland', property_type: 'residential', bedrooms: 1, purchase_price: 145000, created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() },
    { address_line1: '56 South Bridge', city: 'Edinburgh', postcode: 'EH1 1LL', country: 'Scotland', property_type: 'residential', bedrooms: 2, purchase_price: 210000, created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString() },
    { address_line1: '89 Dumbarton Road', city: 'Glasgow', postcode: 'G11 6PW', country: 'Scotland', property_type: 'residential', bedrooms: 2, purchase_price: 165000, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
    { address_line1: '23 Nicolson Street', city: 'Edinburgh', postcode: 'EH8 9BH', country: 'Scotland', property_type: 'residential', bedrooms: 2, purchase_price: 195000, created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },

    // Moving Up Properties
    { address_line1: '45 Ravelston Dykes', city: 'Edinburgh', postcode: 'EH4 3LY', country: 'Scotland', property_type: 'residential', bedrooms: 4, purchase_price: 475000, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
    { address_line1: '78 Hyndland Road', city: 'Glasgow', postcode: 'G12 9UZ', country: 'Scotland', property_type: 'residential', bedrooms: 4, purchase_price: 425000, created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() },
    { address_line1: '12 Blackford Avenue', city: 'Edinburgh', postcode: 'EH9 2PU', country: 'Scotland', property_type: 'residential', bedrooms: 5, purchase_price: 550000, created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
    { address_line1: '34 Dowanside Road', city: 'Glasgow', postcode: 'G12 9DQ', country: 'Scotland', property_type: 'residential', bedrooms: 3, purchase_price: 385000, created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },

    // Investor Properties
    { address_line1: '67 Gorgie Road', city: 'Edinburgh', postcode: 'EH11 2LA', country: 'Scotland', property_type: 'residential', bedrooms: 2, purchase_price: 175000, created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() },
    { address_line1: '45 Maryhill Road', city: 'Glasgow', postcode: 'G20 7XE', country: 'Scotland', property_type: 'residential', bedrooms: 1, purchase_price: 125000, created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString() },
    { address_line1: '89 Commercial Street', city: 'Edinburgh', postcode: 'EH6 6LX', country: 'Scotland', property_type: 'commercial', bedrooms: null, purchase_price: 650000, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },

    // Downsizing Properties
    { address_line1: '23 Bruntsfield Place', city: 'Edinburgh', postcode: 'EH10 4HN', country: 'Scotland', property_type: 'residential', bedrooms: 2, purchase_price: 295000, created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString() },
    { address_line1: '56 Park Circus', city: 'Glasgow', postcode: 'G3 6AP', country: 'Scotland', property_type: 'residential', bedrooms: 3, purchase_price: 325000, created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() },
    { address_line1: '12 Dean Park Crescent', city: 'Edinburgh', postcode: 'EH4 1PH', country: 'Scotland', property_type: 'residential', bedrooms: 2, purchase_price: 275000, created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
  ]

  const { data: createdProperties, error: propertyError } = await supabase
    .from('properties')
    .insert(properties.map((p) => ({ ...p, tenant_id: tenantId })))
    .select()

  if (propertyError) {
    console.error('❌ Error creating properties:', propertyError.message)
    process.exit(1)
  }

  console.log(`✓ Created ${createdProperties.length} properties\n`)

  // Create a map for easy lookup
  const propertyMap = new Map(createdProperties.map((p) => [p.address_line1, p.id]))

  // ============================================================================
  // CREATE QUOTES
  // ============================================================================
  console.log('💼 Creating quotes...')

  const quotes = [
    // ACCEPTED QUOTES (for revenue stats)
    {
      client_id: clientMap.get('sarah.mitchell@email.com'),
      property_id: propertyMap.get('34 Leith Walk'),
      quote_number: 'Q-2024-001',
      transaction_type: 'purchase',
      property_value: 185000,
      status: 'accepted',
      legal_fees: 1200,
      searches_fees: 250,
      registration_fees: 100,
      lbtt_amount: 600,
      total_amount: 2150,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'First-time buyer. Accepted quote same day.',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      client_id: clientMap.get('emily.chen@email.com'),
      property_id: propertyMap.get('56 South Bridge'),
      quote_number: 'Q-2024-002',
      transaction_type: 'purchase',
      property_value: 210000,
      status: 'accepted',
      legal_fees: 1250,
      searches_fees: 250,
      registration_fees: 100,
      lbtt_amount: 850,
      total_amount: 2450,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Also purchased will service (£750) - great cross-sell!',
      created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      client_id: clientMap.get('david.fraser@email.com'),
      property_id: propertyMap.get('45 Ravelston Dykes'),
      quote_number: 'Q-2024-003',
      transaction_type: 'purchase',
      property_value: 475000,
      status: 'accepted',
      legal_fees: 2200,
      searches_fees: 300,
      registration_fees: 150,
      lbtt_amount: 19350,
      total_amount: 22000,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Repeat client. Third transaction with us.',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      client_id: clientMap.get('rachel.brown@email.com'),
      property_id: null,
      quote_number: 'Q-2024-004',
      transaction_type: 'sale',
      property_value: 245000,
      status: 'accepted',
      legal_fees: 1500,
      searches_fees: 0,
      registration_fees: 0,
      lbtt_amount: 0,
      total_amount: 1500,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Selling existing property to upsize.',
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      client_id: clientMap.get('rob.campbell@email.com'),
      property_id: propertyMap.get('67 Gorgie Road'),
      quote_number: 'Q-2024-005',
      transaction_type: 'purchase',
      property_value: 175000,
      status: 'accepted',
      legal_fees: 1400,
      searches_fees: 250,
      registration_fees: 100,
      lbtt_amount: 5350,
      total_amount: 7100,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Buy-to-let investment. Portfolio client.',
      created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      client_id: clientMap.get('margaret.r@email.com'),
      property_id: null,
      quote_number: 'Q-2024-006',
      transaction_type: 'sale',
      property_value: 425000,
      status: 'accepted',
      legal_fees: 2000,
      searches_fees: 0,
      registration_fees: 0,
      lbtt_amount: 0,
      total_amount: 2000,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Full service client - also purchased will, POA, estate planning.',
      created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      client_id: clientMap.get('andrew.macleod@email.com'),
      property_id: propertyMap.get('12 Blackford Avenue'),
      quote_number: 'Q-2024-007',
      transaction_type: 'purchase',
      property_value: 550000,
      status: 'accepted',
      legal_fees: 2500,
      searches_fees: 300,
      registration_fees: 150,
      lbtt_amount: 26850,
      total_amount: 29800,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Repeat client. Also used POA service.',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      client_id: clientMap.get('linda.patel@email.com'),
      property_id: propertyMap.get('45 Maryhill Road'),
      quote_number: 'Q-2024-008',
      transaction_type: 'purchase',
      property_value: 125000,
      status: 'accepted',
      legal_fees: 1100,
      searches_fees: 250,
      registration_fees: 100,
      lbtt_amount: 0,
      total_amount: 1450,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Buy-to-let. Used estate planning service.',
      created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // SENT QUOTES (pipeline)
    {
      client_id: clientMap.get('j.thompson@email.com'),
      property_id: propertyMap.get('12 Woodlands Road'),
      quote_number: 'Q-2024-011',
      transaction_type: 'purchase',
      property_value: 145000,
      status: 'sent',
      legal_fees: 1150,
      searches_fees: 250,
      registration_fees: 100,
      lbtt_amount: 100,
      total_amount: 1600,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Quote sent. Awaiting response.',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      client_id: clientMap.get('sophie.w@email.com'),
      property_id: propertyMap.get('23 Nicolson Street'),
      quote_number: 'Q-2024-012',
      transaction_type: 'purchase',
      property_value: 195000,
      status: 'sent',
      legal_fees: 1200,
      searches_fees: 250,
      registration_fees: 100,
      lbtt_amount: 700,
      total_amount: 2250,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'New client. Quote sent this week.',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      client_id: clientMap.get('jen.scott@email.com'),
      property_id: propertyMap.get('34 Dowanside Road'),
      quote_number: 'Q-2024-013',
      transaction_type: 'purchase',
      property_value: 385000,
      status: 'sent',
      legal_fees: 1900,
      searches_fees: 300,
      registration_fees: 150,
      lbtt_amount: 14350,
      total_amount: 16700,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Family moving for school catchment.',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // DRAFT QUOTES
    {
      client_id: clientMap.get('michael.oconnor@email.com'),
      property_id: propertyMap.get('89 Dumbarton Road'),
      quote_number: 'Q-2024-014',
      transaction_type: 'purchase',
      property_value: 165000,
      status: 'draft',
      legal_fees: 1150,
      searches_fees: 250,
      registration_fees: 100,
      lbtt_amount: 250,
      total_amount: 1750,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Preparing quote for viewing.',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      client_id: clientMap.get('t.anderson@email.com'),
      property_id: propertyMap.get('89 Commercial Street'),
      quote_number: 'Q-2024-015',
      transaction_type: 'purchase',
      property_value: 650000,
      status: 'draft',
      legal_fees: 3500,
      searches_fees: 400,
      registration_fees: 200,
      lbtt_amount: 31100,
      total_amount: 35200,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Commercial property. Complex transaction.',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // DECLINED QUOTES (funnel drop-off)
    {
      client_id: null,
      property_id: null,
      quote_number: 'Q-2024-016',
      transaction_type: 'purchase',
      property_value: 175000,
      status: 'declined',
      legal_fees: 1200,
      searches_fees: 250,
      registration_fees: 100,
      lbtt_amount: 450,
      total_amount: 2000,
      valid_until: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Client went with another firm.',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      client_id: null,
      property_id: null,
      quote_number: 'Q-2024-017',
      transaction_type: 'sale',
      property_value: 220000,
      status: 'declined',
      legal_fees: 1400,
      searches_fees: 0,
      registration_fees: 0,
      lbtt_amount: 0,
      total_amount: 1400,
      valid_until: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Changed mind about selling.',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const { data: createdQuotes, error: quoteError } = await supabase
    .from('quotes')
    .insert(quotes.map((q) => ({ ...q, tenant_id: tenantId })))
    .select()

  if (quoteError) {
    console.error('❌ Error creating quotes:', quoteError.message)
    process.exit(1)
  }

  console.log(`✓ Created ${createdQuotes.length} quotes\n`)

  // ============================================================================
  // SUMMARY STATISTICS
  // ============================================================================
  console.log('📊 Demo Data Summary:\n')
  console.log(`   Clients: ${createdClients.length}`)
  console.log(`   - First-Time Buyers: ${createdClients.filter((c) => c.life_stage === 'first-time-buyer').length}`)
  console.log(`   - Moving Up: ${createdClients.filter((c) => c.life_stage === 'moving-up').length}`)
  console.log(`   - Investors: ${createdClients.filter((c) => c.life_stage === 'investor').length}`)
  console.log(`   - Downsizing/Retired: ${createdClients.filter((c) => c.life_stage === 'downsizing' || c.life_stage === 'retired').length}`)
  console.log()
  console.log(`   Properties: ${createdProperties.length}`)
  console.log()
  console.log(`   Quotes: ${createdQuotes.length}`)
  console.log(`   - Accepted: ${createdQuotes.filter((q) => q.status === 'accepted').length}`)
  console.log(`   - Sent: ${createdQuotes.filter((q) => q.status === 'sent').length}`)
  console.log(`   - Draft: ${createdQuotes.filter((q) => q.status === 'draft').length}`)
  console.log(`   - Declined: ${createdQuotes.filter((q) => q.status === 'declined').length}`)
  console.log()

  const totalRevenue = createdQuotes
    .filter((q) => q.status === 'accepted')
    .reduce((sum, q) => sum + Number(q.total_amount), 0)

  console.log(`   Total Revenue (Accepted): £${totalRevenue.toLocaleString('en-GB')}`)
  console.log()
  console.log('✅ Demo data seeded successfully!')
  console.log('   Visit /analytics and /clients to see the results.')
}

// Run the seed function
seedDemoData().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
