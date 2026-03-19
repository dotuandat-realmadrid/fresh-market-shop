package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.converters.CategoryConverter;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.trash.CategoryTrashBinResponse;
import com.dotuandat.thesis.freshmarket.entities.Category;
import com.dotuandat.thesis.freshmarket.entities.CategoryTrashBin;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.CategoryRepository;
import com.dotuandat.thesis.freshmarket.repositories.CategoryTrashBinRepository;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import com.dotuandat.thesis.freshmarket.services.CategoryTrashBinService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
public class CategoryTrashBinServiceImpl implements CategoryTrashBinService {

    CategoryTrashBinRepository categoryTrashBinRepository;
    CategoryRepository categoryRepository;
    CategoryConverter categoryConverter;
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
    public PageResponse<CategoryTrashBinResponse> search(Pageable pageable) {
        try {
            Page<CategoryTrashBin> categoryTrashBins = categoryTrashBinRepository.findAll(pageable);

            List<CategoryTrashBinResponse> categoryTrashBinResponses = categoryTrashBins.stream()
                    .map(categoryTrashBin -> {
                        CategoryTrashBinResponse response =
                                modelMapper.map(categoryTrashBin, CategoryTrashBinResponse.class);
                        if (categoryTrashBin.getCategory() != null) {
                            response.setCategory(categoryConverter.toResponse(categoryTrashBin.getCategory()));
                        }
                        response.setRemainingTime(calculateRemainingTime(categoryTrashBin.getDeletedDate()));
                        return response;
                    })
                    .collect(Collectors.toList());

            return PageResponse.<CategoryTrashBinResponse>builder()
                    .totalPage(categoryTrashBins.getTotalPages())
                    .currentPage(pageable.getPageNumber() + 1)
                    .pageSize(pageable.getPageSize())
                    .totalElements(categoryTrashBins.getTotalElements())
                    .data(categoryTrashBinResponses)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách CategoryTrashBin: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryTrashBin create(Category category) {
        CategoryTrashBin categoryTrashBin = new CategoryTrashBin();
        categoryTrashBin.setCategory(category);
        categoryTrashBin.setDeletedDate(LocalDateTime.now());

        return categoryTrashBinRepository.save(categoryTrashBin);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void restore(List<String> trashBinIds) {
        List<CategoryTrashBin> categoryTrashBins = trashBinIds.stream()
                .map(trashBinId -> categoryTrashBinRepository
                        .findById(trashBinId)
                        .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_EXISTED)))
                .filter(categoryTrashBin -> calculateDaysRemaining(categoryTrashBin.getDeletedDate()) > 0)
                .collect(Collectors.toList());

        if (categoryTrashBins.isEmpty()) {
            throw new AppException(ErrorCode.NO_RESTORABLE);
        }

        List<Category> categories =
                categoryTrashBins.stream().map(CategoryTrashBin::getCategory).collect(Collectors.toList());

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        categories.forEach(category -> {
            category.setIsActive(StatusConstant.ACTIVE);
            activityLogService.create(
                    username, "RESTORE", "Tài khoản " + username + " vừa khôi phục danh mục " + category.getName());
        });
        categoryRepository.saveAll(categories);

        categoryTrashBinRepository.deleteAll(categoryTrashBins);
    }

    @Scheduled(fixedRate = 1000 * 60 * 30)
    @Transactional
    public void cleanExpiredTrash() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(60);
        List<CategoryTrashBin> expired = categoryTrashBinRepository.findByDeletedDateBefore(threshold);
        categoryTrashBinRepository.deleteAll(expired);

        String username = "system";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            username = auth.getName();
        }
        final String finalUsername = username;
        expired.forEach(categoryTrashBin -> activityLogService.create(
                finalUsername,
                "DELETE",
                "Tài khoản " + finalUsername + " vừa xóa danh mục "
                        + (categoryTrashBin.getCategory() != null
                                ? categoryTrashBin.getCategory().getName()
                                : "Unknown")));
    }
}
