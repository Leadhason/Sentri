package com.project.sentri.repository;

import com.project.sentri.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    Optional<Report> findByJobId(UUID jobId);
    List<Report> findByGenerationStatus(String status);
}
