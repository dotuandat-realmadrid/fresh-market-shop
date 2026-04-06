package com.dotuandat.thesis.freshmarket.dtos.request.order;

import com.dotuandat.thesis.freshmarket.enums.OrderType;
import com.dotuandat.thesis.freshmarket.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class OrderRequest {

    @NotBlank(message = "USER_ID_NOT_BLANK")
    String userId;

    OrderType orderType;

    @NotNull(message = "PRICE_NOT_NULL")
    @Min(value = 1000, message = "MIN_PRICE")
    Long totalPrice;

    PaymentMethod paymentMethod;
    String note;
    String addressId;

    @Valid
    List<OrderDetailRequest> details;
}
