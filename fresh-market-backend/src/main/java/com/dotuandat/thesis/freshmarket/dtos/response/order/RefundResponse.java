package com.dotuandat.thesis.freshmarket.dtos.response.order;

import com.dotuandat.thesis.freshmarket.enums.RefundStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RefundResponse {
    String id;
    String code;
    String userId;
    String username;
    String fullName;
    String phone;
    String address;
    String orderId;
    Long totalPrice;
    BigDecimal refundAmount;
    RefundStatus status;
    String reason;
    LocalDateTime transactionDate;
    LocalDateTime createdDate;
    String note;
    List<OrderDetailResponse> details;
}
