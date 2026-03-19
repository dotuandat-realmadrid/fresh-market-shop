package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.role.RoleRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.role.RoleResponse;

import java.util.List;

public interface RoleService {
    List<RoleResponse> getAll();

    RoleResponse createOrUpdate(RoleRequest request);

    void delete(List<String> codes);
}
