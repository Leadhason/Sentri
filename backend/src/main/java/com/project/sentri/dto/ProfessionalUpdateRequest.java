package com.project.sentri.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProfessionalUpdateRequest {
    private String bio;
    private List<String> specializations;
    private BigDecimal hourlyRate;
    private List<String> operatingLocations;
    private String availabilityStatus;
}
