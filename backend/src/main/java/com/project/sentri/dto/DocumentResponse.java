package com.project.sentri.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class DocumentResponse {
    private UUID id;
    private UUID professionalId;
    private String documentType;
    private String fileUrl;
    private Map<String, Object> extractedFields;
    private BigDecimal confidenceScore;
    private List<String> flags;
    private String status;
    private UUID reviewedByAdminId;
    private String rejectionReason;
    private OffsetDateTime uploadedAt;
    private LocalDate expiryDate;
}
