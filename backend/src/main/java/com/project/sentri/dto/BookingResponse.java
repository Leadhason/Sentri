package com.project.sentri.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class BookingResponse {
    private UUID id;
    private UUID jobId;
    private UUID clientId;
    private UUID professionalId;
    private String professionalName;
    private String jobDescription;
    private String location;
    private Integer minDuration;
    private Integer maxDuration;
    private BigDecimal actualHours;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String status;
    private String slotType;
    private List<UUID> declinedProfessionals;
    private Boolean incidentsLocked;
    private OffsetDateTime createdAt;
}
