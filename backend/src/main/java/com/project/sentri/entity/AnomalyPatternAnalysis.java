package com.project.sentri.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "anomaly_pattern_analysis")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnomalyPatternAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professional_id", nullable = false)
    private Professional professional;

    @Column(name = "analysis_date", nullable = false)
    private LocalDate analysisDate;

    @Column(name = "risk_level", nullable = false)
    private String riskLevel; // 'low', 'medium', 'high'

    @Builder.Default
    @Column(name = "pattern_detected", nullable = false)
    private Boolean patternDetected = false;

    private String summary;

    @Column(name = "recommended_action")
    private String recommendedAction;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
