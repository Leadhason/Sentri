package com.project.sentri.repository;

import com.project.sentri.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByBookingId(UUID bookingId);
    List<Payment> findByClientId(UUID clientId);
    List<Payment> findByProfessionalId(UUID professionalId);
    Optional<Payment> findByPaystackReference(String paystackReference);
    List<Payment> findByStatus(String status);
    long countByProfessionalIdAndStatus(UUID professionalId, String status);
}
