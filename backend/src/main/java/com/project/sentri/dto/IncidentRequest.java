package com.project.sentri.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class IncidentRequest {
    private String incidentType;
    private String description;
    private String photoUrl;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
