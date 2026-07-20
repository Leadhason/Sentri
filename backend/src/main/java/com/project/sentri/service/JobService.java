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
public class JobService {

    private final JobRepository jobRepository;
    private final BookingRepository bookingRepository;
    private final ClientRepository clientRepository;
    private final ProfessionalRepository professionalRepository;
    private final DisputeRepository disputeRepository;
    private final AssessmentRepository assessmentRepository;

    public JobService(JobRepository jobRepository,
                      BookingRepository bookingRepository,
                      ClientRepository clientRepository,
                      ProfessionalRepository professionalRepository,
                      DisputeRepository disputeRepository,
                      AssessmentRepository assessmentRepository) {
        this.jobRepository = jobRepository;
        this.bookingRepository = bookingRepository;
        this.clientRepository = clientRepository;
        this.professionalRepository = professionalRepository;
        this.disputeRepository = disputeRepository;
        this.assessmentRepository = assessmentRepository;
    }

    @Transactional
    public JobResponse createJob(UUID clientId, JobRequest request) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));

        Job job = Job.builder()
                .client(client)
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .date(request.getDate())
                .minDuration(request.getMinDuration())
                .maxDuration(request.getMaxDuration())
                .requirements(request.getRequirements() != null ? request.getRequirements() : List.of())
                .staffingStatus("partial")
                .status("pending")
                .build();

        job = jobRepository.save(job);
        return mapToJobResponse(job);
    }

    @Transactional
    public BookingResponse addBookingToJob(UUID jobId, UUID clientId, BookingRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + jobId));

        if (!job.getClient().getId().equals(clientId)) {
            throw new IllegalArgumentException("Client ID does not match job owner");
        }

        Professional professional = professionalRepository.findById(request.getProfessionalId())
                .orElseThrow(() -> new IllegalArgumentException("Professional not found with ID: " + request.getProfessionalId()));

        // Verification checks
        if (!"verified".equals(professional.getVerificationStatus())) {
            throw new IllegalStateException("Professional is not verified");
        }
        if (!"available".equals(professional.getAvailabilityStatus())) {
            throw new IllegalStateException("Professional is not available");
        }
        if (professional.getTrustScore() < 40) {
            throw new IllegalStateException("Professional does not meet minimum trust score requirements");
        }

        // Check for unresolved dispute payments
        long unresolvedDisputes = disputeRepository.countUnresolvedByProfessionalId(professional.getId());
        if (unresolvedDisputes > 0) {
            throw new IllegalStateException("Professional has unresolved disputes and cannot accept new bookings");
        }

        Booking booking = Booking.builder()
                .job(job)
                .client(job.getClient())
                .professional(professional)
                .jobDescription(request.getJobDescription() != null ? request.getJobDescription() : job.getDescription())
                .location(job.getLocation())
                .minDuration(job.getMinDuration())
                .maxDuration(job.getMaxDuration())
                .status("pending")
                .slotType(request.getSlotType())
                .declinedProfessionals(new ArrayList<>())
                .incidentsLocked(false)
                .build();

        booking = bookingRepository.save(booking);

        // Send FCM push to professional (mock/log for now)
        System.out.println("FCM: New booking request sent to professional: " + professional.getId());

        return mapToBookingResponse(booking);
    }

    public JobResponse getJobById(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + jobId));
        return mapToJobResponse(job);
    }

    public BookingResponse getBookingById(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));
        return mapToBookingResponse(booking);
    }

    @Transactional
    public BookingResponse acceptBooking(UUID bookingId, UUID professionalId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (!booking.getProfessional().getId().equals(professionalId)) {
            throw new IllegalArgumentException("Booking is not assigned to this professional");
        }

        if (!"pending".equals(booking.getStatus())) {
            throw new IllegalStateException("Booking status must be pending to accept");
        }

        // Check if professional has unresolved disputes
        long unresolvedDisputes = disputeRepository.countUnresolvedByProfessionalId(professionalId);
        if (unresolvedDisputes > 0) {
            throw new IllegalStateException("Professional has unresolved disputes and cannot accept new bookings");
        }

        booking.setStatus("accepted");
        booking = bookingRepository.save(booking);

        // Check if job staffing status should be updated
        updateJobStaffingStatus(booking.getJob());

        return mapToBookingResponse(booking);
    }

    @Transactional
    public BookingResponse declineBooking(UUID bookingId, UUID professionalId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (!booking.getProfessional().getId().equals(professionalId)) {
            throw new IllegalArgumentException("Booking is not assigned to this professional");
        }

        if (!"pending".equals(booking.getStatus())) {
            throw new IllegalStateException("Booking status must be pending to decline");
        }

        booking.setStatus("declined");
        if (booking.getDeclinedProfessionals() == null) {
            booking.setDeclinedProfessionals(new ArrayList<>());
        }
        booking.getDeclinedProfessionals().add(professionalId);
        booking = bookingRepository.save(booking);

        // Trigger replacement flow
        triggerReplacementFlow(booking);

        return mapToBookingResponse(booking);
    }

    @Transactional
    public JobResponse createJobFromAssessment(UUID assessmentId, UUID clientId, JobConversionRequest request) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found with ID: " + assessmentId));

        if (!assessment.getClient().getId().equals(clientId)) {
            throw new IllegalArgumentException("Access denied: Client is not the owner of this assessment");
        }

        if (assessment.getJob() != null) {
            throw new IllegalStateException("Assessment has already been converted to a job");
        }

        if (request.getDate() == null) {
            throw new IllegalArgumentException("Job date is required");
        }

        // Parse requirements from assessment JSON
        List<JobRequirement> requirements = new ArrayList<>();
        Map<String, Object> recommendation = assessment.getAiRecommendation();
        List<Map<String, Object>> recommendedPersonnel = (List<Map<String, Object>>) recommendation.get("recommended_personnel");
        if (recommendedPersonnel != null) {
            for (Map<String, Object> rp : recommendedPersonnel) {
                String type = (String) rp.get("type");
                int count = ((Number) rp.get("count")).intValue();
                String rationale = (String) rp.get("rationale");
                requirements.add(new JobRequirement(type, count, rationale));
            }
        }

        // Parse durations from request or set defaults
        int minDuration = request.getMinDuration() != null ? request.getMinDuration() : 4; // default
        int maxDuration = request.getMaxDuration() != null ? request.getMaxDuration() : 8; // default

        Job job = Job.builder()
                .client(assessment.getClient())
                .title(request.getTitle() != null ? request.getTitle() : "Security for " + assessment.getEventType())
                .description(assessment.getConcerns())
                .location(assessment.getLocation())
                .date(request.getDate())
                .minDuration(minDuration)
                .maxDuration(maxDuration)
                .requirements(requirements)
                .staffingStatus("partial")
                .status("pending")
                .build();

        job = jobRepository.save(job);

        // Pre-generate bookings for each matched professional
        List<Map<String, Object>> matchedProfs = assessment.getMatchedProfessionals();
        if (matchedProfs != null) {
            for (Map<String, Object> mp : matchedProfs) {
                UUID profId = UUID.fromString((String) mp.get("professional_id"));
                String type = (String) mp.get("type");

                Professional professional = professionalRepository.findById(profId)
                        .orElseThrow(() -> new IllegalArgumentException("Professional not found with ID: " + profId));

                // Verify professional eligibility
                if ("verified".equals(professional.getVerificationStatus())
                        && "available".equals(professional.getAvailabilityStatus())
                        && professional.getTrustScore() >= 40) {
                    
                    // Verify no unresolved disputes
                    long unresolvedDisputes = disputeRepository.countUnresolvedByProfessionalId(professional.getId());
                    if (unresolvedDisputes == 0) {
                        Booking booking = Booking.builder()
                                .job(job)
                                .client(job.getClient())
                                .professional(professional)
                                .jobDescription(job.getDescription())
                                .location(job.getLocation())
                                .minDuration(job.getMinDuration())
                                .maxDuration(job.getMaxDuration())
                                .status("pending")
                                .slotType(type)
                                .declinedProfessionals(new ArrayList<>())
                                .incidentsLocked(false)
                                .build();

                        bookingRepository.save(booking);
                    }
                }
            }
        }

        assessment.setJob(job);
        assessmentRepository.save(assessment);

        return mapToJobResponse(job);
    }

    private void updateJobStaffingStatus(Job job) {
        List<Booking> bookings = bookingRepository.findByJobId(job.getId());
        
        // Sum requirements
        int requiredGuards = job.getRequirements().stream().mapToInt(JobRequirement::count).sum();
        long acceptedBookings = bookings.stream().filter(b -> "accepted".equals(b.getStatus()) || "active".equals(b.getStatus()) || "completed".equals(b.getStatus()) || "settled".equals(b.getStatus())).count();

        if (acceptedBookings >= requiredGuards) {
            job.setStaffingStatus("full");
        } else {
            job.setStaffingStatus("partial");
        }
        jobRepository.save(job);
    }

    private void triggerReplacementFlow(Booking booking) {
        // Collect all excluded professional IDs (currently assigned or already declined)
        List<Booking> siblingBookings = bookingRepository.findByJobId(booking.getJob().getId());
        Set<UUID> excludedIds = siblingBookings.stream()
                .map(b -> b.getProfessional().getId())
                .collect(Collectors.toSet());

        if (booking.getDeclinedProfessionals() != null) {
            excludedIds.addAll(booking.getDeclinedProfessionals());
        }

        List<UUID> excludeList = new ArrayList<>(excludedIds);
        if (excludeList.isEmpty()) {
            excludeList.add(UUID.randomUUID()); // Avoid empty SQL NOT IN
        }

        // Query replacements
        List<Professional> replacements = professionalRepository.findReplacements(booking.getLocation(), excludeList);

        if (!replacements.isEmpty()) {
            Professional suggestion = replacements.get(0);
            System.out.println("FCM: Replacement suggestion found: " + suggestion.getFullName() + " (ID: " + suggestion.getId() + ")");
            // Notify client (mock/log)
            System.out.println("FCM: Notification sent to client: One of your selected guards declined. We found a replacement to review.");
        } else {
            System.out.println("FCM: No replacement found. Client notified to select manually or reduce guard count.");
        }
    }

    private JobResponse mapToJobResponse(Job job) {
        List<Booking> bookings = bookingRepository.findByJobId(job.getId());
        List<BookingResponse> bookingResponses = bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());

        return JobResponse.builder()
                .id(job.getId())
                .clientId(job.getClient().getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .location(job.getLocation())
                .date(job.getDate())
                .minDuration(job.getMinDuration())
                .maxDuration(job.getMaxDuration())
                .requirements(job.getRequirements())
                .staffingStatus(job.getStaffingStatus())
                .status(job.getStatus())
                .bookings(bookingResponses)
                .createdAt(job.getCreatedAt())
                .build();
    }

    private BookingResponse mapToBookingResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .jobId(b.getJob().getId())
                .clientId(b.getClient().getId())
                .professionalId(b.getProfessional().getId())
                .professionalName(b.getProfessional().getFullName())
                .jobDescription(b.getJobDescription())
                .location(b.getLocation())
                .minDuration(b.getMinDuration())
                .maxDuration(b.getMaxDuration())
                .actualHours(b.getActualHours())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .status(b.getStatus())
                .slotType(b.getSlotType())
                .declinedProfessionals(b.getDeclinedProfessionals())
                .incidentsLocked(b.getIncidentsLocked())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
