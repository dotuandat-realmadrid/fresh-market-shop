package com.dotuandat.thesis.freshmarket.converters;

import com.dotuandat.thesis.freshmarket.dtos.request.role.RoleRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.role.RoleResponse;
import com.dotuandat.thesis.freshmarket.entities.Permission;
import com.dotuandat.thesis.freshmarket.entities.Role;
import com.dotuandat.thesis.freshmarket.repositories.PermissionRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class RoleConverter {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PermissionRepository permissionRepository;

    public RoleResponse toResponse(Role role) {
        return modelMapper.map(role, RoleResponse.class);
    }

    public Role toEntity(RoleRequest request) {
        Role role = modelMapper.map(request, Role.class);

        List<Permission> permissions = request.getPermissions().stream()
                .map(permissionRepository::findByCode)
                .collect(Collectors.toList());

        role.setPermissions(permissions);
        return role;
    }
}
