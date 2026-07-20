package com.project.sentri.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class AnomalyFlagResponse {
    private UUID id;
    private UUID bookingId;
    private UUID professionalId;
    private String professionalName;
    private String anomalyType;
    private OffsetDateTime detectedAt;
    private OffsetDateTime lastDetectedAt;
    private String gpsAtFlag;
    private String expectedLocation;
    private String adminAction;
    private String dismissalReason;
    private Boolean resolved;
}
