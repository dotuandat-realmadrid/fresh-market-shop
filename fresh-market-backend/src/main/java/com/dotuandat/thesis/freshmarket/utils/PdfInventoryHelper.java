package com.dotuandat.thesis.freshmarket.utils;

import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptDetailRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptRequest;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Component
@Slf4j
public class PdfInventoryHelper {
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");

    static {
        DATE_FORMAT.setLenient(false);
    }

    public InventoryReceiptRequest parsePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE_PDF_FORMAT);
        }

        InventoryReceiptRequest request = new InventoryReceiptRequest();
        List<InventoryReceiptDetailRequest> detailRequests = new ArrayList<>();
        long totalAmount = 0L;

        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            String[] lines = text.split("\\r?\\n");

            // Kiểm tra định dạng PDF - header phải chứa các cột cần thiết
            if (text.trim().isEmpty() || lines.length == 0) {
                throw new AppException(ErrorCode.INVALID_FILE_PDF_FORMAT);
            }

            String headerLine = lines[0].trim();
            if (!isValidHeader(headerLine)) {
                throw new AppException(ErrorCode.INVALID_FILE_PDF_FORMAT);
            }

            // Lấy note từ dòng cuối nếu có và không phải là dữ liệu
            String globalNote = extractGlobalNote(lines);

            // Bỏ qua dòng header và dòng note (nếu có)
            int endIndex = globalNote != null ? lines.length - 1 : lines.length;

            for (int i = 1; i < endIndex; i++) {
                String line = lines[i].trim();
                if (line.isEmpty()) continue;

                InventoryReceiptDetailRequest detailRequest = parseLine(line, i + 1);
                if (detailRequest != null) {
                    detailRequests.add(detailRequest);
                    totalAmount += (long) detailRequest.getQuantity() * detailRequest.getPrice();
                }
            }

            if (detailRequests.isEmpty()) {
                throw new AppException(ErrorCode.PRODUCT_NOT_EXISTED);
            }

            request.setDetails(detailRequests);
            request.setTotalAmount(totalAmount);
            if (globalNote != null) {
                request.setNote(globalNote);
            }

        } catch (IOException e) {
            log.error("Lỗi đọc file PDF: {}", e.getMessage());
            throw new AppException(ErrorCode.FILE_READ_PDF_ERROR);
        }

        return request;
    }

    private boolean isValidHeader(String headerLine) {
        // Kiểm tra header có chứa các cột cần thiết
        String lowerHeader = headerLine.toLowerCase();
        return lowerHeader.contains("productcode")
                || lowerHeader.contains("product_code")
                || lowerHeader.contains("quantity") && lowerHeader.contains("price");
    }

    private String extractGlobalNote(String[] lines) {
        if (lines.length <= 2) return null;

        String lastLine = lines[lines.length - 1].trim();
        if (lastLine.isEmpty()) return null;

        // Kiểm tra nếu dòng cuối không phải là dữ liệu (ít nhất 3 cột)
        String[] lastColumns = lastLine.split("\\s+");
        if (lastColumns.length < 3) {
            return lastLine.length() <= 255 ? lastLine : null;
        }

        // Nếu dòng cuối có đủ cột nhưng không parse được thành dữ liệu
        try {
            Integer.parseInt(lastColumns[1].replace(",", ""));
            Long.parseLong(lastColumns[2].replace(",", ""));
            return null; // Đây là dữ liệu, không phải note
        } catch (NumberFormatException e) {
            return lastLine.length() <= 255 ? lastLine : null; // Đây là note
        }
    }

    private InventoryReceiptDetailRequest parseLine(String line, int lineNumber) {
        try {
            String[] columns = line.trim().split("\\s+");

            // Cần ít nhất 5 cột: productCode, quantity, price, manufacturedDate, expiryDate
            if (columns.length < 5) {
                log.warn(
                        "Dòng {}: Không đủ cột dữ liệu (cần 5 cột: productCode, quantity, price, manufacturedDate, expiryDate): {}",
                        lineNumber,
                        line);
                return null;
            }

            // Parse productCode
            String productCode = columns[0];
            if (productCode == null || productCode.isEmpty()) {
                throw new IllegalArgumentException("Product code không được để trống");
            }

            // Parse quantity
            int quantity;
            try {
                quantity = Integer.parseInt(columns[1].replace(",", ""));
                if (quantity <= 0) {
                    throw new IllegalArgumentException("Quantity phải lớn hơn 0");
                }
            } catch (NumberFormatException e) {
                log.warn("Dòng {}: Số lượng không hợp lệ - {}", lineNumber, columns[1]);
                return null;
            }

            // Parse price
            long price;
            try {
                price = Long.parseLong(columns[2].replace(",", ""));
                if (price < 1000) {
                    throw new IllegalArgumentException("Price phải ít nhất 1000");
                }
            } catch (NumberFormatException e) {
                log.warn("Dòng {}: Giá không hợp lệ - {}", lineNumber, columns[2]);
                return null;
            }

            // Parse manufacturedDate
            Date manufacturedDate = parseDate(columns[3], lineNumber, "manufactured date");

            // Parse expiryDate
            Date expiryDate = parseDate(columns[4], lineNumber, "expiry date");

            // Kiểm tra logic ngày tháng
            if (manufacturedDate != null && expiryDate != null && manufacturedDate.after(expiryDate)) {
                throw new IllegalArgumentException("Ngày sản xuất không thể sau ngày hết hạn");
            }

            return InventoryReceiptDetailRequest.builder()
                    .productCode(productCode)
                    .quantity(quantity)
                    .price(price)
                    .manufacturedDate(manufacturedDate)
                    .expiryDate(expiryDate)
                    .build();

        } catch (Exception e) {
            log.warn("Bỏ qua dòng {} do lỗi: {}", lineNumber, e.getMessage());
            return null;
        }
    }

    private Date parseDate(String dateString, int lineNumber, String fieldName) {
        if (dateString == null
                || dateString.trim().isEmpty()
                || dateString.equalsIgnoreCase("null")
                || dateString.equals("-")) {
            return null; // Cho phép null
        }

        String cleanDateString = dateString.trim();

        try {
            return DATE_FORMAT.parse(cleanDateString);
        } catch (ParseException e) {
            log.warn("Dòng {}: {} không đúng định dạng yyyy-MM-dd: {}", lineNumber, fieldName, cleanDateString);
            // Thử các định dạng khác
            return tryOtherDateFormats(cleanDateString, lineNumber, fieldName);
        }
    }

    private Date tryOtherDateFormats(String dateString, int lineNumber, String fieldName) {
        // Thử định dạng dd/MM/yyyy
        try {
            SimpleDateFormat altFormat1 = new SimpleDateFormat("dd/MM/yyyy");
            altFormat1.setLenient(false);
            return altFormat1.parse(dateString);
        } catch (ParseException ignored) {
        }

        // Thử định dạng MM/dd/yyyy
        try {
            SimpleDateFormat altFormat2 = new SimpleDateFormat("MM/dd/yyyy");
            altFormat2.setLenient(false);
            return altFormat2.parse(dateString);
        } catch (ParseException ignored) {
        }

        // Thử định dạng dd-MM-yyyy
        try {
            SimpleDateFormat altFormat3 = new SimpleDateFormat("dd-MM-yyyy");
            altFormat3.setLenient(false);
            return altFormat3.parse(dateString);
        } catch (ParseException ignored) {
        }

        log.warn("Dòng {}: Không thể parse {} với bất kỳ định dạng nào: {}", lineNumber, fieldName, dateString);
        return null;
    }
}
