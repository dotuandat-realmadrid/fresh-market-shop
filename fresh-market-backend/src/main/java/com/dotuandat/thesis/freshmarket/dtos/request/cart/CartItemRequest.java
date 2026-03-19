package com.dotuandat.thesis.freshmarket.dtos.request.cart;

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
public class CartItemRequest {
    @NotBlank(message = "USER_ID_NOT_BLANK")
    String userId;

    @NotBlank(message = "PRODUCT_ID_NOT_BLANK")
    String productId;

    @NotNull(message = "QUANTITY_NOT_NULL")
    @Min(value = 1, message = "MIN_QUANTITY")
    Integer quantity;

    @Min(value = 1, message = "MIN_QUANTITY")
    Integer updatedQuantity;

    @Min(value = 1, message = "MIN_QUANTITY")
    Integer deletedQuantity;
}
