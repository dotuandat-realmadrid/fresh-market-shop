package com.dotuandat.thesis.freshmarket.converters;

import com.dotuandat.thesis.freshmarket.dtos.request.permission.PermissionRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.permission.PermissionResponse;
import com.dotuandat.thesis.freshmarket.entities.Permission;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PermissionConverter {
    @Autowired
    private ModelMapper modelMapper;

    public PermissionResponse toResponse(Permission permission) {
        return modelMapper.map(permission, PermissionResponse.class);
    }

    public Permission toEntity(PermissionRequest permissionRequest) {
        return modelMapper.map(permissionRequest, Permission.class);
    }
}
