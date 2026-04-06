package com.dotuandat.thesis.freshmarket.dtos.request.product;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductSearchRequest {
    String id;
    List<String> categoryCodes;
    String supplierCode;
    String code;
    String name;
    Long minPrice;
    Long maxPrice;
}
