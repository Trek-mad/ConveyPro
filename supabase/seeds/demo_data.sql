-- ConveyPro Demo Data Seed
-- Creates realistic clients, properties, and quotes for impressive analytics demo
-- Run this after migrations are complete

-- IMPORTANT: This seed uses variables. Run sections individually or update tenant_id
-- Get your tenant_id from your database and replace in the INSERT statements

-- ============================================================================
-- CLIENTS - Diverse life stages and scenarios
-- ============================================================================

-- First-Time Buyers (5 clients)
INSERT INTO public.clients (tenant_id, first_name, last_name, email, phone, address_line1, city, postcode, country, client_type, life_stage, services_used, tags, notes, created_at) VALUES
-- Active young professionals
('YOUR_TENANT_ID', 'Sarah', 'Mitchell', 'sarah.mitchell@email.com', '07700 900001', '12 Park Avenue', 'Edinburgh', 'EH3 7AH', 'Scotland', 'couple', 'first-time-buyer', '["purchase"]'::jsonb, ARRAY['first-time-buyer', 'young-professional'], 'Referred by previous client. Looking for 2-bed flat in Leith.', NOW() - INTERVAL '3 months'),
('YOUR_TENANT_ID', 'James', 'Thompson', 'j.thompson@email.com', '07700 900002', '45 Queen Street', 'Glasgow', 'G1 3DW', 'Scotland', 'individual', 'first-time-buyer', '["purchase"]'::jsonb, ARRAY['first-time-buyer'], 'First property. Needs help to market guidance.', NOW() - INTERVAL '4 months'),
('YOUR_TENANT_ID', 'Emily', 'Chen', 'emily.chen@email.com', '07700 900003', '78 High Street', 'Edinburgh', 'EH1 1SR', 'Scotland', 'couple', 'first-time-buyer', '["purchase", "will"]'::jsonb, ARRAY['first-time-buyer', 'married'], 'Recently married. Purchased will service after conveyancing.', NOW() - INTERVAL '5 months'),
('YOUR_TENANT_ID', 'Michael', 'O''Connor', 'michael.oconnor@email.com', '07700 900004', '23 George Square', 'Glasgow', 'G2 1DY', 'Scotland', 'individual', 'first-time-buyer', '["purchase"]'::jsonb, ARRAY['first-time-buyer', 'remote-worker'], 'Works remotely. Interested in suburban property.', NOW() - INTERVAL '2 months'),
('YOUR_TENANT_ID', 'Sophie', 'Williams', 'sophie.w@email.com', '07700 900005', '156 Princes Street', 'Edinburgh', 'EH2 4AD', 'Scotland', 'couple', 'first-time-buyer', '[]'::jsonb, ARRAY['first-time-buyer'], 'Currently viewing properties. Quote sent.', NOW() - INTERVAL '1 month'),

-- Moving Up (4 clients)
('YOUR_TENANT_ID', 'David', 'Fraser', 'david.fraser@email.com', '07700 900011', '89 Victoria Road', 'Edinburgh', 'EH6 5BU', 'Scotland', 'couple', 'moving-up', '["purchase", "sale", "will"]'::jsonb, ARRAY['repeat-client', 'family'], 'Third transaction with us. Growing family needs bigger home.', NOW() - INTERVAL '2 months'),
('YOUR_TENANT_ID', 'Rachel', 'Brown', 'rachel.brown@email.com', '07700 900012', '34 Bath Street', 'Glasgow', 'G2 4JP', 'Scotland', 'couple', 'moving-up', '["purchase", "sale"]'::jsonb, ARRAY['family', 'upsizing'], 'Selling 2-bed, buying 4-bed. Second child on the way.', NOW() - INTERVAL '4 months'),
('YOUR_TENANT_ID', 'Andrew', 'MacLeod', 'a.macleod@email.com', '07700 900013', '67 Morningside Road', 'Edinburgh', 'EH10 4AZ', 'Scotland', 'couple', 'moving-up', '["purchase", "sale", "poa"]'::jsonb, ARRAY['repeat-client'], 'Used our POA service for elderly parents.', NOW() - INTERVAL '3 months'),
('YOUR_TENANT_ID', 'Jennifer', 'Scott', 'jen.scott@email.com', '07700 900014', '12 Byres Road', 'Glasgow', 'G11 5JY', 'Scotland', 'couple', 'moving-up', '["purchase"]'::jsonb, ARRAY['family'], 'Moving to better school catchment area.', NOW() - INTERVAL '1 month'),

