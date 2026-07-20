package com.project.sentri.repository;

import com.project.sentri.entity.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, UUID> {
    List<Dispute> findByBookingId(UUID bookingId);
    List<Dispute> findByResolvedAtIsNull();
    
    @Query("SELECT COUNT(d) FROM Dispute d WHERE d.booking.professional.id = :professionalId AND d.resolvedAt IS NULL")
    long countUnresolvedByProfessionalId(@Param("professionalId") UUID professionalId);
}
