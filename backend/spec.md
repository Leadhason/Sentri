# Sentri — Backend Specification
### Smart Security Operations Platform — Spring Boot Backend
Group 24, KNUST — Consolidated Engineering Spec (supersedes/extends the original project document)

---

## 0. Purpose of This Document

This document consolidates every backend decision made during design sessions for Sentri,
covering all 8 core features plus the deliberate deviations from the original academic
specification document. It is written to be implementation-ready: endpoints, data model,
business logic, scheduled jobs, and edge cases are all specified in full. Where this document
differs from the original KNUST spec PDF, the difference is called out explicitly.

**Deliberate deviations from the original spec doc:**
- **Voice/video calling** between client and professional is added as an in-scope feature
  (the original doc lists this as out of scope). Implemented via a third-party SDK (e.g. Stream),
  gated behind an existing booking.
- **Multi-guard jobs** introduce a `Job` entity as a first-class abstraction above `Booking`,
  which the original spec's 1-to-1 client–professional booking model did not account for.
- **Escrow is per-booking, not per-job** — each professional on a job has an independent
  Paystack hold, payout, and refund cycle.
- **`professionals.verification_status`** uses three explicit enum values
  (`unverified`, `rejected`, `verified`) rather than the four-value version in the original doc
  (`unverified`, `pending`, `verified`, `rejected`) — "pending" is represented at the
  document level (`documents.status = pending_review`), not the professional level.
- **Behavioral Risk Scoring (Feature 4)** uses a two-layer model — deterministic formula +
  bounded AI adjustment — rather than a single AI-generated score as in the original doc.

---

## 1. Architecture & Responsibility Split

### Backend (Spring Boot) owns:
- All database operations (Neon PostgreSQL via JPA/Hibernate)
- Business logic — booking/job state machines, escrow calculations, fee splits, refunds
- All Claude API calls (threat assessment, document verification, behavioral scoring,
  report generation, anomaly pattern analysis)
- Scheduled/background jobs (see §10)
- Payment processing — all Paystack interactions. Frontend never talks to Paystack directly
- PDF generation — built and stored server-side
- File handling — backend stores resulting Supabase Storage URLs; frontend uploads directly
  to Supabase via signed URL
- Push notifications — all FCM calls originate from backend
- Auth enforcement — JWT validation and role-based access control on every endpoint
- Anomaly flagging — polling, threshold comparisons, flag writes, admin alerts

### Frontend (React Native/Expo) owns:
- All screens, forms, navigation for all three roles (Client, Professional, Admin)
- Supabase Auth session management — login, register, token storage, JWT on every request
- Direct-to-Supabase Storage uploads (documents, incident photos) via signed URL provided
  by the backend
- Background GPS via `expo-location` during active jobs — sent to backend, never acted on
  client-side
- Real-time incident feed display (polling or websocket to backend)
- Rendering AI-generated content the backend returns (trust scores, assessments, reports)
- FCM token registration — frontend obtains device token, sends to backend

**The clean rule:** if it touches data, money, AI, or makes a decision — it's backend.
If it shows something to a user or captures input — it's frontend. The frontend holds no
state beyond the current session and should be fully testable against the API via
Postman/cURL before a single screen is built.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native (Expo) |
| Backend | Spring Boot (Java), Gradle |
| Database | Neon PostgreSQL (via JPA/Hibernate) |
| File Storage | Supabase Storage |
| Authentication | Supabase Auth |
| Payments | Paystack |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| AI | Claude API (Anthropic) |
| Voice/Video Calling | Third-party SDK (e.g. Stream) — deliberate addition |
| Background Location | expo-location |
| Backend Hosting | Railway |

Package namespace: `com.knust.group24.sentri`. UI theme: dark/charcoal with gold accent.

---

## 3. Core Data Model (Full Schema)

> This reflects the schema as it evolved across all 8 features, including every addition
> made beyond the original spec doc's baseline tables.

### `users`
`id, email, role (client / professional / admin), full_name, phone, created_at`

### `clients`
- `assessment_credits_remaining` — integer, default `3`
- `credits_reset_at` — timestamp, set to `created_at + 1 month` on account creation, advanced
  by `+1 month` from its own prior value (not `now()`) on each reset to avoid date drift

### `professionals` (extends `professional_profiles` from original doc)
`id, user_id, bio, specializations[], hourly_rate, operating_locations[], availability_status`
- `verification_status` — enum: `unverified`, `rejected`, `verified`
- `base_score` — integer, deterministic formula output (Feature 4)
- `ai_adjustment` — integer, nullable, last AI review's delta, clamped ±15
- `trust_score` — integer, computed `= clamp(base_score + ai_adjustment, 0, 100)` — this is
  what all eligibility checks read
- `last_ai_review_at` — timestamp
- `completed_jobs_count`

### `jobs` — **new entity, not in original spec**
`id, client_id, title, description, location, date, min_duration, max_duration, created_at`
- `requirements` — JSON array of slot requirements from the AI assessment,
  e.g. `[{ "type": "bodyguard", "count": 2 }, ...]`
- `staffing_status` — enum: `partial`, `full`, `confirmed`
- `status` — overall job status, derived from aggregate booking state

### `bookings`
`id, job_id (FK), client_id, professional_id, job_description, location, min_duration,`
`max_duration, actual_hours, start_time, end_time, created_at`
- `status` — enum: `pending → accepted → active → completed → settled`, with `declined` and
  `disputed` branches. Enforced strictly server-side; no role can skip a transition.
