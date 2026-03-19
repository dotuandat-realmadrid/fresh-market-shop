package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.dtos.request.product.DiscountProductRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.entities.Discount;
import com.dotuandat.thesis.freshmarket.entities.Product;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.DiscountRepository;
import com.dotuandat.thesis.freshmarket.repositories.ProductRepository;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import com.dotuandat.thesis.freshmarket.services.DiscountService;
import com.dotuandat.thesis.freshmarket.services.DiscountTrashBinService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DiscountServiceImpl implements DiscountService {
    DiscountRepository discountRepository;
    ProductRepository productRepository;
    ModelMapper modelMapper;
    DiscountTrashBinService discountTrashBinService;
    ActivityLogService activityLogService;

    @Override
    public Discount getById(String id) {
        return discountRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_EXISTED));
    }

    @Override
    public List<Discount> getAll() {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdDate");
        return discountRepository.findAllByIsActive(StatusConstant.ACTIVE, sort);
    }

    @Override
    public PageResponse<Discount> search(Pageable pageable) {
        try {

            // Lấy dữ liệu từ database với phân trang
            Page<Discount> discounts = discountRepository.findAllByIsActive(StatusConstant.ACTIVE, pageable);

            // Tạo và trả về PageResponse
            return PageResponse.<Discount>builder()
                    .totalPage(discounts.getTotalPages())
                    .currentPage(pageable.getPageNumber() + 1)
                    .pageSize(pageable.getPageSize())
                    .totalElements(discounts.getTotalElements())
                    .data(discounts.getContent())
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tìm kiếm category: ", e);
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CUD_DISCOUNT')")
    public Discount create(Discount discount) {
        log.info("discount: {}", discount);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(
                username, "CREATE", "Tài khoản " + username + " vừa thêm mã giảm giá " + discount.getName());

        return discountRepository.save(discount);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CUD_DISCOUNT')")
    public Discount update(String id, Discount request) {
        Discount discount =
                discountRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_EXISTED));

        List<Product> products = discount.getProducts().stream()
                .peek(product -> {
                    product.setDiscount(discount);
                    product.setDiscountPrice(Math.round(product.getPrice() * (100 - request.getPercent()) / 100.0));
                })
                .collect(Collectors.toList());

        discount.setProducts(products);

        modelMapper.map(request, discount);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(
                username, "UPDATE", "Tài khoản " + username + " vừa cập nhật mã giảm giá " + discount.getName());

        return discountRepository.save(discount);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CUD_DISCOUNT')")
    public Discount addDiscountProducts(String id, DiscountProductRequest request) {
        Discount discount =
                discountRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_EXISTED));

        // Lấy danh sách mới từ request
        List<Product> products = request.getProductIds().stream()
                .map(pid -> productRepository
                        .findById(pid)
                        .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_EXISTED)))
                .collect(Collectors.toList());

        // Thiết lập quan hệ ngược lại và cập nhật danh sách mới và
        products.forEach(product -> {
            product.setDiscount(discount);
            product.setDiscountPrice(
                    Math.round(product.getPrice() * (100 - product.getDiscount().getPercent()) / 100.0));
        });
        discount.setProducts(products);

        return discountRepository.save(discount);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CUD_DISCOUNT')")
    public void delete(String id) {
        Discount discount =
                discountRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_EXISTED));

        discount.setIsActive(StatusConstant.INACTIVE);

        discountRepository.save(discount);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(
                username, "DELETE", "Tài khoản " + username + " vừa xóa mã giảm giá " + discount.getName());

        discountTrashBinService.create(discount);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CUD_DISCOUNT')")
    public void remove(String id) {
        Discount discount =
                discountRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_EXISTED));

        discount.getProducts().forEach(product -> {
            product.setDiscount(null);
            product.setDiscountPrice(null);
        });
        productRepository.saveAll(discount.getProducts());

        discountRepository.delete(discount);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(
                username, "DELETE", "Tài khoản " + username + " vừa xóa mã giảm giá " + discount.getName());
    }
}
