package com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class InventoryReceiptRequest {
    @NotNull(message = "TOTAL_AMOUNT_NOY_NULL")
    @Min(value = 1, message = "MIN_QUANTITY")
    Long totalAmount;

    String note;

    @Valid
    List<InventoryReceiptDetailRequest> details;
}
