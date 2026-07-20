package com.project.sentri.dto;

import com.project.sentri.entity.JobRequirement;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class JobRequest {
    private String title;
    private String description;
    private String location;
    private LocalDate date;
    private Integer minDuration;
    private Integer maxDuration;
    private List<JobRequirement> requirements;
}
