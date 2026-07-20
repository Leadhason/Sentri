package com.project.sentri.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "assessments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private Job job;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private Integer attendance;

    @Column(name = "duration_range", nullable = false)
    private String durationRange;

    private String concerns;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_recommendation", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> aiRecommendation;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "matched_professionals", columnDefinition = "jsonb", nullable = false)
    private List<Map<String, Object>> matchedProfessionals;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (aiRecommendation == null) {
            aiRecommendation = Map.of();
        }
        if (matchedProfessionals == null) {
            matchedProfessionals = List.of();
        }
    }
}
