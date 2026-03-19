package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.cart.CartItemRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.cart.CartResponse;

public interface CartService {
    int getTotalItems(String userId);

    CartResponse getCartByUser(String userId);

    void clearCart(String userId);

    CartResponse addCartItem(CartItemRequest request);

    void removeItem(String userId, String productId);
}
