package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.permission.PermissionRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.permission.PermissionResponse;

import java.util.List;

public interface PermissionService {
    List<PermissionResponse> getAll();

    PermissionResponse createOrUpdate(PermissionRequest request);

    void delete(List<String> codes);
}
