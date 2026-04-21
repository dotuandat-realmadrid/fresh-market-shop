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
public class CartResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    String cartId;
    List<CartItemResponse> items;
}
