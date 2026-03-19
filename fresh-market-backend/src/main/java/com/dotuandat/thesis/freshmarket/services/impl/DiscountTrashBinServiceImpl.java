package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.dtos.response.trash.DiscountTrashBinResponse;
import com.dotuandat.thesis.freshmarket.entities.Discount;
import com.dotuandat.thesis.freshmarket.entities.DiscountTrashBin;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.DiscountRepository;
import com.dotuandat.thesis.freshmarket.repositories.DiscountTrashBinRepository;
import com.dotuandat.thesis.freshmarket.repositories.ProductRepository;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import com.dotuandat.thesis.freshmarket.services.DiscountTrashBinService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DiscountTrashBinServiceImpl implements DiscountTrashBinService {

    DiscountTrashBinRepository discountTrashBinRepository;
    DiscountRepository discountRepository;
    ProductRepository productRepository;
    ModelMapper modelMapper;
    ActivityLogService activityLogService;

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
    public List<DiscountTrashBinResponse> findAll() {
        try {
            List<DiscountTrashBin> discountTrashBins =
                    discountTrashBinRepository.findAll(Sort.by(Sort.Direction.DESC, "deletedDate"));
            return discountTrashBins.stream()
                    .map(trashBin -> {
                        DiscountTrashBinResponse response = modelMapper.map(trashBin, DiscountTrashBinResponse.class);
                        response.setRemainingTime(calculateRemainingTime(trashBin.getDeletedDate()));
                        return response;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách DiscountTrashBin: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public DiscountTrashBin create(Discount discount) {
        DiscountTrashBin discountTrashBin = new DiscountTrashBin();
        discountTrashBin.setDiscount(discount);
        discountTrashBin.setDeletedDate(LocalDateTime.now());
        return discountTrashBinRepository.save(discountTrashBin);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void restore(List<String> discountIds) {
        List<DiscountTrashBin> discountTrashBins = discountIds.stream()
                .map(discountId -> discountTrashBinRepository
                        .findByDiscountId(discountId)
                        .orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_EXISTED)))
                .filter(discountTrashBin -> calculateDaysRemaining(discountTrashBin.getDeletedDate()) > 0)
                .collect(Collectors.toList());

        if (discountTrashBins.isEmpty()) {
            throw new AppException(ErrorCode.NO_RESTORABLE);
        }

        List<Discount> discounts =
                discountTrashBins.stream().map(DiscountTrashBin::getDiscount).collect(Collectors.toList());

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        discounts.forEach(discount -> {
            discount.setIsActive(StatusConstant.ACTIVE);
            activityLogService.create(
                    username, "RESTORE", "Tài khoản " + username + " vừa khôi phục mã giảm giá " + discount.getName());
        });
        discountRepository.saveAll(discounts);

        discountTrashBinRepository.deleteAll(discountTrashBins);
    }

    @Scheduled(fixedRate = 1000 * 60 * 30)
    @Transactional
    public void cleanExpiredTrash() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(60);
        List<DiscountTrashBin> expired = discountTrashBinRepository.findByDeletedDateBefore(threshold);

        expired.forEach(trashBin -> {
            Discount discount = trashBin.getDiscount();
            if (discount != null) {
                remove(discount.getId());
            }
        });

        discountTrashBinRepository.deleteAll(expired);
    }

    @Transactional
    public void remove(String id) {
        Discount discount =
                discountRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_EXISTED));

        discount.getProducts().forEach(product -> {
            product.setDiscount(null);
            product.setDiscountPrice(null);
        });
        productRepository.saveAll(discount.getProducts());

        discountRepository.delete(discount);

        String username = "system";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            username = auth.getName();
        }
        final String finalUsername = username;
        activityLogService.create(
                finalUsername, "DELETE", "Tài khoản " + finalUsername + " vừa xóa mã giảm giá " + discount.getName());
    }
}
