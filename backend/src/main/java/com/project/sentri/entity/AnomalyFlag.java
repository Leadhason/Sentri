package com.project.sentri.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "anomaly_flags")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnomalyFlag {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professional_id", nullable = false)
    private Professional professional;

    @Column(name = "anomaly_type", nullable = false)
    private String anomalyType;

    @Column(name = "detected_at", nullable = false, updatable = false)
    private OffsetDateTime detectedAt;

    @Column(name = "last_detected_at", nullable = false)
    private OffsetDateTime lastDetectedAt;

    @Column(name = "gps_at_flag")
    private String gpsAtFlag;

    @Column(name = "expected_location")
    private String expectedLocation;

    @Column(name = "admin_action")
    private String adminAction; // 'confirmed', 'dismissed'

    @Column(name = "dismissal_reason")
    private String dismissalReason;

    @Builder.Default
    @Column(nullable = false)
    private Boolean resolved = false;

    @PrePersist
    protected void onCreate() {
        if (detectedAt == null) {
            detectedAt = OffsetDateTime.now();
        }
        if (lastDetectedAt == null) {
            lastDetectedAt = OffsetDateTime.now();
        }
    }
}
