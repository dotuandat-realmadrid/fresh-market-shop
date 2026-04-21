package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptDetailRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptRequest;
import com.dotuandat.thesis.freshmarket.entities.Product;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.ProductRepository;
import com.dotuandat.thesis.freshmarket.services.InventoryImportService;
import com.dotuandat.thesis.freshmarket.services.InventoryReceiptService;
import com.dotuandat.thesis.freshmarket.utils.AIInventoryHelper;
import com.dotuandat.thesis.freshmarket.utils.ExcelInventoryHelper;
import com.dotuandat.thesis.freshmarket.utils.PdfInventoryHelper;
import com.dotuandat.thesis.freshmarket.utils.QRInventoryHelper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class InventoryImportServiceImpl implements InventoryImportService {

    InventoryReceiptService inventoryReceiptService;
    ProductRepository productRepository;
    QRInventoryHelper qrInventoryHelper;
    AIInventoryHelper aiInventoryHelper;
    ExcelInventoryHelper excelInventoryHelper;
    PdfInventoryHelper pdfInventoryHelper;

    // =========================================================
    // Public API
    // =========================================================

    @Override
    @Async
    public void importFromExcel(MultipartFile file) {
        asyncCreate(excelInventoryHelper.parseExcel(file));
    }

    @Override
    @Async
    public void importFromPdf(MultipartFile file) {
        asyncCreate(pdfInventoryHelper.parsePdf(file));
    }

    @Override
    @Async
    public void importFromQR(MultipartFile file, String qrContent, String source) {
        try {
            String content = resolveQRContent(file, qrContent);
            List<InventoryReceiptRequest> requests = qrInventoryHelper.smartParseContent(content);
            log.info("Đã parse thành công {} phiếu nhập", requests.size());
            requests.forEach(this::asyncCreate);
        } catch (Exception e) {
            log.error("Lỗi import QR: {}", e.getMessage());
            throw new RuntimeException("Lỗi import QR: " + e.getMessage());
        }
    }

    @Override
    public String importFromAI(int quantity) {
        if (quantity < 1 || quantity > 50) {
            throw new AppException(ErrorCode.MIN_QUANTITY);
        }

        try {
            List<String> validProductCodes = productRepository.findAllProductCodes();
            Map<String, Long> productPriceMap = productRepository.findAll().stream()
                    .collect(Collectors.toMap(
                            Product::getCode,
                            p -> p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice()
                    ));

            List<InventoryReceiptRequest> requests =
                    aiInventoryHelper.generateInventoryData(validProductCodes, productPriceMap, quantity);

            if (requests.isEmpty()) {
                throw new RuntimeException("Không thể sinh dữ liệu phiếu nhập từ Gemini API");
            }

            int successCount = 0;
            int limit = Math.min(requests.size(), quantity);
            for (int i = 0; i < limit; i++) {
                try {
                    InventoryReceiptRequest request = requests.get(i);
                    validateReceiptRequest(request);
                    inventoryReceiptService.create(request);
                    successCount++;
                    log.info("Thêm phiếu nhập kho cho sản phẩm {} thành công!",
                            request.getDetails().getFirst().getProductCode());
                } catch (Exception e) {
                    log.error("Lỗi khi tạo phiếu nhập trong quá trình import AI: {}", e.getMessage());
                }
            }
            String message = String.format("Đã sinh và tạo thành công %d/%d phiếu nhập kho bằng AI", successCount, quantity);
            log.info(message);
            return message;
        } catch (Exception e) {
            log.error("Lỗi khi vận hành sinh phiếu nhập bằng AI: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi vận hành sinh phiếu nhập bằng AI: " + e.getMessage());
        }
    }

    // =========================================================
    // Private helpers
    // =========================================================

    @Async
    public void asyncCreate(InventoryReceiptRequest request) {
        try {
            validateReceiptRequest(request);
            inventoryReceiptService.create(request);
            log.info("Thêm phiếu nhập kho với productCode {} thành công!",
                    request.getDetails().getFirst().getProductCode());
        } catch (AppException e) {
            log.error("Lỗi khi thêm phiếu nhập kho với productCode {}: {}",
                    request.getDetails().getFirst().getProductCode(),
                    e.getErrorCode().getMessage());
        }
    }

    private void validateReceiptRequest(InventoryReceiptRequest request) {
        if (request.getDetails() == null || request.getDetails().isEmpty()) {
            throw new AppException(ErrorCode.PRODUCT_NOT_EXISTED);
        }
        if (request.getTotalAmount() == null || request.getTotalAmount() < 1) {
            throw new AppException(ErrorCode.MIN_QUANTITY);
        }

        List<String> validProductCodes = productRepository.findAll().stream()
                .map(Product::getCode)
                .toList();

        for (InventoryReceiptDetailRequest detail : request.getDetails()) {
            if (detail.getProductCode() == null || detail.getProductCode().trim().isEmpty()) {
                throw new AppException(ErrorCode.PRODUCT_ID_NOT_BLANK);
            }
            if (!validProductCodes.contains(detail.getProductCode())) {
                throw new AppException(ErrorCode.PRODUCT_NOT_EXISTED);
            }
            if (detail.getQuantity() == null || detail.getQuantity() < 1) {
                throw new AppException(ErrorCode.MIN_QUANTITY);
            }
            if (detail.getPrice() == null || detail.getPrice() < 1000) {
                throw new AppException(ErrorCode.MIN_PRICE);
            }
            if (detail.getManufacturedDate() != null
                    && detail.getExpiryDate() != null
                    && detail.getManufacturedDate().after(detail.getExpiryDate())) {
                throw new AppException(ErrorCode.INVALID_FILE_EXCEL_FORMAT);
            }
        }

        long calculatedTotal = request.getDetails().stream()
                .mapToLong(detail -> detail.getPrice() * detail.getQuantity())
                .sum();
        if (request.getTotalAmount() != calculatedTotal) {
            throw new AppException(ErrorCode.PRICE_NOT_NULL);
        }
    }

    private String resolveQRContent(MultipartFile file, String qrContent) {
        if (file != null && !file.isEmpty()) {
            String fromImage = qrInventoryHelper.readQRFromImage(file);
            log.info("Đọc nội dung QR từ file: {}", fromImage);
            return fromImage != null ? fromImage : "";
        }
        if (qrContent != null && !qrContent.isEmpty()) {
            return qrContent;
        }
        throw new RuntimeException("Nội dung mã QR trống");
    }
}