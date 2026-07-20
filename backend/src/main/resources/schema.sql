-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. USERS & PROFILES
-- =========================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CONSTRAINT chk_user_role CHECK (role IN ('client', 'professional', 'admin')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    assessment_credits_remaining INT DEFAULT 3 NOT NULL,
    credits_reset_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS professionals (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    specializations VARCHAR(100)[] NOT NULL DEFAULT '{}',
    hourly_rate DECIMAL(10, 2) NOT NULL,
    operating_locations VARCHAR(100)[] NOT NULL DEFAULT '{}',
    availability_status VARCHAR(50) NOT NULL DEFAULT 'available' CONSTRAINT chk_prof_availability CHECK (availability_status IN ('available', 'unavailable', 'suspended')),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'unverified' CONSTRAINT chk_prof_verification CHECK (verification_status IN ('unverified', 'rejected', 'verified')),
    base_score INT NOT NULL DEFAULT 100 CONSTRAINT chk_prof_base_score CHECK (base_score BETWEEN 0 AND 100),
    ai_adjustment INT DEFAULT 0 CONSTRAINT chk_prof_ai_adjustment CHECK (ai_adjustment BETWEEN -15 AND 15),
    trust_score INT NOT NULL DEFAULT 100 CONSTRAINT chk_prof_trust_score CHECK (trust_score BETWEEN 0 AND 100),
    last_ai_review_at TIMESTAMP WITH TIME ZONE,
    completed_jobs_count INT DEFAULT 0 NOT NULL
);

-- =========================================================================
-- 2. JOBS & BOOKINGS
-- =========================================================================

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    min_duration INT NOT NULL, -- in hours
    max_duration INT NOT NULL, -- in hours
    requirements JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. [{"type": "bodyguard", "count": 2}]
    staffing_status VARCHAR(50) NOT NULL DEFAULT 'partial' CONSTRAINT chk_job_staffing CHECK (staffing_status IN ('partial', 'full', 'confirmed')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CONSTRAINT chk_job_status CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id),
    professional_id UUID NOT NULL REFERENCES professionals(id),
    job_description TEXT,
    location VARCHAR(255) NOT NULL,
    min_duration INT NOT NULL,
    max_duration INT NOT NULL,
    actual_hours DECIMAL(5, 2),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CONSTRAINT chk_booking_status CHECK (status IN ('pending', 'accepted', 'active', 'completed', 'settled', 'declined', 'disputed')),
    slot_type VARCHAR(100) NOT NULL,
    declined_professionals UUID[] NOT NULL DEFAULT '{}',
    incidents_locked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 3. DOCUMENTS & ASSESSMENTS
-- =========================================================================

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_url VARCHAR(512) NOT NULL,
    extracted_fields JSONB DEFAULT '{}'::jsonb NOT NULL,
    confidence_score DECIMAL(5, 2),
    flags JSONB DEFAULT '[]'::jsonb NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending_review' CONSTRAINT chk_doc_status CHECK (status IN ('pending_review', 'approved', 'rejected')),
    reviewed_by_admin_id UUID REFERENCES users(id),
    rejection_reason TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expiry_date DATE
);

CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id),
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    attendance INT NOT NULL,
    duration_range VARCHAR(100) NOT NULL,
    concerns TEXT,
    ai_recommendation JSONB DEFAULT '{}'::jsonb NOT NULL,
    matched_professionals JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 4. INCIDENTS & REPORTS (IMMUTABLE TABLES)
-- =========================================================================

CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    professional_id UUID NOT NULL REFERENCES professionals(id),
    incident_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    photo_url VARCHAR(512),
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    severity VARCHAR(50) NOT NULL CONSTRAINT chk_incident_severity CHECK (severity IN ('Low', 'Medium', 'High')),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    location_mismatch BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    report_url VARCHAR(512) NOT NULL,
    incident_count INT NOT NULL DEFAULT 0,
    has_high_severity BOOLEAN NOT NULL DEFAULT FALSE,
    generation_status VARCHAR(50) NOT NULL DEFAULT 'pending' CONSTRAINT chk_report_gen_status CHECK (generation_status IN ('pending', 'generating', 'complete', 'failed')),
    retry_count INT DEFAULT 0 NOT NULL,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    triggered_by VARCHAR(50) NOT NULL CONSTRAINT chk_report_trigger CHECK (triggered_by IN ('auto', 'admin_manual'))
);

