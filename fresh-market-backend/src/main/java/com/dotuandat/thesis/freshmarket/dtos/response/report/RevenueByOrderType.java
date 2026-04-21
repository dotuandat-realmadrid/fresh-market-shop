package com.dotuandat.thesis.freshmarket.dtos.response.report;

import com.dotuandat.thesis.freshmarket.enums.OrderType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RevenueByOrderType implements Serializable {
    private static final long serialVersionUID = 1L;
    OrderType orderType;
    Long totalOrders;
    Long totalRevenue;
}
