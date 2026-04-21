package com.dotuandat.thesis.freshmarket.dtos.response.cart;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    String productId;
    String productCode;
    String productName;
    List<String> images;
    long price;
    Long discountPrice;
    int quantity;
}
