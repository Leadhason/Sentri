package com.project.sentri.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DisputeResolutionRequest {
    private String adminRuling;
    private BigDecimal professionalPayout;
    private BigDecimal clientRefund;
}