- `slot_type` — the recommended personnel type this booking fills (from the assessment),
  used to query replacements on decline
- `declined_professionals` — array of professional IDs who have already declined this slot
- `incidents_locked` — boolean, default `false`, set `true` when booking → `completed`.
  Never reverted.

### `documents`
`id, professional_id, document_type, file_url, extracted_fields (JSON), confidence_score,`
`flags (JSON), uploaded_at, expiry_date`
- `status` — enum: `pending_review`, `approved`, `rejected`
- `reviewed_by_admin_id`
- `rejection_reason`
- Rejected documents are never deleted/overwritten — kept for audit trail. Re-submission
  creates a new row against the same `document_type` slot.

### `assessments`
`id, client_id, job_id (nullable), event_type, location, attendance, duration_range,`
`concerns, ai_recommendation (JSON), matched_professionals (JSON), created_at`

### `incidents` — **append-only, DB-trigger enforced**
`id, booking_id, professional_id, incident_type, description, photo_url, latitude, longitude,`
`severity (Low/Medium/High), logged_at (server-side only), location_mismatch (boolean)`
- No `UPDATE` or `DELETE` permitted by any role, including admin. Enforced via a Postgres
  trigger that rejects those operations at the database level — backend-layer enforcement
  alone is not treated as sufficient.

### `reports`
`id, job_id, generated_at, report_url, incident_count, has_high_severity`
- `generation_status` — enum: `pending`, `generating`, `complete`, `failed`
- `retry_count` — integer, default `0`
- `last_attempt_at` — timestamp
- `triggered_by` — enum: `auto`, `admin_manual`
- Immutable once `complete` — no regeneration, no editing.

### `payments`
`id, booking_id, client_id, professional_id, max_amount_held, actual_hours, amount_due,`
`platform_fee, professional_payout, client_refund, paystack_reference, auto_confirmed,`
`confirmed_at`
- `status` — enum: `held`, `released`, `disputed`, `refunded`
- One row **per booking** (per-booking escrow model — see §9)
- Immutable — no update/delete permitted on this table

### `disputes`
`id, booking_id, raised_by, reason, evidence_urls (JSON), admin_ruling, resolved_at`

### `anomaly_flags`
`id, booking_id, professional_id, anomaly_type, detected_at, last_detected_at, gps_at_flag,`
`expected_location, admin_action (confirmed/dismissed), dismissal_reason, resolved`

### `anomaly_pattern_analysis` — **new, not in original spec**
`id, professional_id, analysis_date, risk_level, pattern_detected, summary,`
`recommended_action, created_at`

### `checkins` — **new, not in original spec**
`id, booking_id, professional_id, checked_in_at`

### `location_logs`
`id, professional_id, booking_id, latitude, longitude, recorded_at`
- Purged after 30 days, **except** records attached to bookings with unresolved anomaly
  flags or active disputes — those persist until resolution.

### `settings` — **new, not in original spec**
`id, key, value, description, updated_by, updated_at`
- Stores all anomaly detection thresholds as individual key-value rows
  (`anomaly.location_departure_meters`, `anomaly.inactivity_minutes`, etc.) plus the
  check-in interval. Read at runtime by the polling job — never hardcoded.

### `score_reviews` — **new, audit trail for Feature 4**
`id, professional_id, base_score_at_review, adjustment, rationale, reviewed_at`

---

## 4. Feature 1 — Browse & Hire

### Endpoints

| Method | Path | Who | Description |
|---|---|---|---|
| GET | `/api/professionals` | Client | Paginated, filtered list of verified professionals |
| GET | `/api/professionals/{id}` | Client | Full profile |
| GET | `/api/professionals/me` | Professional | Own profile |
| PATCH | `/api/professionals/me` | Professional | Update rate, availability, specializations, locations |
| POST | `/api/jobs` | Client | Creates a Job with event details and requirements |
| POST | `/api/jobs/{jobId}/bookings` | Client | Adds an individual professional booking to a job |
| GET | `/api/jobs/{jobId}` | Client | Job with all its bookings and their statuses |
| GET | `/api/bookings/{id}` | Client/Professional | Booking detail |
| PATCH | `/api/bookings/{id}/accept` | Professional | `pending → accepted` |
| PATCH | `/api/bookings/{id}/decline` | Professional | `pending → declined`, triggers replacement flow |
| POST | `/api/bookings/{id}/call/initiate` | Client | Creates a call room via third-party SDK, returns token |

### Query Parameters — `GET /api/professionals`
`city`, `specialization`, `available` (boolean), `min_rate`, `max_rate`, `page`, `size`

### Booking State Machine
```
pending → accepted → active → completed → settled
       ↘ declined
                    ↘ disputed
```
Enforced entirely server-side. Every `PATCH` validates current status before allowing
transition — no role can jump states arbitrarily.

### The Job Entity (multi-guard support)
A `Job` represents the actual engagement (event, location, date, requirements). A `Booking`
is a single professional's assignment within it. Even single-guard hires create a Job with
one Booking underneath, for consistency.

