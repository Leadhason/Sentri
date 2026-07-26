# Sentri — UI/UX Design Specification
### Single Source of Truth for Frontend Interface Design
Companion to `spec.md` (backend) and `Spec.md` (frontend architecture) — Group 24, KNUST

---

### How to read this document

Every design decision below is tagged so a reader can tell what's binding vs. proposed:

- **[REQ]** — directly required by the backend or frontend specification; not optional.
- **[REC]** — this document's design recommendation, filling a gap the specs leave open. Changeable without violating either spec.
- **[ASM]** — an assumption made to keep the design coherent, flagged because the specs don't say either way. Should be confirmed with the team before build.

No functionality is invented beyond what §3 (frontend spec) and the feature sections of the backend spec imply. Where the frontend spec lists an **open item** (§11 of `Spec.md`), this document designs for the frontend's stated mitigation, not the unresolved backend behavior.

### Reference Mockups

Visual mockups/prototypes for the screens in this document exist at **`sentri_design_mockups`**. Treat them as the source for layout, component styling, and the visual system described in §5 — not for copy. **The copy/text used in those mockups does not match Sentri's actual goals and should not be reused as-is;** the mockup layouts should be carried over, but all on-screen text (labels, headings, empty-state messages, button copy, microcopy) should be replaced with the language specified per screen in §4 and the patterns in §6.3, not copied verbatim from the mockup files.

---

## 1. Product Overview

### 1.1 What Sentri Does
Sentri is a platform that connects **Clients** who need security personnel with **Professionals** (verified guards, bodyguards, crowd control staff) for time-boxed jobs, in the Ghanaian market. **[REQ]**

Its differentiation isn't listing availability — it's three AI-assisted layers wrapped around a conventional hire-and-pay flow:
1. **AI Threat & Needs Assessment** — a client describes an event; Claude returns a risk level and a recommended, pre-matched team the client can accept, adjust, or discard. **[REQ]**
2. **AI Document Verification** — professional credentials are extracted and flagged by Claude, but a human admin always makes the final call. **[REQ]**
3. **Behavioral Risk Scoring & Anomaly Detection** — a transparent, mostly-formula trust score (with a bounded, auditable AI nudge) and passive GPS/check-in anomaly monitoring during active jobs. **[REQ]**

Money moves through per-booking Paystack escrow — held at booking, released after the client confirms actual hours — and every guard on a multi-guard job settles independently. **[REQ]**

### 1.2 Core User Goals

**Client:**
- Get from "I have an event, I don't know what I need" to a fully staffed, paid engagement with minimal manual judgment calls. **[REQ]**
- Trust that money is safe until work is verifiably done, and that a guard's presence is being tracked, even passively. **[REQ]**
- See what happened during the job (incidents) without needing to check in on each guard individually. **[REQ]**

**Professional:**
- Get discovered and booked based on a transparent, explainable trust score rather than an opaque algorithm. **[REQ]**
- Move through registration → verification → active work with clear status at every step, especially when something (a document, a booking) is rejected. **[REQ]**
- Log incidents and check in without friction, including offline, without ever losing a submission. **[REQ]**

### 1.3 Main UX Principles

1. **The backend is the only source of truth — the UI never pretends otherwise.** **[REQ, from Spec.md §1]** Nothing shown as "confirmed" for money or evidence is a local optimistic guess; screens re-fetch rather than assume. This shapes visible design: confirmations show a brief "confirming…" state rather than instantly flipping to a done state, wherever money or evidence is involved.
2. **One AI voice, never the final word.** Assessment results, trust scores, and document extractions are always presented as *inputs a human or a transparent formula acts on* — never as an unquestionable verdict. **[REQ]** This is a copy and layout principle throughout (e.g., "Recommended," not "Required"; a score breakdown, not just a number).
3. **Escrow complexity hidden, not lied about.** Client-facing screens always total to one number and one action, but line-item detail is one tap away and bank-statement behavior is proactively explained. **[REQ]**
4. **Passive tracking, active disclosure.** Background GPS and check-ins run silently, but the professional always has a permission-state affordance visible — never a silent failure. **[REC, addressing Spec.md §11 Open Item #4]**
5. **Distinctive, not decorative.** Sentri's visual system (§5) commits to one signature motif — the diamond aperture — rather than defaulting to generic circular progress rings or a stock security-app radar sweep. **[REC — carries forward the team's locked design-system decisions]**

---

## 2. Information Architecture

### 2.1 App Sections **[REQ, Spec.md §2]**

```
Auth Stack (unauthenticated)
└─ Splash → Role Selection → Create Account → (Professional only) Profile Setup
   Login (alternate entry)

Client Navigator — 4 tabs
├─ Home       → Dashboard → AI Assessment (input → results → job creation) → Job/Booking Detail
├─ Browse     → Professional List → Professional Profile → Booking Flow
├─ Activity   → Active Jobs / History → Report Viewer
└─ Account    → Profile → Notification Settings

Professional Navigator — 4 tabs
├─ Home       → Dashboard (incoming requests, active job) → Booking Detail
├─ Jobs       → Active Job → Check-in / Log Incident
├─ Score      → Trust Score → Anomaly History
└─ Account    → Profile → Documents → Availability → History → Reports

Shared, cross-navigator (implemented once, mounted into both)
├─ In-App Call
├─ Live Incident Feed (view)
├─ Report Viewer (PDF)
└─ Upload Flow (document / incident photo)
```

Role is fixed at registration; there is no in-app role switcher. **[REQ]**

### 2.2 Navigation Hierarchy — Design Rendering **[REC]**

