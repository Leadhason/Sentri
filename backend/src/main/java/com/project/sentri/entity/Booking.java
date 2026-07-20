package com.project.sentri.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professional_id", nullable = false)
    private Professional professional;

    @Column(name = "job_description")
    private String jobDescription;

    @Column(nullable = false)
    private String location;

    @Column(name = "min_duration", nullable = false)
    private Integer minDuration;

    @Column(name = "max_duration", nullable = false)
    private Integer maxDuration;

    @Column(name = "actual_hours")
    private BigDecimal actualHours;

    @Column(name = "start_time")
    private OffsetDateTime startTime;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    @Builder.Default
    @Column(name = "status", nullable = false)
    private String status = "pending"; // 'pending', 'accepted', 'active', 'completed', 'settled', 'declined', 'disputed'

    @Column(name = "slot_type", nullable = false)
    private String slotType;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "declined_professionals", columnDefinition = "uuid[]", nullable = false)
    private List<UUID> declinedProfessionals;

    @Builder.Default
    @Column(name = "incidents_locked", nullable = false)
    private Boolean incidentsLocked = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (declinedProfessionals == null) {
            declinedProfessionals = List.of();
        }
    }
}
