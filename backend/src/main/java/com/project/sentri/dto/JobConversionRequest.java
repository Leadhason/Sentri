package com.project.sentri.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class JobConversionRequest {
    private LocalDate date;
    private String title;
    private Integer minDuration;
    private Integer maxDuration;
}
