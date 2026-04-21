package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.dtos.request.review.ReviewRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.review.ReviewResponse;
import com.dotuandat.thesis.freshmarket.entities.Order;
import com.dotuandat.thesis.freshmarket.entities.Product;
import com.dotuandat.thesis.freshmarket.entities.Review;
import com.dotuandat.thesis.freshmarket.entities.User;
import com.dotuandat.thesis.freshmarket.enums.OrderStatus;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.*;
import com.dotuandat.thesis.freshmarket.services.ReviewService;
import com.dotuandat.thesis.freshmarket.utils.PointCalculator;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewServiceImpl implements ReviewService {
    ReviewRepository reviewRepository;
    OrderRepository orderRepository;
    OrderDetailRepository orderDetailRepository;
    UserRepository userRepository;
    ProductRepository productRepository;

    @Override
    @Transactional
    public ReviewResponse create(ReviewRequest request) {
        // Resolve user từ username
        User user = userRepository.findByUsernameAndIsActive(request.getUsername(), StatusConstant.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Order order = validateOrderAndUser(request, user.getId());
        validateProductInOrder(request);
        validateReviewNotExists(request, user.getId());

        Review review = createReviewFromRequest(request, order, user);
        reviewRepository.save(review);

        updateProductRatingAndPoint(review.getProduct().getId(), review.getRating(), true);

        return mapToResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getByProductId(String productId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByProductIdAndIsActive(productId, StatusConstant.ACTIVE, pageable);

        List<ReviewResponse> reviewResponses =
                reviews.stream().map(this::mapToResponse).toList();

        return PageResponse.<ReviewResponse>builder()
                .pageSize(pageable.getPageSize())
                .currentPage(pageable.getPageNumber() + 1)
                .totalPage(reviews.getTotalPages())
                .totalElements(reviews.getTotalElements())
                .data(reviewResponses)
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(String id) {
        Review review = reviewRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_EXISTED));

        updateProductRatingAndPoint(review.getProduct().getId(), review.getRating(), false);
        review.setIsActive(StatusConstant.INACTIVE);
        reviewRepository.save(review);
    }

    private Order validateOrderAndUser(ReviewRequest request, String userId) {
        if (request.getOrderId() == null) return null;

        Order order = orderRepository
                .findById(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_EXISTED));

        if (!order.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new AppException(ErrorCode.CAN_NOT_REVIEW);
        }

        return order;
    }

    private void validateProductInOrder(ReviewRequest request) {
        if (request.getOrderId() == null) return;

        boolean productInOrder =
                orderDetailRepository.existsByOrderIdAndProductId(request.getOrderId(), request.getProductId());
        if (!productInOrder) {
            throw new AppException(ErrorCode.PRODUCT_NOT_IN_ORDER);
        }
    }

//    private void validateReviewNotExists(ReviewRequest request, String userId) {
//        if (reviewRepository.existsByUserIdAndOrderIdAndProductId(
//                userId, request.getOrderId(), request.getProductId())) {
//            throw new AppException(ErrorCode.ALREADY_REVIEWED);
//        }
//    }

    private void validateReviewNotExists(ReviewRequest request, String userId) {
        if (reviewRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            throw new AppException(ErrorCode.ALREADY_REVIEWED);
        }
    }

    private Review createReviewFromRequest(ReviewRequest request, Order order, User user) {
        Product product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_EXISTED));

        return Review.builder()
                .user(user)
                .product(product)
                .order(order)
                .rating(request.getRating())
                .title(request.getTitle())       // thêm title
                .comment(request.getComment())
                .createdDate(LocalDateTime.now())
                .modifiedDate(LocalDateTime.now())
                .build();
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .username(review.getUser().getUsername())
                .fullName(review.getUser().getFullName())
                .orderId(review.getOrder() != null ? review.getOrder().getId() : null)  // fix null
                .productId(review.getProduct().getId())
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .createdDate(review.getCreatedDate())
                .build();
    }

    /**
     * Cập nhật đánh giá trung bình và điểm cho sản phẩm sau khi có review mới.
     *
     * @param productId ID của sản phẩm
     * @param newRating Điểm đánh giá mới
     */
    private void updateProductRatingAndPoint(String productId, int newRating, boolean isAdd) {
        Product product = productRepository
                .findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_EXISTED));

        // Cập nhật avgRating
        int reviewCount = product.getReviewCount();
        double newAvgRating;

        if (isAdd) {
            double currentAvgRating = product.getAvgRating();
            newAvgRating =
                    reviewCount == 0 ? newRating : (currentAvgRating * reviewCount + newRating) / (reviewCount + 1);

            product.setAvgRating(newAvgRating);
            product.setReviewCount(reviewCount + 1);
        } else {
            double currentAvgRating = product.getAvgRating();
            newAvgRating =
                    reviewCount - 1 == 0 ? 2.5 : (currentAvgRating * reviewCount - newRating) / (reviewCount - 1);

            product.setAvgRating(newAvgRating);
            product.setReviewCount(reviewCount - 1);
        }

        // Tính lại point với soldQuantity và avgRating mới
        double point =
                PointCalculator.calculatePoint(product.getSoldQuantity(), newAvgRating, product.getReviewCount());
        product.setPoint(point);

        productRepository.save(product);
    }
}
