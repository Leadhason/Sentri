package com.project.sentri.jobs;

import com.project.sentri.entity.*;
import com.project.sentri.repository.*;
import com.project.sentri.service.AnomalyService;
import com.project.sentri.service.BehavioralScoreService;
import com.project.sentri.service.PaymentService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class SchedulerJobs {

    private final ClientRepository clientRepository;
    private final BehavioralScoreService behavioralScoreService;
    private final AnomalyService anomalyService;
    private final DocumentRepository documentRepository;
    private final ProfessionalRepository professionalRepository;
    private final LocationLogRepository locationLogRepository;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentService paymentService;

    public SchedulerJobs(ClientRepository clientRepository,
                         BehavioralScoreService behavioralScoreService,
                         AnomalyService anomalyService,
                         DocumentRepository documentRepository,
                         ProfessionalRepository professionalRepository,
                         LocationLogRepository locationLogRepository,
                         PaymentRepository paymentRepository,
                         BookingRepository bookingRepository,
                         PaymentService paymentService) {
        this.clientRepository = clientRepository;
        this.behavioralScoreService = behavioralScoreService;
        this.anomalyService = anomalyService;
        this.documentRepository = documentRepository;
        this.professionalRepository = professionalRepository;
        this.locationLogRepository = locationLogRepository;
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.paymentService = paymentService;
    }

    /**
     * Resets client assessment credits daily at 3:00 AM.
     * Resets credits to 3 and advances reset timestamp by 1 month from its prior value.
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void resetAssessmentCredits() {
        OffsetDateTime now = OffsetDateTime.now();
        List<Client> clientsToReset = clientRepository.findByCreditsResetAtLessThanEqual(now);

        for (Client client : clientsToReset) {
            client.setAssessmentCreditsRemaining(3);
            client.setCreditsResetAt(client.getCreditsResetAt().plusMonths(1));
            clientRepository.save(client);
            System.out.println("Job: Reset assessment credits for client " + client.getId());
        }
    }

    /**
     * Scans all active jobs for anomaly flags every 5 minutes.
     */
    @Scheduled(fixedRate = 300000)
    public void runAnomalyChecks() {
        System.out.println("Job: Scanning active jobs for anomalies");
        anomalyService.runAnomalyChecks();
    }

    /**
     * Evaluates anomaly patterns for professionals weekly on Mondays at 3:00 AM.
     */
    @Scheduled(cron = "0 0 3 * * MON")
    public void weeklyAnomalyPatternAnalysis() {
        System.out.println("Job: Running weekly anomaly pattern analysis audits");
        anomalyService.performWeeklyAnomalyPatternAnalysis();
    }

    /**
     * Runs AI trust score review calculations weekly on Mondays at 4:00 AM.
     */
    @Scheduled(cron = "0 0 4 * * MON")
    public void weeklyTrustScoreReviews() {
        System.out.println("Job: Running weekly trust score reviews");
        behavioralScoreService.performWeeklyAiReviews();
    }

    /**
     * Reverts professional status daily when credentials expire.
     */
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void checkDocumentExpiry() {
        System.out.println("Job: Checking for expired professional credentials");
        LocalDate today = LocalDate.now();
        List<Document> expiredDocs = documentRepository.findByStatus("approved").stream()
                .filter(d -> d.getExpiryDate() != null && d.getExpiryDate().isBefore(today))
                .collect(Collectors.toList());

        for (Document doc : expiredDocs) {
            doc.setStatus("rejected");
            doc.setRejectionReason("Credential expired automatically on " + doc.getExpiryDate());
            documentRepository.save(doc);

            // Revert professional status
            Professional p = doc.getProfessional();
            p.setVerificationStatus("rejected");
            professionalRepository.save(p);
            System.out.println("Job: Reverted verification status for professional " + p.getId() + " due to expired credential.");
        }
    }

    /**
     * Purges raw GPS location logs older than 30 days daily.
     * Excludes logs attached to bookings with active disputes or unresolved anomaly flags.
     */
    @Scheduled(cron = "0 30 1 * * *")
    @Transactional
    public void purgeLocationLogs() {
        System.out.println("Job: Purging location logs older than 30 days");
        OffsetDateTime cutoff = OffsetDateTime.now().minusDays(30);
        int purgedRows = locationLogRepository.purgeOldLocationLogs(cutoff);
        System.out.println("Job: Purged " + purgedRows + " location logs rows successfully.");
    }

    /**
     * Flags held escrow payments older than 7 days for admin review.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void checkEscrowTimeouts() {
        System.out.println("Job: Scanning for escrow holds older than 7 days");
        OffsetDateTime sevenDaysAgo = OffsetDateTime.now().minusDays(7);

        // Find active held payments
        List<Payment> heldPayments = paymentRepository.findByStatus("held");
        for (Payment payment : heldPayments) {
            // Check booking creation as a proxy for payment hold date
            if (payment.getBooking().getCreatedAt().isBefore(sevenDaysAgo)) {
                System.out.println("FCM: ALERT - Escrow hold GHS " + payment.getMaxAmountHeld() + 
                        " is older than 7 days. Action required for Booking: " + payment.getBooking().getId());
            }
        }
    }

    /**
     * Auto-confirms completed bookings and releases payments after 12 hours.
     * Runs hourly.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void autoConfirmPayments() {
        System.out.println("Job: Scanning for completed bookings pending auto-release");
        OffsetDateTime twelveHoursAgo = OffsetDateTime.now().minusHours(12);

        List<Booking> completedBookings = bookingRepository.findByStatus("completed");
        for (Booking booking : completedBookings) {
            if (booking.getEndTime() != null && booking.getEndTime().isBefore(twelveHoursAgo)) {
                try {
                    paymentService.autoConfirmPayment(booking.getId());
                } catch (Exception e) {
                    System.err.println("Error auto-confirming payment for booking " + booking.getId() + ": " + e.getMessage());
                }
            }
        }
    }
}
