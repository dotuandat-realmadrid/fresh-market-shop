package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.converters.ProductConverter;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
import com.dotuandat.thesis.freshmarket.entities.Product;
import com.dotuandat.thesis.freshmarket.entities.User;
import com.dotuandat.thesis.freshmarket.entities.WishList;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.ProductRepository;
import com.dotuandat.thesis.freshmarket.repositories.UserRepository;
import com.dotuandat.thesis.freshmarket.repositories.WishListRepository;
import com.dotuandat.thesis.freshmarket.services.WishListService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WishListServiceImpl implements WishListService {
    WishListRepository wishListRepository;
    ProductConverter productConverter;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public PageResponse<ProductResponse> getWishListByUser(String userId, Pageable pageable) {
        Page<WishList> wishLists = wishListRepository.findByUserId(userId, pageable);

        List<ProductResponse> productResponses = wishLists.stream()
                .map(wishList -> productConverter.toResponse(wishList.getProduct()))
                .toList();

        return PageResponse.<ProductResponse>builder()
                .totalPage(wishLists.getTotalPages())
                .currentPage(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .totalElements(wishLists.getTotalElements())
                .data(productResponses)
                .build();
    }

    @Override
    @Transactional
    public void toggle(String userId, String productId) {
        boolean exists = wishListRepository.existsByUser_IdAndProduct_Id(userId, productId);

        if (exists) {
            wishListRepository.deleteByUser_IdAndProduct_Id(userId, productId);
            return;
        }

        User user = userRepository
                .findByIdAndIsActive(userId, StatusConstant.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_EXISTED));

        wishListRepository.save(WishList.builder().user(user).product(product).build());
    }

    @Override
    public boolean checkWishList(String userId, String productId) {
        boolean exists = wishListRepository.existsByUser_IdAndProduct_Id(userId, productId);
        return exists;
    }
}
