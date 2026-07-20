package com.project.sentri.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class HoursConfirmationRequest {
    private BigDecimal actualHours;
}
