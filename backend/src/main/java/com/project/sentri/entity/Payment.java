package com.project.sentri.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professional_id", nullable = false)
    private Professional professional;

    @Column(name = "max_amount_held", nullable = false)
    private BigDecimal maxAmountHeld;

    @Column(name = "actual_hours")
    private BigDecimal actualHours;

    @Column(name = "amount_due")
    private BigDecimal amountDue;

    @Column(name = "platform_fee")
    private BigDecimal platformFee;

    @Column(name = "professional_payout")
    private BigDecimal professionalPayout;

    @Column(name = "client_refund")
    private BigDecimal clientRefund;

    @Column(name = "paystack_reference")
    private String paystackReference;

    @Builder.Default
    @Column(name = "status", nullable = false)
    private String status = "held"; // 'held', 'released', 'disputed', 'refunded'

    @Builder.Default
    @Column(name = "auto_confirmed", nullable = false)
    private Boolean autoConfirmed = false;

    @Column(name = "confirmed_at")
    private OffsetDateTime confirmedAt;
}
