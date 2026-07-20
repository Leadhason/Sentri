package com.project.sentri.service;

import tools.jackson.databind.json.JsonMapper;
import com.project.sentri.entity.*;
import com.project.sentri.repository.BookingRepository;
import com.project.sentri.repository.IncidentRepository;
import com.project.sentri.repository.JobRepository;
import com.project.sentri.repository.ReportRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportingService {

    private final ReportRepository reportRepository;
    private final JobRepository jobRepository;
    private final BookingRepository bookingRepository;
    private final IncidentRepository incidentRepository;
    private final AnthropicService anthropicService;
    private final JsonMapper jsonMapper;

    public ReportingService(ReportRepository reportRepository,
                            JobRepository jobRepository,
                            BookingRepository bookingRepository,
                            IncidentRepository incidentRepository,
                            AnthropicService anthropicService,
                            JsonMapper jsonMapper) {
        this.reportRepository = reportRepository;
        this.jobRepository = jobRepository;
        this.bookingRepository = bookingRepository;
        this.incidentRepository = incidentRepository;
        this.anthropicService = anthropicService;
        this.jsonMapper = jsonMapper;
    }

    public Optional<Report> getReportByJobId(UUID jobId) {
        return reportRepository.findByJobId(jobId);
    }

    public Optional<Report> getReportByBookingId(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));
        return reportRepository.findByJobId(booking.getJob().getId());
    }

    public Report getReportById(UUID id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with ID: " + id));
    }

    public List<Report> getFilteredReports(String status, Boolean hasHighSeverity) {
        return reportRepository.findAll().stream()
                .filter(r -> status == null || status.equalsIgnoreCase(r.getGenerationStatus()))
                .filter(r -> hasHighSeverity == null || hasHighSeverity.equals(r.getHasHighSeverity()))
                .sorted(Comparator.comparing(Report::getGeneratedAt).reversed())
                .collect(Collectors.toList());
    }

    @Async
    @Transactional
    public void triggerReportGenerationAsync(UUID jobId, String triggeredBy) {
        generateReportInternal(jobId, triggeredBy);
    }

    @Transactional
    public Report generateReportSync(UUID jobId, String triggeredBy) {
        return generateReportInternal(jobId, triggeredBy);
    }

    private Report generateReportInternal(UUID jobId, String triggeredBy) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + jobId));

        Optional<Report> existingReportOpt = reportRepository.findByJobId(jobId);
        if (existingReportOpt.isPresent()) {
            Report existing = existingReportOpt.get();
            if ("complete".equals(existing.getGenerationStatus())) {
                return existing; // Report is immutable once completed
            }
        }

        Report report = existingReportOpt.orElseGet(() -> Report.builder()
                .job(job)
                .generationStatus("pending")
                .triggeredBy(triggeredBy)
                .reportUrl("")
                .build());

        report.setGenerationStatus("generating");
        report.setLastAttemptAt(OffsetDateTime.now());
        report = reportRepository.save(report);

        try {
            // 1. Assemble payload
            List<Booking> bookings = bookingRepository.findByJobId(jobId);
            List<Incident> incidents = incidentRepository.findByJobId(jobId);

            long totalIncidents = incidents.size();
            long highIncidents = incidents.stream().filter(i -> "High".equalsIgnoreCase(i.getSeverity())).count();
            long mediumIncidents = incidents.stream().filter(i -> "Medium".equalsIgnoreCase(i.getSeverity())).count();
            long lowIncidents = incidents.stream().filter(i -> "Low".equalsIgnoreCase(i.getSeverity())).count();
            boolean hasHighSeverity = highIncidents > 0;

            List<Map<String, Object>> personnelData = bookings.stream().map(b -> Map.<String, Object>of(
                    "name", b.getProfessional().getFullName(),
                    "specialization", b.getSlotType(),
                    "hours_worked", b.getActualHours() != null ? b.getActualHours() : BigDecimal.ZERO
            )).collect(Collectors.toList());

            List<Map<String, Object>> incidentData = incidents.stream().map(i -> Map.<String, Object>of(
                    "logged_at", i.getLoggedAt().toString(),
                    "logged_by", i.getProfessional().getFullName(),
                    "incident_type", i.getIncidentType(),
                    "description", i.getDescription(),
                    "severity", i.getSeverity(),
                    "has_photo", i.getPhotoUrl() != null && !i.getPhotoUrl().isEmpty()
            )).collect(Collectors.toList());

            Map<String, Object> payload = Map.of(
                    "job", Map.of(
                            "title", job.getTitle(),
                            "location", job.getLocation(),
                            "date", job.getDate().toString()
                    ),
                    "personnel", personnelData,
                    "incidents", incidentData,
                    "summary_stats", Map.of(
                            "total_incidents", totalIncidents,
                            "has_high_severity", hasHighSeverity,
                            "by_severity", Map.of("High", highIncidents, "Medium", mediumIncidents, "Low", lowIncidents)
                    )
            );

            String systemPrompt = "You are an AI post-incident security auditor. Analyze the metadata, personnel worklogs, and incident events for the security engagement.\n" +
                    "Generate a formal, objective, third-person security report summarizing findings.\n" +
                    "You MUST output strictly raw JSON matching this structure:\n" +
                    "{\n" +
                    "  \"report_title\": \"string\",\n" +
                    "  \"executive_summary\": \"string\",\n" +
                    "  \"engagement_overview\": \"string\",\n" +
                    "  \"incident_narrative\": \"string\",\n" +
                    "  \"personnel_performance\": \"string\",\n" +
                    "  \"conclusion\": \"string\"\n" +
                    "}";

            String userPrompt = jsonMapper.writeValueAsString(payload);

            // 2. Call Claude
            String rawResponse;
            try {
                rawResponse = anthropicService.callClaude(systemPrompt, userPrompt);
            } catch (Exception e) {
                throw new RuntimeException("Claude API call failed: " + e.getMessage(), e);
            }

            Map<String, Object> reportTextMap;
            try {
                String jsonStr = rawResponse.trim();
                if (jsonStr.startsWith("```")) {
                    int firstJsonIndex = jsonStr.indexOf('{');
                    int lastJsonIndex = jsonStr.lastIndexOf('}');
                    if (firstJsonIndex != -1 && lastJsonIndex != -1) {
                        jsonStr = jsonStr.substring(firstJsonIndex, lastJsonIndex + 1);
                    }
                }
                reportTextMap = jsonMapper.readValue(jsonStr, Map.class);
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse AI report text response: " + rawResponse, e);
            }

            // 3. Generate PDF (Stubbed byte array generation + mock storage upload)
            String mockPdfUrl = "https://supabase.co/storage/v1/object/private/reports/" + jobId + "/engagement_report.pdf";

            // 4. Update Report details
            report.setReportUrl(mockPdfUrl);
            report.setIncidentCount((int) totalIncidents);
            report.setHasHighSeverity(hasHighSeverity);
            report.setGenerationStatus("complete");
            report = reportRepository.save(report);

            // 5. Notify parties (mock/log)
            System.out.println("FCM: Post-job report generated. Notification sent to client " + job.getClient().getId());
            for (Booking b : bookings) {
                System.out.println("FCM: Post-job report notification sent to professional " + b.getProfessional().getId());
            }

            return report;

        } catch (Exception e) {
            System.err.println("Error generating report for job " + jobId + ": " + e.getMessage());
            report.setGenerationStatus("failed");
            report.setRetryCount(report.getRetryCount() + 1);
            reportRepository.save(report);

            // Schedule retry if retryCount < 3 (mock/handled by a retry poller job)
            if (report.getRetryCount() >= 3) {
                System.out.println("FCM: Admin alert sent. AI Report generation failed 3 times for Job: " + jobId);
            }
            throw new RuntimeException("Failed to generate AI report: " + e.getMessage(), e);
        }
    }
}
