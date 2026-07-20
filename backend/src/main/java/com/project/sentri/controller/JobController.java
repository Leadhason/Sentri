package com.project.sentri.controller;

import com.project.sentri.dto.*;
import com.project.sentri.service.JobService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("/jobs")
    public ResponseEntity<JobResponse> createJob(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody JobRequest request) {
        UUID clientId = UUID.fromString(jwt.getSubject());
        JobResponse response = jobService.createJob(clientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/jobs/{jobId}/bookings")
    public ResponseEntity<BookingResponse> addBooking(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody BookingRequest request) {
        UUID clientId = UUID.fromString(jwt.getSubject());
        BookingResponse response = jobService.addBookingToJob(jobId, clientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable UUID jobId) {
        JobResponse response = jobService.getJobById(jobId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable UUID id) {
        BookingResponse response = jobService.getBookingById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/bookings/{id}/accept")
    public ResponseEntity<BookingResponse> acceptBooking(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID professionalId = UUID.fromString(jwt.getSubject());
        BookingResponse response = jobService.acceptBooking(id, professionalId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/bookings/{id}/decline")
    public ResponseEntity<BookingResponse> declineBooking(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID professionalId = UUID.fromString(jwt.getSubject());
        BookingResponse response = jobService.declineBooking(id, professionalId);
        return ResponseEntity.ok(response);
    }
}