-- Investors (3 clients)
('YOUR_TENANT_ID', 'Robert', 'Campbell', 'rob.campbell@email.com', '07700 900021', '45 Castle Street', 'Edinburgh', 'EH2 3BG', 'Scotland', 'business', 'investor', '["purchase", "purchase", "remortgage"]'::jsonb, ARRAY['investor', 'portfolio', 'high-value'], 'Property portfolio of 8 units. Regular client.', NOW() - INTERVAL '6 months'),
('YOUR_TENANT_ID', 'Linda', 'Patel', 'linda.patel@email.com', '07700 900022', '123 Sauchiehall Street', 'Glasgow', 'G2 3EW', 'Scotland', 'individual', 'investor', '["purchase", "estate"]'::jsonb, ARRAY['investor', 'buy-to-let'], 'Buy-to-let investor. Used estate planning service.', NOW() - INTERVAL '5 months'),
('YOUR_TENANT_ID', 'Thomas', 'Anderson', 't.anderson@email.com', '07700 900023', '89 Lothian Road', 'Edinburgh', 'EH1 2DJ', 'Scotland', 'business', 'investor', '["purchase"]'::jsonb, ARRAY['investor', 'commercial'], 'Commercial property investor.', NOW() - INTERVAL '2 months'),

-- Downsizing/Retired (3 clients)
('YOUR_TENANT_ID', 'Margaret', 'Robertson', 'margaret.r@email.com', '07700 900031', '56 Colinton Road', 'Edinburgh', 'EH10 5BT', 'Scotland', 'couple', 'downsizing', '["sale", "purchase", "will", "poa", "estate"]'::jsonb, ARRAY['retired', 'downsizing', 'full-service'], 'Full service client - conveyancing, will, POA, estate planning.', NOW() - INTERVAL '5 months'),
('YOUR_TENANT_ID', 'John', 'Murray', 'john.murray@email.com', '07700 900032', '34 Great Western Road', 'Glasgow', 'G12 8HN', 'Scotland', 'couple', 'retired', '["sale", "will", "estate"]'::jsonb, ARRAY['retired', 'estate-planning'], 'Selling family home. Comprehensive estate planning.', NOW() - INTERVAL '4 months'),
('YOUR_TENANT_ID', 'Elizabeth', 'Grant', 'liz.grant@email.com', '07700 900033', '78 Comely Bank', 'Edinburgh', 'EH4 1AW', 'Scotland', 'individual', 'downsizing', '["sale", "purchase"]'::jsonb, ARRAY['downsizing'], 'Widowed. Moving to smaller flat.', NOW() - INTERVAL '3 months');


-- ============================================================================
-- PROPERTIES - Linked to quotes
-- ============================================================================

INSERT INTO public.properties (tenant_id, address_line1, city, postcode, country, property_type, bedrooms, price, created_at) VALUES
-- First-Time Buyer Properties
('YOUR_TENANT_ID', '34 Leith Walk', 'Edinburgh', 'EH6 5BR', 'Scotland', 'flat', 2, 185000, NOW() - INTERVAL '3 months'),
('YOUR_TENANT_ID', '12 Woodlands Road', 'Glasgow', 'G3 6UR', 'Scotland', 'flat', 1, 145000, NOW() - INTERVAL '4 months'),
('YOUR_TENANT_ID', '56 South Bridge', 'Edinburgh', 'EH1 1LL', 'Scotland', 'flat', 2, 210000, NOW() - INTERVAL '5 months'),
('YOUR_TENANT_ID', '89 Dumbarton Road', 'Glasgow', 'G11 6PW', 'Scotland', 'flat', 2, 165000, NOW() - INTERVAL '2 months'),
('YOUR_TENANT_ID', '23 Nicolson Street', 'Edinburgh', 'EH8 9BH', 'Scotland', 'flat', 2, 195000, NOW() - INTERVAL '1 month'),

