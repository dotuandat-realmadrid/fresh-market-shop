package com.dotuandat.thesis.freshmarket.controllers;

import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductSearchRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
import com.dotuandat.thesis.freshmarket.services.FileService;
import com.dotuandat.thesis.freshmarket.services.ProductImportService;
import com.dotuandat.thesis.freshmarket.services.ProductService;
import com.dotuandat.thesis.freshmarket.utils.ExportExcelProdHelper;
import com.dotuandat.thesis.freshmarket.utils.ExportPdfProdHelper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductController {
    ProductService productService;
    ProductImportService productImportService;
    FileService fileService;

    @GetMapping
    public ApiResponse<PageResponse<ProductResponse>> search(
            ProductSearchRequest request,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "point") String sortBy,
            @RequestParam(value = "direction", defaultValue = "DESC") String direction) {
        Sort.Direction sortDirection = Sort.Direction.fromString(direction);

        Sort sort = Sort.by(sortDirection, sortBy)
                .and(Sort.by(Sort.Direction.DESC, "createdDate"))
                .and(Sort.by(Sort.Direction.DESC, "inventoryQuantity"))
                .and(Sort.by(Sort.Direction.ASC, "id"));

        Pageable pageable = PageRequest.of(page - 1, size, sort);

        return ApiResponse.<PageResponse<ProductResponse>>builder()
                .result(productService.search(request, pageable))
                .build();
    }

    @GetMapping("/{code}")
    public ApiResponse<ProductResponse> getByCode(@PathVariable String code) {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.getByCode(code))
                .build();
    }

    @PostMapping
    public ApiResponse<ProductResponse> create(@RequestBody @Valid ProductCreateRequest request) {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> update(
            @PathVariable String id, @RequestBody @Valid ProductUpdateRequest request) {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.update(id, request))
                .build();
    }

    @DeleteMapping("/{ids}")
    public ApiResponse<Void> delete(@PathVariable List<String> ids) {
        productService.delete(ids);

        return ApiResponse.<Void>builder().message("Deleted successfully").build();
    }

    @PostMapping("/{id}/images")
    public ApiResponse<Void> uploadProductImages(
            @PathVariable String id, @RequestParam("files") MultipartFile[] files) {
        try {
            List<String> fileNames = fileService.uploadFiles(files);
            productService.saveProductImages(id, fileNames);

            return ApiResponse.<Void>builder().build();
        } catch (Exception e) {
            return ApiResponse.<Void>builder().message(e.getMessage()).build();
        }
    }

    @PutMapping("/{id}/images")
    public ApiResponse<Void> updateProductImages(
            @PathVariable String id,
            @RequestParam(required = false) List<String> keepImages,
            @RequestParam(required = false) MultipartFile[] newImages) {
        try {
            List<String> fileNames = fileService.uploadFiles(newImages);
            productService.updateProductImages(id, keepImages, fileNames);

            return ApiResponse.<Void>builder().build();
        } catch (Exception e) {
            return ApiResponse.<Void>builder().message(e.getMessage()).build();
        }
    }

    @PostMapping("/import-excel")
    public ApiResponse<Void> importCreateProducts(@RequestParam MultipartFile file) {
        productImportService.importCreateFromExcel(file);
        return ApiResponse.<Void>builder().build();
    }

    @PutMapping("/import-excel")
    public ApiResponse<Void> importUpdateProducts(@RequestParam MultipartFile file) {
        productImportService.importUpdateFromExcel(file);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/import-qr")
    public ApiResponse<Void> importCreateFromQR(
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String qrContent,
            @RequestParam(defaultValue = "file") String source) {
        productImportService.importCreateFromQR(file, qrContent, source);
        return ApiResponse.<Void>builder().build();
    }

    @PutMapping("/import-qr")
    public ApiResponse<Void> importUpdateFromQR(
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String qrContent,
            @RequestParam(defaultValue = "file") String source) {
        productImportService.importUpdateFromQR(file, qrContent, source);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/import-ai")
    public ApiResponse<Void> importCreateByAI(@RequestParam int quantity) {
        productImportService.importCreateByAI(quantity);
        return ApiResponse.<Void>builder()
                .message("Generated and created products successfully")
                .build();
    }

    @PostMapping("/import-pdf")
    public ApiResponse<Void> importCreateFromPdf(@RequestParam MultipartFile file) {
        productImportService.importCreateFromPdf(file);
        return ApiResponse.<Void>builder().build();
    }

    @PutMapping("/import-pdf")
    public ApiResponse<Void> importUpdateFromPdf(@RequestParam MultipartFile file) {
        productImportService.importUpdateFromPdf(file);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/export-excel")
    public ApiResponse<Void> exportToExcel(HttpServletResponse response) throws IOException {
        List<ProductResponse> productList = productService.getAllProducts();
        ExportExcelProdHelper exporter = new ExportExcelProdHelper(productList);
        exporter.export(response);
        return ApiResponse.<Void>builder()
                .message("Exported products to Excel successfully")
                .build();
    }

    @GetMapping("/export-pdf")
    public ApiResponse<Void> exportToPDF(HttpServletResponse response) throws IOException {
        List<ProductResponse> productList = productService.getAllProducts();
        ExportPdfProdHelper.export(response, productList);
        return ApiResponse.<Void>builder().build();
    }
}
