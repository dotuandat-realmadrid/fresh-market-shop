package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.converters.UserConverter;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.trash.UserTrashBinResponse;
import com.dotuandat.thesis.freshmarket.entities.User;
import com.dotuandat.thesis.freshmarket.entities.UserTrashBin;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.UserRepository;
import com.dotuandat.thesis.freshmarket.repositories.UserTrashBinRepository;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import com.dotuandat.thesis.freshmarket.services.UserTrashBinService;
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
public class UserTrashBinServiceImpl implements UserTrashBinService {

    UserTrashBinRepository userTrashBinRepository;
    UserRepository userRepository;
    UserConverter userConverter;
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
    public PageResponse<UserTrashBinResponse> search(Pageable pageable) {
        try {
            // Lấy dữ liệu từ database với phân trang
            Page<UserTrashBin> userTrashBins = userTrashBinRepository.findAll(pageable);

            // Chuyển đổi từ List<UserTrashBin> sang List<UserTrashBinResponse>
            List<UserTrashBinResponse> userTrashBinResponses = userTrashBins.stream()
                    .map(userTrashBin -> {
                        // Map cơ bản bằng ModelMapper
                        UserTrashBinResponse response = modelMapper.map(userTrashBin, UserTrashBinResponse.class);

                        // Convert User entity sang UserResponse DTO thủ công
                        if (userTrashBin.getUser() != null) {
                            response.setUser(userConverter.toResponse(userTrashBin.getUser()));
                        }

                        // Tính thời gian còn lại để khôi phục
                        response.setRemainingTime(calculateRemainingTime(userTrashBin.getDeletedDate()));

                        return response;
                    })
                    .collect(Collectors.toList());

            // Tạo và trả về PageResponse
            return PageResponse.<UserTrashBinResponse>builder()
                    .totalPage(userTrashBins.getTotalPages())
                    .currentPage(pageable.getPageNumber() + 1)
                    .pageSize(pageable.getPageSize())
                    .totalElements(userTrashBins.getTotalElements())
                    .data(userTrashBinResponses)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách UserTrashBin: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserTrashBin> create(List<User> users) {
        List<UserTrashBin> userTrashBins = users.stream()
                .map(user -> {
                    UserTrashBin userTrashBin = new UserTrashBin();
                    userTrashBin.setUser(user);
                    userTrashBin.setDeletedDate(LocalDateTime.now());
                    return userTrashBin;
                })
                .collect(Collectors.toList());

        return userTrashBinRepository.saveAll(userTrashBins);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void restore(List<String> userIds) {
        List<UserTrashBin> userTrashBins = userIds.stream()
                .map(userId -> userTrashBinRepository
                        .findByUserId(userId)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)))
                .filter(userTrashBin -> calculateDaysRemaining(userTrashBin.getDeletedDate()) > 0)
                .collect(Collectors.toList());

        if (userTrashBins.isEmpty()) {
            throw new AppException(ErrorCode.NO_RESTORABLE);
        }

        List<User> users = userTrashBins.stream().map(UserTrashBin::getUser).collect(Collectors.toList());

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        users.forEach(user -> {
            user.setIsActive(StatusConstant.ACTIVE);
            activityLogService.create(
                    username, "RESTORE", "Tài khoản " + username + " vừa khôi phục tài khoản " + user.getFullName());
        });
        userRepository.saveAll(users);

        userTrashBinRepository.deleteAll(userTrashBins);
    }

    @Scheduled(fixedRate = 1000 * 60 * 30)
    @Transactional
    public void cleanExpiredTrash() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(60);
        List<UserTrashBin> expired = userTrashBinRepository.findByDeletedDateBefore(threshold);
        userTrashBinRepository.deleteAll(expired);

        String username = "system";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            username = auth.getName();
        }
        final String finalUsername = username;
        expired.forEach(userTrashBin -> activityLogService.create(
                finalUsername,
                "DELETE",
                "Tài khoản " + finalUsername + " vừa xóa tài khoản "
                        + (userTrashBin.getUser() != null
                                ? userTrashBin.getUser().getFullName()
                                : "Unknown")));
    }
}
