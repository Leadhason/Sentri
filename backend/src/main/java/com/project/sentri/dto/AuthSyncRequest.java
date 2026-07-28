package com.project.sentri.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthSyncRequest {
    private String fullName;
    private String phone;
    private String role; // "client", "professional", or "admin"
    private String bio;
    private BigDecimal hourlyRate;
    private List<String> specializations;
    private List<String> operatingLocations;
}
