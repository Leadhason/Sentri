package com.project.sentri.controller;

import com.project.sentri.dto.AnomalyDismissRequest;
import com.project.sentri.dto.AnomalyFlagResponse;
import com.project.sentri.service.AnomalyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AnomalyController {

    private final AnomalyService anomalyService;

    public AnomalyController(AnomalyService anomalyService) {
        this.anomalyService = anomalyService;
    }

    @GetMapping("/admin/anomalies")
    public ResponseEntity<List<AnomalyFlagResponse>> getPendingFlags() {
        List<AnomalyFlagResponse> response = anomalyService.getPendingFlags();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/anomalies/{id}")
    public ResponseEntity<AnomalyFlagResponse> getFlagById(@PathVariable UUID id) {
        AnomalyFlagResponse response = anomalyService.getFlagById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/admin/anomalies/{id}/confirm")
    public ResponseEntity<AnomalyFlagResponse> confirmFlag(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID adminId = UUID.fromString(jwt.getSubject());
        AnomalyFlagResponse response = anomalyService.confirmFlag(id, adminId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/admin/anomalies/{id}/dismiss")
    public ResponseEntity<AnomalyFlagResponse> dismissFlag(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody AnomalyDismissRequest request) {
        UUID adminId = UUID.fromString(jwt.getSubject());
        AnomalyFlagResponse response = anomalyService.dismissFlag(id, adminId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/anomalies/{id}/contact-professional")
    public ResponseEntity<Void> contactProfessional(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID adminId = UUID.fromString(jwt.getSubject());
        anomalyService.contactProfessional(id, adminId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/anomalies/{id}/escalate")
    public ResponseEntity<Void> escalateFlag(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID adminId = UUID.fromString(jwt.getSubject());
        anomalyService.escalateFlag(id, adminId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/settings/anomaly-thresholds")
    public ResponseEntity<Map<String, String>> getAnomalyThresholds() {
        Map<String, String> thresholds = anomalyService.getAnomalyThresholds();
        return ResponseEntity.ok(thresholds);
    }

    @PatchMapping("/admin/settings/anomaly-thresholds")
    public ResponseEntity<Void> updateAnomalyThresholds(
            @RequestBody Map<String, String> thresholds,
            @AuthenticationPrincipal Jwt jwt) {
        UUID adminId = UUID.fromString(jwt.getSubject());
        anomalyService.updateAnomalyThresholds(thresholds, adminId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bookings/{id}/checkin")
    public ResponseEntity<Void> checkin(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID professionalId = UUID.fromString(jwt.getSubject());
        anomalyService.checkin(id, professionalId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/professionals/me/anomalies")
    public ResponseEntity<List<AnomalyFlagResponse>> getOwnFlags(@AuthenticationPrincipal Jwt jwt) {
        UUID professionalId = UUID.fromString(jwt.getSubject());
        List<AnomalyFlagResponse> response = anomalyService.getOwnFlags(professionalId);
        return ResponseEntity.ok(response);
    }
}
