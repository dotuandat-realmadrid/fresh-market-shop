package com.dotuandat.thesis.freshmarket.converters;

import com.dotuandat.thesis.freshmarket.dtos.response.cart.CartItemResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.cart.CartResponse;
import com.dotuandat.thesis.freshmarket.entities.Cart;
import com.dotuandat.thesis.freshmarket.entities.ProductImage;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CartConverter {

    public CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(item -> CartItemResponse.builder()
                        .productId(item.getProduct().getId())
                        .productCode(item.getProduct().getCode())
                        .productName(item.getProduct().getName())
                        .images(item.getProduct().getImages().stream()
                                .map(ProductImage::getImagePath)
                                .toList())
                        .price(item.getProduct().getPrice())
                        .discountPrice(item.getProduct().getDiscountPrice())
                        .quantity(item.getQuantity())
                        .build())
                .toList();

        return CartResponse.builder().cartId(cart.getId()).items(items).build();
    }
}
