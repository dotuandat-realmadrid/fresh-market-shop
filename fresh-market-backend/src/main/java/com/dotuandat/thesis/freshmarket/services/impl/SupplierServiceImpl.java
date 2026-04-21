package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.converters.SupplierConverter;
import com.dotuandat.thesis.freshmarket.dtos.request.supplier.SupplierCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.supplier.SupplierUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.supplier.SupplierResponse;
import com.dotuandat.thesis.freshmarket.entities.Supplier;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.SupplierRepository;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import com.dotuandat.thesis.freshmarket.services.SupplierService;
import com.dotuandat.thesis.freshmarket.services.SupplierTrashBinService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SupplierServiceImpl implements SupplierService {
    SupplierRepository supplierRepository;
    SupplierConverter supplierConverter;
    SupplierTrashBinService supplierTrashBinService;
    ActivityLogService activityLogService;

    @Override
    @Cacheable(value = "suppliers_all")
    public List<SupplierResponse> getAll() {
        Sort sort = Sort.by(Sort.Direction.ASC, "code");

        return supplierRepository.findAllByIsActive(StatusConstant.ACTIVE, sort).stream()
                .map(supplierConverter::toResponse)
                .toList();
    }

    @Override
    @Cacheable(value = "suppliers_search")
    public PageResponse<SupplierResponse> search(Pageable pageable) {
        try {

            // Lấy dữ liệu từ database với phân trang
            Page<Supplier> suppliers = supplierRepository.findAllByIsActive(StatusConstant.ACTIVE, pageable);

            // Chuyển đổi từ Supplier entity sang SupplierResponse DTO
            List<SupplierResponse> supplierResponses =
                    suppliers.stream().map(supplierConverter::toResponse).collect(Collectors.toList());

            // Tạo và trả về PageResponse
            return PageResponse.<SupplierResponse>builder()
                    .totalPage(suppliers.getTotalPages())
                    .currentPage(pageable.getPageNumber() + 1)
                    .pageSize(pageable.getPageSize())
                    .totalElements(suppliers.getTotalElements())
                    .data(supplierResponses)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tìm kiếm category: ", e);
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CUD_CATEGORY_SUPPLIER')")
    @CacheEvict(value = {"suppliers_all", "suppliers_search", "suppliers_codes", "supplier_detail"}, allEntries = true)
    public SupplierResponse create(SupplierCreateRequest request) {
        if (supplierRepository.existsByCode(request.getCode())) throw new AppException(ErrorCode.SUPPLIER_EXISTED);

        Supplier supplier = supplierConverter.toEntity(request);
        supplierRepository.save(supplier);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(
                username, "CREATE", "Tài khoản " + username + " vừa thêm nhà cung cấp " + supplier.getName());

        return supplierConverter.toResponse(supplier);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CUD_CATEGORY_SUPPLIER')")
    @CacheEvict(value = {"suppliers_all", "suppliers_search", "suppliers_codes", "supplier_detail"}, allEntries = true)
    public SupplierResponse update(String code, SupplierUpdateRequest request) {
        Supplier supplier =
                supplierRepository.findByCode(code).orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_EXISTED));

        supplier.setName(request.getName());
        supplierRepository.save(supplier);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(
                username, "UPDATE", "Tài khoản " + username + " vừa cập nhật nhà cung cấp " + supplier.getName());

        return supplierConverter.toResponse(supplier);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CUD_CATEGORY_SUPPLIER')")
    @CacheEvict(value = {"suppliers_all", "suppliers_search", "suppliers_codes", "supplier_detail"}, allEntries = true)
    public void delete(String code) {
        Supplier supplier =
                supplierRepository.findByCode(code).orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_EXISTED));

        supplier.setIsActive(StatusConstant.INACTIVE);
        supplierRepository.save(supplier);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(
                username, "DELETE", "Tài khoản " + username + " vừa xóa nhà cung cấp " + supplier.getName());

        supplierTrashBinService.create(supplier);
    }

    @Override
    @PreAuthorize("hasAuthority('CUD_CATEGORY_SUPPLIER')")
    @Transactional(readOnly = true)
    @Cacheable(value = "suppliers_codes")
    public List<String> findAllSupplierCodes() {
        return supplierRepository.findAllSupplierCodes();
    }

    @Override
    @PreAuthorize("hasAuthority('CUD_CATEGORY_SUPPLIER')")
    @Transactional(readOnly = true)
    @Cacheable(value = "supplier_detail", key = "#code")
    public SupplierResponse findByCode(String code) {
        Supplier supplier = supplierRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_EXISTED));
        return supplierConverter.toResponse(supplier);
    }
}
