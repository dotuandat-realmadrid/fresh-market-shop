package com.dotuandat.thesis.freshmarket.dtos.response.product;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponse {
    String id;
    String categoryCode;
    String supplierCode;
    String code;
    String name;
    String description;
    int price;
    Integer discountPrice;
    int inventoryQuantity;
    int soldQuantity;
    int point;
    double avgRating;
    int reviewCount;
    String discountName;
    List<String> images;
    LocalDateTime createdDate;
    String createdBy;
    LocalDateTime modifiedDate;
    String modifiedBy;
}
