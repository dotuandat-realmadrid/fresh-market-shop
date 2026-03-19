package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.converters.ProductConverter;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.trash.ProductTrashBinResponse;
import com.dotuandat.thesis.freshmarket.entities.Product;
import com.dotuandat.thesis.freshmarket.entities.ProductTrashBin;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.ProductRepository;
import com.dotuandat.thesis.freshmarket.repositories.ProductTrashBinRepository;
import com.dotuandat.thesis.freshmarket.services.ProductTrashBinService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductTrashBinServiceImpl implements ProductTrashBinService {

    ProductTrashBinRepository productTrashBinRepository;
    ProductRepository productRepository;
    ProductConverter productConverter;
    ModelMapper modelMapper;

    private long calculateDaysRemaining(LocalDateTime deletedDate) {
        if (deletedDate == null) {
            return 0L;
        }
        LocalDateTime expiryDate = deletedDate.plusDays(60);
        return Duration.between(LocalDateTime.now(), expiryDate).toDays();
    }

    private String calculateRemainingTime(LocalDateTime deletedDate) {
        if (deletedDate == null) {
            return "0 ngày 0 giờ 0 phút";
        }
        LocalDateTime expiryDate = deletedDate.plusDays(60);
        Duration duration = Duration.between(LocalDateTime.now(), expiryDate);
        if (duration.isNegative() || duration.isZero()) {
            return "Hết hạn";
        }
        long days = duration.toDays();
        long hours = duration.toHours() % 24;
        long minutes = duration.toMinutes() % 60;
        return String.format("%d ngày %d giờ %d phút", days, hours, minutes);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<ProductTrashBinResponse> search(Pageable pageable) {
        try {
            // Lấy dữ liệu từ database với phân trang
            Page<ProductTrashBin> productTrashBins = productTrashBinRepository.findAll(pageable);

            // Chuyển đổi từ List<productTrashBin> sang List<productTrashBinResponse>
            List<ProductTrashBinResponse> productTrashBinResponses = productTrashBins.stream()
                    .map(productTrashBin -> {
                        // Map cơ bản bằng ModelMapper
                        ProductTrashBinResponse response =
                                modelMapper.map(productTrashBin, ProductTrashBinResponse.class);

                        // Convert product entity sang productResponse DTO thủ công
                        if (productTrashBin.getProduct() != null) {
                            response.setProduct(productConverter.toResponse(productTrashBin.getProduct()));
                        }

                        // Tính thời gian còn lại để khôi phục
                        response.setRemainingTime(calculateRemainingTime(productTrashBin.getDeletedDate()));

                        return response;
                    })
                    .collect(Collectors.toList());

            // Tạo và trả về PageResponse
            return PageResponse.<ProductTrashBinResponse>builder()
                    .totalPage(productTrashBins.getTotalPages())
                    .currentPage(pageable.getPageNumber() + 1)
                    .pageSize(pageable.getPageSize())
                    .totalElements(productTrashBins.getTotalElements())
                    .data(productTrashBinResponses)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách productTrashBin: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public List<ProductTrashBin> create(List<Product> products) {
        List<ProductTrashBin> productTrashBins = products.stream()
                .map(product -> {
                    ProductTrashBin productTrashBin = new ProductTrashBin();
                    productTrashBin.setProduct(product);
                    productTrashBin.setDeletedDate(LocalDateTime.now());
                    return productTrashBin;
                })
                .collect(Collectors.toList());

        return productTrashBinRepository.saveAll(productTrashBins);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void restore(List<String> productIds) {
        List<ProductTrashBin> productTrashBins = productIds.stream()
                .map(productId -> productTrashBinRepository
                        .findByProductId(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_EXISTED)))
                .filter(productTrashBin -> calculateDaysRemaining(productTrashBin.getDeletedDate()) > 0)
                .collect(Collectors.toList());

        if (productTrashBins.isEmpty()) {
            throw new AppException(ErrorCode.NO_RESTORABLE);
        }

        List<Product> products =
                productTrashBins.stream().map(ProductTrashBin::getProduct).collect(Collectors.toList());

        products.forEach(product -> product.setIsActive(StatusConstant.ACTIVE));
        productRepository.saveAll(products);

        productTrashBinRepository.deleteAll(productTrashBins);
    }

    @Scheduled(fixedRate = 1000 * 60 * 30)
    @Transactional
    public void cleanExpiredTrash() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(60);
        List<ProductTrashBin> expired = productTrashBinRepository.findByDeletedDateBefore(threshold);
        productTrashBinRepository.deleteAll(expired);
    }
}
