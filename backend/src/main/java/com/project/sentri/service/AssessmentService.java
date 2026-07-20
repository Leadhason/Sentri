package com.project.sentri.service;

import tools.jackson.databind.json.JsonMapper;
import com.project.sentri.dto.AssessmentRequest;
import com.project.sentri.dto.AssessmentResponse;
import com.project.sentri.entity.Assessment;
import com.project.sentri.entity.Client;
import com.project.sentri.entity.Professional;
import com.project.sentri.repository.AssessmentRepository;
import com.project.sentri.repository.ClientRepository;
import com.project.sentri.repository.ProfessionalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final ClientRepository clientRepository;
    private final ProfessionalRepository professionalRepository;
    private final AnthropicService anthropicService;
    private final JsonMapper jsonMapper;

    public AssessmentService(AssessmentRepository assessmentRepository,
                             ClientRepository clientRepository,
                             ProfessionalRepository professionalRepository,
                             AnthropicService anthropicService,
                             JsonMapper jsonMapper) {
        this.assessmentRepository = assessmentRepository;
        this.clientRepository = clientRepository;
        this.professionalRepository = professionalRepository;
        this.anthropicService = anthropicService;
        this.jsonMapper = jsonMapper;
    }

    @Transactional
    public AssessmentResponse performAssessment(UUID clientId, AssessmentRequest request) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));

        // Credit check
        if (client.getAssessmentCreditsRemaining() <= 0) {
            throw new IllegalStateException("Insufficient assessment credits. Next reset at: " + client.getCreditsResetAt());
        }

        // Deduct credit upfront
        client.setAssessmentCreditsRemaining(client.getAssessmentCreditsRemaining() - 1);
        client = clientRepository.save(client);

        String systemPrompt = "You are a professional security operations planner. Analyze the event information provided by the user and determine the security risk level, risk flags, recommended personnel types with counts and rationales, and a summary.\n" +
                "You MUST output strictly raw JSON matching this structure and nothing else. No markdown code blocks, no preamble, no postscript.\n" +
                "JSON structure:\n" +
                "{\n" +
                "  \"risk_level\": \"low|moderate|high\",\n" +
                "  \"risk_flags\": [\"flag1\", \"flag2\"],\n" +
                "  \"recommended_personnel\": [\n" +
                "    { \"type\": \"type\", \"count\": 2, \"rationale\": \"rationale text\" }\n" +
                "  ],\n" +
                "  \"recommendations_summary\": \"summary text\"\n" +
                "}\n" +
                "Please choose personnel types from the following standard specializations: bodyguard, crowd_control, patrol, armed_guard, bouncer, event_security.";

        String userMessage;
        try {
            userMessage = jsonMapper.writeValueAsString(request);
        } catch (Exception e) {
            // Refund credit and fail
            refundCredit(client);
            throw new IllegalArgumentException("Failed to format assessment request data: " + e.getMessage(), e);
        }

        // Call Claude with retry logic (retry once)
        String rawResponse = null;
        Exception lastError = null;
        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                rawResponse = anthropicService.callClaude(systemPrompt, userMessage);
                break; // success
            } catch (Exception e) {
                lastError = e;
                if (attempt == 1) {
                    System.out.println("Warning: Claude API call failed, retrying... Error: " + e.getMessage());
                }
            }
        }

        if (rawResponse == null) {
            // Refund credit on hard failure
            refundCredit(client);
            throw new RuntimeException("AI threat assessment service is currently unavailable. Credit refunded. Last error: " + (lastError != null ? lastError.getMessage() : "unknown"), lastError);
        }

        Map<String, Object> aiRecommendationMap;
        try {
            // Clean up any potential markdown formatting in case Claude returned it anyway
            String jsonStr = rawResponse.trim();
            if (jsonStr.startsWith("```")) {
                int firstJsonIndex = jsonStr.indexOf('{');
                int lastJsonIndex = jsonStr.lastIndexOf('}');
                if (firstJsonIndex != -1 && lastJsonIndex != -1) {
                    jsonStr = jsonStr.substring(firstJsonIndex, lastJsonIndex + 1);
                }
            }
            aiRecommendationMap = jsonMapper.readValue(jsonStr, Map.class);
        } catch (Exception e) {
            // Refund credit if JSON is malformed and we cannot use it
            refundCredit(client);
            throw new RuntimeException("AI threat assessment returned a malformed response. Credit refunded. Raw response: " + rawResponse, e);
        }

        // Match professionals based on recommendations
        List<Map<String, Object>> matchedProfessionalsList = new ArrayList<>();
        List<Map<String, Object>> recommendedPersonnel = (List<Map<String, Object>>) aiRecommendationMap.get("recommended_personnel");
        if (recommendedPersonnel != null) {
            for (Map<String, Object> recommendation : recommendedPersonnel) {
                String type = (String) recommendation.get("type");
                Object countObj = recommendation.get("count");
                int count = countObj instanceof Number ? ((Number) countObj).intValue() : 1;

                List<Professional> professionals = professionalRepository.findMatchesForSlot(request.getLocation(), type, count);
                for (Professional p : professionals) {
                    matchedProfessionalsList.add(Map.of(
                            "professional_id", p.getId().toString(),
                            "name", p.getFullName(),
                            "type", type,
                            "hourly_rate", p.getHourlyRate(),
                            "trust_score", p.getTrustScore()
                    ));
                }
            }
        }

        Assessment assessment = Assessment.builder()
                .client(client)
                .eventType(request.getEventType())
                .location(request.getLocation())
                .attendance(request.getAttendance())
                .durationRange(request.getDurationRange())
                .concerns(request.getConcerns())
                .aiRecommendation(aiRecommendationMap)
                .matchedProfessionals(matchedProfessionalsList)
                .build();

        assessment = assessmentRepository.save(assessment);
        return mapToResponse(assessment);
    }

    public AssessmentResponse getAssessmentById(UUID id, UUID clientId) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found with ID: " + id));

        if (!assessment.getClient().getId().equals(clientId)) {
            throw new IllegalArgumentException("Access denied: Client is not the owner of this assessment");
        }

        return mapToResponse(assessment);
    }

    private void refundCredit(Client client) {
        try {
            client.setAssessmentCreditsRemaining(client.getAssessmentCreditsRemaining() + 1);
            clientRepository.save(client);
        } catch (Exception e) {
            System.err.println("Critical: Failed to refund assessment credit to client " + client.getId() + ": " + e.getMessage());
        }
    }

    private AssessmentResponse mapToResponse(Assessment a) {
        return AssessmentResponse.builder()
                .id(a.getId())
                .clientId(a.getClient().getId())
                .jobId(a.getJob() != null ? a.getJob().getId() : null)
                .eventType(a.getEventType())
                .location(a.getLocation())
                .attendance(a.getAttendance())
                .durationRange(a.getDurationRange())
                .concerns(a.getConcerns())
                .aiRecommendation(a.getAiRecommendation())
                .matchedProfessionals(a.getMatchedProfessionals())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
