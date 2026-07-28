-- =========================================================================
-- Sentri Platform — Master Seed Data Script
-- =========================================================================

-- 1. SYSTEM SETTINGS
INSERT INTO settings (key, value, description) VALUES
  ('anomaly.location_departure_meters', '500', 'Maximum radius deviation before flagging location departure anomaly'),
  ('anomaly.inactivity_minutes', '45', 'Inactivity duration threshold for guard location updates'),
  ('anomaly.rapid_abandonment_minutes', '15', 'Threshold for rapid guard job abandonment post-acceptance'),
  ('anomaly.late_start_minutes', '20', 'Grace period after shift start time before late start flag'),
  ('anomaly.checkin_interval_minutes', '30', 'Required periodic checkin frequency for active guards'),
  ('sentri.score.max-ai-adjustment', '15', 'Maximum score adjustment range for AI behavioral reviews')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. USERS (ADMIN, CLIENTS, PROFESSIONALS)

-- 2a. Command Admin User
INSERT INTO users (id, email, role, full_name, phone, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@sentri.com', 'admin', 'Sentri Command Admin', '+233200000001', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 2b. Client Users
INSERT INTO users (id, email, role, full_name, phone, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'client.kwame@sentri.com', 'client', 'Kwame Darko', '+233240000001', CURRENT_TIMESTAMP),
  ('11111111-1111-1111-1111-111111111112', 'client.abena@sentri.com', 'client', 'Abena Osei', '+233240000002', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO clients (id, assessment_credits_remaining, credits_reset_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 3, CURRENT_TIMESTAMP + INTERVAL '1 month'),
  ('11111111-1111-1111-1111-111111111112', 5, CURRENT_TIMESTAMP + INTERVAL '1 month')
ON CONFLICT (id) DO NOTHING;

-- 2c. Professional Guard Users
INSERT INTO users (id, email, role, full_name, phone, created_at) VALUES
  ('22222222-2222-2222-2222-222222222221', 'pro.kwame@sentri.com', 'professional', 'Kwame Mensah', '+233260000001', CURRENT_TIMESTAMP),
  ('22222222-2222-2222-2222-222222222222', 'pro.kofi@sentri.com', 'professional', 'Kofi Owusu', '+233260000002', CURRENT_TIMESTAMP),
  ('22222222-2222-2222-2222-222222222223', 'pro.abena@sentri.com', 'professional', 'Abena Appiah', '+233260000003', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO professionals (
  id, bio, specializations, hourly_rate, operating_locations, availability_status, 
  verification_status, base_score, ai_adjustment, trust_score, completed_jobs_count
) VALUES
  (
    '22222222-2222-2222-2222-222222222221',
    '5+ years tactical experience in close VIP bodyguard detail, crowd management, and venue perimeter security across Greater Accra.',
    ARRAY['VIP ESCORT & CLOSE PROTECTION', 'EVENT PERIMETER SECURITY'],
    120.00,
    ARRAY['Accra Central', 'East Legon'],
    'available',
    'verified',
    96,
    0,
    96,
    142
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Crowd control and tactical venue security specialist with extensive multi-day event protection experience.',
    ARRAY['CROWD CONTROL & VENUE', 'STATIC GUARD DUTY'],
    85.00,
    ARRAY['Labadi', 'Osu', 'Kumasi'],
    'available',
    'verified',
    92,
    0,
    92,
    98
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    'Static guard duty & asset protection specialist. Certified close-quarters protective agent.',
    ARRAY['STATIC GUARD & ASSET PROTECTION', 'VIP ESCORT'],
    90.00,
    ARRAY['Tema Industrial', 'Accra Central'],
    'available',
    'verified',
    94,
    0,
    94,
    115
  )
ON CONFLICT (id) DO NOTHING;

-- 3. JOBS & BOOKINGS

INSERT INTO jobs (
  id, client_id, title, description, location, date, min_duration, max_duration, requirements, staffing_status, status, created_at
) VALUES
  (
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    'Labadi Beach Event Guarding',
    'VIP Party Perimeter Control & Entry Point Access Security',
    'Labadi Beach Resort, Accra',
    CURRENT_DATE,
    6,
    8,
    '[{"type": "bodyguard", "count": 2}]'::jsonb,
    'confirmed',
    'active',
    CURRENT_TIMESTAMP
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111112',
    'Airport Area VIP Escort',
    'High-profile executive arrival transport & close protection escort',
    'Airport Residential Area, Accra',
    CURRENT_DATE + 1,
    4,
    6,
    '[{"type": "close_protection", "count": 1}]'::jsonb,
    'partial',
    'pending',
    CURRENT_TIMESTAMP
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (
  id, job_id, client_id, professional_id, job_description, location, min_duration, max_duration, status, slot_type, created_at
) VALUES
  (
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'VIP Escort & Close Protection',
    'Labadi Beach Resort, Accra',
    6,
    8,
    'active',
    'VIP Escort',
    CURRENT_TIMESTAMP
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Perimeter Crowd Security',
    'Labadi Beach Resort, Accra',
    6,
    8,
    'pending',
    'Perimeter Security',
    CURRENT_TIMESTAMP
  )
ON CONFLICT (id) DO NOTHING;

-- 4. PAYMENTS & ESCROW
INSERT INTO payments (
  id, booking_id, client_id, professional_id, max_amount_held, status, auto_confirmed
) VALUES
  (
    '55555555-5555-5555-5555-555555555551',
    '44444444-4444-4444-4444-444444444441',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    720.00,
    'held',
    FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- 5. VERIFICATION DOCUMENTS
INSERT INTO documents (
  id, professional_id, document_type, file_url, extracted_fields, confidence_score, flags, status, uploaded_at
) VALUES
  (
    '66666666-6666-6666-6666-666666666661',
    '22222222-2222-2222-2222-222222222221',
    'national_id',
    'https://sentri-mock.supabase.co/storage/v1/object/public/documents/kwame_id.pdf',
    '{"id_number": "GHA-72940294-1", "name": "Kwame Mensah"}'::jsonb,
    98.50,
    '[]'::jsonb,
    'approved',
    CURRENT_TIMESTAMP
  )
ON CONFLICT (id) DO NOTHING;

-- 6. SCORE REVIEWS
INSERT INTO score_reviews (
  id, professional_id, base_score_at_review, adjustment, rationale, reviewed_at
) VALUES
  (
    '77777777-7777-7777-7777-777777777771',
    '22222222-2222-2222-2222-222222222221',
    96,
    0,
    'Claude AI weekly review: Consistent on-time arrival and zero geofence anomalies across 142 deployments.',
    CURRENT_TIMESTAMP
  )
ON CONFLICT (id) DO NOTHING;
