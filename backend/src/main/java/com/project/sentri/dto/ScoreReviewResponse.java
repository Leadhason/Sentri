package com.project.sentri.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ScoreReviewResponse {
    private UUID id;
    private UUID professionalId;
    private Integer baseScoreAtReview;
    private Integer adjustment;
    private String rationale;
    private OffsetDateTime reviewedAt;
}
