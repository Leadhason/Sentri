package com.project.sentri.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "professionals")
@DiscriminatorValue("professional")
@PrimaryKeyJoinColumn(name = "id")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Professional extends User {
    private String bio;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "specializations", columnDefinition = "varchar[]")
    private List<String> specializations;

    @Column(name = "hourly_rate", nullable = false)
    private BigDecimal hourlyRate;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "operating_locations", columnDefinition = "varchar[]")
    private List<String> operatingLocations;

    @Builder.Default
    @Column(name = "availability_status", nullable = false)
    private String availabilityStatus = "available"; // 'available', 'unavailable', 'suspended'

    @Builder.Default
    @Column(name = "verification_status", nullable = false)
    private String verificationStatus = "unverified"; // 'unverified', 'rejected', 'verified'

    @Builder.Default
    @Column(name = "base_score", nullable = false)
    private Integer baseScore = 100;

    @Builder.Default
    @Column(name = "ai_adjustment")
    private Integer aiAdjustment = 0;

    @Builder.Default
    @Column(name = "trust_score", nullable = false)
    private Integer trustScore = 100;

    @Column(name = "last_ai_review_at")
    private OffsetDateTime lastAiReviewAt;

    @Builder.Default
    @Column(name = "completed_jobs_count", nullable = false)
    private Integer completedJobsCount = 0;
}
