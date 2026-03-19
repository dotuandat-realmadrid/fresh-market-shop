package com.dotuandat.thesis.freshmarket.dtos.request.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class OrderDetailRequest {
    @NotBlank(message = "PRODUCT_ID_NOT_BLANK")
    String productId;

    @NotNull(message = "QUANTITY_NOT_NULL")
    @Min(value = 1, message = "MIN_QUANTITY")
    Integer quantity;

    @NotNull(message = "PRICE_NOT_NULL")
    @Min(value = 1000, message = "MIN_PRICE")
    Long priceAtPurchase;
}
