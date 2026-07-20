package com.project.sentri.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class AnomalyPatternAnalysisResponse {
    private UUID id;
    private UUID professionalId;
    private LocalDate analysisDate;
    private String riskLevel;
    private Boolean patternDetected;
    private String summary;
    private String recommendedAction;
    private OffsetDateTime createdAt;
}