- `POST /api/jobs` — client specifies event details and how many guards of what type
- `POST /api/jobs/{jobId}/bookings` — client adds individual professionals, one booking each
- `staffing_status` reflects aggregate booking state (`partial` until every slot is `accepted`)
- **Rule:** a job cannot transition to `active` until `staffing_status = full` — every slot
  must have an accepted booking.

### Business Logic
- Bookable only if `verification_status = verified` AND `availability_status = available`
  AND `trust_score >= 40`
- A professional with an unresolved disputed payment cannot accept new bookings — checked
  at `PATCH /accept`
- Booking creation calculates and stores `max_amount = max_duration × hourly_rate`, feeding
  directly into Feature 8 (escrow)
- Professional gets FCM push on new booking request
- Auto-expiry to `declined` via scheduled job if no response within the response window

### Voice/Video Call Feature (deliberate deviation)
- Architecture: third-party SDK (Stream, Daily.co, or Agora) rather than self-managed WebRTC.
  Backend footprint is minimal — one endpoint creates a room/token via the provider's REST API.
- `POST /api/bookings/{id}/call/initiate` — validates a booking exists in `pending` or
  `accepted` status (never before a booking exists, never after a job goes `active`),
  creates the room, returns token to both parties, sends FCM push to the professional.
- Call duration capped via the third-party SDK's own configuration.
- Calls require an existing booking — no cold-calling from the browse screen, to prevent spam.

### Multi-Guard Client Experience (summary screen)
Client sees one unified "Confirm & Pay" screen showing all selected professionals and their
individual costs, totalling to one number — even though multiple Paystack charges fire
under the hood (see §9). Post-job, client sees one unified confirmation prompt across all
guards on the job, with per-guard hours/amounts and a single net refund total.

### Data Touched
`professionals`, `bookings`, `jobs`, `payments` (max_amount pre-written at booking creation)

---

## 5. Feature 2 — AI Threat & Needs Assessment

### Endpoints

| Method | Path | Who | Description |
|---|---|---|---|
| POST | `/api/assess` | Client | Sends situational input to Claude, gets risk assessment + auto-matched professionals |
| GET | `/api/assess/{id}` | Client | Retrieves a previously generated assessment (free, no credit cost) |
| POST | `/api/jobs/from-assessment/{assessmentId}` | Client | Converts an accepted assessment into a real Job + pre-generated bookings |

### Request → Claude
```json
{
  "event_type": "private_event",
  "location": "Accra",
  "date": "2026-07-14",
  "duration_hours": 6,
  "attendee_count": 150,
  "description": "Free-text situational details"
}
```
Backend requests **strict JSON output only** — no preamble — since the response is piped
directly into a matching query, not shown raw to the user.

### Claude's Response Shape
```json
{
  "risk_level": "moderate",
  "risk_flags": ["large_crowd", "public_venue", "vip_presence"],
  "recommended_personnel": [
    { "type": "bodyguard", "count": 2, "rationale": "..." },
    { "type": "crowd_control", "count": 4, "rationale": "..." }
  ],
  "recommendations_summary": "Short client-facing explanation"
}
```

### Backend Post-Processing (AI-Assisted Personnel Selection)
Immediately after Claude responds, the backend runs one matching query per recommended
slot type: `verification_status = verified`, `availability_status = available`,
`trust_score >= 40`, operating location matches job location, ranked by trust score,
top N returned per slot. Both the AI output and matched professionals are bundled into one
response and persisted to `assessments` so the client can revisit without re-calling Claude.

Client sees a fully pre-selected team (not just recommended types) and can accept as-is,
swap an individual, or remove a slot. One tap converts the whole assessment into a Job with
bookings pre-generated in `pending` status.

**Constraint:** AI-selected professionals still individually accept their booking requests.
Pre-selection never bypasses that.

### Auto-Replacement on Decline
1. Booking → `declined`
2. Backend immediately re-queries for the next best match — same criteria, excluding
   everyone already on the job and everyone in `declined_professionals` for that slot
3. `replacement_suggestion` written to the job record for that slot
4. Client FCM push: "One of your selected guards declined. We found a replacement to review."
5. Client taps **Accept Replacement** (new booking created, request sent) or
   **Find Manually** (slot opens, client browses and picks themselves)
6. If the replacement also declines, the cycle repeats
7. **No match found:** client notified immediately, no auto-suggestion shown — must select
   manually or reduce guard count

### Assessment Credits — 3 per client, resets monthly
Implemented via **scheduled job**, not lazy/on-request reset.

```
AssessmentCreditResetJob — @Scheduled, daily at 3am

SELECT * FROM clients WHERE credits_reset_at <= now()

for each client:
    client.assessment_credits_remaining = 3
    client.credits_reset_at = client.credits_reset_at + 1 month   // anchored to prior value, not now()
```
Anchoring to the client's own prior `credits_reset_at` (rather than `now()`) prevents the
reset date drifting later each cycle if the job runs a few hours late.

Enforcement in `POST /api/assess`:
```
if client.assessment_credits_remaining <= 0:
    return 403 { "error": "no_assessment_credits", "next_reset": client.credits_reset_at }

client.assessment_credits_remaining -= 1
# proceed to call Claude
```
- Credit is decremented **before** the Claude call, but **refunded** if the Claude call
  hard-fails (not just malformed JSON) — infrastructure failures shouldn't cost the client
  a credit.
- `GET /api/assess/{id}` and the staleness re-query on conversion are both free — they don't
  hit Claude or consume a credit.

