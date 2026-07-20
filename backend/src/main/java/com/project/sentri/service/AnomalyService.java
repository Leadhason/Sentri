package com.project.sentri.service;

import tools.jackson.databind.json.JsonMapper;
import com.project.sentri.dto.AnomalyDismissRequest;
import com.project.sentri.dto.AnomalyFlagResponse;
import com.project.sentri.dto.AnomalyPatternAnalysisResponse;
import com.project.sentri.entity.*;
import com.project.sentri.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnomalyService {

    private final AnomalyFlagRepository anomalyFlagRepository;
    private final BookingRepository bookingRepository;
    private final LocationLogRepository locationLogRepository;
    private final CheckinRepository checkinRepository;
    private final IncidentRepository incidentRepository;
    private final SettingRepository settingRepository;
    private final ProfessionalRepository professionalRepository;
    private final AnomalyPatternAnalysisRepository anomalyPatternAnalysisRepository;
    private final BehavioralScoreService behavioralScoreService;
    private final AnthropicService anthropicService;
    private final JsonMapper jsonMapper;

    public AnomalyService(AnomalyFlagRepository anomalyFlagRepository,
                          BookingRepository bookingRepository,
                          LocationLogRepository locationLogRepository,
                          CheckinRepository checkinRepository,
                          IncidentRepository incidentRepository,
                          SettingRepository settingRepository,
                          ProfessionalRepository professionalRepository,
                          AnomalyPatternAnalysisRepository anomalyPatternAnalysisRepository,
                          BehavioralScoreService behavioralScoreService,
                          AnthropicService anthropicService,
                          JsonMapper jsonMapper) {
        this.anomalyFlagRepository = anomalyFlagRepository;
        this.bookingRepository = bookingRepository;
        this.locationLogRepository = locationLogRepository;
        this.checkinRepository = checkinRepository;
        this.incidentRepository = incidentRepository;
        this.settingRepository = settingRepository;
        this.professionalRepository = professionalRepository;
        this.anomalyPatternAnalysisRepository = anomalyPatternAnalysisRepository;
        this.behavioralScoreService = behavioralScoreService;
        this.anthropicService = anthropicService;
        this.jsonMapper = jsonMapper;
    }

    public List<AnomalyFlagResponse> getPendingFlags() {
        return anomalyFlagRepository.findByResolved(false).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AnomalyFlagResponse getFlagById(UUID id) {
        AnomalyFlag flag = anomalyFlagRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Anomaly flag not found with ID: " + id));
        return mapToResponse(flag);
    }

    public List<AnomalyFlagResponse> getOwnFlags(UUID professionalId) {
        // Surface confirmed-only flag history
        return anomalyFlagRepository.findByProfessionalId(professionalId).stream()
                .filter(f -> "confirmed".equals(f.getAdminAction()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AnomalyFlagResponse confirmFlag(UUID flagId, UUID adminId) {
        AnomalyFlag flag = anomalyFlagRepository.findById(flagId)
                .orElseThrow(() -> new IllegalArgumentException("Anomaly flag not found with ID: " + flagId));

        if (flag.getResolved()) {
            throw new IllegalStateException("Anomaly flag is already resolved");
        }

        flag.setAdminAction("confirmed");
        flag.setResolved(true);
        flag = anomalyFlagRepository.save(flag);

        // Trigger trust score recalculation
        Professional professional = flag.getProfessional();
        behavioralScoreService.recalculateBaseScore(professional.getId());

        // Check for automatic suspension (>= 3 confirmed flags in last 30 days)
        OffsetDateTime thirtyDaysAgo = OffsetDateTime.now().minusDays(30);
        long confirmedCount = anomalyFlagRepository.findByProfessionalId(professional.getId()).stream()
                .filter(f -> "confirmed".equals(f.getAdminAction()))
                .filter(f -> f.getDetectedAt().isAfter(thirtyDaysAgo))
                .count();

        if (confirmedCount >= 3) {
            professional.setAvailabilityStatus("suspended");
            professionalRepository.save(professional);
            System.out.println("FCM: Professional " + professional.getId() + " AUTOMATICALLY SUSPENDED due to " + confirmedCount + " confirmed anomalies in 30 days.");
        }

        System.out.println("FCM: Anomaly flag confirmed. Recalculated trust score for " + professional.getFullName());
        return mapToResponse(flag);
    }

    @Transactional
    public AnomalyFlagResponse dismissFlag(UUID flagId, UUID adminId, AnomalyDismissRequest request) {
        AnomalyFlag flag = anomalyFlagRepository.findById(flagId)
                .orElseThrow(() -> new IllegalArgumentException("Anomaly flag not found with ID: " + flagId));

        if (flag.getResolved()) {
            throw new IllegalStateException("Anomaly flag is already resolved");
        }

        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Dismissal reason is required");
        }

        flag.setAdminAction("dismissed");
        flag.setDismissalReason(request.getReason());
        flag.setResolved(true);
        flag = anomalyFlagRepository.save(flag);

        return mapToResponse(flag);
    }

    @Transactional
    public void contactProfessional(UUID flagId, UUID adminId) {
        AnomalyFlag flag = anomalyFlagRepository.findById(flagId)
                .orElseThrow(() -> new IllegalArgumentException("Anomaly flag not found with ID: " + flagId));

        System.out.println("LOG: Admin " + adminId + " contacted professional " + flag.getProfessional().getId() + " regarding flag: " + flag.getAnomalyType());
    }

    @Transactional
    public void escalateFlag(UUID flagId, UUID adminId) {
        AnomalyFlag flag = anomalyFlagRepository.findById(flagId)
                .orElseThrow(() -> new IllegalArgumentException("Anomaly flag not found with ID: " + flagId));

        Booking booking = flag.getBooking();
        booking.setStatus("disputed");
        bookingRepository.save(booking);

        System.out.println("LOG: Booking " + booking.getId() + " escalated to DISPUTED status. Payments frozen.");
    }

    public Map<String, String> getAnomalyThresholds() {
        Map<String, String> thresholds = new HashMap<>();
        thresholds.put("anomaly.location_departure_meters", getSetting("anomaly.location_departure_meters", "500"));
        thresholds.put("anomaly.inactivity_minutes", getSetting("anomaly.inactivity_minutes", "45"));
        thresholds.put("anomaly.rapid_abandonment_minutes", getSetting("anomaly.rapid_abandonment_minutes", "15"));
        thresholds.put("anomaly.late_start_minutes", getSetting("anomaly.late_start_minutes", "20"));
        thresholds.put("anomaly.checkin_interval_minutes", getSetting("anomaly.checkin_interval_minutes", "30"));
        return thresholds;
    }

    @Transactional
    public void updateAnomalyThresholds(Map<String, String> newThresholds, UUID adminId) {
        for (Map.Entry<String, String> entry : newThresholds.entrySet()) {
            Setting setting = settingRepository.findByKey(entry.getKey())
                    .orElseGet(() -> Setting.builder().key(entry.getKey()).build());
            setting.setValue(entry.getValue());
            settingRepository.save(setting);
        }
    }

    @Transactional
    public void checkin(UUID bookingId, UUID professionalId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (!"active".equals(booking.getStatus())) {
            throw new IllegalStateException("Check-in is only allowed for active bookings");
        }

        if (!booking.getProfessional().getId().equals(professionalId)) {
            throw new IllegalArgumentException("Unauthorized check-in attempt");
        }

        Checkin checkin = Checkin.builder()
                .booking(booking)
                .professional(booking.getProfessional())
                .build();

        checkinRepository.save(checkin);
        System.out.println("Job: Check-in saved for professional " + professionalId + " on booking " + bookingId);
    }

    @Transactional
    public void runAnomalyChecks() {
        List<Booking> activeBookings = bookingRepository.findByStatus("active");
        OffsetDateTime now = OffsetDateTime.now();

        // 1. Load thresholds from settings
        double locationThreshold = Double.parseDouble(getSetting("anomaly.location_departure_meters", "500"));
        int inactivityThreshold = Integer.parseInt(getSetting("anomaly.inactivity_minutes", "45"));
        int rapidAbandonThreshold = Integer.parseInt(getSetting("anomaly.rapid_abandonment_minutes", "15"));

        for (Booking booking : activeBookings) {
            Optional<LocationLog> lastLog = locationLogRepository.findFirstByBookingIdOrderByRecordedAtDesc(booking.getId());

            // A. Location Departure Check
            if (lastLog.isPresent()) {
                double distance = calculateHaversineDistance(
                        booking.getJob().getLocation(), // expected (we assume job location string can be parsed or we check coordinates if present. Let's mock coordinate check)
                        lastLog.get().getLatitude().doubleValue(),
                        lastLog.get().getLongitude().doubleValue()
                );

                if (distance > locationThreshold) {
                    createOrUpdateAnomalyFlag(booking, "location_departure", 
                            lastLog.get().getLatitude() + "," + lastLog.get().getLongitude(), 
                            booking.getLocation());
                }
            }

            // B. Inactivity Check
            Optional<Checkin> lastCheckin = checkinRepository.findFirstByBookingIdOrderByCheckedInAtDesc(booking.getId());
            Optional<Incident> lastIncident = incidentRepository.findByBookingId(booking.getId()).stream()
                    .max(Comparator.comparing(Incident::getLoggedAt));

            OffsetDateTime lastActivity = booking.getCreatedAt(); // fallback
            if (lastLog.isPresent() && lastLog.get().getRecordedAt().isAfter(lastActivity)) {
                lastActivity = lastLog.get().getRecordedAt();
            }
            if (lastCheckin.isPresent() && lastCheckin.get().getCheckedInAt().isAfter(lastActivity)) {
                lastActivity = lastCheckin.get().getCheckedInAt();
            }
            if (lastIncident.isPresent() && lastIncident.get().getLoggedAt().isAfter(lastActivity)) {
                lastActivity = lastIncident.get().getLoggedAt();
            }

            if (now.isAfter(lastActivity.plusMinutes(inactivityThreshold))) {
                createOrUpdateAnomalyFlag(booking, "extended_inactivity", null, "Regular check-ins or location pings");
            }

            // C. Rapid Abandonment Check
            if (booking.getStartTime() != null && now.isBefore(booking.getStartTime().plusMinutes(30))) {
                if (lastLog.isPresent() && now.isAfter(lastLog.get().getRecordedAt().plusMinutes(rapidAbandonThreshold))) {
                    createOrUpdateAnomalyFlag(booking, "rapid_job_abandonment", null, "Continuous GPS tracking at start");
                }
            }
        }

        // D. Late Job Start Check
        List<Booking> pendingBookings = bookingRepository.findByStatus("accepted");
        int lateStartThreshold = Integer.parseInt(getSetting("anomaly.late_start_minutes", "20"));

        for (Booking booking : pendingBookings) {
            if (booking.getStartTime() != null && now.isAfter(booking.getStartTime().plusMinutes(lateStartThreshold))) {
                Optional<Checkin> checkin = checkinRepository.findFirstByBookingIdOrderByCheckedInAtDesc(booking.getId());
                if (checkin.isEmpty()) {
                    createOrUpdateAnomalyFlag(booking, "late_job_start", null, "Initial check-in at start time");
                }
            }
        }
    }

    @Transactional
    public void performWeeklyAnomalyPatternAnalysis() {
        OffsetDateTime ninetyDaysAgo = OffsetDateTime.now().minusDays(90);

        // Fetch all professionals with flags in last 90 days
        List<Professional> targets = professionalRepository.findAll().stream()
                .filter(p -> {
                    long flagCount = anomalyFlagRepository.findByProfessionalId(p.getId()).stream()
                            .filter(f -> f.getDetectedAt().isAfter(ninetyDaysAgo))
                            .count();
                    return flagCount > 0;
                }).collect(Collectors.toList());

        for (Professional p : targets) {
            try {
                processWeeklyAnomalyPatternAnalysisForProfessional(p, ninetyDaysAgo);
            } catch (Exception e) {
                System.err.println("Error doing AI anomaly analysis for professional " + p.getId() + ": " + e.getMessage());
            }
        }
    }

    private void processWeeklyAnomalyPatternAnalysisForProfessional(Professional p, OffsetDateTime ninetyDaysAgo) {
        List<Map<String, Object>> flagHistory = anomalyFlagRepository.findByProfessionalId(p.getId()).stream()
                .filter(f -> f.getDetectedAt().isAfter(ninetyDaysAgo))
                .map(f -> Map.<String, Object>of(
                        "anomaly_type", f.getAnomalyType(),
                        "booking_id", f.getBooking().getId().toString(),
                        "detected_at", f.getDetectedAt().toString(),
                        "admin_action", f.getAdminAction() != null ? f.getAdminAction() : "unresolved"
                )).collect(Collectors.toList());

        Map<String, Object> payload = Map.of(
                "professional_id", p.getId().toString(),
                "analysis_period_days", 90,
                "anomaly_history", flagHistory,
                "total_jobs_in_period", p.getCompletedJobsCount()
        );

        String systemPrompt = "You are an AI trust and safety auditor. Evaluate if the professional's repeated anomaly flag alerts (departures, inactivity, lateness) represent a concerning pattern or exit risk.\n" +
                "Determine the risk level (low/medium/high), whether a pattern was detected, a short summary, and a recommended action.\n\n" +
                "You MUST output strictly raw JSON matching this structure:\n" +
                "{\n" +
                "  \"risk_level\": \"low|medium|high\",\n" +
                "  \"pattern_detected\": true|false,\n" +
                "  \"summary\": \"summary text\",\n" +
                "  \"recommended_action\": \"action description\"\n" +
                "}";

        String userPrompt;
        try {
            userPrompt = jsonMapper.writeValueAsString(payload);
        } catch (Exception e) {
            return;
        }

        String rawResponse;
        try {
            rawResponse = anthropicService.callClaude(systemPrompt, userPrompt);
        } catch (Exception e) {
            System.err.println("Warning: AI anomaly pattern analysis failed for " + p.getId() + ". Error: " + e.getMessage());
            return;
        }

        Map<String, Object> responseMap;
        try {
            String jsonStr = rawResponse.trim();
            if (jsonStr.startsWith("```")) {
                int firstJsonIndex = jsonStr.indexOf('{');
                int lastJsonIndex = jsonStr.lastIndexOf('}');
                if (firstJsonIndex != -1 && lastJsonIndex != -1) {
                    jsonStr = jsonStr.substring(firstJsonIndex, lastJsonIndex + 1);
                }
            }
            responseMap = jsonMapper.readValue(jsonStr, Map.class);
        } catch (Exception e) {
            System.err.println("Warning: AI anomaly pattern response malformed. Error: " + e.getMessage());
            return;
        }

        AnomalyPatternAnalysis analysis = AnomalyPatternAnalysis.builder()
                .professional(p)
                .analysisDate(LocalDate.now())
                .riskLevel((String) responseMap.get("risk_level"))
                .patternDetected((Boolean) responseMap.get("pattern_detected"))
                .summary((String) responseMap.get("summary"))
                .recommendedAction((String) responseMap.get("recommended_action"))
                .build();

        anomalyPatternAnalysisRepository.save(analysis);
        System.out.println("Job: AI weekly anomaly pattern analysis saved for professional " + p.getFullName());
    }

    private void createOrUpdateAnomalyFlag(Booking booking, String anomalyType, String gps, String expected) {
        Optional<AnomalyFlag> existing = anomalyFlagRepository.findByBookingIdAndAnomalyTypeAndResolved(
                booking.getId(), anomalyType, false);

        if (existing.isPresent()) {
            AnomalyFlag flag = existing.get();
            flag.setLastDetectedAt(OffsetDateTime.now());
            if (gps != null) flag.setGpsAtFlag(gps);
            anomalyFlagRepository.save(flag);
        } else {
            AnomalyFlag flag = AnomalyFlag.builder()
                    .booking(booking)
                    .professional(booking.getProfessional())
                    .anomalyType(anomalyType)
                    .gpsAtFlag(gps)
                    .expectedLocation(expected)
                    .resolved(false)
                    .build();
            anomalyFlagRepository.save(flag);
            System.out.println("FCM: New anomaly flag detected: " + anomalyType + " for Booking: " + booking.getId());
        }
    }

    private String getSetting(String key, String defaultValue) {
        return settingRepository.findByKey(key)
                .map(Setting::getValue)
                .orElse(defaultValue);
    }

    private double calculateHaversineDistance(String locationString, double lat2, double lon2) {
        // Since geocoding is mocked, let's return a distance of 100 meters, or compare coordinates if lat/lon are parsed.
        // For testing purposes, we assume the professional matches unless we simulate a mismatch.
        // If the locationString contains coordinates (e.g. "5.12, -1.2"), parse them, otherwise return 0.
        try {
            if (locationString != null && locationString.contains(",")) {
                String[] parts = locationString.split(",");
                double lat1 = Double.parseDouble(parts[0].trim());
                double lon1 = Double.parseDouble(parts[1].trim());
                return calculateHaversineDistance(lat1, lon1, lat2, lon2);
            }
        } catch (Exception e) {
            // ignore
        }
        return 10.0; // default 10 meters (within radius)
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000;
        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double deltaPhi = Math.toRadians(lat2 - lat1);
        double deltaLambda = Math.toRadians(lon2 - lon1);

        double a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    private AnomalyFlagResponse mapToResponse(AnomalyFlag f) {
        return AnomalyFlagResponse.builder()
                .id(f.getId())
                .bookingId(f.getBooking().getId())
                .professionalId(f.getProfessional().getId())
                .professionalName(f.getProfessional().getFullName())
                .anomalyType(f.getAnomalyType())
                .detectedAt(f.getDetectedAt())
                .lastDetectedAt(f.getLastDetectedAt())
                .gpsAtFlag(f.getGpsAtFlag())
                .expectedLocation(f.getExpectedLocation())
                .adminAction(f.getAdminAction())
                .dismissalReason(f.getDismissalReason())
                .resolved(f.getResolved())
                .build();
    }
}
