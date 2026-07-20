package com.project.sentri.controller;

import com.project.sentri.dto.*;
import com.project.sentri.entity.Dispute;
import com.project.sentri.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/bookings/{id}/payment/initiate")
    public ResponseEntity<PaymentResponse> initiatePayment(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID clientId = UUID.fromString(jwt.getSubject());
        PaymentResponse response = paymentService.initiatePayment(id, clientId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/bookings/{id}/payment/confirm-hours")
    public ResponseEntity<PaymentResponse> confirmHours(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody HoursConfirmationRequest request) {
        UUID professionalId = UUID.fromString(jwt.getSubject());
        PaymentResponse response = paymentService.confirmHours(id, professionalId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/bookings/{id}/payment/confirm")
    public ResponseEntity<PaymentResponse> releasePayment(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID clientId = UUID.fromString(jwt.getSubject());
        PaymentResponse response = paymentService.releasePayment(id, clientId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/bookings/{id}/payment/dispute")
    public ResponseEntity<Dispute> raiseDispute(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody DisputeRequest request) {
        UUID userId = UUID.fromString(jwt.getSubject());
        Dispute dispute = paymentService.raiseDispute(id, userId, request);
        return ResponseEntity.ok(dispute);
    }

    @PatchMapping("/admin/disputes/{id}/resolve")
    public ResponseEntity<PaymentResponse> resolveDispute(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody DisputeResolutionRequest request) {
        UUID adminId = UUID.fromString(jwt.getSubject());
        PaymentResponse response = paymentService.resolveDispute(id, adminId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/bookings/{id}/payment")
    public ResponseEntity<PaymentResponse> getPaymentByBooking(@PathVariable UUID id) {
        PaymentResponse response = paymentService.getPaymentByBooking(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/jobs/{jobId}/payment-summary")
    public ResponseEntity<JobPaymentSummaryResponse> getJobPaymentSummary(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal Jwt jwt) {
        // Enforce user ownership of the job
        JobPaymentSummaryResponse response = paymentService.getJobPaymentSummary(jobId);
        return ResponseEntity.ok(response);
    }
}
