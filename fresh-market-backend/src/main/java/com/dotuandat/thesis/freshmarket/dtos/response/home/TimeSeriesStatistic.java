package com.dotuandat.thesis.freshmarket.dtos.response.home;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TimeSeriesStatistic {
    String timestamp; // Mốc thời gian định dạng ISO 8601
    long totalProductsSold;
    double totalRevenue;
    long totalCustomers;
}
