package com.dotuandat.thesis.freshmarket.dtos.response.report;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RevenueByProduct {
    String code;
    long totalInventoryQuantity;
    long totalRevenuePrice;
    long totalSoldQuantity;
    long totalRevenue;
}
