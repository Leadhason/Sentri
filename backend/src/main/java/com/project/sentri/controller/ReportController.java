package com.project.sentri.controller;

import com.project.sentri.dto.ReportResponse;
import com.project.sentri.entity.Report;
import com.project.sentri.service.ReportingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ReportController {

    private final ReportingService reportingService;

    public ReportController(ReportingService reportingService) {
        this.reportingService = reportingService;
    }

    @GetMapping("/jobs/{jobId}/report")
    public ResponseEntity<ReportResponse> getReportByJob(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal Jwt jwt) {
        Report report = reportingService.getReportByJobId(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found for Job ID: " + jobId));
        return ResponseEntity.ok(mapToResponse(report));
    }

    @GetMapping("/bookings/{id}/report")
    public ResponseEntity<ReportResponse> getReportByBooking(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        Report report = reportingService.getReportByBookingId(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found for Booking ID: " + id));
        return ResponseEntity.ok(mapToResponse(report));
    }

    @GetMapping("/admin/reports")
    public ResponseEntity<List<ReportResponse>> getFilteredReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean hasHighSeverity) {
        List<ReportResponse> response = reportingService.getFilteredReports(status, hasHighSeverity).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/reports/{id}")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable UUID id) {
        Report report = reportingService.getReportById(id);
        return ResponseEntity.ok(mapToResponse(report));
    }

    private ReportResponse mapToResponse(Report r) {
        return ReportResponse.builder()
                .id(r.getId())
                .jobId(r.getJob().getId())
                .generatedAt(r.getGeneratedAt())
                .reportUrl(r.getReportUrl())
                .incidentCount(r.getIncidentCount())
                .hasHighSeverity(r.getHasHighSeverity())
                .generationStatus(r.getGenerationStatus())
                .triggeredBy(r.getTriggeredBy())
                .build();
    }
}
