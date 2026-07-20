package com.project.sentri.repository;

import com.project.sentri.entity.Professional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProfessionalRepository extends JpaRepository<Professional, UUID> {

    @Query(value = "SELECT p.*, u.email, u.role, u.full_name, u.phone, u.created_at " +
            "FROM professionals p " +
            "JOIN users u ON p.id = u.id " +
            "WHERE p.verification_status = 'verified' " +
            "  AND p.trust_score >= 40 " +
            "  AND (:specialization IS NULL OR :specialization = ANY(p.specializations)) " +
            "  AND (:city IS NULL OR :city = ANY(p.operating_locations)) " +
            "  AND (:available IS NULL OR " +
            "       (:available = true AND p.availability_status = 'available') OR " +
            "       (:available = false AND p.availability_status = 'unavailable')) " +
            "  AND (:minRate IS NULL OR p.hourly_rate >= :minRate) " +
            "  AND (:maxRate IS NULL OR p.hourly_rate <= :maxRate)",
            countQuery = "SELECT count(*) " +
            "FROM professionals p " +
            "JOIN users u ON p.id = u.id " +
            "WHERE p.verification_status = 'verified' " +
            "  AND p.trust_score >= 40 " +
            "  AND (:specialization IS NULL OR :specialization = ANY(p.specializations)) " +
            "  AND (:city IS NULL OR :city = ANY(p.operating_locations)) " +
            "  AND (:available IS NULL OR " +
            "       (:available = true AND p.availability_status = 'available') OR " +
            "       (:available = false AND p.availability_status = 'unavailable')) " +
            "  AND (:minRate IS NULL OR p.hourly_rate >= :minRate) " +
            "  AND (:maxRate IS NULL OR p.hourly_rate <= :maxRate)",
            nativeQuery = true)
    Page<Professional> findVerifiedAndEligible(
            @Param("city") String city,
            @Param("specialization") String specialization,
            @Param("available") Boolean available,
            @Param("minRate") BigDecimal minRate,
            @Param("maxRate") BigDecimal maxRate,
            Pageable pageable
    );

    @Query(value = "SELECT p.*, u.email, u.role, u.full_name, u.phone, u.created_at " +
            "FROM professionals p " +
            "JOIN users u ON p.id = u.id " +
            "WHERE p.verification_status = 'verified' " +
            "  AND p.availability_status = 'available' " +
            "  AND p.trust_score >= 40 " +
            "  AND :city = ANY(p.operating_locations) " +
            "  AND p.id NOT IN (:excludeIds)",
            nativeQuery = true)
    List<Professional> findReplacements(
            @Param("city") String city,
            @Param("excludeIds") List<UUID> excludeIds
    );

    @Query(value = "SELECT p.*, u.email, u.role, u.full_name, u.phone, u.created_at " +
            "FROM professionals p " +
            "JOIN users u ON p.id = u.id " +
            "WHERE p.verification_status = 'verified' " +
            "  AND p.availability_status = 'available' " +
            "  AND p.trust_score >= 40 " +
            "  AND :city = ANY(p.operating_locations) " +
            "  AND :specialization = ANY(p.specializations) " +
            "ORDER BY p.trust_score DESC " +
            "LIMIT :limit",
            nativeQuery = true)
    List<Professional> findMatchesForSlot(
            @Param("city") String city,
            @Param("specialization") String specialization,
            @Param("limit") int limit
    );

    @Query(value = "SELECT p.*, u.email, u.role, u.full_name, u.phone, u.created_at " +
            "FROM professionals p " +
            "JOIN users u ON p.id = u.id " +
            "WHERE p.base_score BETWEEN :minScore AND :maxScore " +
            "   OR p.last_ai_review_at IS NULL " +
            "   OR p.last_ai_review_at <= :staleTime",
            nativeQuery = true)
    List<Professional> findProfessionalsRequiringScoreReview(
            @Param("minScore") int minScore,
            @Param("maxScore") int maxScore,
            @Param("staleTime") java.time.OffsetDateTime staleTime
    );
}
