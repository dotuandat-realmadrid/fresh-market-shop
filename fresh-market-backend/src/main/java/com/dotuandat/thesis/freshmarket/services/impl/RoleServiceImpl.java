package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.converters.RoleConverter;
import com.dotuandat.thesis.freshmarket.dtos.request.role.RoleRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.role.RoleResponse;
import com.dotuandat.thesis.freshmarket.entities.Role;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.RoleRepository;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import com.dotuandat.thesis.freshmarket.services.RoleService;
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
public class RoleServiceImpl implements RoleService {
    RoleConverter roleConverter;
    RoleRepository roleRepository;
    ActivityLogService activityLogService;

    @Override
    public List<RoleResponse> getAll() {
        return roleRepository.findAll().stream().map(roleConverter::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public RoleResponse createOrUpdate(RoleRequest request) {
        String id = request.getId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        if (id == null && roleRepository.existsByCode(request.getCode())) {
            activityLogService.create(
                    username, "UPDATE", "Tài khoản " + username + " vừa cập nhật role " + request.getCode());
            throw new AppException(ErrorCode.ROLE_EXISTED);
        } else if (id != null && !roleRepository.existsById(id)) {
            activityLogService.create(
                    username, "CREATE", "Tài khoản " + username + " vừa thêm role " + request.getCode());
            throw new AppException(ErrorCode.ROLE_NOT_EXISTED);
        }

        Role role = roleConverter.toEntity(request);
        roleRepository.save(role);

        return roleConverter.toResponse(role);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(List<String> codes) {
        if (roleRepository.existsByCodeInAndUsersIsNotEmpty(codes)) {
            throw new AppException(ErrorCode.INVALID_DELETE_ROLE);
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        codes.forEach(code -> {
            if (!roleRepository.existsByCode(code)) {
                throw new AppException(ErrorCode.ROLE_NOT_EXISTED);
            }
            activityLogService.create(username, "DELETE", "Tài khoản " + username + " vừa xóa role " + code);
        });

        roleRepository.deleteByCodeIn(codes);
    }
}
