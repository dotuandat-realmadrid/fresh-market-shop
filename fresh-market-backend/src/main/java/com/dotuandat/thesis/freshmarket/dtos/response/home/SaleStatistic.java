package com.dotuandat.thesis.freshmarket.dtos.response.home;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SaleStatistic implements Serializable {
    private static final long serialVersionUID = 1L;
    long totalProductsSold;
    double salesGrowthPercent;
    long totalRevenue;
    double revenueGrowthPercent;
    long totalCustomers;
    double customersGrowthPercent;
    String period;
    String periodLabel;
}
