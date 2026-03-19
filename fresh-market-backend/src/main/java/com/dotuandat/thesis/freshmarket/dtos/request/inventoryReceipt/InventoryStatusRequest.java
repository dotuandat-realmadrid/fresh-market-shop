package com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt;

import com.dotuandat.thesis.freshmarket.enums.InventoryStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class InventoryStatusRequest {
    InventoryStatus status;
}