-- =========================================================================
-- 5. PAYMENTS & DISPUTES
-- =========================================================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    client_id UUID NOT NULL REFERENCES users(id),
    professional_id UUID NOT NULL REFERENCES professionals(id),
    max_amount_held DECIMAL(10, 2) NOT NULL,
    actual_hours DECIMAL(5, 2),
    amount_due DECIMAL(10, 2),
    platform_fee DECIMAL(10, 2),
    professional_payout DECIMAL(10, 2),
    client_refund DECIMAL(10, 2),
    paystack_reference VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'held' CONSTRAINT chk_payment_status CHECK (status IN ('held', 'released', 'disputed', 'refunded')),
    auto_confirmed BOOLEAN DEFAULT FALSE NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    raised_by UUID NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    evidence_urls JSONB DEFAULT '[]'::jsonb NOT NULL,
    admin_ruling TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- =========================================================================
-- 6. MONITORING, AUDITING & SETTINGS
-- =========================================================================

CREATE TABLE IF NOT EXISTS anomaly_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    professional_id UUID NOT NULL REFERENCES professionals(id),
    anomaly_type VARCHAR(100) NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    gps_at_flag VARCHAR(100),
    expected_location VARCHAR(255),
    admin_action VARCHAR(50) CONSTRAINT chk_anomaly_admin_action CHECK (admin_action IN ('confirmed', 'dismissed')),
    dismissal_reason TEXT,
    resolved BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS anomaly_pattern_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    risk_level VARCHAR(50) NOT NULL CONSTRAINT chk_anomaly_pattern_risk CHECK (risk_level IN ('low', 'medium', 'high')),
    pattern_detected BOOLEAN NOT NULL DEFAULT FALSE,
    summary TEXT,
    recommended_action VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS location_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value VARCHAR(255) NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS score_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    base_score_at_review INT NOT NULL,
    adjustment INT NOT NULL,
    rationale TEXT NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 7. TRIGGERS FOR IMMUTABILITY
-- =========================================================================

-- Trigger function to reject updates or deletes
CREATE OR REPLACE FUNCTION prevent_update_or_delete()
RETURNS TRIGGER AS '
BEGIN
    RAISE EXCEPTION ''Updates and deletions are not allowed on this immutable table.'';
END;
' LANGUAGE plpgsql;

-- Apply to incidents table
DROP TRIGGER IF EXISTS trg_incidents_immutable ON incidents;
CREATE TRIGGER trg_incidents_immutable
BEFORE UPDATE OR DELETE ON incidents
FOR EACH ROW
EXECUTE FUNCTION prevent_update_or_delete();

-- Apply to payments table
DROP TRIGGER IF EXISTS trg_payments_immutable ON payments;
CREATE TRIGGER trg_payments_immutable
BEFORE UPDATE OR DELETE ON payments
FOR EACH ROW
EXECUTE FUNCTION prevent_update_or_delete();

-- =========================================================================
-- 8. INDEXES
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_bookings_job_id ON bookings(job_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_professional_id ON bookings(professional_id);

CREATE INDEX IF NOT EXISTS idx_incidents_booking_id ON incidents(booking_id);
CREATE INDEX IF NOT EXISTS idx_incidents_professional_id ON incidents(professional_id);

CREATE INDEX IF NOT EXISTS idx_documents_professional_id ON documents(professional_id);

CREATE INDEX IF NOT EXISTS idx_location_logs_booking_prof ON location_logs(booking_id, professional_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_professionals_trust_score ON professionals(trust_score) WHERE verification_status = 'verified' AND availability_status = 'available';

CREATE INDEX IF NOT EXISTS idx_documents_pending ON documents(status) WHERE status = 'pending_review';
CREATE INDEX IF NOT EXISTS idx_anomaly_flags_unresolved ON anomaly_flags(resolved) WHERE resolved = FALSE;