### Business Rules
- An assessment is not a booking — nothing charged, no professional notified, until
  explicit conversion via `/api/jobs/from-assessment/{id}`
- Assessments can go stale (availability drifts) — converting a stale one re-runs the
  matching query only (not the Claude call) to refresh professional picks
- Claude call failure: retry once, then generic error — client can still fill the job manually

### Data Touched
`assessments` (new), `professionals` (read-only for matching), `jobs`/`bookings` (on conversion)

---

## 6. Feature 3 — AI Document Verification & Credentialing

### Endpoints

| Method | Path | Who | Description |
|---|---|---|---|
| POST | `/api/professionals/me/documents` | Professional | Registers uploaded doc, triggers AI extraction |
| GET | `/api/professionals/me/documents` | Professional | Lists own documents and status |
| GET | `/api/admin/documents/pending` | Admin | Documents awaiting manual review |
| GET | `/api/admin/documents/{id}` | Admin | Full detail — file, extracted data, confidence flags |
| PATCH | `/api/admin/documents/{id}/approve` | Admin | Approves; may flip professional to `verified` |
| PATCH | `/api/admin/documents/{id}/reject` | Admin | Rejects with reason; professional flips to `rejected` |

### Upload Flow
1. Frontend requests a signed upload URL from Supabase Storage
2. Frontend uploads the file directly to Supabase
3. Frontend calls `POST /api/professionals/me/documents` with the resulting URL and
   `document_type` (`national_id`, `security_license`, `background_check`, etc.)
4. Backend fetches the file and calls Claude vision, requesting structured JSON extraction
5. Extracted data + confidence flags stored; document `status = pending_review`

### Claude's Response Shape
```json
{
  "extracted_fields": {
    "full_name": "Kwame Mensah",
    "id_number": "GHA-123456789-0",
    "expiry_date": "2028-03-01",
    "document_type_detected": "national_id"
  },
  "confidence": "high",
  "flags": ["expiry_date_unclear", "possible_tampering"],
  "matches_profile_name": true
}
```
The professional's registered name is passed into the prompt so Claude can flag a name
mismatch directly rather than requiring manual admin cross-check.

### Business Logic
- `confidence: "low"` or any non-empty `flags` → never auto-approved, always `pending_review`
- Even `confidence: "high"` with no flags still routes to `pending_review` by default —
  extraction assists the admin, doesn't replace them (auto-approve path is a future
  consideration once extraction reliability data exists, not at launch)
- `verification_status = verified` only once **all required document types** for the role
  are individually `approved`
- **Rejection is destructive to overall status but not to other documents:**
  - Rejecting any single document immediately flips `professionals.verification_status = rejected`
  - Only the rejected `document_type` slot needs re-submission — other already-approved
    documents keep their `approved` status untouched
  - Re-submission creates a **new row** (not an overwrite) under the same `document_type`,
    goes through the same extraction → `pending_review` → admin decision cycle
  - On approval of the resubmission, backend re-checks "are all required types now
    approved?" — if yes, flips to `verified`; if other rejected slots remain, stays `rejected`

### `professionals.verification_status` — full state logic
```
On document reject:
    document.status = 'rejected'
    professional.verification_status = 'rejected'

On document approve:
    document.status = 'approved'
    if all required document_types are 'approved':
        professional.verification_status = 'verified'
    else if professional has any document with status = 'rejected':
        professional.verification_status stays 'rejected'
    else:
        professional.verification_status = 'unverified'   // still mid-review, nothing rejected

On new document submitted for a previously-rejected slot:
    document.status = 'pending_review'
    // verification_status stays 'rejected' until admin acts again
```

### Data Touched
`documents` (new fields: `status`, `reviewed_by_admin_id`, `rejection_reason`),
`professionals.verification_status`

### Notifications
FCM push to professional on approve/reject. Admin dashboard shows pending-document badge count.

---

## 7. Feature 4 — Behavioral Risk Scoring

Two-layer model: deterministic base score (real-time, cheap) + bounded AI adjustment
(periodic, catches nuance).

### Layer 1 — Deterministic Base Score
Recalculated immediately on any relevant event (booking settled, incident logged, dispute
raised, response timeout, etc.) — no AI call, pure weighted arithmetic.
```
base_score = 100
  - (missed_response_penalty × late_responses)
  - (decline_rate_penalty × decline_rate)
  - (incident_severity_penalty × weighted_incident_count)
  - (dispute_penalty × unresolved_disputes)
  - (anomaly_penalty × confirmed_anomaly_flags)
  + (completion_bonus × completed_jobs_streak)
```
This is what gates the `>= 40` browse-eligibility check in real time, with no lag.

### Layer 2 — AI-Assisted Periodic Review
```
TrustScoreReviewJob — @Scheduled, every Monday 4am
(runs after the Feature 7 AnomalyPatternAnalysisJob so it reviews current-week signal)

SELECT * FROM professionals
WHERE base_score BETWEEN 32 AND 48                          -- ±8 boundary band around 40
   OR last_ai_review_at IS NULL
   OR last_ai_review_at <= now() - INTERVAL '7 days'         -- staleness catch-all

for each:
    assemble job history, incidents, disputes, anomaly history
    call Claude → { adjustment, rationale, confidence }
    ai_adjustment = clamp(adjustment, -15, +15)
    trust_score = clamp(base_score + ai_adjustment, 0, 100)
    write to score_reviews (audit trail)
    last_ai_review_at = now()
```

