package com.project.sentri.service;

import tools.jackson.databind.json.JsonMapper;
import com.project.sentri.dto.ScoreBreakdownResponse;
import com.project.sentri.dto.ScoreReviewResponse;
import com.project.sentri.entity.Professional;
import com.project.sentri.entity.ScoreReview;
import com.project.sentri.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BehavioralScoreService {

    private final ProfessionalRepository professionalRepository;
    private final BookingRepository bookingRepository;
    private final IncidentRepository incidentRepository;
    private final DisputeRepository disputeRepository;
    private final AnomalyFlagRepository anomalyFlagRepository;
    private final ScoreReviewRepository scoreReviewRepository;
    private final AnthropicService anthropicService;
    private final JsonMapper jsonMapper;

    public BehavioralScoreService(ProfessionalRepository professionalRepository,
                                  BookingRepository bookingRepository,
                                  IncidentRepository incidentRepository,
                                  DisputeRepository disputeRepository,
                                  AnomalyFlagRepository anomalyFlagRepository,
                                  ScoreReviewRepository scoreReviewRepository,
                                  AnthropicService anthropicService,
                                  JsonMapper jsonMapper) {
        this.professionalRepository = professionalRepository;
        this.bookingRepository = bookingRepository;
        this.incidentRepository = incidentRepository;
        this.disputeRepository = disputeRepository;
        this.anomalyFlagRepository = anomalyFlagRepository;
        this.scoreReviewRepository = scoreReviewRepository;
        this.anthropicService = anthropicService;
        this.jsonMapper = jsonMapper;
    }

    @Transactional
    public void recalculateBaseScore(UUID professionalId) {
        Professional professional = professionalRepository.findById(professionalId)
                .orElseThrow(() -> new IllegalArgumentException("Professional not found with ID: " + professionalId));

        // Decline rate calculation
        long totalBookings = bookingRepository.findByProfessionalId(professionalId).size();
        long declinedBookings = bookingRepository.findByProfessionalId(professionalId).stream()
                .filter(b -> "declined".equals(b.getStatus()))
                .count();
        double declineRate = totalBookings > 0 ? (double) declinedBookings / totalBookings : 0.0;
        int declinePenalty = (int) (declineRate * 30); // Max 30 points penalty for high decline rate

        // Incident count by severity
        long lowIncidents = incidentRepository.countByProfessionalIdAndSeverity(professionalId, "Low");
        long mediumIncidents = incidentRepository.countByProfessionalIdAndSeverity(professionalId, "Medium");
        long highIncidents = incidentRepository.countByProfessionalIdAndSeverity(professionalId, "High");
        int incidentPenalty = (int) (lowIncidents * 2 + mediumIncidents * 5 + highIncidents * 15);

        // Unresolved disputes
        long unresolvedDisputes = disputeRepository.countUnresolvedByProfessionalId(professionalId);
        int disputePenalty = (int) (unresolvedDisputes * 10);

        // Confirmed anomaly flags
        long confirmedAnomalies = anomalyFlagRepository.countByProfessionalIdAndAdminAction(professionalId, "confirmed");
        int anomalyPenalty = (int) (confirmedAnomalies * 5);

        // Streak/Completion bonus (up to max +15)
        int completionBonus = Math.min(professional.getCompletedJobsCount() * 1, 15);

        // Compute Base Score
        int baseScore = 100 - declinePenalty - incidentPenalty - disputePenalty - anomalyPenalty + completionBonus;
        baseScore = Math.max(0, Math.min(100, baseScore));

        professional.setBaseScore(baseScore);
        
        int aiAdj = professional.getAiAdjustment() != null ? professional.getAiAdjustment() : 0;
        professional.setTrustScore(Math.max(0, Math.min(100, baseScore + aiAdj)));

        professionalRepository.save(professional);
    }

    public ScoreBreakdownResponse getScoreBreakdown(UUID professionalId) {
        Professional professional = professionalRepository.findById(professionalId)
                .orElseThrow(() -> new IllegalArgumentException("Professional not found with ID: " + professionalId));

        long totalBookings = bookingRepository.findByProfessionalId(professionalId).size();
        long declinedBookings = bookingRepository.findByProfessionalId(professionalId).stream()
                .filter(b -> "declined".equals(b.getStatus()))
                .count();
        double declineRate = totalBookings > 0 ? (double) declinedBookings / totalBookings : 0.0;
        int declinePenalty = (int) (declineRate * 30);

        long lowIncidents = incidentRepository.countByProfessionalIdAndSeverity(professionalId, "Low");
        long mediumIncidents = incidentRepository.countByProfessionalIdAndSeverity(professionalId, "Medium");
        long highIncidents = incidentRepository.countByProfessionalIdAndSeverity(professionalId, "High");
        int incidentPenalty = (int) (lowIncidents * 2 + mediumIncidents * 5 + highIncidents * 15);

        long unresolvedDisputes = disputeRepository.countUnresolvedByProfessionalId(professionalId);
        int disputePenalty = (int) (unresolvedDisputes * 10);

        long confirmedAnomalies = anomalyFlagRepository.countByProfessionalIdAndAdminAction(professionalId, "confirmed");
        int anomalyPenalty = (int) (confirmedAnomalies * 5);

        int completionBonus = Math.min(professional.getCompletedJobsCount() * 1, 15);

        Map<String, Object> breakdown = new LinkedHashMap<>();
        breakdown.put("declineRate", String.format("%.2f%%", declineRate * 100));
        breakdown.put("declinePenalty", -declinePenalty);
        breakdown.put("lowIncidentsCount", lowIncidents);
        breakdown.put("mediumIncidentsCount", mediumIncidents);
        breakdown.put("highIncidentsCount", highIncidents);
        breakdown.put("incidentPenalty", -incidentPenalty);
        breakdown.put("unresolvedDisputesCount", unresolvedDisputes);
        breakdown.put("disputePenalty", -disputePenalty);
        breakdown.put("confirmedAnomaliesCount", confirmedAnomalies);
        breakdown.put("anomalyPenalty", -anomalyPenalty);
        breakdown.put("completedJobsCount", professional.getCompletedJobsCount());
        breakdown.put("completionBonus", completionBonus);

        return ScoreBreakdownResponse.builder()
                .trustScore(professional.getTrustScore())
                .baseScore(professional.getBaseScore())
                .aiAdjustment(professional.getAiAdjustment() != null ? professional.getAiAdjustment() : 0)
                .breakdown(breakdown)
                .build();
    }

    public List<ScoreReviewResponse> getScoreHistory(UUID professionalId) {
        return scoreReviewRepository.findByProfessionalId(professionalId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void performWeeklyAiReviews() {
        OffsetDateTime staleTime = OffsetDateTime.now().minusDays(7);
        // Query professionals with baseScore between 32 and 48 OR missing reviews OR stale reviews
        List<Professional> targets = professionalRepository.findProfessionalsRequiringScoreReview(32, 48, staleTime);

        for (Professional p : targets) {
            try {
                processProfessionalAiReview(p);
            } catch (Exception e) {
                System.err.println("Error running trust score review for professional " + p.getId() + ": " + e.getMessage());
            }
        }
    }

    private void processProfessionalAiReview(Professional p) {
        // Collect qualitative histories
        List<Map<String, Object>> incidentHistory = incidentRepository.findByProfessionalId(p.getId()).stream()
                .map(i -> Map.<String, Object>of(
                        "type", i.getIncidentType(),
                        "severity", i.getSeverity(),
                        "description", i.getDescription(),
                        "date", i.getLoggedAt().toString()
                )).collect(Collectors.toList());

        List<Map<String, Object>> anomalyHistory = anomalyFlagRepository.findByProfessionalId(p.getId()).stream()
                .map(a -> Map.<String, Object>of(
                        "type", a.getAnomalyType(),
                        "action", a.getAdminAction() != null ? a.getAdminAction() : "unresolved",
                        "detected_at", a.getDetectedAt().toString()
                )).collect(Collectors.toList());

        Map<String, Object> historyPayload = Map.of(
                "professional_id", p.getId().toString(),
                "full_name", p.getFullName(),
                "base_score", p.getBaseScore(),
                "completed_jobs", p.getCompletedJobsCount(),
                "incidents", incidentHistory,
                "anomalies", anomalyHistory
        );

        String systemPrompt = "You are an AI trust and safety auditor for a smart security service. Review the professional's activity profile.\n" +
                "Evaluate if their qualitative behavior (repeated incidents, unresponsiveness patterns, suspicious location deviations, or dispute patterns) warrants an adjustments delta to their deterministic base score.\n" +
                "Provide an adjustment score (integer between -15 and +15) and a clean, concise rationale.\n\n" +
                "You MUST output strictly raw JSON matching this structure:\n" +
                "{\n" +
                "  \"adjustment\": -5,\n" +
                "  \"rationale\": \"explanation text\",\n" +
                "  \"confidence\": \"high|medium|low\"\n" +
                "}";

        String userPrompt;
        try {
            userPrompt = jsonMapper.writeValueAsString(historyPayload);
        } catch (Exception e) {
            return;
        }

        String rawResponse;
        try {
            rawResponse = anthropicService.callClaude(systemPrompt, userPrompt);
        } catch (Exception e) {
            System.err.println("Warning: AI score review Claude call failed for " + p.getId() + ". Skipping. Error: " + e.getMessage());
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
            System.err.println("Warning: AI score review response is malformed for " + p.getId() + ". Error: " + e.getMessage());
            return;
        }

        Object adjObj = responseMap.get("adjustment");
        int adjustment = adjObj instanceof Number ? ((Number) adjObj).intValue() : 0;
        String rationale = (String) responseMap.get("rationale");

        // Clamp adjustment to ±15
        adjustment = Math.max(-15, Math.min(15, adjustment));

        p.setAiAdjustment(adjustment);
        p.setTrustScore(Math.max(0, Math.min(100, p.getBaseScore() + adjustment)));
        p.setLastAiReviewAt(OffsetDateTime.now());
        professionalRepository.save(p);

        // Log audit review
        ScoreReview review = ScoreReview.builder()
                .professional(p)
                .baseScoreAtReview(p.getBaseScore())
                .adjustment(adjustment)
                .rationale(rationale != null ? rationale : "AI periodic review")
                .build();
        scoreReviewRepository.save(review);
    }

    private ScoreReviewResponse mapToResponse(ScoreReview sr) {
        return ScoreReviewResponse.builder()
                .id(sr.getId())
                .professionalId(sr.getProfessional().getId())
                .baseScoreAtReview(sr.getBaseScoreAtReview())
                .adjustment(sr.getAdjustment())
                .rationale(sr.getRationale())
                .reviewedAt(sr.getReviewedAt())
                .build();
    }
}
