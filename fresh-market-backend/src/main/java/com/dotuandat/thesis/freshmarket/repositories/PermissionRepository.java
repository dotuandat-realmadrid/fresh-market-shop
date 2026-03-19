package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.entities.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PermissionRepository extends JpaRepository<Permission, String> {
    boolean existsByCode(String code);

    Permission findByCode(String code);

    void deleteByCodeIn(List<String> code);

    boolean existsByCodeInAndRolesIsNotEmpty(List<String> codes);
}
