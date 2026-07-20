package com.project.sentri.dto;

import com.project.sentri.entity.JobRequirement;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class JobResponse {
    private UUID id;
    private UUID clientId;
    private String title;
    private String description;
    private String location;
    private LocalDate date;
    private Integer minDuration;
    private Integer maxDuration;
    private List<JobRequirement> requirements;
    private String staffingStatus;
    private String status;
    private List<BookingResponse> bookings;
    private OffsetDateTime createdAt;
}
