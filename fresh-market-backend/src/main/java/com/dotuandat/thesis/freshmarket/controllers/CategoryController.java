package com.dotuandat.thesis.freshmarket.controllers;

import com.dotuandat.thesis.freshmarket.dtos.request.category.CategoryCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.category.CategoryUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.category.CategoryResponse;
import com.dotuandat.thesis.freshmarket.services.CategoryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {
    CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAll() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .result(categoryService.getAll())
                .build();
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<CategoryResponse>> search(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdDate").and(Sort.by(Sort.Direction.ASC, "id"));
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        return ApiResponse.<PageResponse<CategoryResponse>>builder()
                .result(categoryService.search(pageable))
                .build();
    }

    @PostMapping
    public ApiResponse<CategoryResponse> create(@RequestBody @Valid CategoryCreateRequest request) {
        return ApiResponse.<CategoryResponse>builder()
                .result(categoryService.create(request))
                .build();
    }

    @PutMapping("/{code}")
    public ApiResponse<CategoryResponse> update(
            @PathVariable String code, @RequestBody @Valid CategoryUpdateRequest request) {
        return ApiResponse.<CategoryResponse>builder()
                .result(categoryService.update(code, request))
                .build();
    }

    @DeleteMapping("/{code}")
    public ApiResponse<Void> delete(@PathVariable String code) {
        categoryService.delete(code);
        return ApiResponse.<Void>builder().message("Delete successfully").build();
    }

    @GetMapping("/codes")
    public ApiResponse<List<String>> getAllCategoryCodes() {
        return ApiResponse.<List<String>>builder()
                .result(categoryService.findAllByCategoryCodes())
                .build();
    }

    @GetMapping("/{code}")
    public ApiResponse<CategoryResponse> getByCode(@PathVariable String code) {
        return ApiResponse.<CategoryResponse>builder()
                .result(categoryService.findByCode(code))
                .build();
    }

    @PostMapping("/{code}/image")
    public ApiResponse<Void> uploadCategoryImage(
            @PathVariable String code, @RequestParam("file") MultipartFile file) {
        try {
            categoryService.saveCategoryImage(code, file);
            return ApiResponse.<Void>builder().build();
        } catch (Exception e) {
            return ApiResponse.<Void>builder().message(e.getMessage()).build();
        }
    }

    @PutMapping("/{code}/image")
    public ApiResponse<Void> updateCategoryImage(
            @PathVariable String code,
            @RequestParam(required = false) MultipartFile newImage,
            @RequestParam(required = false) String keepImage) {
        try {
            categoryService.updateCategoryImage(code, keepImage, newImage);
            return ApiResponse.<Void>builder().build();
        } catch (Exception e) {
            return ApiResponse.<Void>builder().message(e.getMessage()).build();
        }
    }

    @GetMapping("/tree")
    public ApiResponse<List<CategoryResponse>> getCategoryTree() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .result(categoryService.getCategoryTree())
                .build();
    }

    @GetMapping("/tree/paged")
    public ApiResponse<PageResponse<CategoryResponse>> getCategoryTreePaged(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer level) {
        Pageable pageable = PageRequest.of(page - 1, size);
        return ApiResponse.<PageResponse<CategoryResponse>>builder()
                .result(categoryService.getCategoryTreePaged(pageable, code, name, level))
                .build();
    }
}
