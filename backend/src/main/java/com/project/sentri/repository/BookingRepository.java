package com.project.sentri.repository;

import com.project.sentri.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByJobId(UUID jobId);
    List<Booking> findByClientId(UUID clientId);
    List<Booking> findByProfessionalId(UUID professionalId);
    List<Booking> findByStatus(String status);
    List<Booking> findByStatusAndCreatedAtBefore(String status, OffsetDateTime timestamp);
}
