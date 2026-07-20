package com.project.sentri.repository;

import com.project.sentri.entity.AnomalyPatternAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnomalyPatternAnalysisRepository extends JpaRepository<AnomalyPatternAnalysis, UUID> {
    List<AnomalyPatternAnalysis> findByProfessionalId(UUID professionalId);
}
