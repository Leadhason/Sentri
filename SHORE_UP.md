# Sentri Platform — Cumulative Shore-Up Log

This log lists all placeholders, security configurations, missing integrations, properties, and refactoring items needed to bring implemented features to a production-ready state.

---

## [2026-07-08] Session 1: Features 1 (Browse & Hire) & 2 (AI Needs Assessment)

### 🔒 Security & Auth Gaps
1. **OAuth2 Resource Server Filter Chain**: Expose JWT-validated user details to controllers.
   - *Requirement*: Create a `SecurityConfig` class registering a `SecurityFilterChain`.
   - *Detail*: Configure JWT decoding with Supabase's JWKS URI in `application.yaml` (under `spring.security.oauth2.resourceserver.jwt.jwk-set-uri`).
2. **Role-Based Access Control (RBAC)**: Extract role claims (e.g. `client`, `professional`, `admin`) from Supabase user metadata in the JWT.
   - *Requirement*: Map claims to Spring Security authorities to enforce `@PreAuthorize("hasAuthority('ROLE_CLIENT')")` or similar constraints.

### 🔌 Missing Third-Party Integrations
3. **FCM Push Notifications**: Real FCM alerts are currently stubbed with standard console logs (`System.out.println`) in `JobService`.
   - *Requirement*: Import Firebase Admin SDK and implement an `FCMService` to dispatch pushes using professional and client device tokens.
