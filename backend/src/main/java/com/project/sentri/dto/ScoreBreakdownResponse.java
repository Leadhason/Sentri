package com.project.sentri.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class ScoreBreakdownResponse {
    private Integer trustScore;
    private Integer baseScore;
    private Integer aiAdjustment;
    private Map<String, Object> breakdown;
}
