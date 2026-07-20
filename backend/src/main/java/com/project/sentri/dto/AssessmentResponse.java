package com.project.sentri.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class AssessmentResponse {
    private UUID id;
    private UUID clientId;
    private UUID jobId;
    private String eventType;
    private String location;
    private Integer attendance;
    private String durationRange;
    private String concerns;
    private Map<String, Object> aiRecommendation;
    private List<Map<String, Object>> matchedProfessionals;
    private OffsetDateTime createdAt;
}
