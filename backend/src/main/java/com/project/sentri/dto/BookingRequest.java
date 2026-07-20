package com.project.sentri.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class BookingRequest {
    private UUID professionalId;
    private String slotType;
    private String jobDescription;
}
