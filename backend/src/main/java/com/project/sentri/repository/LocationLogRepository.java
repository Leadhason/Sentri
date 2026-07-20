package com.project.sentri.repository;

import com.project.sentri.entity.LocationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LocationLogRepository extends JpaRepository<LocationLog, UUID> {
    List<LocationLog> findByBookingId(UUID bookingId);
    Optional<LocationLog> findFirstByBookingIdOrderByRecordedAtDesc(UUID bookingId);

    @Modifying
    @Transactional
    @Query("DELETE FROM LocationLog l WHERE l.recordedAt < :cutoff " +
            "AND l.booking.id NOT IN (SELECT DISTINCT a.booking.id FROM AnomalyFlag a WHERE a.resolved = false) " +
            "AND l.booking.id NOT IN (SELECT DISTINCT d.booking.id FROM Dispute d WHERE d.resolvedAt IS NULL)")
    int purgeOldLocationLogs(@Param("cutoff") OffsetDateTime cutoff);
}
