# Sentri — Frontend Specification
### React Native (Expo) — Client & Professional Roles
Companion document to the backend specification (`spec.md`). Group 24, KNUST.

---

## 0. Purpose of This Document

This document consolidates every frontend decision for Sentri's React Native (Expo)
application, covering the **Client** and **Professional** roles. It is a companion to the
backend specification (`spec.md`) — it assumes that document's data model, endpoints, and
business rules as given, and does not restate them except where necessary for context.

**Scope:** Client and Professional roles only. Admin is explicitly out of scope for this
document.

**Not covered here:** visual design, theming, component styling — this document specifies
behavior, data flow, and screen contracts only.

**Open Decisions Log:** unlike the backend doc, there's no prior spec to diverge from — so
instead of "deviations," this doc tracks frontend-only judgment calls as they're made, so a
later reader can see what was decided and why without hunting through each section. See
§11 for the complete, consolidated log.

---

## 1. Architecture & Responsibility Boundaries

The frontend is a thin client. It renders state, captures input, and talks to the backend
API — it holds no independent authority over data, money, or decisions.

**The frontend owns:**
- All screens, forms, and navigation for Client and Professional roles
- Supabase Auth session management — login, register, token storage, attaching JWT to
  every request
- Direct-to-Supabase Storage uploads (documents, incident photos) via signed URL from the
  backend
- Background GPS via `expo-location` during active jobs — sent to backend, **never acted
  on client-side**
- Real-time incident feed display
- Rendering AI-generated content the backend returns (trust scores, assessments, reports)
- FCM token registration — obtaining device token, sending to backend

**The frontend never:**
- Computes fees, payouts, refunds, or any charge-related amount
- Enforces or assumes a booking/job/document state transition — it reflects whatever
  state the backend returns, and re-fetches rather than optimistically transitioning
  state locally for anything money- or evidence-related
- Treats its own clock or GPS reading as authoritative — `logged_at` and location
  plausibility are backend-decided
- Talks to Paystack, Claude, or FCM directly — all three are backend-mediated
- Persists money- or evidence-adjacent state (payment status, incident submissions)
  locally as a source of truth — the backend response is always the source of truth,
  local state is a cache of it at best

---

## 2. Navigation Structure

**Top-level split:** a single Auth Stack, then a role-resolved navigator determined by
`users.role` from the session — Client Navigator or Professional Navigator. Role is fixed
at registration; the app never presents a role switcher.

**Auth Stack** (unauthenticated): Splash → Login → Register → (Professional only)
Profile Setup, before entering the role navigator.

**Client Navigator** — 4 tabs:
- **Home tab**: dashboard → AI assessment (input → results → job creation) → job/booking
  detail (stack). Assessment lives here rather than as its own tab since it's a
  Home-initiated action ("start a new engagement"), not a standing area with ongoing state
  to revisit.
- **Browse tab**: professional list → professional profile → booking flow (stack)
- **Activity tab**: active jobs, history, reports (stack)
- **Account tab**: profile, notifications settings

**Professional Navigator** — 4 tabs:
- **Home tab**: dashboard (incoming requests, active job) → booking detail (stack)
- **Jobs tab**: active job screen → check-in/incident logging (stack)
- **Score tab**: trust score, anomaly history
- **Account tab**: profile, documents, availability, history, reports

**Shared components, not shared screens:** in-app call screen, incident feed view, report
viewer (PDF), and the upload flow are implemented once and mounted into both navigators —
not duplicated, but also not literally the same navigator entry, since entry points and
back-stack behavior differ per role.

**Deep-link / push notification routing:** an FCM push must route to the correct stack
screen even from a cold start (e.g. tapping "booking accepted" push opens Professional →
Jobs → that booking, not just the tab root). This requires role-aware deep-link resolution
at the navigator level, resolved after auth check.

---

## 3. Screen-by-Screen Data Contracts

### General Pattern (applies to every screen below)

Every screen consumes a **named React Query hook** (`useClientJobs`, `useActiveBooking`,
`useMyDocuments`, `useCreateJob`, etc.) — never a raw endpoint call written inline in the
screen component. The hook is the seam between "what the backend actually provides" and
"what the screen needs." This means:

- Screens can be written and built **now**, against a mocked/stubbed hook, without waiting
  on any of the open backend items listed in §11.
- When an open item resolves (e.g. a jobs-list endpoint gets added, or turns out to be
  `GET /api/jobs?status=active`), only the hook implementation is touched — no screen code
  changes, because the screen only ever consumes the hook's return shape, never the raw
  endpoint or response.
- If a resolution changes the *response shape* rather than just the URL, the hook's return
  type is the only thing to update.

Each entry below follows this template:
- **Hook / Endpoint(s)** — the query hook name, and which backend call(s) it wraps, and when
  (on mount, on pull-to-refresh, on action)
