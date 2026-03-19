package com.dotuandat.thesis.freshmarket.dtos.request.product;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductSearchRequest {
    String id;
    String categoryCode;
    String supplierCode;
    String code;
    String name;
    Long minPrice;
    Long maxPrice;
}