-- Moving Up Properties
('YOUR_TENANT_ID', '45 Ravelston Dykes', 'Edinburgh', 'EH4 3LY', 'Scotland', 'house', 4, 475000, NOW() - INTERVAL '2 months'),
('YOUR_TENANT_ID', '78 Hyndland Road', 'Glasgow', 'G12 9UZ', 'Scotland', 'house', 4, 425000, NOW() - INTERVAL '4 months'),
('YOUR_TENANT_ID', '12 Blackford Avenue', 'Edinburgh', 'EH9 2PU', 'Scotland', 'house', 5, 550000, NOW() - INTERVAL '3 months'),
('YOUR_TENANT_ID', '34 Dowanside Road', 'Glasgow', 'G12 9DQ', 'Scotland', 'house', 3, 385000, NOW() - INTERVAL '1 month'),

-- Investor Properties
('YOUR_TENANT_ID', '67 Gorgie Road', 'Edinburgh', 'EH11 2LA', 'Scotland', 'flat', 2, 175000, NOW() - INTERVAL '6 months'),
('YOUR_TENANT_ID', '45 Maryhill Road', 'Glasgow', 'G20 7XE', 'Scotland', 'flat', 1, 125000, NOW() - INTERVAL '5 months'),
('YOUR_TENANT_ID', '89 Commercial Street', 'Edinburgh', 'EH6 6LX', 'Scotland', 'commercial', NULL, 650000, NOW() - INTERVAL '2 months'),

-- Downsizing Properties
('YOUR_TENANT_ID', '23 Bruntsfield Place', 'Edinburgh', 'EH10 4HN', 'Scotland', 'flat', 2, 295000, NOW() - INTERVAL '5 months'),
('YOUR_TENANT_ID', '56 Park Circus', 'Glasgow', 'G3 6AP', 'Scotland', 'flat', 3, 325000, NOW() - INTERVAL '4 months'),
('YOUR_TENANT_ID', '12 Dean Park Crescent', 'Edinburgh', 'EH4 1PH', 'Scotland', 'flat', 2, 275000, NOW() - INTERVAL '3 months');


-- ============================================================================
-- QUOTES - Mix of statuses for impressive analytics
-- ============================================================================

-- NOTE: You'll need to get actual client_id and property_id values after inserting clients and properties
-- This is a template showing the variety of quotes to create

-- ACCEPTED QUOTES (High-value conversions for revenue stats)
-- Quote for Sarah Mitchell - FTB Purchase (ACCEPTED)
INSERT INTO public.quotes (tenant_id, client_id, property_id, quote_number, transaction_type, property_value, status, legal_fees, searches_fees, registration_fees, lbtt_amount, total_amount, valid_until, notes, created_at, updated_at)
SELECT
  'YOUR_TENANT_ID',
  c.id,
  p.id,
  'Q-2024-001',
  'purchase',
  185000,
  'accepted',
  1200,
  250,
  100,
  600,
  2150,
  NOW() + INTERVAL '30 days',
  'First-time buyer. Accepted quote same day.',
  NOW() - INTERVAL '3 months',
  NOW() - INTERVAL '2 months'
FROM public.clients c, public.properties p
WHERE c.email = 'sarah.mitchell@email.com' AND p.address_line1 = '34 Leith Walk'
LIMIT 1;

-- Quote for Emily Chen - FTB Purchase with Will cross-sell (ACCEPTED)
INSERT INTO public.quotes (tenant_id, client_id, property_id, quote_number, transaction_type, property_value, status, legal_fees, searches_fees, registration_fees, lbtt_amount, total_amount, valid_until, notes, created_at, updated_at)
SELECT
  'YOUR_TENANT_ID',
  c.id,
  p.id,
  'Q-2024-002',
  'purchase',
  210000,
  'accepted',
  1250,
  250,
  100,
  850,
  2450,
  NOW() + INTERVAL '30 days',
  'Also purchased will service (£750) - great cross-sell!',
  NOW() - INTERVAL '5 months',
  NOW() - INTERVAL '4 months'
