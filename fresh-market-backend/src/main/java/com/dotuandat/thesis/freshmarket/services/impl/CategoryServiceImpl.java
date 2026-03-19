package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.converters.CategoryConverter;
import com.dotuandat.thesis.freshmarket.dtos.request.category.CategoryCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.category.CategoryUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.category.CategoryResponse;
import com.dotuandat.thesis.freshmarket.entities.Category;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.CategoryRepository;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import com.dotuandat.thesis.freshmarket.services.CategoryService;
import com.dotuandat.thesis.freshmarket.services.CategoryTrashBinService;
import com.dotuandat.thesis.freshmarket.services.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryServiceImpl implements CategoryService {
    CategoryRepository categoryRepository;
    CategoryConverter categoryConverter;
    CategoryTrashBinService categoryTrashBinService;
    ActivityLogService activityLogService;
    FileService fileService;

    @Override
    @Transactional
    public List<CategoryResponse> getAll() {
        Sort sort = Sort.by(Sort.Direction.ASC, "code");
        return categoryRepository.findAllByIsActive(StatusConstant.ACTIVE, sort).stream()
                .map(categoryConverter::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public PageResponse<CategoryResponse> search(Pageable pageable) {
        try {
            Page<Category> categories = categoryRepository.findAllByIsActive(StatusConstant.ACTIVE, pageable);
            List<CategoryResponse> categoryResponses = categories.stream()
                    .map(categoryConverter::toResponse)
                    .collect(Collectors.toList());
            return PageResponse.<CategoryResponse>builder()
                    .totalPage(categories.getTotalPages())
                    .currentPage(pageable.getPageNumber() + 1)
                    .pageSize(pageable.getPageSize())
                    .totalElements(categories.getTotalElements())
                    .data(categoryResponses)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tìm kiếm category: ", e);
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CUD_CATEGORY_SUPPLIER')")
    public CategoryResponse create(CategoryCreateRequest request) {
        if (categoryRepository.existsByCode(request.getCode()))
            throw new AppException(ErrorCode.CATEGORY_EXISTED);

        Category category = categoryConverter.toEntity(request);
        categoryRepository.save(category);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(username, "CREATE",
                "Tài khoản " + username + " vừa thêm danh mục " + category.getName());

        return categoryConverter.toResponse(category);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CUD_CATEGORY_SUPPLIER')")
    public CategoryResponse update(String code, CategoryUpdateRequest request) {
        Category existedCategory = categoryRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_EXISTED));

        Category updatedCategory = categoryConverter.toEntity(existedCategory, request);
        categoryRepository.save(updatedCategory);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(username, "UPDATE",
                "Tài khoản " + username + " vừa cập nhật danh mục " + updatedCategory.getName());

        return categoryConverter.toResponse(updatedCategory);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CUD_CATEGORY_SUPPLIER')")
    public void delete(String code) {
        Category category = categoryRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_EXISTED));

        category.setIsActive(StatusConstant.INACTIVE);
        categoryRepository.save(category);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(username, "DELETE",
                "Tài khoản " + username + " vừa xóa danh mục " + category.getName());

        categoryTrashBinService.create(category);
    }

    @Override
    @PreAuthorize("hasAuthority('CUD_CATEGORY_SUPPLIER')")
    public List<String> findAllByCategoryCodes() {
        return categoryRepository.findAllCategoryCodes();
    }

    @Override
    @PreAuthorize("hasAuthority('CUD_CATEGORY_SUPPLIER')")
    public CategoryResponse findByCode(String code) {
        Category category = categoryRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_EXISTED));
        return categoryConverter.toResponse(category);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CUD_CATEGORY_SUPPLIER')")
    public void saveCategoryImage(String code, MultipartFile file) {
        Category category = categoryRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_EXISTED));
        try {
            List<String> fileNames = fileService.uploadFiles(new MultipartFile[]{file});
            category.setImagePath(fileNames.get(0));
            categoryRepository.save(category);
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi upload ảnh: ", e);
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(username, "UPDATE",
                "Tài khoản " + username + " vừa thêm ảnh danh mục " + category.getName());
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CUD_CATEGORY_SUPPLIER')")
    public void updateCategoryImage(String code, String keepImage, MultipartFile newImage) {
        Category category = categoryRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_EXISTED));
        try {
            if (keepImage != null && !keepImage.isBlank()) {
                // Giữ nguyên ảnh cũ
            } else if (newImage != null && !newImage.isEmpty()) {
                List<String> fileNames = fileService.uploadFiles(new MultipartFile[]{newImage});
                category.setImagePath(fileNames.get(0));
            } else {
                category.setImagePath(null);
            }
            categoryRepository.save(category);
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi upload ảnh: ", e);
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(username, "UPDATE",
                "Tài khoản " + username + " vừa cập nhật ảnh danh mục " + category.getName());
    }

    @Override
    @Transactional
    public List<CategoryResponse> getCategoryTree() {
        List<Category> roots = categoryRepository
                .findByLevelAndIsActiveOrderByCreatedDateAsc(1, StatusConstant.ACTIVE);
        return roots.stream()
                .map(categoryConverter::mapToTree)
                .toList();
    }

    @Override
    @Transactional
    public PageResponse<CategoryResponse> getCategoryTreePaged(Pageable pageable, String code, String name, Integer level) {
        Page<Category> rootPage = categoryRepository.findRootsWithFilter(
                StatusConstant.ACTIVE, level,
                (code != null && !code.isBlank()) ? code : null,
                (name != null && !name.isBlank()) ? name : null,
                pageable);

        List<CategoryResponse> trees = rootPage.getContent().stream()
                .map(categoryConverter::mapToTree)
                .toList();

        return PageResponse.<CategoryResponse>builder()
                .totalPage(rootPage.getTotalPages())
                .currentPage(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .totalElements(rootPage.getTotalElements())
                .data(trees)
                .build();
    }
}
