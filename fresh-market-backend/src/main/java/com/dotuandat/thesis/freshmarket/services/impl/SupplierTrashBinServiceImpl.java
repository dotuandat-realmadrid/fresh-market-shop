package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.converters.SupplierConverter;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.trash.SupplierTrashBinResponse;
import com.dotuandat.thesis.freshmarket.entities.Supplier;
import com.dotuandat.thesis.freshmarket.entities.SupplierTrashBin;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.SupplierRepository;
import com.dotuandat.thesis.freshmarket.repositories.SupplierTrashBinRepository;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import com.dotuandat.thesis.freshmarket.services.SupplierTrashBinService;
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
public class SupplierTrashBinServiceImpl implements SupplierTrashBinService {

    SupplierTrashBinRepository supplierTrashBinRepository;
    SupplierRepository supplierRepository;
    SupplierConverter supplierConverter;
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
    public PageResponse<SupplierTrashBinResponse> search(Pageable pageable) {
        try {
            // Lấy dữ liệu từ database với phân trang
            Page<SupplierTrashBin> supplierTrashBins = supplierTrashBinRepository.findAll(pageable);

            // Chuyển đổi từ List<SupplierTrashBin> sang List<SupplierTrashBinResponse>
            List<SupplierTrashBinResponse> supplierTrashBinResponses = supplierTrashBins.stream()
                    .map(supplierTrashBin -> {
                        // Map cơ bản bằng ModelMapper
                        SupplierTrashBinResponse response =
                                modelMapper.map(supplierTrashBin, SupplierTrashBinResponse.class);

                        // Convert Supplier entity sang SupplierResponse DTO thủ công
                        if (supplierTrashBin.getSupplier() != null) {
                            response.setSupplier(supplierConverter.toResponse(supplierTrashBin.getSupplier()));
                        }

                        // Tính thời gian còn lại để khôi phục
                        response.setRemainingTime(calculateRemainingTime(supplierTrashBin.getDeletedDate()));

                        return response;
                    })
                    .collect(Collectors.toList());

            // Tạo và trả về PageResponse
            return PageResponse.<SupplierTrashBinResponse>builder()
                    .totalPage(supplierTrashBins.getTotalPages())
                    .currentPage(pageable.getPageNumber() + 1)
                    .pageSize(pageable.getPageSize())
                    .totalElements(supplierTrashBins.getTotalElements())
                    .data(supplierTrashBinResponses)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách SupplierTrashBin: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public SupplierTrashBin create(Supplier supplier) {

        SupplierTrashBin supplierTrashBin = new SupplierTrashBin();
        supplierTrashBin.setSupplier(supplier);
        supplierTrashBin.setDeletedDate(LocalDateTime.now());

        return supplierTrashBinRepository.save(supplierTrashBin);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void restore(List<String> trashBinIds) {
        // Kiểm tra và lấy danh sách SupplierTrashBin theo trashBinIds
        List<SupplierTrashBin> supplierTrashBins = trashBinIds.stream()
                .map(trashBinId -> supplierTrashBinRepository
                        .findById(trashBinId)
                        .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_EXISTED)))
                .filter(supplierTrashBin -> {
                    long daysRemaining = calculateDaysRemaining(supplierTrashBin.getDeletedDate());
                    return daysRemaining > 0;
                })
                .collect(Collectors.toList());

        // Kiểm tra xem có bản ghi nào có thể khôi phục không
        if (supplierTrashBins.isEmpty()) {
            throw new AppException(ErrorCode.NO_RESTORABLE);
        }

        // Lấy danh sách Supplier từ SupplierTrashBin
        List<Supplier> suppliers = supplierTrashBins.stream()
                .map(SupplierTrashBin::getSupplier)
                .filter(supplier -> supplier != null) // Đảm bảo Supplier không null
                .collect(Collectors.toList());

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Cập nhật trạng thái isActive của Supplier
        suppliers.forEach(supplier -> {
            supplier.setIsActive(StatusConstant.ACTIVE);
            activityLogService.create(
                    username, "RESTORE", "Tài khoản " + username + " vừa khôi phục nhà cung cấp " + supplier.getName());
        });
        supplierRepository.saveAll(suppliers);

        // Xóa các bản ghi SupplierTrashBin
        supplierTrashBinRepository.deleteAll(supplierTrashBins);
    }

    @Scheduled(fixedRate = 1000 * 60 * 30)
    @Transactional
    public void cleanExpiredTrash() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(60);
        List<SupplierTrashBin> expired = supplierTrashBinRepository.findByDeletedDateBefore(threshold);
        supplierTrashBinRepository.deleteAll(expired);

        String username = "system";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            username = auth.getName();
        }
        final String finalUsername = username;
        expired.forEach(supplierTrashBin -> {
            activityLogService.create(
                    finalUsername,
                    "DELETE",
                    "Tài khoản " + finalUsername + " vừa xóa nhà cung cấp "
                            + supplierTrashBin.getSupplier().getName());
        });
    }
}
