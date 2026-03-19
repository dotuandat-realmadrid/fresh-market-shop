package com.dotuandat.thesis.freshmarket.dtos.response.home;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SaleStatistic {
    long totalProductsSold;
    double salesGrowthPercent;
    long totalRevenue;
    double revenueGrowthPercent;
    long totalCustomers;
    double customersGrowthPercent;
    String period;
    String periodLabel;
}
