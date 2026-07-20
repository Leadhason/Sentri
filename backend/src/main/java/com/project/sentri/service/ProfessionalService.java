package com.project.sentri.service;

import com.project.sentri.dto.ProfessionalResponse;
import com.project.sentri.dto.ProfessionalUpdateRequest;
import com.project.sentri.entity.Professional;
import com.project.sentri.repository.ProfessionalRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class ProfessionalService {

    private final ProfessionalRepository professionalRepository;

    public ProfessionalService(ProfessionalRepository professionalRepository) {
        this.professionalRepository = professionalRepository;
    }

    public Page<ProfessionalResponse> getProfessionals(
            String city, String specialization, Boolean available,
            BigDecimal minRate, BigDecimal maxRate, Pageable pageable) {
        
        Page<Professional> page = professionalRepository.findVerifiedAndEligible(
                city, specialization, available, minRate, maxRate, pageable);
        
        return page.map(this::mapToResponse);
    }

    public ProfessionalResponse getProfessionalById(UUID id) {
        Professional professional = professionalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Professional not found with ID: " + id));
        return mapToResponse(professional);
    }

    @Transactional
    public ProfessionalResponse updateProfessionalProfile(UUID id, ProfessionalUpdateRequest request) {
        Professional professional = professionalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Professional not found with ID: " + id));

        if (request.getBio() != null) {
            professional.setBio(request.getBio());
        }
        if (request.getSpecializations() != null) {
            professional.setSpecializations(request.getSpecializations());
        }
        if (request.getHourlyRate() != null) {
            professional.setHourlyRate(request.getHourlyRate());
        }
        if (request.getOperatingLocations() != null) {
            professional.setOperatingLocations(request.getOperatingLocations());
        }
        if (request.getAvailabilityStatus() != null) {
            String status = request.getAvailabilityStatus();
            if (!status.equals("available") && !status.equals("unavailable") && !status.equals("suspended")) {
                throw new IllegalArgumentException("Invalid availability status: " + status);
            }
            professional.setAvailabilityStatus(status);
        }

        professional = professionalRepository.save(professional);
        return mapToResponse(professional);
    }

    public ProfessionalResponse mapToResponse(Professional p) {
        return ProfessionalResponse.builder()
                .id(p.getId())
                .email(p.getEmail())
                .fullName(p.getFullName())
                .phone(p.getPhone())
                .bio(p.getBio())
                .specializations(p.getSpecializations())
                .hourlyRate(p.getHourlyRate())
                .operatingLocations(p.getOperatingLocations())
                .availabilityStatus(p.getAvailabilityStatus())
                .verificationStatus(p.getVerificationStatus())
                .trustScore(p.getTrustScore())
                .completedJobsCount(p.getCompletedJobsCount())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
