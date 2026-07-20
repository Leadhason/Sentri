package com.project.sentri.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ReportResponse {
    private UUID id;
    private UUID jobId;
    private OffsetDateTime generatedAt;
    private String reportUrl;
    private Integer incidentCount;
    private Boolean hasHighSeverity;
    private String generationStatus;
    private String triggeredBy;
}
