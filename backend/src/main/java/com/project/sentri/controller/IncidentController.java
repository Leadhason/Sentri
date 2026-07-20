package com.project.sentri.controller;

import com.project.sentri.dto.IncidentRequest;
import com.project.sentri.dto.IncidentResponse;
import com.project.sentri.dto.SignedUrlResponse;
import com.project.sentri.service.IncidentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping("/bookings/{id}/incidents")
    public ResponseEntity<IncidentResponse> logIncident(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody IncidentRequest request) {
        UUID professionalId = UUID.fromString(jwt.getSubject());
        IncidentResponse response = incidentService.logIncident(id, professionalId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/bookings/{id}/incidents")
    public ResponseEntity<List<IncidentResponse>> getIncidentsByBooking(@PathVariable UUID id) {
        List<IncidentResponse> response = incidentService.getIncidentsByBooking(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/jobs/{jobId}/incidents")
    public ResponseEntity<List<IncidentResponse>> getIncidentsByJob(@PathVariable UUID jobId) {
        List<IncidentResponse> response = incidentService.getIncidentsByJob(jobId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/bookings/{id}/incidents/photo-url")
    public ResponseEntity<SignedUrlResponse> getSignedUploadUrl(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID professionalId = UUID.fromString(jwt.getSubject());
        SignedUrlResponse response = incidentService.getSignedUploadUrl(id, professionalId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/incidents")
    public ResponseEntity<List<IncidentResponse>> getFilteredIncidents(
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) UUID professionalId,
            @RequestParam(required = false) UUID bookingId) {
        List<IncidentResponse> response = incidentService.getFilteredIncidents(severity, type, professionalId, bookingId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/incidents/{id}")
    public ResponseEntity<IncidentResponse> getIncidentById(@PathVariable UUID id) {
        IncidentResponse response = incidentService.getIncidentById(id);
        return ResponseEntity.ok(response);
    }
}
