package com.project.sentri.repository;

import com.project.sentri.entity.Checkin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CheckinRepository extends JpaRepository<Checkin, UUID> {
    List<Checkin> findByBookingId(UUID bookingId);
    Optional<Checkin> findFirstByBookingIdOrderByCheckedInAtDesc(UUID bookingId);
}
