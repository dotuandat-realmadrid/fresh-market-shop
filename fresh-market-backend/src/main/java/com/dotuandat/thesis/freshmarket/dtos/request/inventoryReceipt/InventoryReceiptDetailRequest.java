package com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class InventoryReceiptDetailRequest {
    @NotBlank(message = "PRODUCT_ID_NOT_BLANK")
    String productCode;

    @NotNull(message = "QUANTITY_NOT_NULL")
    @Min(value = 1, message = "MIN_QUANTITY")
    Integer quantity;

    @NotNull(message = "QUANTITY_NOT_NULL")
    @Min(value = 1000, message = "MIN_PRICE")
    Long price;

    Date manufacturedDate;

    Date expiryDate;
}
