package com.dotuandat.thesis.freshmarket.entities;

import com.dotuandat.thesis.freshmarket.enums.RefundStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "refund")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Refund extends BaseEntity {

    @Column(name = "code", nullable = false)
    String code;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    @ManyToOne
    @JoinColumn(name = "order_id")
    Order order;

    @Column(name = "refund_amount", nullable = false, precision = 10, scale = 2)
    @DecimalMin(value = "0.0", inclusive = false)
    BigDecimal refundAmount;

    @Column(name = "reason", length = 500)
    String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    RefundStatus status;

    @Column(name = "transaction_date", nullable = false)
    @Builder.Default
    LocalDateTime transactionDate = LocalDateTime.now();

    @Column(name = "note", length = 1000)
    String note;
}