**Why bounded, not AI-computed-from-scratch:** a fully AI-generated number is
non-reproducible and hard to explain or dispute. A capped adjustment on a transparent
formula means every professional's score is explainable — mostly formula, occasionally
nudged by a qualitative pattern the formula can't weight (e.g. correlated incident +
unresponsiveness patterns).

**Why ±8 band, not wider/narrower:** wider (e.g. ±15) pulls in professionals whose grade
bracket won't change either way — spend without decision value. Narrower (e.g. ±5) risks
missing professionals trending toward the threshold before they actually cross it.

**Why weekly, aligned to Feature 7's Monday job:** one less distinct schedule to reason
about; that week's anomaly confirmations feed the base score before the AI reviews it,
so the AI sees current data, not a stale mid-week snapshot; keeps AI spend predictable
and batched.

### Claude Response Shape
```json
{
  "adjustment": -6,
  "rationale": "Pattern of on-time completions but two incidents both involving unresponsiveness during active jobs — formula doesn't weight this pattern correlation.",
  "confidence": "high"
}
```

### Endpoints

| Method | Path | Who | Description |
|---|---|---|---|
| GET | `/api/professionals/me/score` | Professional | Current score + plain-language breakdown |
| GET | `/api/admin/professionals/{id}/score-history` | Admin | Full audit trail — base score changes, AI reviews, rationale |

### Data Touched
`professionals` (`base_score`, `ai_adjustment`, `trust_score`, `last_ai_review_at`),
`score_reviews` (new, audit trail)

---

## 8. Feature 5 — Incident Logging

### Endpoints

| Method | Path | Who | Description |
|---|---|---|---|
| POST | `/api/bookings/{id}/incidents` | Professional | Logs a new incident against an active booking |
| GET | `/api/bookings/{id}/incidents` | Client/Professional | Incidents for one booking, chronological |
| GET | `/api/jobs/{jobId}/incidents` | Client | Unified feed across all bookings under a job |
| POST | `/api/bookings/{id}/incidents/photo-url` | Professional | Signed Supabase upload URL for a photo |
| GET | `/api/admin/incidents` | Admin | All incidents, filterable |
| GET | `/api/admin/incidents/{id}` | Admin | Single incident, full detail |

**No update or delete endpoint exists for incidents, for any role including admin.**

### Flow
1. **(Optional) Photo upload:** frontend calls `photo-url` → backend validates booking is
   `active` and professional is assigned → returns signed Supabase upload URL → frontend
   uploads → frontend gets storage URL, includes it in the incident submission
2. **Submission:**
```json
{
  "incident_type": "Unauthorized Access Attempt",
  "description": "Individual attempted to enter VIP section without wristband. Escorted out without resistance.",
  "photo_url": "https://supabase.../incidents/uuid.jpg",
  "latitude": 6.6885,
  "longitude": -1.6244
}
```
3. **Backend processing, in order:**
   - Validates booking status is strictly `active` — rejects any other status
   - Validates submitting professional is assigned to this booking
   - Auto-assigns severity:
     - **High:** Physical Altercation, Medical Emergency
     - **Medium:** Unauthorized Access Attempt, Property Damage
     - **Low:** Suspicious Activity, Noise or Disturbance, Crowd Control Issue,
       Client Request, Other
   - Writes record with `logged_at = now()` server-side — frontend timestamp never trusted
   - Returns created record immediately
