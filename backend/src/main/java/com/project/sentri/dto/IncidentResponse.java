package com.project.sentri.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class IncidentResponse {
    private UUID id;
    private UUID bookingId;
    private UUID professionalId;
    private String professionalName;
    private String incidentType;
    private String description;
    private String photoUrl;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String severity;
    private OffsetDateTime loggedAt;
    private Boolean locationMismatch;
}
