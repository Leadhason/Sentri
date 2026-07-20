package com.project.sentri.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "score_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreReview {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professional_id", nullable = false)
    private Professional professional;

    @Column(name = "base_score_at_review", nullable = false)
    private Integer baseScoreAtReview;

    @Column(nullable = false)
    private Integer adjustment;

    @Column(nullable = false)
    private String rationale;

    @Column(name = "reviewed_at", nullable = false, updatable = false)
    private OffsetDateTime reviewedAt;

    @PrePersist
    protected void onCreate() {
        if (reviewedAt == null) {
            reviewedAt = OffsetDateTime.now();
        }
    }
}
