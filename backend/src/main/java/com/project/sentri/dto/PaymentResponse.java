package com.project.sentri.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class PaymentResponse {
    private UUID id;
    private UUID bookingId;
    private UUID clientId;
    private UUID professionalId;
    private BigDecimal maxAmountHeld;
    private BigDecimal actualHours;
    private BigDecimal amountDue;
    private BigDecimal platformFee;
    private BigDecimal professionalPayout;
    private BigDecimal clientRefund;
    private String paystackReference;
    private String status;
    private Boolean autoConfirmed;
    private OffsetDateTime confirmedAt;
}
