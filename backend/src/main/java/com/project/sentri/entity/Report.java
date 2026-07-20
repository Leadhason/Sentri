package com.project.sentri.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "generated_at", nullable = false, updatable = false)
    private OffsetDateTime generatedAt;

    @Column(name = "report_url", nullable = false)
    private String reportUrl;

    @Builder.Default
    @Column(name = "incident_count", nullable = false)
    private Integer incidentCount = 0;

    @Builder.Default
    @Column(name = "has_high_severity", nullable = false)
    private Boolean hasHighSeverity = false;

    @Builder.Default
    @Column(name = "generation_status", nullable = false)
    private String generationStatus = "pending"; // 'pending', 'generating', 'complete', 'failed'

    @Builder.Default
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;

    @Column(name = "last_attempt_at")
    private OffsetDateTime lastAttemptAt;

    @Column(name = "triggered_by", nullable = false)
    private String triggeredBy; // 'auto', 'admin_manual'

    @PrePersist
    protected void onCreate() {
        if (generatedAt == null) {
            generatedAt = OffsetDateTime.now();
        }
    }
}
