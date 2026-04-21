package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.converters.UserConverter;
import com.dotuandat.thesis.freshmarket.dtos.request.user.GuestCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.user.UserCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.user.UserSearchRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.user.UserUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.user.UserResponse;
import com.dotuandat.thesis.freshmarket.entities.User;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.RoleRepository;
import com.dotuandat.thesis.freshmarket.repositories.UserRepository;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import com.dotuandat.thesis.freshmarket.services.UserService;
import com.dotuandat.thesis.freshmarket.services.UserTrashBinService;
import com.dotuandat.thesis.freshmarket.specifications.UserSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {

    UserRepository userRepository;
    UserConverter userConverter;
    RoleRepository roleRepository;
    UserTrashBinService userTrashBinService;
    ActivityLogService activityLogService;

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('RU_USER')")
    public PageResponse<UserResponse> search(UserSearchRequest request, Pageable pageable) {
        Specification<User> spec = Specification.where(UserSpecification.withId(request.getId()))
                .and(UserSpecification.withUsername(request.getUsername()))
                .and(UserSpecification.withFullName(request.getFullName()))
                .and(UserSpecification.withPhone(request.getPhone()))
                .and(UserSpecification.withIsGuest(request.getIsGuest()))
                .and(UserSpecification.withRole(request.getRole()));

        Page<User> users = userRepository.findAll(spec, pageable);

        return PageResponse.<UserResponse>builder()
                .totalPage(users.getTotalPages())
                .pageSize(pageable.getPageSize())
                .currentPage(pageable.getPageNumber() + 1)
                .totalElements(users.getTotalElements())
                .data(users.stream().map(userConverter::toResponse).toList())
                .build();
    }

    @Override
    @Transactional
    public UserResponse create(UserCreateRequest request) {
        String username = request.getUsername();

        User user = userRepository.findByUsername(username).orElse(null);

        // Chưa tồn tại user, tạo mới
        if (user == null) {
            return createNewUser(request);
        }

        // Tồn tại user và ko là guest -> throw ex
        if (user.getIsGuest() == StatusConstant.USER) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        // Là guest, -> user
        return upgradeGuestToUser(user, request);
    }

    private UserResponse createNewUser(UserCreateRequest request) {
        User user = userConverter.toEntity(null, request);
        userRepository.save(user);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(
                username, "CREATE", "Tài khoản " + username + " vừa thêm tài khoản " + user.getFullName());

        return userConverter.toResponse(user);
    }

    private UserResponse upgradeGuestToUser(User existedUser, UserCreateRequest request) {
        User user = userConverter.toEntity(existedUser, request);
        userRepository.save(user);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(
                username, "CREATE", "Tài khoản " + username + " vừa thêm tài khoản " + user.getFullName());

        return userConverter.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createGuest(GuestCreateRequest request) {
        User user = userConverter.toEntity(request);
        userRepository.save(user);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(
                username, "CREATE", "Tài khoản " + username + " vừa thêm tài khoản " + user.getFullName());

        return userConverter.toResponse(user);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('RU_USER') or authentication.name == #request.username")
    public UserResponse update(String id, UserUpdateRequest request) {
        User currentUser = userRepository
                .findByIdAndIsActive(id, StatusConstant.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        User updatedUser = userConverter.toEntity(currentUser, request);

        userRepository.save(updatedUser);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(
                username, "UPDATE", "Tài khoản " + username + " vừa cập nhật tài khoản " + updatedUser.getFullName());

        return userConverter.toResponse(updatedUser);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(List<String> ids) {
        List<User> users = ids.stream()
                .map(id -> userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)))
                .collect(Collectors.toList());

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        users.stream()
                .filter(user -> !user.getRoles().contains(roleRepository.findByCode("ADMIN"))) // ko xóa ADMIN
                .forEach(user -> {
                    user.setIsActive(StatusConstant.INACTIVE);
                    activityLogService.create(
                            username, "DELETE", "Tài khoản " + username + " vừa xóa tài khoản " + user.getFullName());
                });
        userRepository.saveAll(users);

        userTrashBinService.create(users);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMyInfo() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository
                .findByUsernameAndIsActive(username, StatusConstant.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userConverter.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('RU_USER')")
    public UserResponse getById(String id) {
        return userConverter.toResponse(
                userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }
}
