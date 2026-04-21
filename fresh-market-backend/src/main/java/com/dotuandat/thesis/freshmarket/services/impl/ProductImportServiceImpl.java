package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
import com.dotuandat.thesis.freshmarket.entities.Product;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.CategoryRepository;
import com.dotuandat.thesis.freshmarket.repositories.ProductRepository;
import com.dotuandat.thesis.freshmarket.repositories.SupplierRepository;
import com.dotuandat.thesis.freshmarket.services.ProductImportService;
import com.dotuandat.thesis.freshmarket.services.ProductService;
import com.dotuandat.thesis.freshmarket.utils.AIProdHelper;
import com.dotuandat.thesis.freshmarket.utils.ExcelProdHelper;
import com.dotuandat.thesis.freshmarket.utils.PdfProdHelper;
import com.dotuandat.thesis.freshmarket.utils.QRProdHelper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.util.Pair;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductImportServiceImpl implements ProductImportService {

    ProductService productService;
    ProductRepository productRepository;
    CategoryRepository categoryRepository;
    SupplierRepository supplierRepository;
    QRProdHelper qrProdHelper;
    AIProdHelper aiProdHelper;
    ExcelProdHelper excelProdHelper;
    PdfProdHelper pdfProdHelper;

    // ==================== EXCEL ====================

    @Override
    @Async
    public void importCreateFromExcel(MultipartFile file) {
        List<Pair<ProductCreateRequest, List<String>>> requests = excelProdHelper.parseCreateExcel(file);
        for (Pair<ProductCreateRequest, List<String>> pair : requests) {
            ProductCreateRequest request = pair.getFirst();
            List<String> imagePaths = pair.getSecond();
            try {
                ProductResponse created = productService.create(request);
                Product product = productRepository.findById(created.getId())
                        .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_EXISTED));
                if (product.getImages() == null) {
                    product.setImages(new ArrayList<>());
                    productRepository.save(product);
                }
                if (!imagePaths.isEmpty()) {
                    productService.saveProductImages(created.getId(), imagePaths);
                }
                log.info("Thêm sản phẩm {} thành công!", request.getCode());
            } catch (AppException e) {
                log.error("Lỗi khi thêm sản phẩm {}: {}", request.getCode(), e.getErrorCode().getMessage());
            }
        }
    }

    @Override
    @Async
    public void importUpdateFromExcel(MultipartFile file) {
        List<Pair<String, ProductUpdateRequest>> requests = excelProdHelper.parseUpdateExcel(file);
        for (Pair<String, ProductUpdateRequest> pair : requests) {
            try {
                productService.updateImport(pair.getFirst(), pair.getSecond());
                log.info("Cập nhật sản phẩm {} thành công!", pair.getFirst());
            } catch (AppException e) {
                log.error("Lỗi khi cập nhật sản phẩm {}: {}", pair.getFirst(), e.getErrorCode().getMessage());
            } catch (Exception e) {
                log.error("Lỗi hệ thống khi cập nhật sản phẩm {}: {}", pair.getFirst(), e.getMessage());
            }
        }
    }

    // ==================== QR ====================

    @Override
    @Async
    public void importCreateFromQR(MultipartFile file, String qrContent, String source) {
        List<ProductCreateRequest> requests = qrProdHelper.parseCreateFromQR(file, qrContent);
        for (ProductCreateRequest request : requests) {
            try {
                productService.create(request);
                log.info("Thêm sản phẩm {} thành công!", request.getCode());
            } catch (AppException e) {
                log.error("Lỗi khi thêm sản phẩm {}: {}", request.getCode(), e.getErrorCode().getMessage());
            }
        }
    }

    @Override
    @Async
    public void importUpdateFromQR(MultipartFile file, String qrContent, String source) {
        List<Pair<String, ProductUpdateRequest>> requests = qrProdHelper.parseUpdateFromQR(file, qrContent);
        for (Pair<String, ProductUpdateRequest> pair : requests) {
            try {
                productService.updateImport(pair.getFirst(), pair.getSecond());
                log.info("Cập nhật sản phẩm {} thành công!", pair.getFirst());
            } catch (AppException e) {
                log.error("Lỗi khi cập nhật sản phẩm {}: {}", pair.getFirst(), e.getErrorCode().getMessage());
            }
        }
    }

    // ==================== AI ====================

    @Override
    public String importCreateByAI(int quantity) {
        if (quantity < 1 || quantity > 50) {
            throw new AppException(ErrorCode.MIN_QUANTITY);
        }
        List<String> validCategoryCodes = categoryRepository.findAllCategoryCodes();
        List<String> validSupplierCodes = supplierRepository.findAllSupplierCodes();

        List<ProductCreateRequest> requests = aiProdHelper.generateProducts(quantity, validCategoryCodes, validSupplierCodes);
        int successCount = 0;
        for (ProductCreateRequest request : requests) {
            try {
                productService.create(request);
                successCount++;
                log.info("Thêm sản phẩm {} thành công!", request.getCode());
            } catch (AppException e) {
                log.error("Lỗi khi thêm sản phẩm {}: {}", request.getCode(), e.getErrorCode().getMessage());
            } catch (Exception e) {
                log.error("Lỗi hệ thống khi thêm sản phẩm {}: {}", request.getCode(), e.getMessage());
            }
        }
        String message = String.format("Đã sinh và tạo thành công %d/%d sản phẩm bằng AI", successCount, quantity);
        log.info(message);
        return message;
    }

    // ==================== PDF ====================

    @Override
    @Async
    public void importCreateFromPdf(MultipartFile file) {
        try {
            List<Pair<ProductCreateRequest, List<String>>> requests =
                    pdfProdHelper.readProductsForCreateFromPdf(file.getInputStream());
            for (Pair<ProductCreateRequest, List<String>> pair : requests) {
                ProductCreateRequest request = pair.getFirst();
                List<String> imagePaths = pair.getSecond();
                try {
                    ProductResponse created = productService.create(request);
                    Product product = productRepository.findById(created.getId())
                            .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_EXISTED));
                    if (product.getImages() == null) {
                        product.setImages(new ArrayList<>());
                        productRepository.save(product);
                    }
                    if (!imagePaths.isEmpty()) {
                        productService.saveProductImages(created.getId(), imagePaths);
                    }
                    log.info("Thêm sản phẩm {} thành công với {} hình ảnh!", request.getCode(), imagePaths.size());
                } catch (AppException e) {
                    log.error("Lỗi khi thêm sản phẩm {}: {}", request.getCode(), e.getErrorCode().getMessage());
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Lỗi import PDF: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void importUpdateFromPdf(MultipartFile file) {
        try {
            List<Pair<String, ProductUpdateRequest>> requests =
                    pdfProdHelper.readProductsForUpdateFromPdf(file.getInputStream());
            for (Pair<String, ProductUpdateRequest> pair : requests) {
                try {
                    productService.updateImport(pair.getFirst(), pair.getSecond());
                    log.info("Cập nhật sản phẩm {} thành công!", pair.getFirst());
                } catch (AppException e) {
                    log.error("Lỗi khi cập nhật sản phẩm {}: {}", pair.getFirst(), e.getErrorCode().getMessage());
                } catch (Exception e) {
                    log.error("Lỗi hệ thống khi cập nhật sản phẩm {}: {}", pair.getFirst(), e.getMessage());
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Lỗi import PDF: " + e.getMessage());
        }
    }

    // ==================== PRIVATE HELPERS ====================
}
