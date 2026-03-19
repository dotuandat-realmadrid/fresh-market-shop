package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.converters.PermissionConverter;
import com.dotuandat.thesis.freshmarket.dtos.request.permission.PermissionRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.permission.PermissionResponse;
import com.dotuandat.thesis.freshmarket.entities.Permission;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.PermissionRepository;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import com.dotuandat.thesis.freshmarket.services.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionServiceImpl implements PermissionService {

    PermissionRepository permissionRepository;
    PermissionConverter permissionConverter;
    ActivityLogService activityLogService;

    @Override
    public List<PermissionResponse> getAll() {
        return permissionRepository.findAll().stream()
                .map(permissionConverter::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public PermissionResponse createOrUpdate(PermissionRequest request) {
        String id = request.getId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        if (id == null && permissionRepository.existsByCode(request.getCode())) {
            activityLogService.create(
                    username, "UPDATE", "Tài khoản " + username + " vừa cập nhật permission " + request.getCode());
            throw new AppException(ErrorCode.PERMISSION_EXISTED);
        } else if (id != null && !permissionRepository.existsById(id)) {
            activityLogService.create(
                    username, "CREATE", "Tài khoản " + username + " vừa thêm permission " + request.getCode());
            throw new AppException(ErrorCode.PERMISSION_NOT_EXISTED);
        }

        Permission permission = permissionConverter.toEntity(request);
        permissionRepository.save(permission);

        return permissionConverter.toResponse(permission);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(List<String> codes) {
        if (permissionRepository.existsByCodeInAndRolesIsNotEmpty(codes)) {
            throw new AppException(ErrorCode.INVALID_DELETE_PERMISSION);
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        codes.forEach(code -> {
            if (!permissionRepository.existsByCode(code)) {
                throw new AppException(ErrorCode.PERMISSION_NOT_EXISTED);
            }
            activityLogService.create(username, "DELETE", "Tài khoản " + username + " vừa xóa permission " + code);
        });

        permissionRepository.deleteByCodeIn(codes);
    }
}
