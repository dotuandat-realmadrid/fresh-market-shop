package com.dotuandat.thesis.freshmarket.dtos.response.report;

import com.dotuandat.thesis.freshmarket.enums.OrderType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RevenueByOrderType {
    OrderType orderType;
    Long totalOrders;
    Long totalRevenue;
}
