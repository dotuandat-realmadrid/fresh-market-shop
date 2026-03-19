package com.dotuandat.thesis.freshmarket.dtos.response.order;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderDetailResponse {
    String productId;
    String productCode;
    String productName;
    int quantity;
    Long priceAtPurchase;
    List<String> images;

    @JsonProperty("isReviewed")
    boolean isReviewed;
}