4. **Paystack Payments & Escrow Hold (Feature 8)**: Booking payments and escrow mechanisms are not yet connected to Paystack.
   - *Requirement*: Implement a Paystack API client class (using Spring's `RestClient`) to charge cards, hold funds in escrow, verify transactions, and issue payouts/refunds.
5. **Supabase Storage (Signed Upload URLs)**: Frontend needs backend-generated signed URLs to upload documents and photos securely.
   - *Requirement*: Build endpoints that call Supabase client libraries to generate signed write-only URLs for specific paths.
6. **Voice & Video Calling SDK**: Call rooms are not yet implemented.
   - *Requirement*: Create room-initiation logic targeting a third-party SDK provider (e.g., GetStream.io or Agora) and return call tokens to clients/professionals.

### ⚙️ Properties & Configurations
7. **Anthropic API Key**: `AnthropicService` retrieves the API key via `${anthropic.api.key:}`, which is currently unconfigured.
   - *Requirement*: Define `ANTHROPIC_API_KEY` in environment variables or `application.yaml`.

### 🛠️ Code Refactoring & Database Considerations
8. **JPA Entity `@Data` Hazard**: Entities currently use Lombok's `@Data` and `@EqualsAndHashCode(callSuper = true)`.
   - *Danger*: Auto-generated `toString()` and `hashCode()` can cause infinite recursion or N+1 queries during lazy loading.
   - *Fix*: Replace `@Data` with `@Getter` and `@Setter`, and write targeted `equals()` and `hashCode()` methods that compare database `id` only.
9. **SQL Array empty check**: The `NOT IN (:excludeIds)` query in `ProfessionalRepository` fails in Postgres if the list is empty. We passed a mock UUID in `JobService` to prevent this.
   - *Refactoring*: Implement a cleaner approach using dynamic JPA Specifications or a null check structure in SQL.
10. **AI Parser Failure Handling**: Parsing Claude's raw string responses into JSON maps is fragile.
    - *Refactoring*: Implement fallback patterns or JSON schema extraction to protect against unstructured text formats in Claude's output.

## [2026-07-08] Session 2: Features 3 (AI Document Verification) & 4 (Behavioral Risk Scoring)

### 🔒 Security & Auth Gaps
11. **Admin Authorization Guard**: Admin actions like approving/rejecting documents (`/api/admin/documents/**`) or checking score history (`/api/admin/professionals/{id}/score-history`) are checked using user properties.
    - *Requirement*: Enforce these rules at the API Gateway or Spring Security level using `@PreAuthorize("hasRole('ROLE_ADMIN')")` once the security filter chain is configured.

### 🔌 Missing Third-Party Integrations
12. **Claude Vision Mock Fallback**: If Claude Vision fails (or key is missing), `VerificationService` falls back to a hardcoded mock JSON extraction map.
    - *Requirement*: Remove or gate this fallback behind a profile-based configuration flag (e.g. `sentri.mock.ai-extraction=true`) so it cannot trigger in production.
13. **Private Bucket File Fetching**: In `VerificationService`, the backend downloads document files from file URLs using public HTTP GET.
    - *Requirement*: If credentials are stored in a private Supabase Storage bucket, the download request must include authorization headers (Bearer token / API service keys) or retrieve the files via backend-to-bucket SDKs.

### ⚙️ Properties & Configurations
14. **Scheduler Server Timezone**: Scheduling cron expressions like `0 0 3 * * *` (credit reset) and `0 0 4 * * MON` (score review) run based on the application server's local time.
    - *Requirement*: Configure `spring.task.scheduling.timezone` in properties to align with your platform's operational timezone (e.g. UTC or local time).

### 🛠️ Code Refactoring & Database Considerations
15. **Clamping Limits in Properties**: The AI adjustment range limit of `±15` is currently hardcoded in `BehavioralScoreService`.
    - *Refactoring*: Externalize this threshold value to application properties (e.g. `sentri.score.max-ai-adjustment=15`) so it can be tweaked without code redeployment.

## [2026-07-08] Session 3: Features 5 (Incident Logging) & 6 (AI Post-Job Report Generation)

### 🔒 Security & Auth Gaps
16. **Job Report Ownership Validator**: Endpoints for getting reports (`/api/jobs/{jobId}/report` and `/api/bookings/{id}/report`) do not verify if the calling client or professional has an active association with that job.
    - *Requirement*: Add validation logic in controllers or services to verify the authenticated user UUID matches either the job client or one of the assigned professionals.
17. **Admin Incident Audits RBAC**: Admin-specific endpoints `/api/admin/incidents/**` and `/api/admin/reports/**` should be role-guarded.
    - *Requirement*: Add `@PreAuthorize("hasRole('ROLE_ADMIN')")` once Spring Security config is fully loaded.

### 🔌 Missing Third-Party Integrations
18. **PDF Generation Engine**: Report PDF generation and upload are currently mocked, returning a hardcoded Supabase storage path.
    - *Requirement*: Add `iText` or `Apache PDFBox` dependencies, implement a layout generator, and fetch/embed incident photos inline (resizing to max 800px) from Supabase.
19. **Report Supabase Upload Connection**: PDF file uploads are stubbed out.
    - *Requirement*: Build the HTTP/REST client code in the storage manager to upload the generated PDF bytes to the private `reports` bucket on Supabase Storage.

### ⚙️ Properties & Configurations
20. **Report Retry Backoff Cron/Delay**: If report generation fails, it increments the retry count, but the backoff delay (2 min -> 5 min) is not fully scheduled.
    - *Requirement*: Implement a retry polling scheduler job in `SchedulerJobs` that processes failed reports (e.g., status is `failed` and `retry_count < 3`) with the specified backoff intervals.

### 🛠️ Code Refactoring & Database Considerations
21. **Seeding Geofence Threshold**: In `IncidentService`, the location deviation threshold defaults to `500.0` meters if it's missing from settings.
    - *Refactoring*: Ensure database migrations seed the row `('anomaly.location_departure_meters', '500')` into the `settings` table at boot time.

## [2026-07-09] Session 4: Feature 7 (Anomaly Detection & Geofencing)

### 🔒 Security & Auth Gaps
22. **Admin Settings & Anomalies RBAC**: Endpoints under `/api/admin/anomalies/**` and `/api/admin/settings/**` require role restrictions.
    - *Requirement*: Apply `@PreAuthorize("hasRole('ROLE_ADMIN')")` security annotations to prevent privilege escalation.

### 🔌 Missing Third-Party Integrations
23. **Reverse Geocoding for City Mismatch Check**: The "Job Location Mismatch" checks compare the professional's GPS position with the booking location city. This is currently mocked.
    - *Requirement*: Integrate a reverse geocoding API (e.g. Google Maps Geocoding API or OpenStreetMap Nominatim) to convert GPS coordinates to city names for comparison.

### ⚙️ Properties & Configurations
24. **Settings Database Seeding**: Polling thresholds read from the settings table default to hardcoded fallbacks if the key is missing.
    - *Requirement*: Seed the settings table at boot time with the default keys: `anomaly.location_departure_meters` (500), `anomaly.inactivity_minutes` (45), `anomaly.rapid_abandonment_minutes` (15), `anomaly.late_start_minutes` (20), and `anomaly.checkin_interval_minutes` (30).

### 🛠️ Code Refactoring & Database Considerations
25. **Structural Coordinates on Job/Booking**: Location departure checks attempt to parse coordinates (e.g. `"5.12, -1.2"`) from the booking location string. If the location is a description (e.g., "Mövenpick Ballroom"), parsing fails.
    - *Refactoring*: Add explicit `latitude` and `longitude` fields to the `Job` (and `Booking`) entities to make distance auditing robust.

## [2026-07-09] Session 5: Feature 8 (Escrow Payment System) & Background Schedulers

### 🔒 Security & Auth Gaps
26. **Escrow Dispute Arbitration RBAC**: Dispute resolutions (/api/admin/disputes/{id}/resolve) must be restricted to administrators.
    - *Requirement*: Apply `@PreAuthorize("hasRole('ROLE_ADMIN')")` once the security filter chain is active.
27. **Payout/Refund Caller Guard**: Endpoints for release (`/confirm`) and hours submit (`/confirm-hours`) check user context in services.
    - *Requirement*: Ensure Spring Security propagates the correct principal to prevent identity spoofing.

### 🔌 Missing Third-Party Integrations
28. **Paystack Payout & Refund API Client**: Financial releases in `PaymentService.releasePayment` are currently simulated using print statements.
    - *Requirement*: Implement REST client connections targeting Paystack endpoints (`/transfer` for professional payouts, `/refund` for client returns) using Spring `RestClient`.

### ⚙️ Properties & Configurations
29. **Paystack Secret Credentials**: Paystack API client requires API keys.
    - *Requirement*: Configure `PAYSTACK_SECRET_KEY` in environment variables or `application.yaml`.

### 🛠️ Code Refactoring & Database Considerations
30. **Ledger Row Timestamp Sorting**: Because the database trigger blocks all updates to the `payments` table, state changes are recorded by inserting new payment rows. We find the latest state by sorting on the primary key UUID.
    - *Refactoring*: Add a `created_at` timestamp with timezone to the `payments` table and sort on it, as sorting on UUID keys is non-deterministic.

## [2026-07-15] Session 6: Spring Boot 4 / Jackson 3 Migration & Dependency Correction

### ⚙️ Properties & Configurations
31. **Jackson 3 Integration**: The application dependency configuration has been upgraded to Spring Boot 4.1.0 and utilizes Jackson 3's new immutable `tools.jackson.databind.json.JsonMapper` instead of Jackson 2's `com.fasterxml.jackson.databind.ObjectMapper`.
    - *Requirement*: Ensure all custom components or test classes requiring JSON mapping inject the new `JsonMapper` bean from the container rather than manually instantiating `ObjectMapper` using Jackson 2 configurations.

### 🛠️ Code Refactoring & Database Considerations
32. **Dependency Injection in PaymentService**: Resolved critical missing dependency injection where `PaymentService` referenced `BehavioralScoreService` without declaring it or injecting it. 
    - *Requirement*: Ensure that any future service extensions referencing other core services declare them as `private final` fields and inject them via the constructor.
33. **Map.of Constraints & Type Inference**:
    - *Requirement*: Avoid using Java's `Map.of` with more than 10 entries (limit of `Map.of` overloading). Use a builder or `LinkedHashMap` for larger sets.
    - *Requirement*: Explicitly parameterize `Map.<String, Object>of` within stream mapping collectors that compile into `List<Map<String, Object>>` to prevent compilation failures due to invariant generics type mismatch in Java.
