package com.dotuandat.thesis.freshmarket.converters;

import com.dotuandat.thesis.freshmarket.dtos.request.category.CategoryCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.category.CategoryUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.category.CategoryResponse;
import com.dotuandat.thesis.freshmarket.entities.Category;
import com.dotuandat.thesis.freshmarket.entities.Supplier;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.CategoryRepository;
import com.dotuandat.thesis.freshmarket.repositories.SupplierRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CategoryConverter {
    @Autowired
    ModelMapper modelMapper;

    @Autowired
    SupplierRepository supplierRepository;

    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    SupplierConverter supplierConverter;

    public CategoryResponse toResponse(Category category) {
        CategoryResponse response = modelMapper.map(category, CategoryResponse.class);

        List<String> parents = categoryRepository.findParentCodesByChildCode(category.getCode());
        response.setParents(parents);

        if (category.getChildren() != null) {
            response.setChildren(
                    category.getChildren().stream()
                            .map(this::toResponse)
                            .toList()
            );
        }

        Sort sort = Sort.by(Sort.Direction.ASC, "code");
        List<Supplier> suppliers = supplierRepository.findAllByCategories_Code(category.getCode(), sort);
        response.setSuppliers(suppliers.stream().map(supplierConverter::toResponse).toList());

        return response;
    }

    public Category toEntity(CategoryCreateRequest request) {
        Category category = modelMapper.map(request, Category.class);
        category.setParents(resolveParents(request.getParentCodes()));
        category.setSuppliers(getSuppliers(request.getSupplierCodes()));
        return category;
    }

    public Category toEntity(Category existedCategory, CategoryUpdateRequest request) {
        modelMapper.map(request, existedCategory);
        existedCategory.setParents(resolveParents(request.getParentCodes()));
        existedCategory.setSuppliers(getSuppliers(request.getSupplierCodes()));
        return existedCategory;
    }

    private List<Category> resolveParents(List<String> parentCodes) {
        if (parentCodes == null || parentCodes.isEmpty()) return new ArrayList<>();
        return parentCodes.stream()
                .map(code -> categoryRepository.findByCode(code)
                        .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_EXISTED)))
                .collect(Collectors.toList());
    }

    private List<Supplier> getSuppliers(List<String> supplierCodes) {
        if (supplierCodes == null || supplierCodes.isEmpty()) return new ArrayList<>();
        return supplierCodes.stream()
                .map(code -> supplierRepository.findByCode(code)
                        .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_EXISTED)))
                .collect(Collectors.toList());
    }

    public CategoryResponse mapToTree(Category category) {
        CategoryResponse response = modelMapper.map(category, CategoryResponse.class);

        // Set parentCodes
        List<String> parents = categoryRepository.findParentCodesByChildCode(category.getCode());
        response.setParents(parents);

        // Override children — gọi đệ quy qua mapToTree thay vì để ModelMapper tự map
        if (category.getChildren() != null) {
            response.setChildren(
                    category.getChildren().stream()
                            .map(this::mapToTree)  // đệ quy -> mỗi child cũng được set parentCodes
                            .toList()
            );
        }

        Sort sort = Sort.by(Sort.Direction.ASC, "createdDate");
        List<Supplier> suppliers = supplierRepository.findAllByCategories_Code(category.getCode(), sort);
        response.setSuppliers(suppliers.stream().map(supplierConverter::toResponse).toList());

        return response;
    }
}
