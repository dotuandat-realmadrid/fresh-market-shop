package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.category.CategoryCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.category.CategoryUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.category.CategoryResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAll();

    CategoryResponse create(CategoryCreateRequest request);

    CategoryResponse update(String code, CategoryUpdateRequest request);

    void delete(String code);

    List<String> findAllByCategoryCodes();

    PageResponse<CategoryResponse> search(Pageable pageable);

    CategoryResponse findByCode(String code);

    void saveCategoryImage(String code, MultipartFile file);

    void updateCategoryImage(String code, String keepImage, MultipartFile newImage);

    List<CategoryResponse> getCategoryTree();

    PageResponse<CategoryResponse> getCategoryTreePaged(Pageable pageable, String code, String name, Integer level);
}
