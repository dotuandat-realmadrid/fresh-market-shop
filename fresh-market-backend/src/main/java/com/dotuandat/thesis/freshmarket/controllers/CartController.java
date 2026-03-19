package com.dotuandat.thesis.freshmarket.controllers;

import com.dotuandat.thesis.freshmarket.dtos.request.cart.CartItemRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.cart.CartResponse;
import com.dotuandat.thesis.freshmarket.services.CartService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartController {
    CartService cartService;

    @GetMapping("/{userId}/total-items")
    public ApiResponse<Integer> getTotalItems(@PathVariable String userId) {
        return ApiResponse.<Integer>builder()
                .result(cartService.getTotalItems(userId))
                .build();
    }

    @GetMapping("/{userId}")
    public ApiResponse<CartResponse> getCartByUser(@PathVariable String userId) {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.getCartByUser(userId))
                .build();
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<Void> clearCart(@PathVariable String userId) {
        cartService.clearCart(userId);

        return ApiResponse.<Void>builder().message("Clear cart successful").build();
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> addCartItem(@RequestBody @Valid CartItemRequest request) {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.addCartItem(request))
                .build();
    }

    @DeleteMapping("/{userId}/items/{productId}")
    public ApiResponse<Void> removeItem(@PathVariable String userId, @PathVariable String productId) {
        cartService.removeItem(userId, productId);

        return ApiResponse.<Void>builder().message("Clear cart item successful").build();
    }
}