4. **Notifications (async, don't block the response):**
   - Client FCM push on every log
   - If `severity = High` — admin also gets an immediate separate FCM push with booking ID,
     professional ID, incident type, GPS

### Unified Job Feed
`GET /api/jobs/{jobId}/incidents` merges incidents across all bookings under a job into one
chronological list, each annotated with `professional_name` so the client knows which guard
logged what — no sense of separate bookings in the client's view.

### Record Locking
On booking → `completed`, backend sets `incidents_locked = true`. Every incident write
endpoint checks this flag first; `403` regardless of caller if locked. **Enforced at the
service layer AND via a Postgres trigger rejecting `UPDATE`/`DELETE` on the table** —
backend-layer enforcement alone is not treated as sufficient for legal-evidence immutability.

### Business Rules
- `incident_type` validated against the fixed list; `Other` requires non-empty `description`
- Submitted GPS cross-referenced against `location_logs`; significant mismatch sets
  `location_mismatch = true` on the record
- Photo URLs validated to point to the Sentri Supabase bucket — external URLs rejected
- Records retained permanently, no purge — legal evidence
- No deduplication — two incidents of the same type in the same booking are two records
- Admin can filter by date, booking, professional, severity, type

### Data Touched
`incidents` (new writes only), `bookings.incidents_locked`, `location_logs` (read),
Supabase Storage (private incident-photo bucket), FCM

---

## 9. Feature 6 — AI Post-Job Report Generation

### Endpoints

| Method | Path | Who | Description |
|---|---|---|---|
| GET | `/api/jobs/{jobId}/report` | Client/Professional | Report metadata + Supabase download URL |
| GET | `/api/bookings/{id}/report` | Client/Professional | Report for a single booking under a multi-guard job |
| GET | `/api/admin/reports` | Admin | All reports, filterable (date, has_high_severity, job) |
| GET | `/api/admin/reports/{id}` | Admin | Full report metadata |

**No endpoint triggers generation manually (internal only). No update/delete endpoint.**

### Trigger
Fires automatically when a job's `staffing_status` and all bookings under it reach
`completed` — i.e. the **last** booking on a multi-guard job completing triggers **one**
unified report covering the whole engagement, not one report per booking.

### Flow
1. **Backend assembles payload:**
```json
{
  "job": { "title": "...", "client_name": "...", "location": "...", "date": "...",
           "start_time": "...", "end_time": "...", "total_duration_hours": 5.75 },
  "personnel": [ { "name": "...", "specialization": "...", "hours_worked": 5.75 } ],
  "incidents": [ { "logged_at": "...", "logged_by": "...", "incident_type": "...",
                    "description": "...", "severity": "...", "has_photo": true } ],
  "summary_stats": { "total_incidents": 2, "by_severity": {...}, "has_high_severity": false }
}
```
   Note: only `has_photo: true/false` is sent to Claude — **actual photo bytes/URLs are
   never sent to Claude.**

2. **Claude generates report text** — formal, factual, third-person prose, no speculation.
   Zero-incident jobs get a clean all-clear report.
```json
{
  "report_title": "...", "executive_summary": "...", "engagement_overview": "...",
  "incident_narrative": "...", "personnel_performance": "...", "conclusion": "..."
}
```

3. **Backend generates PDF server-side** (iText or Apache PDFBox):
   - Sentri branded header/logo
   - Job metadata block
   - Executive summary
   - Incident timeline — timestamp, type, severity, logged-by, description, **embedded photo**
   - Personnel performance section
   - Conclusion
   - Footer — report ID, generation timestamp, immutability notice

4. **Images embedded directly, never as URLs:** for every incident with `has_photo: true`,
   backend fetches image bytes from Supabase via a server-side service key (no signed URL
   needed, backend-to-backend), resizes to a max 800px width, embeds inline beneath the
   incident description. If a fetch fails, logs the failure and renders
   `[Photo unavailable]` instead — the rest of the report still generates.

5. **PDF uploaded** to a dedicated private `reports` bucket in Supabase Storage; URL stored
   in `reports` table.

6. **Notifications:** client and all professionals on the job get FCM push
   ("Your report is ready").

### Retry Logic
```
Attempt 1 fails → wait 2 min → Attempt 2
Attempt 2 fails → wait 5 min → Attempt 3
Attempt 3 fails → admin FCM alert with job ID; admin can manually trigger regeneration
```
Tracked via `generation_status`, `retry_count`, `last_attempt_at` on `reports`.

### Business Rules
- Internal trigger only — no external endpoint exposes generation
- Immutable once `generation_status = complete` — no regeneration, no editing
- Both parties retain permanent access regardless of later account status
  (suspension, deletion)
- Role-gated access: client → own jobs only; professional → assigned jobs only; admin → all
- `has_high_severity` boolean allows admin filtering without reading every report
- Claude receives names only — no phone numbers, payment data, or IDs
- **PDF generation failure never blocks payment settlement** — Feature 8 proceeds
  independently; the two are fully decoupled

### Data Touched
`bookings`, `jobs`, `incidents` (read), `reports` (write/update through lifecycle),
Supabase Storage (`reports` bucket), FCM

---

## 10. Feature 7 — Anomaly Detection

Silent background monitoring of every active job's location and activity patterns.

### Endpoints

| Method | Path | Who | Description |
|---|---|---|---|
| GET | `/api/admin/anomalies` | Admin | All flags, filterable |
| GET | `/api/admin/anomalies/{id}` | Admin | Single flag, full detail with GPS |
| PATCH | `/api/admin/anomalies/{id}/confirm` | Admin | Confirms flag, triggers score recalculation |
| PATCH | `/api/admin/anomalies/{id}/dismiss` | Admin | Dismisses with a required, logged reason |
| POST | `/api/admin/anomalies/{id}/contact-professional` | Admin | Logs contact re: this flag |
| POST | `/api/admin/anomalies/{id}/escalate` | Admin | Booking → `disputed`, freezes payment |
| GET | `/api/admin/settings/anomaly-thresholds` | Admin | Current thresholds |
| PATCH | `/api/admin/settings/anomaly-thresholds` | Admin | Updates thresholds — no deploy needed |
| POST | `/api/bookings/{id}/checkin` | Professional | Passive check-in during active job |
| GET | `/api/professionals/me/anomalies` | Professional | Own confirmed-only flag history |

### Anomaly Types & Default Thresholds (all stored in `settings`, runtime-configurable)

| Type | Default | Trigger |
|---|---|---|
| `location_departure` | 500m | GPS moves beyond radius from job location |
| `extended_inactivity` | 45 min | No app activity, incidents, or check-ins logged |
| `job_location_mismatch` | any different city | GPS at job start ≠ booking location city |
| `rapid_job_abandonment` | 15 min | Professional offline within this window of job going active |
| `late_job_start` | 20 min | No check-in past scheduled start time |

### Detection Flow — Background Polling Job
`@Scheduled`, every 5 minutes. Queries all `active` bookings, runs 5 checks per booking:

1. **Location Departure** — Haversine distance from most recent `location_logs` entry vs
   job location; flag if `> threshold`
2. **Extended Inactivity** — most recent of `location_logs`/`incidents`/`checkins` for that
   booking; flag if older than threshold
3. **Job Location Mismatch** — runs once at job start; reverse-geocodes most recent GPS,
   compares city to booking location city; flag immediately if different
4. **Rapid Job Abandonment** — for jobs active < 30 min; flag if no GPS ping since job
   went active beyond threshold
5. **Late Job Start** — for `accepted` bookings past `start_time`; flag if
   `now > start_time + threshold` and no check-in logged

### Deduplication
Before writing a flag, backend checks for an existing unresolved flag of the same
`anomaly_type` on the same `booking_id`. If found, updates `last_detected_at` instead of
creating a new row — prevents one 3-hour departure from spamming hundreds of flags at a
5-minute poll interval.

### Flag Lifecycle
```
detected → unresolved → confirmed (admin) → feeds into score, checked against 30-day suspension count
                       ↘ dismissed (admin, reason required) → no score impact
```
- **Confirm:** `admin_action = confirmed`, `resolved = true`, Feature 4 score recalculation
  triggered immediately, then backend checks confirmed count in the last 30 days
- **Dismiss:** `admin_action = dismissed`, `dismissal_reason` stored (required, rejected if
  empty), `resolved = true`, no score impact

### Check-in System
Passive prompt ("Tap to confirm you're on site") at a configurable interval (default 30 min).
`POST /api/bookings/{id}/checkin` — no body. Validates booking `active` and professional
assigned, writes to `checkins`, feeds directly into the inactivity check.

### GPS Data Flow
Frontend sends pings every 5 min via `expo-location` background tracking during active jobs
→ `location_logs`. Purged after 30 days except for records tied to unresolved flags/disputes.

### Weekly AI Pattern Analysis
`@Scheduled`, every Monday 3am. For every professional with ≥1 anomaly flag in the last 90
days:
```json
{
  "professional_id": "uuid",
  "analysis_period_days": 90,
  "anomaly_history": [ { "anomaly_type": "...", "booking_id": "...", "detected_at": "...", "admin_action": "..." } ],
  "total_jobs_in_period": 14,
  "confirmed_flags": 1,
  "dismissed_flags": 1
}
```
Claude returns:
```json
{
  "risk_level": "low",
  "pattern_detected": false,
  "summary": "...",
  "recommended_action": "none"
}
```
Stored in `anomaly_pattern_analysis`, surfaced on the admin dashboard next to the
professional's profile. Runs **only** for professionals with flag history — no cost on
clean professionals.

### Automatic Suspension
After every confirmation:
```sql
SELECT COUNT(*) FROM anomaly_flags
WHERE professional_id = ? AND admin_action = 'confirmed'
AND detected_at >= NOW() - INTERVAL '30 days'
```
If `count >= 3`: `availability_status = suspended`, removed from search immediately, admin
FCM alert, professional FCM notification. Reinstatement requires manual admin action
(same path as score-based suspension).

### Business Rules
- Detection alone never suspends — only confirmed flags count toward the 30-day threshold
- All thresholds read from `settings` at runtime — polling job never hardcodes values
- Location data used for detection is never exposed to the client — operational tool only
- GPS records tied to confirmed flags are retained beyond the 30-day purge until resolved
- Dismissal reason is mandatory
- Weekly Claude analysis runs only for professionals with flag history

### Data Touched
`location_logs`, `checkins`, `anomaly_flags`, `bookings`, `professionals.availability_status`,
`settings`, `anomaly_pattern_analysis`, FCM

---

## 11. Feature 8 — Escrow Payment System

Per-booking escrow model (not job-level pooled) — chosen for clean isolation of payments,
refunds, and disputes across guards on the same job.

### Endpoints

| Method | Path | Who | Description |
|---|---|---|---|
| POST | `/api/bookings/{id}/payment/initiate` | Client | Creates Paystack charge for `max_amount_held`, stores reference |
| POST | `/api/bookings/{id}/payment/confirm-hours` | Professional | Logs actual end time, triggers payout calculation |
| POST | `/api/bookings/{id}/payment/confirm` | Client | Confirms actual hours, releases payment |
| POST | `/api/bookings/{id}/payment/dispute` | Client/Professional | Raises dispute, freezes fund movement |
| PATCH | `/api/admin/disputes/{id}/resolve` | Admin | Manual ruling, releases funds accordingly |
| GET | `/api/bookings/{id}/payment` | Client/Professional | Payment record and status |
| GET | `/api/jobs/{jobId}/payment-summary` | Client | Unified multi-booking cost summary (read-only aggregation) |

### Payment Flow
1. Booking reaches `accepted` → client initiates payment → backend calculates
   `max_amount_held = max_duration × hourly_rate` → Paystack charge fired →
   `paystack_reference` stored → `payments.status = held`
2. Job → `active` → professional works → `completed` via `confirm-hours`
3. Backend calculates:
   - `amount_due = actual_hours × hourly_rate`
   - `platform_fee = amount_due × 10%`
   - `professional_payout = amount_due − platform_fee`
   - `client_refund = max_amount_held − amount_due`
4. Client gets confirmation prompt with a 6-hour warning before the 12-hour auto-confirm
   window closes
5. On confirm (manual or auto): Paystack Transfer (payout) and Paystack Refund (client
   refund) fire in the same transaction, `payments.status = released`

### Per-Booking Escrow — Why, and What It Looks Like
Each professional on a job gets an **independent** hold, charge, payout, and refund —
their financials never mix with another guard's.

**Example — two guards on one job:**
- Guard A: GHS 50/hr × 6hr max → GHS 300 held
- Guard B: GHS 80/hr × 6hr max → GHS 480 held
- Total held upfront: GHS 780 (two separate Paystack charges)

Job ends. Guard A worked 4hrs, Guard B worked 6hrs:
- Guard A: GHS 200 paid out, GHS 100 refunded
- Guard B: GHS 480 paid out, GHS 0 refunded

Each settlement is fully independent — Guard B finishing on time doesn't affect Guard A's
refund; a dispute on one booking freezes only that booking's funds, the other releases on
schedule.

**Rejected alternative — job-level pooled escrow:** one charge for the whole job, split
internally. Rejected because it requires manually rebuilding what Paystack already does
per-transaction — tracking internal splits, handling one guard disputing while another
doesn't (frozen pot problem), handling late guard additions (top-up vs. second charge).
More code, more edge cases, more room for money to go missing.

**`GET /api/jobs/{jobId}/payment-summary`** is purely a read-time aggregation summing all
`payments` rows under a job's bookings — it never holds or moves money at the job level.
This is what powers the single "Confirm & Pay" and single "Confirm hours" screens the
client sees, even though the underlying charges are per-booking.

### Client-Facing Experience
- **Booking:** one summary screen, one "Confirm & Pay" button, itemized per guard, totalled.
  Bank statement shows multiple deductions — mitigated with an in-app note
  ("2 payments totalling GHS 780 held in escrow")
- **During job:** one unified live incident feed, no sense of separate bookings
- **Post-job:** one confirmation screen, itemized hours/amounts per guard, one net refund
  figure; client can dispute per-guard without blocking the others

### Dispute Flow
- Either party disputes within 24h of `completed` → `payments.status = disputed`,
  booking → `disputed` — freezes only that booking's funds
- Professional with any unresolved disputed payment blocked from accepting new bookings
  (checked at `PATCH /accept`)
- Admin reviews incidents, anomaly flags, GPS, both accounts → manual ruling →
  `/resolve` releases funds per ruling

### Business Rules
- Platform fee (10%) deducted only from `amount_due`, never from the full hold — client
  never pays a fee on unused hours
- Maximum 7-day hold — `EscrowTimeoutJob` (`@Scheduled`) flags any `payments.status = held`
  older than 7 days for mandatory admin intervention
- All payment records immutable — no update/delete, same pattern as `incidents`
- `auto_confirmed` and `confirmed_at` track whether release happened via 12-hour timeout
  or explicit client action

### Data Touched
`payments` (per booking), `disputes`, `bookings.status`

---

## 12. Scheduled Jobs — Full Registry

| Job | Cadence | Purpose |
|---|---|---|
| `AssessmentCreditResetJob` | Daily, 3am | Resets `assessment_credits_remaining` to 3, advances `credits_reset_at` by 1 month from its prior value |
| `AnomalyPollingJob` | Every 5 min | Runs all 5 anomaly checks against every `active` booking |
| `AnomalyPatternAnalysisJob` | Weekly, Monday 3am | Claude pattern review for professionals with flag history in last 90 days |
| `TrustScoreReviewJob` | Weekly, Monday 4am (after anomaly analysis) | Claude-assisted score adjustment for professionals in the ±8 boundary band around 40, or stale reviews |
| `DocumentExpiryCheckJob` | Daily | Reverts professional status when credentials expire |
| `LocationLogPurgeJob` | Daily | Purges `location_logs` older than 30 days, excluding those tied to unresolved flags/disputes |
| `EscrowTimeoutJob` | Daily | Flags `payments.status = held` older than 7 days for admin intervention |
| `BookingAutoExpiryJob` | Interval TBD | Auto-declines bookings with no professional response within the response window |
| Report generation retry | Internal, event-triggered | 2 min → 5 min backoff, 3 attempts, then admin alert |

Recommendation: group all of these under one `@Configuration`/`jobs` package as the
codebase grows rather than leaving them scattered.

---

## 13. Cross-Cutting Business Rules

- **Immutability by design:** `incidents`, `payments`, and `reports` (once complete) are
  never updated or deleted by any role, including admin. `incidents` is additionally
  enforced via a Postgres trigger, not backend code alone.
- **Server never trusts client-submitted timestamps or GPS for authoritative records** —
  `logged_at` on incidents is always `now()` server-side; GPS is cross-referenced against
  `location_logs` for plausibility.
- **AI outputs are never taken as final authority** where money, verification, or account
  status are at stake — document verification always requires human admin sign-off;
  trust score AI adjustment is bounded and auditable, not freeform.
- **Credits, fees, and financial calculations are backend-computed only** — never trust a
  client-submitted amount for anything charge-related.
- **State machines are enforced server-side on every transition** — no client or
  professional can PATCH a booking/job/document into an invalid state.

---

## 14. Known Open Items

- Response window duration for booking auto-expiry (Feature 1) — not yet finalized
- Whether a fully-depleted assessment credit balance should ever be toppable-up
  (paid top-up, loyalty mechanic) beyond the monthly reset — deferred
- Auto-approve path for high-confidence, zero-flag document extractions (Feature 3) —
  explicitly deferred pending real extraction-accuracy data post-launch