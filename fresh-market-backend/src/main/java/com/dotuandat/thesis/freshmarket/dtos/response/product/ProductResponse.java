package com.dotuandat.thesis.freshmarket.dtos.response.product;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    String id;
    List<String> categoryCodes;
    String supplierCode;
    String code;
    String name;
    String branch;
    String description;
    int price;
    Integer discountPrice;
    Double percent;
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
