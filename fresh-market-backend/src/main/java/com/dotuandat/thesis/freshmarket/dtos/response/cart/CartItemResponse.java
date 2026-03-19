package com.dotuandat.thesis.freshmarket.dtos.response.cart;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemResponse {
    String productId;
    String productCode;
    String productName;
    List<String> images;
    long price;
    Long discountPrice;
    int quantity;
}
