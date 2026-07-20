package com.project.sentri.repository;

import com.project.sentri.entity.ScoreReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScoreReviewRepository extends JpaRepository<ScoreReview, UUID> {
    List<ScoreReview> findByProfessionalId(UUID professionalId);
}
