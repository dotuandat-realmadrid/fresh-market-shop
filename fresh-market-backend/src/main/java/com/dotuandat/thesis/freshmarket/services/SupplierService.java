package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.supplier.SupplierCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.supplier.SupplierUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.supplier.SupplierResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SupplierService {
    List<SupplierResponse> getAll();

    SupplierResponse create(SupplierCreateRequest request);

    SupplierResponse update(String code, SupplierUpdateRequest request);

    void delete(String code);

    List<String> findAllSupplierCodes();

    PageResponse<SupplierResponse> search(Pageable pageable);

    SupplierResponse findByCode(String code);
}
