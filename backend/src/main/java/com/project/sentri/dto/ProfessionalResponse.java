package com.project.sentri.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ProfessionalResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private String bio;
    private List<String> specializations;
    private BigDecimal hourlyRate;
    private List<String> operatingLocations;
    private String availabilityStatus;
    private String verificationStatus;
    private Integer trustScore;
    private Integer completedJobsCount;
    private OffsetDateTime createdAt;
}