FROM public.clients c, public.properties p
WHERE c.email = 'emily.chen@email.com' AND p.address_line1 = '56 South Bridge'
LIMIT 1;

-- Quote for David Fraser - Moving Up Purchase (ACCEPTED - High Value)
INSERT INTO public.quotes (tenant_id, client_id, property_id, quote_number, transaction_type, property_value, status, legal_fees, searches_fees, registration_fees, lbtt_amount, total_amount, valid_until, notes, created_at, updated_at)
SELECT
  'YOUR_TENANT_ID',
  c.id,
  p.id,
  'Q-2024-003',
  'purchase',
  475000,
  'accepted',
  2200,
  300,
  150,
  19350,
  22000,
  NOW() + INTERVAL '30 days',
  'Repeat client. Third transaction with us.',
  NOW() - INTERVAL '2 months',
  NOW() - INTERVAL '1 month'
FROM public.clients c, public.properties p
WHERE c.email = 'david.fraser@email.com' AND p.address_line1 = '45 Ravelston Dykes'
LIMIT 1;

-- Quote for Rachel Brown - Sale (ACCEPTED)
INSERT INTO public.quotes (tenant_id, client_id, property_id, quote_number, transaction_type, property_value, status, legal_fees, searches_fees, registration_fees, lbtt_amount, total_amount, valid_until, notes, created_at, updated_at)
SELECT
  'YOUR_TENANT_ID',
  c.id,
  NULL,
  'Q-2024-004',
  'sale',
  245000,
  'accepted',
  1500,
  0,
  0,
  0,
  1500,
  NOW() + INTERVAL '30 days',
  'Selling existing property to upsize.',
  NOW() - INTERVAL '4 months',
  NOW() - INTERVAL '3 months'
FROM public.clients c
WHERE c.email = 'rachel.brown@email.com'
LIMIT 1;

-- Quote for Robert Campbell - Investor Purchase (ACCEPTED - High Value)
INSERT INTO public.quotes (tenant_id, client_id, property_id, quote_number, transaction_type, property_value, status, legal_fees, searches_fees, registration_fees, lbtt_amount, total_amount, valid_until, notes, created_at, updated_at)
SELECT
  'YOUR_TENANT_ID',
  c.id,
  p.id,
  'Q-2024-005',
  'purchase',
  175000,
  'accepted',
  1400,
  250,
  100,
  5350,
  7100,
  NOW() + INTERVAL '30 days',
  'Buy-to-let investment. Portfolio client.',
  NOW() - INTERVAL '6 months',
  NOW() - INTERVAL '5 months'
FROM public.clients c, public.properties p
WHERE c.email = 'rob.campbell@email.com' AND p.address_line1 = '67 Gorgie Road'
LIMIT 1;

-- Quote for Margaret Robertson - Sale + Will/POA/Estate (ACCEPTED - Full Service)
INSERT INTO public.quotes (tenant_id, client_id, property_id, quote_number, transaction_type, property_value, status, legal_fees, searches_fees, registration_fees, lbtt_amount, total_amount, valid_until, notes, created_at, updated_at)
SELECT
  'YOUR_TENANT_ID',
  c.id,
  NULL,
  'Q-2024-006',
  'sale',
  425000,
  'accepted',
  2000,
  0,
  0,
  0,
  2000,
  NOW() + INTERVAL '30 days',
  'Full service client - also purchased will, POA, estate planning.',
  NOW() - INTERVAL '5 months',
  NOW() - INTERVAL '4 months'
FROM public.clients c
WHERE c.email = 'margaret.r@email.com'
LIMIT 1;

