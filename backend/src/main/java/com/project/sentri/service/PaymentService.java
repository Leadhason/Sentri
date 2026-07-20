package com.project.sentri.service;

import com.project.sentri.dto.*;
import com.project.sentri.entity.*;
import com.project.sentri.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final JobRepository jobRepository;
    private final DisputeRepository disputeRepository;
    private final UserRepository userRepository;
    private final ProfessionalRepository professionalRepository;
    private final BehavioralScoreService behavioralScoreService;

    public PaymentService(PaymentRepository paymentRepository,
                          BookingRepository bookingRepository,
                          JobRepository jobRepository,
                          DisputeRepository disputeRepository,
                          UserRepository userRepository,
                          ProfessionalRepository professionalRepository,
                          BehavioralScoreService behavioralScoreService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.jobRepository = jobRepository;
        this.disputeRepository = disputeRepository;
        this.userRepository = userRepository;
        this.professionalRepository = professionalRepository;
        this.behavioralScoreService = behavioralScoreService;
    }

    @Transactional
    public PaymentResponse initiatePayment(UUID bookingId, UUID clientId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (!booking.getClient().getId().equals(clientId)) {
            throw new IllegalArgumentException("Unauthorized: User is not the booking client");
        }

        if (!"accepted".equals(booking.getStatus())) {
            throw new IllegalStateException("Payment can only be initiated for accepted bookings");
        }

        // Calculate max amount held
        BigDecimal hourlyRate = booking.getProfessional().getHourlyRate();
        BigDecimal maxDuration = BigDecimal.valueOf(booking.getMaxDuration());
        BigDecimal maxAmountHeld = hourlyRate.multiply(maxDuration);

        // Simulate Paystack charge reference
        String paystackReference = "pay_" + UUID.randomUUID().toString().substring(0, 12);

        Payment payment = Payment.builder()
                .booking(booking)
                .client(booking.getClient())
                .professional(booking.getProfessional())
                .maxAmountHeld(maxAmountHeld)
                .paystackReference(paystackReference)
                .status("held")
                .build();

        payment = paymentRepository.save(payment);

        System.out.println("LOG: Paystack hold initiated for GHS " + maxAmountHeld + " on Booking: " + bookingId);
        return mapToResponse(payment);
    }

    @Transactional
    public PaymentResponse confirmHours(UUID bookingId, UUID professionalId, HoursConfirmationRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (!booking.getProfessional().getId().equals(professionalId)) {
            throw new IllegalArgumentException("Unauthorized: User is not the assigned professional");
        }

        if (!"active".equals(booking.getStatus())) {
            throw new IllegalStateException("Hours can only be confirmed for active bookings");
        }

        // Find initial payment hold
        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        Payment holdPayment = payments.stream()
                .filter(p -> "held".equals(p.getStatus()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No active escrow payment hold found for this booking"));

        BigDecimal actualHours = request.getActualHours();
        BigDecimal hourlyRate = booking.getProfessional().getHourlyRate();

        // Calculate Splits
        BigDecimal amountDue = actualHours.multiply(hourlyRate);
        BigDecimal platformFee = amountDue.multiply(BigDecimal.valueOf(0.10)); // 10% Platform fee
        BigDecimal professionalPayout = amountDue.subtract(platformFee);
        BigDecimal clientRefund = holdPayment.getMaxAmountHeld().subtract(amountDue);

        // Update booking details
        booking.setActualHours(actualHours);
        booking.setEndTime(OffsetDateTime.now());
        booking.setStatus("completed");
        booking = bookingRepository.save(booking);

        // Save new ledger row with calculations populated
        Payment payment = Payment.builder()
                .booking(booking)
                .client(booking.getClient())
                .professional(booking.getProfessional())
                .maxAmountHeld(holdPayment.getMaxAmountHeld())
                .actualHours(actualHours)
                .amountDue(amountDue)
                .platformFee(platformFee)
                .professionalPayout(professionalPayout)
                .clientRefund(clientRefund)
                .paystackReference(holdPayment.getPaystackReference())
                .status("held") // still held until client/auto confirms
                .build();

        payment = paymentRepository.save(payment);

        System.out.println("LOG: Professional confirmed " + actualHours + " hours. Calculations written to ledger.");
        return mapToResponse(payment);
    }

    @Transactional
    public PaymentResponse releasePayment(UUID bookingId, UUID clientId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (!booking.getClient().getId().equals(clientId)) {
            throw new IllegalArgumentException("Unauthorized: User is not the booking client");
        }

        if (!"completed".equals(booking.getStatus())) {
            throw new IllegalStateException("Payment can only be released for completed bookings");
        }

        // Retrieve last calculated ledger row
        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        Payment calcPayment = payments.stream()
                .filter(p -> p.getAmountDue() != null)
                .max(Comparator.comparing(Payment::getId)) // get latest row
                .orElseThrow(() -> new IllegalStateException("Calculations not found for this completed booking"));

        booking.setStatus("settled");
        booking = bookingRepository.save(booking);

        // Increment professional completed jobs count
        Professional professional = booking.getProfessional();
        professional.setCompletedJobsCount(professional.getCompletedJobsCount() + 1);
        professionalRepository.save(professional);

        // Update trust score streak
        behavioralScoreService.recalculateBaseScore(professional.getId());

        // Save new ledger row as released
        Payment releasedPayment = Payment.builder()
                .booking(booking)
                .client(booking.getClient())
                .professional(booking.getProfessional())
                .maxAmountHeld(calcPayment.getMaxAmountHeld())
                .actualHours(calcPayment.getActualHours())
                .amountDue(calcPayment.getAmountDue())
                .platformFee(calcPayment.getPlatformFee())
                .professionalPayout(calcPayment.getProfessionalPayout())
                .clientRefund(calcPayment.getClientRefund())
                .paystackReference(calcPayment.getPaystackReference())
                .status("released")
                .confirmedAt(OffsetDateTime.now())
                .autoConfirmed(false)
                .build();

        releasedPayment = paymentRepository.save(releasedPayment);

        // Simulate Paystack Transfer/Refund calls
        System.out.println("Paystack: GHS " + calcPayment.getProfessionalPayout() + " transferred to professional " + professional.getId());
        System.out.println("Paystack: GHS " + calcPayment.getClientRefund() + " refunded to client " + booking.getClient().getId());

        return mapToResponse(releasedPayment);
    }

    @Transactional
    public void autoConfirmPayment(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (!"completed".equals(booking.getStatus())) {
            return;
        }

        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        Payment calcPayment = payments.stream()
                .filter(p -> p.getAmountDue() != null)
                .max(Comparator.comparing(Payment::getId))
                .orElse(null);

        if (calcPayment == null) return;

        booking.setStatus("settled");
        bookingRepository.save(booking);

        Professional professional = booking.getProfessional();
        professional.setCompletedJobsCount(professional.getCompletedJobsCount() + 1);
        professionalRepository.save(professional);
        behavioralScoreService.recalculateBaseScore(professional.getId());

        Payment releasedPayment = Payment.builder()
                .booking(booking)
                .client(booking.getClient())
                .professional(booking.getProfessional())
                .maxAmountHeld(calcPayment.getMaxAmountHeld())
                .actualHours(calcPayment.getActualHours())
                .amountDue(calcPayment.getAmountDue())
                .platformFee(calcPayment.getPlatformFee())
                .professionalPayout(calcPayment.getProfessionalPayout())
                .clientRefund(calcPayment.getClientRefund())
                .paystackReference(calcPayment.getPaystackReference())
                .status("released")
                .confirmedAt(OffsetDateTime.now())
                .autoConfirmed(true)
                .build();

        paymentRepository.save(releasedPayment);

        System.out.println("LOG: Auto-released escrow payment for booking " + bookingId);
    }

    @Transactional
    public Dispute raiseDispute(UUID bookingId, UUID userId, DisputeRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        if (!booking.getClient().getId().equals(userId) && !booking.getProfessional().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized: Only booking client or professional can raise disputes");
        }

        if (!"completed".equals(booking.getStatus())) {
            throw new IllegalStateException("Disputes can only be raised on completed bookings prior to release");
        }

        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        Payment calcPayment = payments.stream()
                .filter(p -> p.getAmountDue() != null)
                .max(Comparator.comparing(Payment::getId))
                .orElseThrow(() -> new IllegalStateException("Calculations not found for this completed booking"));

        booking.setStatus("disputed");
        bookingRepository.save(booking);

        // Save new ledger row as disputed
        Payment disputedPayment = Payment.builder()
                .booking(booking)
                .client(booking.getClient())
                .professional(booking.getProfessional())
                .maxAmountHeld(calcPayment.getMaxAmountHeld())
                .actualHours(calcPayment.getActualHours())
                .amountDue(calcPayment.getAmountDue())
                .platformFee(calcPayment.getPlatformFee())
                .professionalPayout(calcPayment.getProfessionalPayout())
                .clientRefund(calcPayment.getClientRefund())
                .paystackReference(calcPayment.getPaystackReference())
                .status("disputed")
                .build();

        paymentRepository.save(disputedPayment);

        Dispute dispute = Dispute.builder()
                .booking(booking)
                .raisedBy(user)
                .reason(request.getReason())
                .evidenceUrls(request.getEvidenceUrls() != null ? request.getEvidenceUrls() : List.of())
                .build();

        return disputeRepository.save(dispute);
    }

    @Transactional
    public PaymentResponse resolveDispute(UUID disputeId, UUID adminId, DisputeResolutionRequest request) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new IllegalArgumentException("Dispute not found with ID: " + disputeId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found with ID: " + adminId));

        if (!"admin".equals(admin.getRole())) {
            throw new IllegalArgumentException("Unauthorized: User is not an admin");
        }

        Booking booking = dispute.getBooking();
        List<Payment> payments = paymentRepository.findByBookingId(booking.getId());
        Payment calcPayment = payments.stream()
                .filter(p -> p.getAmountDue() != null)
                .max(Comparator.comparing(Payment::getId))
                .orElseThrow(() -> new IllegalStateException("Payment records not found for this booking"));

        // Validate splits sum up to maxAmountHeld
        BigDecimal totalPayoutSplit = request.getProfessionalPayout().add(request.getClientRefund());
        if (totalPayoutSplit.compareTo(calcPayment.getMaxAmountHeld()) > 0) {
            throw new IllegalArgumentException("Sum of professional payout and client refund cannot exceed the total escrow hold: " + calcPayment.getMaxAmountHeld());
        }

        // Update Dispute
        dispute.setAdminRuling(request.getAdminRuling());
        dispute.setResolvedAt(OffsetDateTime.now());
        disputeRepository.save(dispute);

        // Update Booking
        booking.setStatus("settled");
        bookingRepository.save(booking);

        // Recalculate score (resolution clears unresolved penalty)
        behavioralScoreService.recalculateBaseScore(booking.getProfessional().getId());

        // Save new ledger row as resolved (released or refunded depending on splits)
        String finalStatus = request.getProfessionalPayout().compareTo(BigDecimal.ZERO) > 0 ? "released" : "refunded";

        Payment resolvedPayment = Payment.builder()
                .booking(booking)
                .client(booking.getClient())
                .professional(booking.getProfessional())
                .maxAmountHeld(calcPayment.getMaxAmountHeld())
                .actualHours(calcPayment.getActualHours())
                .amountDue(request.getProfessionalPayout()) // final amount awarded
                .platformFee(calcPayment.getPlatformFee()) // platform keeps original computed fee or admin overridden fee
                .professionalPayout(request.getProfessionalPayout())
                .clientRefund(request.getClientRefund())
                .paystackReference(calcPayment.getPaystackReference())
                .status(finalStatus)
                .confirmedAt(OffsetDateTime.now())
                .autoConfirmed(false)
                .build();

        resolvedPayment = paymentRepository.save(resolvedPayment);

        System.out.println("LOG: Dispute resolved by Admin. Payout GHS " + request.getProfessionalPayout() + ", Refund GHS " + request.getClientRefund());
        return mapToResponse(resolvedPayment);
    }

    public PaymentResponse getPaymentByBooking(UUID bookingId) {
        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        if (payments.isEmpty()) {
            throw new IllegalArgumentException("No payment records found for Booking ID: " + bookingId);
        }
        // Return latest state row
        Payment latest = payments.stream().max(Comparator.comparing(Payment::getId)).get();
        return mapToResponse(latest);
    }

    public JobPaymentSummaryResponse getJobPaymentSummary(UUID jobId) {
        List<Booking> bookings = bookingRepository.findByJobId(jobId);
        
        BigDecimal totalMaxAmountHeld = BigDecimal.ZERO;
        BigDecimal totalAmountDue = BigDecimal.ZERO;
        BigDecimal totalPlatformFee = BigDecimal.ZERO;
        BigDecimal totalProfessionalPayout = BigDecimal.ZERO;
        BigDecimal totalClientRefund = BigDecimal.ZERO;
        
        List<PaymentResponse> paymentResponses = new ArrayList<>();

        for (Booking b : bookings) {
            List<Payment> payments = paymentRepository.findByBookingId(b.getId());
            if (!payments.isEmpty()) {
                Payment latest = payments.stream().max(Comparator.comparing(Payment::getId)).get();
                PaymentResponse resp = mapToResponse(latest);
                paymentResponses.add(resp);

                if (resp.getMaxAmountHeld() != null) totalMaxAmountHeld = totalMaxAmountHeld.add(resp.getMaxAmountHeld());
                if (resp.getAmountDue() != null) totalAmountDue = totalAmountDue.add(resp.getAmountDue());
                if (resp.getPlatformFee() != null) totalPlatformFee = totalPlatformFee.add(resp.getPlatformFee());
                if (resp.getProfessionalPayout() != null) totalProfessionalPayout = totalProfessionalPayout.add(resp.getProfessionalPayout());
                if (resp.getClientRefund() != null) totalClientRefund = totalClientRefund.add(resp.getClientRefund());
            }
        }

        return JobPaymentSummaryResponse.builder()
                .jobId(jobId)
                .totalMaxAmountHeld(totalMaxAmountHeld)
                .totalAmountDue(totalAmountDue)
                .totalPlatformFee(totalPlatformFee)
                .totalProfessionalPayout(totalProfessionalPayout)
                .totalClientRefund(totalClientRefund)
                .payments(paymentResponses)
                .build();
    }

    private PaymentResponse mapToResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .bookingId(p.getBooking().getId())
                .clientId(p.getClient().getId())
                .professionalId(p.getProfessional().getId())
                .maxAmountHeld(p.getMaxAmountHeld())
                .actualHours(p.getActualHours())
                .amountDue(p.getAmountDue())
                .platformFee(p.getPlatformFee())
                .professionalPayout(p.getProfessionalPayout())
                .clientRefund(p.getClientRefund())
                .paystackReference(p.getPaystackReference())
                .status(p.getStatus())
                .autoConfirmed(p.getAutoConfirmed())
                .confirmedAt(p.getConfirmedAt())
                .build();
    }
}
