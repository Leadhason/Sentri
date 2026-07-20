package com.project.sentri.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class JobPaymentSummaryResponse {
    private UUID jobId;
    private BigDecimal totalMaxAmountHeld;
    private BigDecimal totalAmountDue;
    private BigDecimal totalPlatformFee;
    private BigDecimal totalProfessionalPayout;
    private BigDecimal totalClientRefund;
    private List<PaymentResponse> payments;
}