- **Bottom nav:** a floating, centered capsule dock rather than a flush edge-to-edge tab bar — 4 icons, active tab rendered as a solid gold circle. *(Carries forward the team's locked design-system decision — see §5.)*
- **Stack depth:** each tab keeps its own back-stack (per **[REQ, Spec.md §2, Decision D2]**); the dock persists across stack pushes within a tab, disappears only for full-screen takeovers (incoming call, camera capture).
- **Deep links:** a push notification (e.g., "booking accepted") must resolve directly to the relevant stack screen inside the correct role navigator, even from a cold start. **[REQ]** Visually, this means every stack screen needs a normal back affordance even when it's the *first* screen the user ever sees in a session — never assume the dashboard was visited first.

### 2.3 User Journeys

**Client — assessment-led hire (primary journey) [REQ]**
```
Home Dashboard → "New Assessment" → Assessment Input → (analyzing) → Assessment Results
  → Review pre-matched team → Accept as-is / swap one / remove a slot
  → Convert to Job → Job Summary & Confirm & Pay → (per-booking escrow charges fire)
  → wait for professional acceptances → Active Job / Live Incident Feed (during event)
  → Post-Job Confirmation (confirm hours, per-guard) → Job/Booking History
```

**Client — manual hire (secondary journey) [REQ]**
```
Browse tab → filter professionals → Professional Profile → Add to booking
  → Job Summary & Confirm & Pay → same downstream flow as above
```

**Professional — onboarding to first job [REQ]**
```
Register → Profile Setup → Document Upload (per required type) → pending_review
  → (approved/rejected per document) → verification_status becomes verified
  → Home Dashboard shows incoming booking requests → Booking Request Detail
  → Accept → Active Job Screen (check-in prompts, background GPS)
  → Log Incident (as needed) → job completes → Trust Score reflects outcome
```

**Cross-cutting: decline & replacement [REQ, backend spec §5]**
```
Professional declines a pending booking → Client gets FCM push
  → Client reviews auto-suggested replacement → Accept Replacement / Find Manually
  → (if no match found) Client notified, must act manually
```

---

## 3. Screen Inventory

**27 screens total** — 5 in the Auth Stack, 11 Client-only, 9 Professional-only, 2 fully shared (mounted into both navigators). Report Viewer and In-App Call are shared component screens; the Incident Feed is a shared *view* embedded inside two different host screens (Client Active Job, Professional Active Job) rather than a standalone destination — reported under its host screens below.

| # | Screen | Section | Role(s) | Purpose |
|---|---|---|---|---|
| 1 | Splash | Auth | Both | Session check, route to Login or role navigator |
| 2 | Role Selection | Auth | Both | Choose Client or Professional before registering |
| 3 | Create Account | Auth | Both | Role-specific registration form |
| 4 | Login | Auth | Both | Returning-user sign-in |
| 5 | Professional Profile Setup | Auth | Professional | Bio, rate, specializations, locations before first use |
| 6 | Client Home / Dashboard | Client · Home | Client | Active/pending job summary, assessment credit balance, entry to Assess |
| 7 | AI Assessment — Input | Client · Home | Client | Situational input form for Claude threat assessment |
| 8 | Assessment Results | Client · Home | Client | Risk level, flags, pre-matched team, convert or adjust |
| 9 | Create Job / Convert Assessment | Client · Home | Client | Finalize slots (from assessment or manual), initiate bookings |
| 10 | Job Summary & Confirm & Pay | Client · Home/Browse | Client | Itemized per-guard cost, single Confirm & Pay |
| 11 | Client Active Job / Live Incident Feed | Client · Activity | Client | Real-time incident feed + payment status strip during a job |
| 12 | Post-Job Confirmation | Client · Activity | Client | Confirm actual hours per guard, single net refund, dispute entry |
| 13 | Browse Professionals | Client · Browse | Client | Filterable, paginated professional list |
| 14 | Professional Profile (client view) | Client · Browse | Client | Full profile, add-to-booking, call, initiate contact |
| 15 | Client Job/Booking History | Client · Activity | Client | Past jobs, settled/completed |
| 16 | Client Account & Settings | Client · Account | Client | Profile, notification preferences |
| 17 | Professional Home / Dashboard | Professional · Home | Professional | Incoming requests, current active job |
| 18 | Booking Request Detail | Professional · Home | Professional | Job/client context, Accept / Decline |
| 19 | Professional Active Job Screen | Professional · Jobs | Professional | Check-in prompt, status, entry to Log Incident |
| 20 | Log Incident | Professional · Jobs | Professional | Fixed-type incident submission, optional photo |
| 21 | My Trust Score | Professional · Score | Professional | Current score, plain-language breakdown |
| 22 | My Anomaly History | Professional · Score | Professional | Confirmed-only anomaly flags |
| 23 | Professional Job/Booking History | Professional · Account | Professional | Past bookings |
| 24 | My Profile (Professional) | Professional · Account | Professional | Bio, rate, specializations, locations, availability toggle |
| 25 | Document Upload & Status | Professional · Account | Professional | Per-document-type upload, status badges, resubmission |
| 26 | In-App Call | Shared | Both | Voice/video call tied to an existing booking |
| 27 | Report Viewer | Shared | Both | In-app PDF viewer for post-job reports |

---

## 4. Detailed Screen Specifications

Legend for **States**: every screen supports *loading*, *error*, and screen-specific states; only the notable/non-default ones are listed per screen to avoid repetition.

### 4.1 Auth Stack

#### 1 — Splash
- **Objective:** Resolve session validity and route silently — this is infrastructure, not a branding moment to linger on. **[REQ]**
- **Layout:** Full-bleed void-black background, centered Sentri diamond mark, no text. **[REC]**
- **Components:** Logo mark only; no buttons.
- **Data displayed:** None — purely a transition state.
- **User actions:** None.
- **Interactions:** Auto-routes on session check resolution — to Login if no session, or the role navigator if a session and resolved role exist. **[REQ, Spec.md §5]**
- **Edge cases/states:** Session exists but role resolution (`GET /api/users/me`-equivalent, **[REQ pending — Spec.md §11 Open Item #6, blocking]**) fails or times out → falls back to Login with a generic "please sign in again" message rather than hanging. **[REC — mitigation for a blocking open item]**
- **Mobile/responsive:** N/A — single fixed layout, no scroll.

#### 2 — Role Selection
- **Objective:** Establish role before any account fields are shown, since role is permanent. **[REQ, Spec.md §2]**
- **Layout:** Two full-width tappable cards stacked vertically (not a toggle) — "I need security" (Client) and "I provide security" (Professional). **[REQ, per team's locked onboarding decision]**
- **Components:** Two illustrated cards, each with a one-line description of what the role can do; a small "Already have an account? Log in" link below.
- **Data displayed:** Static descriptive copy only.
- **User actions:** Tap a card to proceed to Create Account with role pre-set.
- **Interactions:** Card press state (scale/glow), immediate navigation — no confirmation step needed since the next screen still allows back-navigation before any data is submitted.
- **Edge cases/states:** None role-specific; standard back button returns to Splash/Login.
- **Mobile/responsive:** Cards stack vertically on all widths; on tablet-width, cards may sit side-by-side — **[REC]**.

#### 3 — Create Account
- **Objective:** Collect role-specific registration fields and create the account. **[REQ]**
- **Layout:** Single-column form, chamfered hero panel at top showing which role was selected (with an "change" link back to Role Selection). **[REC]**
- **Components:** Text inputs (name, email, phone, password), role-conditional fields **[ASM — backend spec's `users` table has no role-specific registration fields beyond the shared columns; assuming Client registration is name/email/phone/password only, and Professional registration collects the same core fields here, deferring bio/rate/specializations to Profile Setup]**, primary CTA button, terms acknowledgment.
- **Data displayed:** None (input-only screen).
- **User actions:** Fill form, submit, edit terms link.
- **Interactions:** Real-time field validation (email format, password strength) before submit is enabled — error prevention over error messages, per usability fundamentals.
- **Edge cases/states:** Duplicate email, weak password, network failure on submit — each with a specific inline message, not a generic toast. Submitting routes Client straight into the Client Navigator; Professional routes to Profile Setup next. **[REQ, Spec.md §2]**
- **Mobile/responsive:** Keyboard-avoiding scroll view; CTA button pinned above keyboard.

#### 4 — Login
- **Objective:** Authenticate a returning user of either role. **[REQ]**
- **Layout:** Centered logo, email/password fields, primary CTA, "Forgot password" and "Create account" links.
- **Components:** Standard auth form.
- **Data displayed:** None.
- **User actions:** Submit credentials; navigate to password reset or registration.
- **Interactions:** Inline validation; loading state on submit disables the button (prevents double-submit).
- **Edge cases/states:** Invalid credentials (generic "email or password incorrect" — never confirms which field is wrong, standard security practice **[REC]**), account exists but role resolution fails (see Splash edge case).
- **Mobile/responsive:** Keyboard-avoiding layout, autofocus email field.

#### 5 — Professional Profile Setup
- **Objective:** Capture the profile fields a Professional needs before appearing in Browse results. **[REQ]**
- **Layout:** Multi-step form (progressive disclosure) — bio/specializations → rate/locations → availability — rather than one long scroll. **[REC]**
- **Components:** Text area (bio), multi-select chips (specializations, from a fixed backend enum **[ASM — enum values not listed in backend spec; treat as backend-provided list, not hardcoded]**), numeric input (hourly rate, GHS), location multi-select, availability toggle.
- **Data displayed:** None (input-only).
- **User actions:** Progress through steps, edit previous steps, submit.
- **Interactions:** Step indicator (not a diamond-aperture — that motif is reserved for status/progress in the sense of a live value, not a linear form wizard **[REC]**); a plain dot-step indicator instead.
- **Edge cases/states:** Cannot be skipped — Professional cannot reach the Home Dashboard without completing this, since `verification_status` and browse-eligibility depend on baseline profile data existing. **[ASM]** Saving partially and resuming later is not specified — assumed out of scope for v1. **[ASM]**
- **Mobile/responsive:** One field group per screen height where possible to avoid excessive scrolling on smaller devices.

### 4.2 Client — Home Tab

#### 6 — Client Home / Dashboard
- **Objective:** Give the client an immediate read on active engagements and a clear entry into starting a new one. **[REQ, Spec.md §3.1]**
- **Layout:** Oversized asymmetric hero stat at top (count of active jobs, numeral bleeding off the hero zone edge) **[REC, locked design decision]**; below it, a "Start an Assessment" primary CTA card showing remaining credits; below that, a scrollable list of active/pending jobs as dispatch-ticket rows.
- **Components:** Hero stat panel (chamfered), assessment-credit CTA card, dispatch-ticket list rows (left color bar by status, mono job ID, avatar-tile for lead guard if assigned), floating capsule nav.
- **Data displayed:** Active/pending job count and summaries (`id`, `title`, `status`, `staffing_status`, `date`), `assessment_credits_remaining`. **[REQ]**
- **User actions:** Tap a job row → Job/Booking Detail; tap "Start an Assessment" → Assessment Input; pull-to-refresh.
- **Interactions:** FCM push on any job/booking status change silently updates the list on next focus/pull. **[REQ]**
- **Edge cases/states:** Empty state — "No active jobs — start with an assessment or browse professionals," with both CTAs visible, not just the assessment one **[REC, matches Spec.md's stated empty-state copy plus a secondary path]**. Assessment credits at 0 — CTA still tappable but shows "0 of 3 remaining · resets [date]" instead of hiding the entry point. **[REC]**
- **Mobile/responsive:** Single column; hero stat scales down but stays the visual anchor at all widths.

#### 7 — AI Assessment — Input
- **Objective:** Collect situational details for Claude's threat assessment. **[REQ]**
- **Layout:** Single-column form: event type (select), location, date, duration, attendee count, free-text description.
- **Components:** Select inputs, date picker, numeric stepper, multi-line text area, submit CTA.
- **Data displayed:** Remaining assessment credits shown persistently near the CTA so the cost is never a surprise. **[REC]**
- **User actions:** Fill and submit.
- **Interactions:** On submit, transitions to a **distinct "Analyzing…" state** — not a generic spinner, since this is a slow Claude round-trip. **[REQ, Spec.md §3.1]** Recommend an animated diamond-aperture "scanning" motif here specifically because it's the one moment AI work is genuinely happening — reinforces the motif's meaning rather than using it decoratively elsewhere. **[REC]**
- **Edge cases/states:** `403 no_assessment_credits` — distinct screen state showing credits-remaining and reset date, with a clear "Browse professionals instead" fallback path, distinguished from a hard failure (where retry is safe since the credit is refunded server-side). **[REQ, Spec.md §3.1]**
- **Mobile/responsive:** Keyboard-avoiding scroll; numeric steppers use large touch targets given on-the-go entry is likely.

#### 8 — Assessment Results
- **Objective:** Present risk assessment and pre-matched team; let the client accept, adjust, or discard. **[REQ]**
- **Layout:** Risk-level banner at top (color-coded by severity, using semantic tokens not raw hue), risk flags as chips, then a pre-matched team list (dispatch-ticket rows per slot, each showing the matched professional and a swap/remove action).
- **Components:** Risk banner, flag chip row, per-slot team rows (avatar, name, trust score badge, rate), "Convert to Job" primary CTA, "Recommendations summary" text block.
- **Data displayed:** `risk_level`, `risk_flags`, `recommended_personnel`, `matched_professionals`, `recommendations_summary`. **[REQ]**
- **User actions:** Swap an individual professional (opens a mini Browse picker scoped to that slot type), remove a slot entirely, accept as-is, convert to job.
- **Interactions:** Revisitable free of charge — this is a persisted result, not live data, so no auto-refresh; a manual refresh option exists to re-check staleness. **[REQ]**
- **Edge cases/states:** **Stale-assessment state** — a visible banner ("Some professionals may no longer be available — refresh before converting") when the spec's staleness note applies, shown *before* conversion, not discovered after payment. **[REQ, Spec.md §3.1]** No professional found for a slot — the slot row shows an explicit "no match — browse manually" state rather than disappearing silently.
- **Mobile/responsive:** Chips wrap; team list scrolls independently of the fixed risk banner header.

#### 9 — Create Job / Convert Assessment
- **Objective:** Finalize job details and initiate bookings — from an assessment or from manual selections made in Browse. **[REQ]**
- **Layout:** Job detail summary (title, location, date, duration) at top, slot list below (same dispatch-ticket row style as Assessment Results, reused for consistency), "Create Job" CTA.
- **Components:** Editable job-detail fields (for the manual path), read-only slot list, submit CTA.
- **Data displayed:** Job + nested bookings once created, in `pending` status. **[REQ]**
- **User actions:** Edit job details (manual path only), confirm slot list, submit.
- **Interactions:** On submit, the UI must handle **partial success** — the create-job hook returns `{ succeeded, failed }` regardless of how the backend actually behaves underneath. **[REQ, Spec.md §3.1 & §11 D2]** Design rendering: a per-slot success/retry row appears after submission — succeeded slots show an accepted-pending chip, failed slots show an inline "retry" button, not a single all-or-nothing error blocking the whole screen.
- **Edge cases/states:** All slots fail — full-screen error with a single retry-all action. Partial failure — as above, non-blocking for the succeeded slots.
- **Mobile/responsive:** Slot list is the primary scroll region; job-detail summary collapses to a compact header on scroll.

#### 10 — Job Summary & Confirm & Pay
- **Objective:** One unified payment action across all guards on a job, despite multiple underlying Paystack charges. **[REQ, backend spec §11]**
- **Layout:** Chamfered hero panel showing the single totalled amount (large numeral, IBM Plex Mono for the currency figure) **[REC, applies the mono-for-data-tokens rule + the one-chamfered-element-per-screen rule]**; itemized per-guard rows below (rate, max hours, max amount held); single "Confirm & Pay" CTA pinned at the bottom.
- **Components:** Hero total panel, itemized dispatch-ticket rows per guard, inline note about bank statement behavior, CTA.
- **Data displayed:** Per-booking `max_amount_held`; the total is computed **display-side only** from backend-provided per-booking amounts, never client-calculated from raw rate × duration. **[REQ]**
- **User actions:** Review, confirm & pay.
- **Interactions:** In-app note explicitly set client expectations: **"2 payments totalling GHS 780 held in escrow"** style copy so a multi-line bank statement doesn't read as an error. **[REQ, backend spec §11]**
- **Edge cases/states:** **Per-guard payment failure** — one Paystack charge fails while others succeed; needs a retry-per-guard state, not all-or-nothing, mirroring the Create Job partial-failure pattern. **[REQ]**
- **Mobile/responsive:** CTA always reachable without scrolling past it (sticky bottom bar) given this is a money-committing action.

#### 11 — Client Active Job / Live Incident Feed
- **Objective:** Show what's happening during an active job without the client needing to track individual guards. **[REQ]**
- **Layout:** Payment-status strip pinned at top (compact, using the diamond-aperture indicator for aggregate staffing/payment status), unified chronological incident feed below (merged across all bookings under the job). **[REQ]**
- **Components:** Status strip, incident feed rows (each annotated with `professional_name`, severity-tinted left bar — ember only for High, steel for Medium/Low **[REC, keeping ember reserved for genuine high-severity per the design system's restraint rule]**), photo thumbnails where present, call entry point per guard.
- **Data displayed:** Chronological incidents (severity, type, description, photo_url), payment summary. **[REQ]**
- **User actions:** Tap an incident for full detail/photo; initiate a call to a guard; pull-to-refresh.
- **Interactions:** FCM-triggered silent background refetch when an incident-log push arrives while mounted, plus refetch on focus and manual pull — no polling, no websocket. **[REQ, Spec.md §3.1 & §8]**
- **Edge cases/states:** Empty — "No incidents logged — all quiet," phrased as reassurance, not an absence of data to worry about. **[REQ]**
- **Mobile/responsive:** Feed is the primary scroll region; status strip stays pinned/compact on scroll.

#### 12 — Post-Job Confirmation
- **Objective:** Client confirms actual hours and releases payment, per guard, with one net figure. **[REQ]**
- **Layout:** Countdown banner at top (6-hour warning before the 12-hour auto-confirm window closes) **[REQ]**, itemized hours/amounts per guard below, single net refund figure, per-guard "Confirm" / "Dispute" actions, one aggregate "Confirm All" shortcut.
- **Components:** Countdown banner, itemized rows, dispute entry per row, primary CTA.
- **Data displayed:** Itemized hours/amounts per guard, single net refund figure (backend-aggregated). **[REQ]**
- **User actions:** Confirm per guard or all at once; raise a dispute per guard without blocking the others. **[REQ, backend spec §11]**
- **Interactions:** The countdown is a **client-side display only** — never the source of truth for whether auto-confirm actually fired. On screen focus, the app re-fetches status rather than trusting the local timer, in case auto-confirm fired while backgrounded. **[REQ, Spec.md §3.1]**
- **Edge cases/states:** Auto-confirm fires while the client is on this screen (rare) — re-fetch should replace the countdown state with confirmed state without the user needing to act. Dispute raised — that guard's row visually locks (frozen state), others remain actionable. **[REQ]**
- **Mobile/responsive:** Countdown banner sticky at top given its time-sensitivity.

### 4.3 Client — Browse Tab

#### 13 — Browse Professionals
- **Objective:** Let a client find and filter professionals for manual hiring. **[REQ]**
- **Layout:** Filter bar (city, specialization, availability, rate range) pinned at top, paginated list below as dispatch-ticket rows (avatar tile + initials, trust score badge, rate, availability dot).
- **Components:** Filter chips/sheet, list rows, pagination/infinite scroll.
- **Data displayed:** `full_name`, `specializations[]`, `hourly_rate`, `availability_status`, `trust_score`. **[REQ]**
- **User actions:** Apply filters, tap a row → Professional Profile.
- **Interactions:** Refetch on filter change and pull-to-refresh only — no auto-poll, since eligibility is re-validated server-side at accept time regardless. **[REQ, Spec.md §3.1]**
- **Edge cases/states:** Empty — "No professionals match your filters," with a clear "clear filters" action. Error — retry action. **[REQ]**
- **Mobile/responsive:** Filters collapse into a bottom sheet on narrow widths rather than a persistent bar.

#### 14 — Professional Profile (client view)
- **Objective:** Give the client enough to decide whether to book this professional. **[REQ]**
- **Layout:** Chamfered hero panel (photo/avatar, name, trust score as a diamond-aperture ring fill), bio and specialization chips below, rate and locations, "Add to Booking" and "Call" actions.
- **Components:** Hero panel, trust-score aperture ring, spec chips, action buttons.
- **Data displayed:** Bio, specializations, hourly_rate, operating_locations, availability_status, verification_status, trust_score. **[REQ]**
- **User actions:** Add to booking (feeds into Create Job flow), initiate call (only valid pre-booking per the call feature's own gating — see Screen 26).
- **Interactions:** Static view — refetches on navigation focus only, no polling needed. **[REQ]**
- **Edge cases/states:** Not-found — professional no longer available (e.g., deactivated between list and detail fetch); shows a clear message and returns to the list rather than a blank/broken screen. **[REQ]**
- **Mobile/responsive:** Hero panel height reduces on shorter screens but the aperture ring never drops below a legible minimum size.

### 4.4 Client — Activity Tab

#### 15 — Client Job/Booking History
- **Objective:** Browse past jobs. **[REQ]**
- **Layout:** Same dispatch-ticket list pattern as Home Dashboard, filtered to settled/completed status, with a lightweight status filter control.
- **Components:** List rows, filter control, entry to Report Viewer per row.
- **Data displayed:** Past job summaries. **[REQ]**
- **User actions:** Tap a row → job detail/report; pull-to-refresh.
- **Interactions:** Tab focus + pull-to-refresh triggers only — this is historical data, no push-driven updates expected. **[REQ]**
- **Edge cases/states:** Empty — "No completed jobs yet."
- **Mobile/responsive:** Standard list scroll.

### 4.5 Client — Account Tab

#### 16 — Client Account & Settings
- **Objective:** Manage profile info and notification preferences. **[ASM — Spec.md §2 names this tab's contents ("profile, notifications settings") but doesn't detail the screen; contents below follow directly from that line]**
- **Layout:** Simple settings-list pattern — profile fields at top, toggle list below.
- **Components:** Editable name/phone fields, notification toggle switches, logout action.
- **Data displayed:** Current profile values.
- **User actions:** Edit and save profile fields, toggle notification categories, log out.
- **Interactions:** Standard form save with a saving/saved micro-state.
- **Edge cases/states:** Save failure — inline error, field retains the attempted edit rather than reverting silently.
- **Mobile/responsive:** Standard scrollable settings list.

### 4.6 Professional — Home Tab

#### 17 — Professional Home / Dashboard
- **Objective:** Surface incoming requests and the current active job at a glance. **[REQ]**
- **Layout:** Oversized asymmetric hero — if a job is active, the hero shows its status (aperture ring); if none, the hero shows the incoming-request count. Pending requests listed below as dispatch-ticket rows. **[REC, consistent with Client Home's locked hero pattern]**
- **Components:** Hero panel, incoming-request list rows, active-job entry card.
- **Data displayed:** Incoming pending requests, current active job if any, summary counts. **[REQ]**
- **User actions:** Tap a pending request → Booking Request Detail; tap active job → Active Job Screen.
- **Interactions:** FCM push on new booking request updates the list; tab focus and pull-to-refresh as fallback. **[REQ]**
- **Edge cases/states:** Empty — "No pending requests." **[REQ]**
- **Mobile/responsive:** Single column, hero scales but stays dominant.

#### 18 — Booking Request Detail
- **Objective:** Let the professional accept or decline with full context. **[REQ]**
- **Layout:** Job context block (client info, location, duration, rate) at top, Accept/Decline actions pinned at bottom.
- **Components:** Context block, dual CTA (Accept primary, Decline secondary/destructive-styled).
- **Data displayed:** Booking detail — job context, client info, location, duration, rate. **[REQ]**
- **User actions:** Accept, decline (with a required reason or generic decline — **[ASM — backend spec doesn't require a decline reason from the professional; assumed optional, unlike admin's mandatory dismissal reason for anomalies]**), initiate call to ask the client a question before deciding.
- **Interactions:** **Refetch-on-focus guard** — before either action is enabled, the screen re-checks the booking hasn't already auto-expired or been reassigned; if it has, both actions are disabled and replaced with an "already actioned" state. **[REQ, Spec.md §3.2]**
- **Edge cases/states:** Action-in-flight (accept/decline submitting) disables both buttons to prevent double-tap; already-actioned state as above.
- **Mobile/responsive:** CTAs sticky at the bottom given the decision-making nature of the screen.

### 4.7 Professional — Jobs Tab

#### 19 — Professional Active Job Screen
- **Objective:** Give the professional their live job status and a passive check-in prompt. **[REQ]**
- **Layout:** Status header (job/booking detail), check-in prompt card (only visible when due), entry to Log Incident, read-only view of the same live incident feed component used on the client side. **[REQ — incident feed is a shared component, Spec.md §2]**
- **Components:** Status header, check-in card, incident feed (shared), Log Incident CTA.
- **Data displayed:** Booking detail, current status, check-in interval — consumed with a hardcoded fallback default of 30 minutes until the backend exposes a runtime value. **[REQ, Spec.md §3.2 & §11 Open Item #3]**
- **User actions:** Tap to check in, tap to log an incident.
- **Interactions:** Background `expo-location` pings run independent of this screen being open. **[REQ]**
- **Edge cases/states:** **Check-in-due** — a passive, non-blocking prompt (not a modal interruption) since a guard is actively working. **GPS-permission-denied** — a persistent, non-dismissible in-app banner with a settings deep link; the frontend cannot self-resolve this, it's flagged as needing a backend-side answer. **[REQ, Spec.md §11 Open Item #4 — this is the frontend's stated mitigation, not a resolution]**
- **Mobile/responsive:** Check-in card designed for a quick glance-and-tap, since the professional may be actively on duty.

#### 20 — Log Incident
- **Objective:** Fast, low-friction incident submission from the field, including offline. **[REQ]**
- **Layout:** Incident-type selector (fixed list) at top, description text area, optional photo attach, submit CTA.
- **Components:** Fixed-enum select (severity auto-assigned server-side, never chosen by the professional — **[REQ, backend spec §8]**), text area, photo picker/camera, GPS auto-attached silently.
- **Data displayed:** Fixed `incident_type` list from the backend enum. **[REQ]**
- **User actions:** Select type, describe, optionally attach a photo, submit.
- **Interactions:** If a photo is attached, upload progress shows before the incident record submits. **[REQ]** "Other" type requires a non-empty description before submit is enabled — error prevention, not a post-submit rejection. **[REQ, backend spec §8]**
- **Edge cases/states:** **Locked state** — if the booking isn't `active`, the submit action is disabled entirely on this screen rather than allowing a doomed request. **[REQ]** **Offline/"pending upload"** — submission queues locally (persisted, survives app kill) and shows a distinct queued-state confirmation rather than pretending it succeeded live. **[REQ, Spec.md §3.2 & §9, Decision D11]**
- **Mobile/responsive:** Camera capture is the primary photo path given field use; gallery selection as a secondary option.

### 4.8 Professional — Score Tab

#### 21 — My Trust Score
- **Objective:** Show the professional their score with a plain-language, non-opaque breakdown. **[REQ]**
- **Layout:** Chamfered hero panel with the score rendered in the diamond-aperture ring (fill proportional to score/100), breakdown list below explaining contributing factors in plain language. **[REQ for the data; REC for the aperture-ring rendering, consistent with the locked design system]**
- **Components:** Aperture score ring, breakdown text list.
- **Data displayed:** Current score, plain-language breakdown. **[REQ]**
- **User actions:** None beyond viewing — this screen is read-only. **[ASM — no mutation endpoint exists for this data from the professional side]**
- **Interactions:** Refetch on tab focus only — no FCM push is defined for score changes in the backend spec. **[REQ, Spec.md §3.2]**
- **Edge cases/states:** None beyond loading/error — a stable, mostly-static screen by design.
- **Mobile/responsive:** Standard single-column layout.

#### 22 — My Anomaly History
- **Objective:** Show confirmed anomaly flags only — never unresolved or dismissed ones. **[REQ, backend spec §10]**
- **Layout:** Simple chronological list of confirmed flags.
- **Components:** List rows (type, date, brief context).
- **Data displayed:** Confirmed-only flags. **[REQ]**
- **User actions:** Tap for detail (if any additional detail is exposed — **[ASM — backend spec doesn't detail a per-flag detail view; assumed a simple expand/collapse rather than a separate screen, since no dedicated endpoint for single-flag detail is listed]**).
- **Interactions:** Tab focus refetch.
- **Edge cases/states:** Empty — "No confirmed flags."
- **Mobile/responsive:** Standard list scroll.

### 4.9 Professional — Account Tab

#### 23 — Professional Job/Booking History
- **Objective:** Browse past bookings. **[REQ]**
- **Layout:** Same list pattern as Client History, filtered to settled/completed.
- **Components:** List rows.
- **Data displayed:** Past booking summaries. **[REQ]**
- **User actions:** Tap a row for detail/report.
- **Interactions:** Tab focus, pull-to-refresh.
- **Edge cases/states:** Empty state.
- **Mobile/responsive:** Standard list scroll.

#### 24 — My Profile (Professional)
- **Objective:** Let the professional manage bio, rate, specializations, locations, and availability. **[REQ]**
- **Layout:** Editable form, availability toggle prominent near the top since it's the one field with different (optimistic) update behavior. **[REQ, Spec.md §3.2 — profile metadata is the one stated optimistic-update exception]**
- **Components:** Text/bio field, rate input, specialization chips, location multi-select, availability toggle.
- **Data displayed:** Current bio, specializations, hourly_rate, operating_locations, availability_status. **[REQ]**
- **User actions:** Edit any field, save; toggle availability independently of the rest of the form.
- **Interactions:** Availability toggle flips instantly (optimistic) since it's not money/evidence data; other field saves show a standard saving/saved state, not optimistic. **[REQ]**
- **Edge cases/states:** Save failure on a non-availability field reverts to the last confirmed value with an inline error — unlike availability, which is allowed to be optimistic.
- **Mobile/responsive:** Standard scrollable form.

#### 25 — Document Upload & Status
- **Objective:** Upload required credential documents and track their review status. **[REQ]**
- **Layout:** Checklist of required document types at top (empty state), each becoming a status row once uploaded (pending_review/approved/rejected badge).
- **Components:** Per-type upload card, status badges, rejection-reason display, resubmit action.
- **Data displayed:** `document_type`, `status`, `rejection_reason` if rejected. **[REQ]**
- **User actions:** Upload a document per required type; resubmit a rejected slot (creates a new row, doesn't overwrite — the rejected version remains visible as history). **[REQ, backend spec §6]**
- **Interactions:** Upload progress shown distinctly from review-pending status — "uploading" is a client-side state, "pending_review" is a server state reached only after successful upload. **[REC — keeps the two conceptually distinct in the UI, matching their distinct data states]**
- **Edge cases/states:** Empty — required-types checklist shown, nothing uploaded yet. **[REQ]** Per-document rejected state shows the reason and a clear resubmit CTA on that slot only — other approved documents stay untouched and don't re-enter any pending state. **[REQ]**
- **Mobile/responsive:** Camera/file picker as the upload entry point; document thumbnails sized for quick recognition, not full preview (tap to view full).

### 4.10 Shared Screens

#### 26 — In-App Call
- **Objective:** Voice (or video) call between client and professional, gated to an existing booking. **[REQ]**
- **Layout:** Standard call UI — full-screen takeover, standard controls (mute, end call, speaker).
- **Components:** Call SDK's native call surface (Stream or equivalent), incoming-call full-screen UI for the receiving party (not just a banner). **[REQ, Spec.md §10]**
- **Data displayed:** Call state (connecting, in-call, ended), duration timer.
- **User actions:** Answer/decline (receiving party), mute, end call.
- **Interactions:** Token fetch failure shows *why* (e.g., booking in the wrong state) rather than a generic "failed" message; network-level connection failures get a generic retry; mid-call drops rely on the SDK's own reconnect logic, reflected passively by the UI. **[REQ, Spec.md §10]**
- **Edge cases/states:** Booking not in `pending`/`accepted` state — call cannot be initiated at all, entry point disabled rather than allowed to fail. **[REQ]** Call duration cap — reflects whatever the SDK does when the cap hits; no client-side timer enforcement to build. **[REQ]**
- **Mobile/responsive:** Full-screen on all devices; this is a takeover, not embedded in the tab layout.

#### 27 — Report Viewer
- **Objective:** Render a post-job PDF report in-app. **[REQ]**
- **Layout:** In-app PDF viewer, not a browser hand-off. **[REQ, Spec.md §3.1]**
- **Components:** PDF render surface, download/share action, pending-state illustration when not yet ready.
- **Data displayed:** Report metadata, incident count, high-severity flag, rendered PDF content. **[REQ]**
- **User actions:** View, download/share, "notify me" if pending.
- **Interactions:** If `generation_status ≠ complete`, the screen either refetches until ready or shows a "notify me" state, since an FCM push fires on completion anyway — no need to force a user to sit and wait. **[REQ, Spec.md §3.1]**
- **Edge cases/states:** Generation failed (after retries) — a plain "report couldn't be generated" state, not a silently stuck pending spinner. **[ASM — backend spec defines a `failed` generation status but the frontend spec doesn't detail its screen treatment; this follows directly from the state existing]**
- **Mobile/responsive:** PDF viewer supports pinch-zoom; download action always reachable without needing to scroll the document itself.

---

## 5. Design System Recommendations

*(This section documents design-system decisions the team has already locked, carried forward here as the binding reference for screen implementation — not a fresh proposal.)* **[REC — reflecting prior team decisions]**

### 5.1 Typography
- **Display:** Space Grotesk — used for hero numerals, screen titles, the one dominant focal element per screen.
- **Body:** IBM Plex Sans — all reading text, labels, descriptions, microcopy.
- **Numeric/operational data:** IBM Plex Mono — restricted to actual data tokens shown as small chips (timestamps, rates, trust scores, job/booking IDs). Not used for full sentences or metadata lines — that stays in Plex Sans even when it contains a number, to keep the mono voice meaningful rather than decorative.

### 5.2 Colors
| Token | Value | Use |
|---|---|---|
| `void` | `#12151A` | Base background |
| `panel` | `#1B2029` | Card / surface |
| `gold` (accent) | `#F0A73B` | Primary actions, active states — the one color doing identity work |
| `steel` (secondary) | `#3D5A80` | Informational, medium/low severity |
| `ember` (critical) | `#C1453A` | High-severity only — never used decoratively, reserved so its appearance always means something |

Severity is never color-only: every High-severity element also carries a label and an icon, so meaning survives for a user who can't distinguish the hues.

### 5.3 Spacing
- 8pt base grid, consistent across both navigators. **[REC]**
- Whitespace around the hero stat/panel on Home/Dashboard screens is deliberately generous — it's the one focal point per screen, and crowding it with secondary content would undercut that.

### 5.4 Component Library Recommendations
- **Signature element — diamond-aperture status ring:** replaces default circular progress universally. Used for: staffing progress (Job Summary), trust score (My Trust Score, Professional Profile), and job/booking status (Active Job screens). Diamond-clipped fill, guard/status markers sit on the diamond's actual vertices — deliberately not a circular radar sweep, since that's a generic security-app trope disconnected from Sentri's own shield-logo language.
- **Chamfered (45°-cut) panel:** reserved for exactly one identity/status element per screen — the hero panel only. Never applied to buttons, list containers, or everyday chrome, which stay soft-radius and clearly tappable.
- **Dispatch-ticket list rows:** left color bar (status/severity), punched-notch edge, mono job/request ID — used for every job/booking/request list, replacing plain hairline-divided rows. Rows sit inside a contained soft-radius panel, not flush against the base background.
- **Avatars:** colored tile + initials, used on every job/request row for scannability.
- **Bottom navigation:** floating centered capsule dock; active tab renders as a solid gold circle — not a flush edge-to-edge tab bar.

### 5.5 Reusable UI Patterns
- **Countdown banners** (Post-Job Confirmation) — always paired with a background refetch-on-focus; the visible countdown is never trusted as the actual state.
- **Analyzing/processing states** — used only where genuine AI latency exists (Assessment Input); a generic spinner is used everywhere else to avoid diluting the meaning of the "AI is working" moment.
- **Partial-success list rendering** — per-row success/retry chips (Create Job, Confirm & Pay) instead of all-or-nothing error blocking, used consistently everywhere the backend's per-item independence (per-booking escrow, per-slot booking) surfaces to the user.

---

## 6. UX Considerations

### 6.1 Accessibility **[REC]**
- Every status/severity communicated by color is paired with an icon or label — required given `ember`/`steel`/`gold` distinctions carry real operational meaning (e.g., incident severity).
- Diamond-aperture rings include a plain-text percentage/score readout for screen readers, since the shape itself conveys nothing to a non-visual user.
- Minimum touch target size maintained on all field-use screens (Log Incident, Check-In) given professionals may be interacting one-handed or under time pressure.
- Contrast-tested against the `void`/`panel` dark backgrounds specifically, not assumed from a light-mode baseline.

### 6.2 Error Prevention **[REQ, backend + frontend spec cross-cutting rules]**
- Money and evidence writes never optimistically update — every confirm/pay/log-incident action shows a genuine pending state until the backend confirms, directly reflecting the "re-fetch, don't assume" architecture rule.
- Destructive-adjacent actions (Decline booking, Dispute payment) get inline context rather than a blind confirm dialog — the professional/client sees *why* it matters before committing, not just "are you sure?"
- Fixed enums (incident type, document type) are always selected from backend-provided lists, never free text where a fixed list exists — prevents invalid states before submission rather than rejecting them after.

### 6.3 Empty / Loading / Error States
- Every list screen (Home Dashboard, Browse, History, Anomaly History) has bespoke empty-state copy specified per screen above, rather than a single generic "Nothing here" — each one either explains why it's empty or offers a next action.
- Loading state convention (skeleton vs. spinner) is flagged in the frontend spec as **not yet standardized app-wide** **[REQ, Spec.md §12]** — this document recommends **skeleton screens for list/detail screens** (Home, Browse, History, Profile) and a **spinner reserved for one-shot actions** (submit, pay, call-connect), so the two conventions map to "waiting to see existing data" vs. "waiting for an action's result" rather than being interchangeable. **[REC]**
- Error states throughout state what went wrong in plain language and what to do next — never a raw error code, per the backend/frontend specs' own emphasis on human-readable failure states (e.g., Booking Request Detail's "already actioned," Assessment Input's credit-vs-hard-failure distinction).

### 6.4 User Onboarding
- Role Selection uses full explanatory cards rather than a toggle specifically because the choice is permanent and consequential — this is the one onboarding moment worth slowing the user down for, deliberately breaking from the "frictionless is best" instinct. **[REQ, per team's locked decision]**
- Professional Profile Setup is a required gate, not a skippable step, since browse-eligibility and verification depend on it existing — but it's broken into short steps (progressive disclosure) rather than one long form, to keep the mandatory gate from feeling punishing.
- Document upload's empty-state checklist doubles as onboarding guidance — showing exactly which credential types are required before the professional can go live, rather than leaving that as tribal knowledge.

---

## Appendix — Items Requiring Team Confirmation Before Build

Carried forward from the frontend spec's own open-items log (`Spec.md` §11), the following affect specific screens above and should be resolved before those screens are finalized:

- **Role resolution endpoint (blocking):** Splash's routing logic assumes this exists; currently falls back to Login on failure.
- **Jobs/bookings list endpoint:** Home Dashboard, History screens (both roles) are speced against a hook, not a confirmed endpoint shape.
- **Check-in interval exposure:** Professional Active Job Screen uses a hardcoded 30-minute fallback.
- **GPS-permission-denied handling:** Professional Active Job Screen's banner is a frontend-only mitigation; no backend-side resolution path exists yet.
- **Document signed-URL endpoint:** Document Upload & Status is built against the incident-photo upload pattern as a placeholder.
- **Voice vs. video call default:** In-App Call assumes voice-only (no camera permission prompt) until confirmed.