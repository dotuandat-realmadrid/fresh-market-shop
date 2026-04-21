package com.dotuandat.thesis.freshmarket.dtos.response.home;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TimeSeriesStatistic implements Serializable {
    private static final long serialVersionUID = 1L;
    String timestamp; // Mốc thời gian định dạng ISO 8601
    long totalProductsSold;
    double totalRevenue;
    long totalCustomers;
}
