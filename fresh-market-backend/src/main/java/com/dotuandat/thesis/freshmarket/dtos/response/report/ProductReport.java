package com.dotuandat.thesis.freshmarket.dtos.response.report;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductReport implements Serializable {
    private static final long serialVersionUID = 1L;
    String code;
    String name;
    long totalSoldQuantity;
    long totalRevenue;
}
