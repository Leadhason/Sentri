package com.project.sentri.controller;

import com.project.sentri.dto.ProfessionalResponse;
import com.project.sentri.dto.ProfessionalUpdateRequest;
import com.project.sentri.service.ProfessionalService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/professionals")
public class ProfessionalController {

    private final ProfessionalService professionalService;

    public ProfessionalController(ProfessionalService professionalService) {
        this.professionalService = professionalService;
    }

    @GetMapping
    public ResponseEntity<Page<ProfessionalResponse>> getProfessionals(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) BigDecimal minRate,
            @RequestParam(required = false) BigDecimal maxRate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ProfessionalResponse> results = professionalService.getProfessionals(
                city, specialization, available, minRate, maxRate, pageable);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfessionalResponse> getProfessionalById(@PathVariable UUID id) {
        ProfessionalResponse response = professionalService.getProfessionalById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ProfessionalResponse> getOwnProfile(@AuthenticationPrincipal Jwt jwt) {
        UUID professionalId = UUID.fromString(jwt.getSubject());
        ProfessionalResponse response = professionalService.getProfessionalById(professionalId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me")
    public ResponseEntity<ProfessionalResponse> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ProfessionalUpdateRequest request) {
        UUID professionalId = UUID.fromString(jwt.getSubject());
        ProfessionalResponse response = professionalService.updateProfessionalProfile(professionalId, request);
        return ResponseEntity.ok(response);
    }
}
