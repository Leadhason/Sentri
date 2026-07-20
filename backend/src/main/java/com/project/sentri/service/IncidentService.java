package com.project.sentri.service;

import com.project.sentri.dto.IncidentRequest;
import com.project.sentri.dto.IncidentResponse;
import com.project.sentri.dto.SignedUrlResponse;
import com.project.sentri.entity.*;
import com.project.sentri.repository.BookingRepository;
import com.project.sentri.repository.IncidentRepository;
import com.project.sentri.repository.LocationLogRepository;
import com.project.sentri.repository.SettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final BookingRepository bookingRepository;
    private final LocationLogRepository locationLogRepository;
    private final SettingRepository settingRepository;

    public IncidentService(IncidentRepository incidentRepository,
                           BookingRepository bookingRepository,
                           LocationLogRepository locationLogRepository,
                           SettingRepository settingRepository) {
        this.incidentRepository = incidentRepository;
        this.bookingRepository = bookingRepository;
        this.locationLogRepository = locationLogRepository;
        this.settingRepository = settingRepository;
    }

    @Transactional
    public IncidentResponse logIncident(UUID bookingId, UUID professionalId, IncidentRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (!"active".equals(booking.getStatus())) {
            throw new IllegalStateException("Incidents can only be logged for active bookings");
        }

        if (!booking.getProfessional().getId().equals(professionalId)) {
            throw new IllegalArgumentException("Incident must be logged by the assigned professional");
        }

        if (booking.getIncidentsLocked()) {
            throw new IllegalStateException("Incidents are locked for this completed booking");
        }

        // Validate type "Other" requires description
        if ("Other".equalsIgnoreCase(request.getIncidentType()) && 
                (request.getDescription() == null || request.getDescription().trim().isEmpty())) {
            throw new IllegalArgumentException("Description must be provided when incident type is 'Other'");
        }

        // Validate photo URL bucket
        if (request.getPhotoUrl() != null && !request.getPhotoUrl().isEmpty()) {
            if (!request.getPhotoUrl().contains("supabase") && !request.getPhotoUrl().contains("localhost")) {
                throw new IllegalArgumentException("Photo URL must point to the Sentri Supabase Storage bucket");
            }
        }

        // Classify severity
        String severity = classifySeverity(request.getIncidentType());

        // GPS mismatch check
        boolean locationMismatch = false;
        Optional<LocationLog> lastLog = locationLogRepository.findFirstByBookingIdOrderByRecordedAtDesc(bookingId);
        if (lastLog.isPresent() && request.getLatitude() != null && request.getLongitude() != null) {
            double distance = calculateHaversineDistance(
                    request.getLatitude().doubleValue(),
                    request.getLongitude().doubleValue(),
                    lastLog.get().getLatitude().doubleValue(),
                    lastLog.get().getLongitude().doubleValue()
            );

            // Read geofence threshold from settings (default to 500 meters)
            double threshold = 500.0;
            Optional<Setting> thresholdSetting = settingRepository.findByKey("anomaly.location_departure_meters");
            if (thresholdSetting.isPresent()) {
                try {
                    threshold = Double.parseDouble(thresholdSetting.get().getValue());
                } catch (Exception e) {
                    System.err.println("Warning: Invalid anomaly threshold configured: " + thresholdSetting.get().getValue());
                }
            }

            if (distance > threshold) {
                locationMismatch = true;
            }
        }

        Incident incident = Incident.builder()
                .booking(booking)
                .professional(booking.getProfessional())
                .incidentType(request.getIncidentType())
                .description(request.getDescription())
                .photoUrl(request.getPhotoUrl())
                .latitude(request.getLatitude() != null ? request.getLatitude() : BigDecimal.ZERO)
                .longitude(request.getLongitude() != null ? request.getLongitude() : BigDecimal.ZERO)
                .severity(severity)
                .locationMismatch(locationMismatch)
                .build();

        incident = incidentRepository.save(incident);

        // Send FCM pushes (mock/log)
        System.out.println("FCM: Incident notification sent to client " + booking.getClient().getId() + " - Type: " + incident.getIncidentType());
        if ("High".equals(severity)) {
            System.out.println("FCM: HIGH SEVERITY alert sent to Admins. Booking ID: " + bookingId + ", Type: " + incident.getIncidentType() + ", GPS: " + incident.getLatitude() + "," + incident.getLongitude());
        }

        return mapToResponse(incident);
    }

    public List<IncidentResponse> getIncidentsByBooking(UUID bookingId) {
        return incidentRepository.findByBookingId(bookingId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<IncidentResponse> getIncidentsByJob(UUID jobId) {
        return incidentRepository.findByJobId(jobId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SignedUrlResponse getSignedUploadUrl(UUID bookingId, UUID professionalId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (!"active".equals(booking.getStatus())) {
            throw new IllegalStateException("Booking must be active to generate upload URLs");
        }

        if (!booking.getProfessional().getId().equals(professionalId)) {
            throw new IllegalArgumentException("Unauthorized: Professional is not assigned to this booking");
        }

        // Mock Supabase storage URL generation
        String uuid = UUID.randomUUID().toString();
        String uploadUrl = "https://supabase.co/storage/v1/object/write/incidents/" + bookingId + "/" + uuid + ".jpg?token=mock_signed_write_token";
        String publicUrl = "https://supabase.co/storage/v1/object/public/incidents/" + bookingId + "/" + uuid + ".jpg";

        return SignedUrlResponse.builder()
                .uploadUrl(uploadUrl)
                .publicUrl(publicUrl)
                .build();
    }

    public List<IncidentResponse> getFilteredIncidents(String severity, String type, UUID professionalId, UUID bookingId) {
        // Query database and filter
        return incidentRepository.findAll().stream()
                .filter(i -> severity == null || severity.equalsIgnoreCase(i.getSeverity()))
                .filter(i -> type == null || type.equalsIgnoreCase(i.getIncidentType()))
                .filter(i -> professionalId == null || professionalId.equals(i.getProfessional().getId()))
                .filter(i -> bookingId == null || bookingId.equals(i.getBooking().getId()))
                .sorted(Comparator.comparing(Incident::getLoggedAt).reversed())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public IncidentResponse getIncidentById(UUID id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found with ID: " + id));
        return mapToResponse(incident);
    }

    private String classifySeverity(String type) {
        if ("Physical Altercation".equalsIgnoreCase(type) || "Medical Emergency".equalsIgnoreCase(type)) {
            return "High";
        } else if ("Unauthorized Access Attempt".equalsIgnoreCase(type) || "Property Damage".equalsIgnoreCase(type)) {
            return "Medium";
        }
        return "Low"; // Suspicious Activity, Noise or Disturbance, Crowd Control Issue, Client Request, Other
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Radius of Earth in meters
        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double deltaPhi = Math.toRadians(lat2 - lat1);
        double deltaLambda = Math.toRadians(lon2 - lon1);

        double a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    private IncidentResponse mapToResponse(Incident i) {
        return IncidentResponse.builder()
                .id(i.getId())
                .bookingId(i.getBooking().getId())
                .professionalId(i.getProfessional().getId())
                .professionalName(i.getProfessional().getFullName())
                .incidentType(i.getIncidentType())
                .description(i.getDescription())
                .photoUrl(i.getPhotoUrl())
                .latitude(i.getLatitude())
                .longitude(i.getLongitude())
                .severity(i.getSeverity())
                .loggedAt(i.getLoggedAt())
                .locationMismatch(i.getLocationMismatch())
                .build();
    }
}
