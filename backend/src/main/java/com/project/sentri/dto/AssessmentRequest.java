package com.project.sentri.dto;

import lombok.Data;

@Data
public class AssessmentRequest {
    private String eventType;
    private String location;
    private Integer attendance;
    private String durationRange;
    private String concerns;
    private Integer durationHours;
}