-- SENT QUOTES (Showing pipeline)
-- Quote for James Thompson - FTB (SENT)
INSERT INTO public.quotes (tenant_id, client_id, property_id, quote_number, transaction_type, property_value, status, legal_fees, searches_fees, registration_fees, lbtt_amount, total_amount, valid_until, notes, created_at, updated_at)
SELECT
  'YOUR_TENANT_ID',
  c.id,
  p.id,
  'Q-2024-007',
  'purchase',
  145000,
  'sent',
  1150,
  250,
  100,
  100,
  1600,
  NOW() + INTERVAL '30 days',
  'Quote sent. Awaiting response.',
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '1 week'
FROM public.clients c, public.properties p
WHERE c.email = 'j.thompson@email.com' AND p.address_line1 = '12 Woodlands Road'
LIMIT 1;

-- Quote for Sophie Williams - FTB (SENT)
INSERT INTO public.quotes (tenant_id, client_id, property_id, quote_number, transaction_type, property_value, status, legal_fees, searches_fees, registration_fees, lbtt_amount, total_amount, valid_until, notes, created_at, updated_at)
SELECT
  'YOUR_TENANT_ID',
  c.id,
  p.id,
  'Q-2024-008',
  'purchase',
  195000,
  'sent',
  1200,
  250,
  100,
  700,
  2250,
  NOW() + INTERVAL '30 days',
  'New client. Quote sent this week.',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
FROM public.clients c, public.properties p
WHERE c.email = 'sophie.w@email.com' AND p.address_line1 = '23 Nicolson Street'
LIMIT 1;

-- Quote for Jennifer Scott - Moving Up (SENT)
INSERT INTO public.quotes (tenant_id, client_id, property_id, quote_number, transaction_type, property_value, status, legal_fees, searches_fees, registration_fees, lbtt_amount, total_amount, valid_until, notes, created_at, updated_at)
SELECT
  'YOUR_TENANT_ID',
  c.id,
  p.id,
  'Q-2024-009',
  'purchase',
  385000,
  'sent',
  1900,
  300,
  150,
  14350,
  16700,
  NOW() + INTERVAL '30 days',
  'Family moving for school catchment.',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
FROM public.clients c, public.properties p
WHERE c.email = 'jen.scott@email.com' AND p.address_line1 = '34 Dowanside Road'
LIMIT 1;

-- DRAFT QUOTES (Work in progress)
-- Quote for Michael O'Connor - FTB (DRAFT)
INSERT INTO public.quotes (tenant_id, client_id, property_id, quote_number, transaction_type, property_value, status, legal_fees, searches_fees, registration_fees, lbtt_amount, total_amount, valid_until, notes, created_at, updated_at)
SELECT
  'YOUR_TENANT_ID',
  c.id,
  p.id,
  'Q-2024-010',
  'purchase',
  165000,
  'draft',
  1150,
  250,
  100,
  250,
  1750,
  NOW() + INTERVAL '30 days',
  'Preparing quote for viewing.',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day'
FROM public.clients c, public.properties p
WHERE c.email = 'michael.oconnor@email.com' AND p.address_line1 = '89 Dumbarton Road'
LIMIT 1;

-- DECLINED QUOTES (Showing funnel drop-off)
-- Generic declined quote
INSERT INTO public.quotes (tenant_id, quote_number, transaction_type, property_value, status, legal_fees, searches_fees, registration_fees, lbtt_amount, total_amount, valid_until, notes, created_at, updated_at)
VALUES
('YOUR_TENANT_ID', 'Q-2024-011', 'purchase', 175000, 'declined', 1200, 250, 100, 450, 2000, NOW() - INTERVAL '1 month', 'Client went with another firm.', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month');


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these after seeding to verify data

-- Check client distribution by life stage
-- SELECT life_stage, COUNT(*) FROM public.clients GROUP BY life_stage;

-- Check quote status distribution
-- SELECT status, COUNT(*) FROM public.quotes GROUP BY status;

-- Check total revenue
-- SELECT SUM(total_amount) as total_revenue FROM public.quotes WHERE status = 'accepted';

-- Check cross-sell opportunities
-- SELECT
--   first_name,
--   last_name,
--   life_stage,
--   services_used,
--   (SELECT COUNT(*) FROM public.quotes q WHERE q.client_id = c.id) as quote_count
-- FROM public.clients c
-- ORDER BY created_at DESC;
