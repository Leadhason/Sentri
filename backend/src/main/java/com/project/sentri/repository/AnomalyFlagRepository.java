package com.project.sentri.repository;

import com.project.sentri.entity.AnomalyFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnomalyFlagRepository extends JpaRepository<AnomalyFlag, UUID> {
    List<AnomalyFlag> findByBookingId(UUID bookingId);
    List<AnomalyFlag> findByProfessionalId(UUID professionalId);
    List<AnomalyFlag> findByResolved(Boolean resolved);
    Optional<AnomalyFlag> findByBookingIdAndAnomalyTypeAndResolved(UUID bookingId, String anomalyType, Boolean resolved);
    long countByProfessionalIdAndAdminAction(UUID professionalId, String adminAction);
    long countByBookingIdAndResolved(UUID bookingId, Boolean resolved);
}
