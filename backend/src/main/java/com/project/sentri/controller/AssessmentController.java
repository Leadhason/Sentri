package com.project.sentri.controller;

import com.project.sentri.dto.AssessmentRequest;
import com.project.sentri.dto.AssessmentResponse;
import com.project.sentri.dto.JobConversionRequest;
import com.project.sentri.dto.JobResponse;
import com.project.sentri.service.AssessmentService;
import com.project.sentri.service.JobService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final JobService jobService;

    public AssessmentController(AssessmentService assessmentService, JobService jobService) {
        this.assessmentService = assessmentService;
        this.jobService = jobService;
    }

    @PostMapping("/assess")
    public ResponseEntity<AssessmentResponse> performAssessment(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody AssessmentRequest request) {
        UUID clientId = UUID.fromString(jwt.getSubject());
        AssessmentResponse response = assessmentService.performAssessment(clientId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/assess/{id}")
    public ResponseEntity<AssessmentResponse> getAssessmentById(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID clientId = UUID.fromString(jwt.getSubject());
        AssessmentResponse response = assessmentService.getAssessmentById(id, clientId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/jobs/from-assessment/{assessmentId}")
    public ResponseEntity<JobResponse> convertToJob(
            @PathVariable UUID assessmentId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody JobConversionRequest request) {
        UUID clientId = UUID.fromString(jwt.getSubject());
        JobResponse response = jobService.createJobFromAssessment(assessmentId, clientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
