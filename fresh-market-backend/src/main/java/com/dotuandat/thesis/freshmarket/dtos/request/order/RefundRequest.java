package com.dotuandat.thesis.freshmarket.dtos.request.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class RefundRequest {

    String code;

    @NotBlank(message = "USER_ID_NOT_BLANK")
    String userId;

    String orderId;

    @NotNull(message = "PRICE_NOT_NULL")
    @Min(value = 1000, message = "MIN_PRICE")
    BigDecimal refundAmount;

    String reason;

    String note;
}
