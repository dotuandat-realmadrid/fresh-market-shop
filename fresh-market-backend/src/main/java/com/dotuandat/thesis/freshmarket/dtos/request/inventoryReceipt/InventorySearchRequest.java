package com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class InventorySearchRequest {
    String id;
    String email;
    LocalDate startDate;
    LocalDate endDate;
}
