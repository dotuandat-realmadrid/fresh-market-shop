package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
import org.springframework.data.domain.Pageable;

public interface WishListService {
    PageResponse<ProductResponse> getWishListByUser(String userId, Pageable pageable);

    void toggle(String userId, String productId);

    boolean checkWishList(String userId, String productId);
}