- **Expects** — the response shape it depends on (referencing backend spec's schema, not
  redefined here)
- **States** — loading, empty, error, and any screen-specific state
- **Refetch trigger** — what causes this screen to re-fetch (navigation focus, FCM push,
  manual pull, poll interval)

---

### 3.1 Client Screens

#### Client — Home / Dashboard
- **Hook:** `useClientJobs({ status: 'active' | 'pending' })`, wrapping
  `{{JOBS_LIST_ENDPOINT}}` — not explicit in the backend spec (see §11, Open Item #1).
  **Contract requirement, not implementation guess:** whatever this endpoint turns out to
  be, it must return a paginated array of job summaries (`id`, `title`, `status`,
  `staffing_status`, `date`). Also consumes `clients.assessment_credits_remaining`, either
  via the same call or a second one — doesn't matter to the screen, since both surface
  through the same hook.
- **Expects:** summary counts (active jobs, pending confirmations), assessment credit
  balance
- **States:** loading, empty ("no active jobs — start with an assessment or browse
  professionals"), error — unaffected by which endpoint eventually backs this
- **Refetch trigger:** tab focus, pull-to-refresh, FCM push on any job/booking status change

#### Client — Browse Professionals
- **Hook:** `useProfessionals(filters)`, wrapping `GET /api/professionals`
- **Expects:** paginated list; each item has `id`, `full_name`, `specializations[]`,
  `hourly_rate`, `availability_status`, `trust_score`
- **States:** loading (initial + pagination), empty ("no professionals match your
  filters"), error (retry action)
- **Refetch trigger:** filter change, pull-to-refresh; no auto-poll — list staleness is
  acceptable here since booking eligibility is re-validated server-side at accept time
  anyway

#### Client — Professional Profile
- **Hook:** `useProfessional(id)`, wrapping `GET /api/professionals/{id}`
- **Expects:** full profile — bio, specializations, hourly_rate, operating_locations,
  availability_status, verification_status, trust_score
- **States:** loading, error, not-found (professional no longer available)
- **Refetch trigger:** navigation focus only — no poll needed for a static profile view

#### Client — AI Assessment (input)
- **Hook:** `useCreateAssessment()` mutation, wrapping `POST /api/assess`
- **Expects:** request built from event_type, location, date, duration_hours,
  attendee_count, description; response is the full assessment object (risk_level,
  risk_flags, recommended_personnel, matched professionals)
- **States:** loading (this call is slow — Claude round trip, needs a distinct "analyzing"
  state, not a generic spinner), error — must distinguish `403 no_assessment_credits`
  (show credits-remaining + reset date) from a hard failure (credit is refunded
  server-side, so retry is safe)
- **Refetch trigger:** N/A — one-shot submission, not a listing screen

#### Client — Assessment Results
- **Hook:** `useAssessment(id)`, wrapping `GET /api/assess/{id}` (free, re-visitable)
- **Expects:** risk_level, risk_flags, recommended_personnel[], matched_professionals
  (pre-selected team), recommendations_summary
- **States:** loading, error, "stale" state — spec notes assessments can go stale as
  availability drifts; screen needs a visible affordance for this before conversion
- **Refetch trigger:** manual only (this is a persisted, revisitable result — not live
  data)

#### Client — Create Job / Convert Assessment
- **Hook:** `useCreateJob()` mutation, wrapping either `POST /api/jobs` +
  `POST /api/jobs/{jobId}/bookings` per selected professional (manual path), or
  `POST /api/jobs/from-assessment/{assessmentId}` (assessment path)
- **Expects:** created Job with nested Bookings in `pending` status
- **States:** loading, error, partial-failure handling — see §11, Open Item #2. Regardless
  of how the backend eventually defines partial-failure behavior, the hook's contract to
  the screen is always: return `{ succeeded: Booking[], failed: { professionalId, error }[]
  }`. The screen renders success/retry-per-slot UI off that shape today (assuming
  best-effort partial success, which matches the per-booking escrow isolation already
  described elsewhere in the backend spec). If the backend later returns a single
  all-or-nothing error instead, the hook maps that into the same
  `{ succeeded: [], failed: [all] }` shape — the screen doesn't change.
- **Refetch trigger:** N/A — one-shot creation action

#### Client — Job Summary & Confirm & Pay
- **Hook:** `useJob(jobId)` for current state, `useInitiatePayment()` mutation per booking
  on confirm, wrapping `GET /api/jobs/{jobId}` and
  `POST /api/bookings/{id}/payment/initiate`
- **Expects:** job with all bookings and per-booking `max_amount_held`; single totalled
  "Confirm & Pay" amount computed **display-side only** from backend-provided per-booking
  amounts, never client-calculated from raw rate × duration
- **States:** loading, error, per-guard payment failure (one Paystack charge fails while
  others succeed — needs a retry-per-guard state, not all-or-nothing)
- **Refetch trigger:** on payment action completion, on FCM push (professional
  accepted/declined)

#### Client — Active Job / Live Incident Feed
- **Hook:** `useJobIncidents(jobId)` wrapping `GET /api/jobs/{jobId}/incidents` (unified
  feed), `useJobPaymentSummary(jobId)` wrapping `GET /api/jobs/{jobId}/payment-summary`
  for the status strip
- **Expects:** chronological incident list annotated with `professional_name`; each
  incident has severity, type, description, photo_url
- **States:** loading, empty ("no incidents logged — all quiet"), error
- **Refetch trigger:** FCM-triggered refetch (see §8) — silent background refetch when the
  incident-log push arrives while mounted, plus refetch on screen focus and manual
  pull-to-refresh. No polling, no websocket.

#### Client — Post-Job Confirmation
- **Hook:** `useJobPaymentSummary(jobId)`, `useConfirmPayment()` mutation per guard
  wrapping `POST /api/bookings/{id}/payment/confirm`, `useDispute()` mutation wrapping
  `POST /api/bookings/{id}/payment/dispute` if disputing
- **Expects:** itemized hours/amounts per guard, single net refund figure
  (backend-aggregated)
- **States:** loading, error, countdown state (6-hour warning before 12-hour auto-confirm
  — client-side countdown display, but **never** the source of truth for whether
  auto-confirm actually fired — must re-fetch status rather than assume timeout locally,
  per §1)
- **Refetch trigger:** on action, on FCM push, on screen focus (to catch auto-confirm if it
  fired while app was backgrounded)

#### Client — Job/Booking History
- **Hook:** `useClientJobs({ status: 'settled' | 'completed' })` — same hook as Home
  Dashboard, different filter; same open-item dependency (§11, Open Item #1)
- **Expects:** list of past jobs with summary info
- **States:** loading, empty, error
- **Refetch trigger:** tab focus, pull-to-refresh

#### Client — Report Viewer
- **Hook:** `useJobReport(jobId)` wrapping `GET /api/jobs/{jobId}/report` (or
  `useBookingReport(id)` wrapping `GET /api/bookings/{id}/report` for single-booking view)
- **Expects:** report metadata + Supabase download URL; render as in-app PDF viewer, not a
  browser hand-off
- **States:** loading, error, "report pending" (`generation_status ≠ complete` — should
  refetch until ready, or show a "notify me" state since FCM push fires on completion)
- **Refetch trigger:** manual, or FCM push if navigated to while `generation_status` still
  pending

#### Client — In-App Call
- **Hook:** `useInitiateCall(bookingId)` mutation wrapping
  `POST /api/bookings/{id}/call/initiate`
- **Expects:** room token from third-party SDK
- **States:** loading (creating room), error (booking not in valid state — `pending`/
  `accepted` only), in-call, call-ended
- **Refetch trigger:** N/A — ephemeral session, no persisted state

---

### 3.2 Professional Screens

#### Professional — Home / Dashboard
- **Hook:** `useProfessionalBookings({ status: 'pending' | 'active' })` — same open-item
  dependency as Client Home (§11, Open Item #1)
- **Expects:** incoming pending requests, current active job if any, summary counts
- **States:** loading, empty ("no pending requests"), error
- **Refetch trigger:** tab focus, pull-to-refresh, FCM push on new booking request

#### Professional — My Profile
- **Hook:** `useMyProfessionalProfile()` wrapping `GET /api/professionals/me` on mount,
  `useUpdateProfile()` mutation wrapping `PATCH /api/professionals/me` on save
- **Expects:** bio, specializations[], hourly_rate, operating_locations[],
  availability_status
- **States:** loading, error, saving. This is an optimistic-update exception: profile
  metadata is not money/evidence data, so a local optimistic update is acceptable per the
  §1 boundary.
- **Refetch trigger:** manual, on screen focus after edit

#### Professional — Document Upload & Status
- **Hook:** `useMyDocuments()` wrapping `GET /api/professionals/me/documents`,
  `useUploadDocument()` mutation wrapping `POST /api/professionals/me/documents`
  (registration step after the Supabase upload — see §7 for the full upload flow, and §11
  Open Item #5 for the signed-URL endpoint gap)
- **Expects:** per-document `document_type`, `status` (pending_review/approved/rejected),
  `rejection_reason` if rejected
- **States:** loading, empty (no docs yet — show required types checklist), error,
  per-document states (pending/approved/rejected badges), re-submission flow for rejected
  slots
- **Refetch trigger:** manual, FCM push on approve/reject

#### Professional — Booking Request Detail
- **Hook:** `useBooking(id)` wrapping `GET /api/bookings/{id}` on mount, `useAcceptBooking()`
  / `useDeclineBooking()` mutations wrapping `PATCH /api/bookings/{id}/accept` or `/decline`
- **Expects:** booking detail — job context, client info, location, duration, rate
- **States:** loading, error, action-in-flight (accept/decline), already-actioned (booking
  state changed elsewhere — needs a re-fetch-on-focus guard so the professional can't act
  on stale state)
- **Refetch trigger:** on focus (guards against acting on a booking already auto-expired or
  reassigned)

#### Professional — Active Job Screen
- **Hook:** `useActiveBooking(id)` wrapping `GET /api/bookings/{id}`, `useCheckIn()`
  mutation wrapping `POST /api/bookings/{id}/checkin` on tap; background `expo-location`
  pings run independent of screen state.
- **Expects:** booking detail, current status. Check-in interval consumed via
  `data.checkInIntervalMinutes` with a **hardcoded fallback default of 30** (per the
  backend spec's stated default) if the hook doesn't yet surface a runtime value — see §11
  Open Item #3. The screen works correctly today and silently starts using the real
  runtime-configured value the moment the backend exposes it, with no frontend code change
  required.
- **States:** loading, error, check-in-due (passive prompt), GPS-permission-denied — see
  §6 and §11 Open Item #4
- **Refetch trigger:** on focus, on check-in submit

#### Professional — Log Incident
- **Hook:** `useLogIncident()` mutation, internally calling
  `POST /api/bookings/{id}/incidents/photo-url` (optional, if photo attached) then
  `POST /api/bookings/{id}/incidents`. Offline behavior specified in §9.
- **Expects:** fixed `incident_type` list (from backend enum); submission returns created
  record immediately
- **States:** loading (upload in progress if photo), submitting, error, success
  confirmation, "pending upload" (queued offline — see §9), locked-state (booking not
  `active` — should disable this screen's submit entirely rather than let the request
  fail)
- **Refetch trigger:** N/A — write-only screen, but the incident feed elsewhere refetches
  after this via FCM push

#### Professional — My Trust Score
- **Hook:** `useMyScore()` wrapping `GET /api/professionals/me/score`
- **Expects:** current score, plain-language breakdown
- **States:** loading, error
- **Refetch trigger:** tab focus. No FCM push is defined for score changes in the backend
  spec, so refetch-on-focus is the only trigger.

#### Professional — My Anomaly History
- **Hook:** `useMyAnomalies()` wrapping `GET /api/professionals/me/anomalies`
- **Expects:** confirmed-only flags (backend spec is explicit: a professional never sees
  unresolved or dismissed ones)
- **States:** loading, empty, error
- **Refetch trigger:** tab focus

#### Professional — Job/Booking History
- **Hook:** `useProfessionalBookings({ status: 'settled' | 'completed' })` — same hook and
  open-item dependency as Home Dashboard
- **States:** loading, empty, error
- **Refetch trigger:** tab focus, pull-to-refresh

#### Professional — Report Viewer
- Shared component with Client's Report Viewer. Same contract, scoped via
  `useBookingReport(id)` wrapping `GET /api/bookings/{id}/report` for the professional's
  own assigned booking.

#### Professional — In-App Call
- Shared component with Client's In-App Call. Same contract.

---

## 4. State Management

**Tier 1 — Session state (global, persisted):**
`access_token`, `refresh_token`, `user.id`, `user.role`. Persisted to secure storage
(Expo SecureStore), rehydrated on app launch. Nothing else belongs at this tier.

**Tier 2 — Server-cache state (per-screen, not persisted):**
Everything that comes from an API call — professional lists, job details, incident feeds,
scores, documents. Backed by a query-cache library (React Query) rather than hand-rolled
`useState` + `useEffect` fetching, so refetch-on-focus, retry, and staleness are handled
consistently rather than reimplemented per screen. This tier is **never** the tie-breaker
for money/evidence truth — a cached "payment held" state shown while offline is a display
convenience, not a claim about actual backend state, and the screen must refetch on
reconnect/focus before allowing another action.

**Tier 3 — Ephemeral local state (per-screen, not persisted, not cached):**
Form drafts (assessment input, incident description before submit), in-progress uploads,
UI-only state (expanded/collapsed, selected filter). Lost on navigation away or app kill —
explicitly, since no requirement calls for draft persistence, and adding it would
contradict "frontend holds no state beyond the current session."

*Exception:* the offline incident/check-in queue described in §9 is deliberately **not**
Tier 3 — it's persisted (SQLite/MMKV) specifically because it must survive app kill/restart.
It is best thought of as a fourth, narrowly-scoped persistence category — pending-submission
state, distinct from both the session (Tier 1) and cached server data (Tier 2).

**What does NOT get a client-side global store:** active job status, booking state, trust
score, anomaly flags — all Tier 2, always refetched, never duplicated into a Redux/
Zustand-style global store that could drift from the backend's actual state.

**Decision:** React Query (or an equivalent server-cache library) is used for all
server-derived data — no global Redux/Zustand store for anything server-derived. Given the
"backend is always source of truth, frontend never assumes state" boundary from §1, a
query-cache library fits better than a manually-managed global store that could drift from
actual backend state.

---

## 5. Auth & Session Handling

**Token lifecycle:** Supabase Auth issues access + refresh tokens on login/register.
Access token attached as `Authorization: Bearer` on every API request. Refresh handled
transparently by the Supabase client SDK — the app doesn't manually manage expiry timers.

**Session persistence:** tokens stored in Expo SecureStore (not AsyncStorage — these are
credentials, not cache). On app launch, attempt silent rehydration before showing any UI;
only fall through to the Auth Stack if rehydration fails.

**401 mid-session handling:** any API call returning 401 triggers one silent refresh
attempt. If the refresh also fails, force logout — clear SecureStore, navigate to Login,
and show a one-time "session expired" message. This must not silently fail on a
money-in-flight screen (e.g. mid-payment-confirm) — those screens should surface the
logout redirect as an explicit interruption, not lose the user's place silently.

**Role resolution:** `role` is backend-owned data (`users.role` in Postgres via the Spring
Boot backend/Neon DB), not inherently part of the Supabase JWT — Supabase Auth only issues
the JWT for authentication; role-based access control happens against the backend's own
`users` table. Resolved via a `GET /api/users/me`-style call (see §11 Open Item #6)
immediately after Supabase Auth login/rehydration, before entering either role navigator.
Cached at Tier 1 alongside the tokens. Not re-fetched per-navigation, but re-fetched on any
401-triggered re-auth.

**Logout:** clears SecureStore, clears the entire Tier 2 query cache (no stale
professional-A's data lingering if professional-B logs in on the same device), navigates
to Auth Stack.

**Multi-device / concurrent sessions:** not addressed in the backend spec — assumed
allowed by default (Supabase Auth's normal behavior) unless told otherwise. Not currently
flagged as an open item since nothing in the app (e.g. the escrow auto-confirm countdown)
depends on single-device assumptions — revisit if that changes.

---

## 6. Device Capabilities & Permissions

**Background Location (`expo-location`):**
- Requested contextually — at the moment a Professional's booking transitions to `active`,
  not at app install or login. iOS requires "When In Use" granted first, then a follow-up
  prompt for "Always" (background) — the flow must handle this two-step iOS pattern
  explicitly, not assume one prompt covers both.
- **On denial:** the Active Job screen shows a persistent, non-dismissible banner
  ("Location required to log this job as active — anomaly detection and check-ins won't
  work without it") with a deep link to system settings. See §11 Open Item #4 — this is a
  real gap, not just a UI concern: the backend's anomaly detection assumes GPS pings
  arrive, and there's no defined server-side fallback for a professional who never sends
  any.

**Camera / Photo Library:**
- Requested contextually at two points: incident photo attachment (Professional), document
  upload (Professional, Feature 3). Standard single-purpose prompts, not requested upfront.
- **On denial:** feature degrades gracefully — incident submission works without a photo
  (photo is optional per backend spec); document upload for a required type is blocked
  with a clear message, since a required document can't be skipped.

**Push Notifications (FCM):**
- Requested at first launch, post-auth (once role is known, so the prompt copy can be
  role-relevant — "get notified when a client books you" vs. "get notified when your guard
  arrives").
- **On denial:** app remains functional — FCM push is a convenience layer for state changes
  the app already re-fetches on focus/pull-to-refresh (per Tier 2 in §4), so denial degrades
  timeliness, not correctness. Stated explicitly here so no screen is later built to depend
  on a push as the *only* way it learns about a state change.

**Microphone (for Stream calls):**
- Requested contextually, at the moment of tapping "call" or receiving an incoming call
  invite, not before.

**Decision:** all permissions are requested contextually, not upfront at launch/login.
Standard mobile UX practice; also lets denial states be feature-scoped instead of a single
blocking gate at onboarding.

---

## 7. File Upload Flow

Both document uploads and incident photos follow the same two-step pattern:

1. **Request signed URL** — frontend calls the relevant signed-URL endpoint
   (`POST /api/bookings/{id}/incidents/photo-url` for incidents; the equivalent for
   documents is not explicit in the backend spec — see §11 Open Item #5), backend
   validates context (booking must be `active` for incident photos) before issuing the URL.
2. **Direct upload to Supabase Storage** — frontend uploads the file bytes directly to the
   signed URL. Backend is not in this path at all.
3. **Register the result** — frontend calls the actual creation endpoint
   (`POST /api/professionals/me/documents` or `POST /api/bookings/{id}/incidents`) with the
   resulting Supabase URL included in the payload.

**Frontend-side concerns this pattern handles uniformly:**
- **Upload progress** — real progress shown (not a spinner) since these can be large images
  on slow connections; a genuine UX need given the context (professional on-site, possibly
  weak signal)
- **Upload failure ≠ submission failure** — if step 2 fails, step 3 never fires; the UI
  clearly distinguishes "photo didn't upload, try again" from "incident wasn't logged"
  rather than a single generic error
- **Retry** — retry step 2 alone on failure, don't re-request a new signed URL unless the
  original one expired
- **File constraints enforced client-side before upload starts** — file type/size checked
  locally first (see §11 Open Item #7 — limits aren't specified in the backend spec), to
  avoid wasting an upload attempt on something that'll be rejected
- **Compression** — incident photos and ID documents are compressed/resized client-side
  before upload. The backend re-resizes to 800px width when embedding in PDFs anyway, so
  there's no value in uploading full-resolution originals over a potentially weak
  on-site connection.

---

## 8. Real-Time / Async Behavior

**Incident feed and all other state-change updates: FCM-triggered refetch, not polling or
a persistent websocket.**

Every incident log already fires an FCM push to the client (Feature 5). Rather than
building a second live channel, affected screens refetch their underlying query when:
- the relevant FCM push arrives while the screen is mounted (silent background refetch, no
  user action needed)
- the screen regains focus (catches anything missed while backgrounded)
- manual pull-to-refresh

**Why not websocket:** `spring-boot-starter-websocket` is in the backend's dependency list,
but no websocket channel is actually specified anywhere in the 8 features — it may be
there for the Stream call SDK's own signaling, not for app-level real-time data. Building a
second live channel for one feed, on top of FCM (which is already backend-mediated and
already fires for this exact event), is redundant infrastructure for a feed that isn't
genuinely high-frequency (an active job might log a handful of incidents, not a stream).

**Why not plain polling:** an active job could run for hours; polling every N seconds for
that whole window burns battery and backend load for a feed that updates rarely. FCM
already tells the app exactly when something changed — polling on top of that is
redundant.

**Escrow auto-confirm countdown:** rendered as a client-side countdown display only (per
§1 — never authoritative), refreshed via refetch on screen focus and on the FCM push that
fires when payment status actually changes, not via a ticking poll.

**General pattern going forward:** anywhere the backend already sends an FCM push for a
state change (booking accepted/declined, document approved/rejected, report ready), the
frontend treats that push as the refetch trigger — not a dedicated poll. Polling only
applies where no push exists and staleness genuinely can't be tolerated — no such case has
come up in this document. (Trust score has no defined push — see §3.2, Professional — My
Trust Score — so it relies on focus-refetch alone, not polling.)

---

## 9. Error Handling & Offline Behavior

**Tiered by consequence, not a single global error handler:**

- **Read failures** (browse list, profile, history, score) — standard retry UI, no special
  handling. Cached Tier 2 data (per §4) can still display stale-but-labeled data while a
  background retry runs.
- **Write failures — reversible/low-stakes** (profile edit, availability toggle) — inline
  error, retry button, no queuing needed. User can just try again.
- **Write failures — money-adjacent** (payment initiate, payment confirm, dispute) — never
  silently retried or queued. Explicit failure state, explicit re-attempt action, and the
  screen re-fetches actual backend status before allowing another attempt (guards against
  double-charging if the request actually succeeded server-side but the response was
  lost).
- **Write failures — evidence-adjacent** (incident log, check-in) — these need offline
  **queuing**, not just retry, since a professional on-site may have poor signal precisely
  when an incident happens. Incidents are described as legal evidence in the backend spec,
  so losing one to a dropped connection is a materially bigger problem than losing a
  profile edit.

**Offline incident/check-in queue — persistence requirement:** the queue is persisted via
local storage (SQLite or MMKV, not plain in-memory Tier 3 state) so it survives app
kill/restart. "Professional on-site with bad signal" is exactly the situation where the
app might also get backgrounded or killed, so an in-memory-only queue would lose evidence
in precisely the scenario it exists to protect. On next app launch, queued items resume
upload automatically, still showing a "pending upload" indicator until confirmed. This is
the one piece of this document that is genuinely non-trivial engineering, not just a
data-fetching pattern, and should be flagged to whoever picks up this screen first.

**GPS ping failures:** silent — background location pings that fail to send are retried by
`expo-location`'s own queuing (if configured) or simply dropped for that interval; not
surfaced to the user per-ping, since surfacing every failed 5-minute ping would be noise.
Only surfaced if location has been failing long enough to risk an anomaly false-positive
— see §11 Open Item #4; no threshold for this warning is defined yet.

**Global network-down state:** a lightweight banner ("You're offline — some actions are
paused") rather than blocking the whole app, since read screens can still show cached data.

---

## 10. Third-Party SDK Integration (Voice/Video Calling)

**Provider:** Stream (or equivalent — Daily.co/Agora named as alternatives in the backend
spec; this document assumes Stream since it's listed first, unless told otherwise).

**Call initiation flow:**
1. Frontend calls `POST /api/bookings/{id}/call/initiate` — backend validates the booking
   is `pending` or `accepted` (never before a booking exists, never after the job goes
   `active`), creates the room via Stream's API, returns a token.
2. Frontend joins the Stream call UI/SDK using that token.
3. Backend sends an FCM push to the other party — the frontend handles an **incoming
   call** push distinctly from a regular notification (a full-screen incoming-call UI, not
   just a banner — standard call UX, but worth stating since nothing else in this document
   needs a full-screen takeover).

**Call failure states:** token fetch fails (booking in the wrong state — show why, not
just "failed"), Stream connection fails (network-level, generic retry), call drops
mid-session (Stream SDK's own reconnect logic, frontend just reflects connection state).

**Permissions:** microphone (and camera, if video), requested at call-initiation time per
§6. See §11 Open Item #8 — the backend spec says "voice/video" without confirming whether
calls are voice-only, video-only, or user-selectable.

**Call duration:** capped via Stream's own configuration server-side — no client-side
timer enforcement to build; the frontend just reflects whatever Stream does when the cap
hits.

**No call history/recording UI** — nothing in the backend spec mentions storing or
retrieving past calls, so this document doesn't spec one. Calls are ephemeral sessions
only.

---

## 11. Open Decisions Log

Consolidated record of every judgment call and every open item raised against the backend
spec while writing this document.

### Decisions made

| # | Decision | Chosen | Rationale | Section |
|---|---|---|---|---|
| D1 | Local state for money/evidence data | Never treated as source of truth — always re-fetch backend response rather than optimistically transition locally | Backend spec enforces all state machines server-side; a locally-assumed transition (e.g. "payment confirmed") could show a false state if the actual write fails or gets rejected | §1 |
| D2 | Navigation shape | Bottom tab bar per role, each tab with its own stack history | Client/Professional each have several distinct areas users jump between rather than move through linearly; tabs preserve per-area navigation state | §2 |
| D3 | Assess placement | Folded into the Home tab rather than given its own tab | It's a Home-initiated action ("start a new engagement"), not a standing area with ongoing state to revisit | §2 |
| D4 | Screen-to-backend coupling | Every screen consumes a named React Query hook, never a raw endpoint call inline | Decouples screen code from unresolved/uncertain backend endpoint shapes; open items become hook-only changes, not screen rewrites | §3 |
| D5 | Server-derived state management | React Query (or equivalent server-cache library) — no global Redux/Zustand store for anything server-derived | Query-cache library handles refetch-on-focus/staleness natively without risking a hand-maintained store drifting from actual backend state | §4 |
| D6 | Role resolution | `GET /api/users/me`-style call after login, not a JWT claim | `role` lives on the backend's `users` table, not inherently in the Supabase JWT — assuming a claim would break unless a custom auth hook was separately configured | §5 |
| D7 | Permission request timing | All permissions requested contextually, not upfront at launch/login | Standard mobile UX practice; lets denial states be feature-scoped instead of a single blocking gate at onboarding | §6 |
| D8 | Client-side compression | Compress/resize incident photos and documents before upload | Backend re-resizes to 800px for PDF embedding anyway; no value in uploading full-res originals over a potentially weak on-site connection | §7 |
| D9 | Incident feed / state-change updates | FCM-triggered refetch, not polling or websocket | Every relevant event already fires FCM per backend spec; no app-level websocket channel is actually specified; avoids redundant infrastructure and unnecessary battery/backend load | §8 |
| D10 | Error handling tiering | Read / low-stakes-write / money-write / evidence-write treated differently, not one global handler | Consequence of failure differs wildly — a failed profile edit and a failed incident log are not the same risk | §9 |
| D11 | Offline incident/check-in queue | Persisted (SQLite/MMKV), survives app kill/restart | Poor signal on-site often coincides with app backgrounding/kill; losing queued legal evidence to a force-quit is unacceptable | §9 |

### Open items — need resolution against the backend spec

| # | Item | Why it matters | Section | Frontend mitigation until resolved |
|---|---|---|---|---|
| O1 | No explicit "list my jobs/bookings" endpoint — only `GET /api/jobs/{jobId}` (single) exists | Both Client and Professional Home/History screens need a filtered list, not a single-job fetch | §3 | Screens consume `useClientJobs`/`useProfessionalBookings` hooks now; only the hook changes once the real endpoint is confirmed |
| O2 | No defined behavior for partial failure when creating multiple bookings under one job | Multi-guard job creation could partially succeed with no defined rollback/retry contract | §3 | `useCreateJob()` normalizes any backend behavior into a `{ succeeded, failed }` shape today; screen already handles partial success |
| O3 | Check-in interval stored in `settings` but no endpoint exposes it to frontend | Active Job screen needs it to render the passive check-in prompt at the right cadence | §3 | Hardcoded fallback default of 30 minutes (per backend spec's stated default) until the real value is exposed |
| O4 | No defined fallback if a professional denies background GPS permission | Anomaly detection (Feature 7) assumes pings arrive; a professional who denies location has no defined handling path — could falsely trigger `location_departure`-type flags or silently produce no data | §6 | Persistent non-dismissible in-app banner + settings deep link; no backend-side mitigation possible from the frontend alone — this needs a backend-side answer |
| O5 | No explicit document signed-URL endpoint in the backend spec (incident photos have one; documents don't) | Document upload flow (§7) can't be fully implemented without confirming this exists | §7 | Upload flow built against the incident-photo pattern as a placeholder; needs backend confirmation before documents can actually upload |
| O6 | No `GET /api/users/me`-style endpoint listed for resolving `role` post-login | Role resolution (§5) needs some way to fetch the authenticated user's own role/profile record | §5 | Blocking — the app cannot route into the correct role navigator without this; highest-priority open item |
| O7 | No file size/type limits specified for uploads | Needed for client-side validation before an upload attempt is made | §7 | Client-side validation deferred/loosely bounded until backend/Supabase bucket config is confirmed |
| O8 | Voice vs. video call default not specified — backend spec says "voice/video" without confirming which, or if user-selectable | Affects camera permission timing and call UI (video needs a camera prompt, voice doesn't) | §10 | Assuming voice-only as the safer default until confirmed, camera permission deferred |

**Priority note:** O6 (role resolution endpoint) is the only item that blocks the app from
functioning at all — without it, there's no way to route a logged-in user into either role
navigator. Every other open item degrades a specific feature but doesn't block the app as
a whole; O1–O5, O7, O8 should be resolved before their respective screens are built, not
necessarily before development starts.

---

## 12. Known Open Items Beyond the Backend Spec

Frontend-only unknowns that aren't backend gaps, just not yet decided:

- Whether the offline incident queue needs a maximum retry duration before escalating to a
  more visible warning state (currently: retry indefinitely on reconnect, no timeout)
- App-wide loading skeleton vs. spinner convention — not yet standardized across screens
- Whether `availability_status` toggle (Professional) is the only optimistic-update
  exception, or whether other low-stakes fields should follow the same pattern


## Core Framework & Language
The frontend is built with React Native via Expo (managed workflow), giving cross-platform iOS/Android support from a single codebase without needing native build tooling for day-to-day development. TypeScript is used throughout rather than plain JavaScript, since the app's data contracts (booking states, payment shapes, incident schemas) are complex enough that type safety catches real bugs at the boundary between screens and API responses.
## Navigation
React Navigation handles the app's structure — bottom tab navigators for each role (Client, Professional) nested with stack navigators per tab, as specified in §2. Deep-link resolution for FCM-triggered navigation (routing a push notification to the correct screen from a cold start) is handled through React Navigation's linking configuration.
## Server State & Data Fetching
React Query (TanStack Query) manages all server-derived state — the Tier 2 layer from §4. It owns caching, refetch-on-focus, retry logic, and background updates, and is the library backing every named hook described in §3 (useClientJobs, useActiveBooking, etc.). No separate global state manager (Redux, Zustand) is used for anything server-derived, per the §4 decision.

## Local & Session Storage
Expo SecureStore holds session credentials (access/refresh tokens, resolved role) — the Tier 1 layer from §4. For the persisted offline incident/check-in queue described in §9, either SQLite (via expo-sqlite) or MMKV is used — MMKV is faster for simple key-value queuing, SQLite is preferable if the queue ever needs querying/filtering beyond FIFO resubmission; this choice can be finalized when that screen is actually built.
## Auth
Supabase's JavaScript client (@supabase/supabase-js) handles authentication — login, registration, and token refresh — as specified in §5, with the resulting session persisted to SecureStore rather than Supabase's default storage adapter.
## Location & Device APIs
expo-location handles background GPS tracking during active jobs (§1, §6). expo-image-picker (or expo-camera if in-app capture is preferred over gallery/camera-roll selection) handles incident photo and document capture. expo-notifications combined with Firebase Cloud Messaging handles push registration and delivery, per the FCM-triggered refetch pattern in §8.
## File Uploads
Direct-to-Supabase-Storage uploads (§7) are done via Supabase's storage client using the signed URLs the backend issues — no separate upload library needed beyond what @supabase/supabase-js already provides. Image compression before upload uses expo-image-manipulator.
## Calling
The Stream SDK (@stream-io/video-react-native-sdk, assuming Stream per §10) handles the in-app voice/video call UI once the backend issues a room token.
## Forms & Validation
React Hook Form for form state (assessment input, incident logging, profile editing), paired with Zod for schema validation — both for client-side validation before submission and, since the API contracts are already typed via TypeScript, Zod schemas can double as a lightweight runtime check on API responses at the hook layer described in §3.