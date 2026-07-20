package com.project.sentri.repository;

import com.project.sentri.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, UUID> {
    List<Incident> findByBookingId(UUID bookingId);
    List<Incident> findByProfessionalId(UUID professionalId);
    
    @Query("SELECT i FROM Incident i WHERE i.booking.job.id = :jobId")
    List<Incident> findByJobId(@Param("jobId") UUID jobId);

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.booking.job.id = :jobId")
    long countByJobId(@Param("jobId") UUID jobId);

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.booking.job.id = :jobId AND i.severity = :severity")
    long countByJobIdAndSeverity(@Param("jobId") UUID jobId, @Param("severity") String severity);
    
    long countByProfessionalIdAndSeverity(UUID professionalId, String severity);
    long countByProfessionalId(UUID professionalId);
}
