package com.dotuandat.thesis.freshmarket.utils;

import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptDetailRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptRequest;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
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
public class ExcelInventoryHelper {
    private static final String SHEET_NAME = "inventory_receipt";
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");

    static {
        DATE_FORMAT.setLenient(false);
    }

    public InventoryReceiptRequest parseExcel(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE_EXCEL_FORMAT);
        }

        InventoryReceiptRequest request = new InventoryReceiptRequest();
        List<InventoryReceiptDetailRequest> detailRequests = new ArrayList<>();
        long totalAmount = 0L;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheet(SHEET_NAME);
            if (sheet == null) {
                throw new AppException(ErrorCode.INVALID_FILE_EXCEL_FORMAT);
            }

            // Kiểm tra nếu sheet rỗng hoặc chỉ có header
            if (sheet.getLastRowNum() <= 0) {
                throw new AppException(ErrorCode.INVALID_FILE_EXCEL_FORMAT);
            }

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Bỏ qua header

                // Kiểm tra nếu dòng rỗng hoàn toàn
                if (isRowEmpty(row)) continue;

                // Lấy note từ dòng đầu tiên có dữ liệu (chỉ lấy 1 lần)
                if (request.getNote() == null) {
                    String note = getStringCellValue(row, 5);
                    request.setNote(note);
                }

                InventoryReceiptDetailRequest detailRequest = parseRow(row);
                if (detailRequest != null) {
                    detailRequests.add(detailRequest);
                    totalAmount += (long) detailRequest.getQuantity() * detailRequest.getPrice();
                }
            }

            if (detailRequests.isEmpty()) {
                throw new AppException(ErrorCode.INVALID_FILE_EXCEL_FORMAT);
            }

            request.setDetails(detailRequests);
            request.setTotalAmount(totalAmount);
        } catch (IOException e) {
            log.error("Lỗi đọc file Excel: {}", e.getMessage());
            throw new AppException(ErrorCode.FILE_READ_EXCEL_ERROR);
        }

        return request;
    }

    private InventoryReceiptDetailRequest parseRow(Row row) {
        try {
            String productCode = getStringCellValue(row, 0);
            if (productCode == null || productCode.isEmpty()) {
                throw new IllegalArgumentException("Product code không được để trống");
            }

            int quantity = (int) getNumericCellValue(row, 1);
            if (quantity <= 0) {
                throw new IllegalArgumentException("Quantity phải lớn hơn 0");
            }

            long price = (long) getNumericCellValue(row, 2);
            if (price <= 0) {
                throw new IllegalArgumentException("Price phải lớn hơn 0");
            }

            Date manufacturedDate = getDateCellValue(row, 3);
            Date expiryDate = getDateCellValue(row, 4);

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
            log.warn("Bỏ qua dòng {} do lỗi: {}", row.getRowNum() + 1, e.getMessage());
            return null;
        }
    }

    private String getStringCellValue(Row row, int index) {
        Cell cell = row.getCell(index, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) {
            return null;
        }

        // Xử lý các loại cell khác nhau
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                // Nếu là số nhưng cần trả về string (như product code)
                if (DateUtil.isCellDateFormatted(cell)) {
                    return DATE_FORMAT.format(cell.getDateCellValue());
                } else {
                    return String.valueOf((long) cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }

    private double getNumericCellValue(Row row, int index) {
        Cell cell = row.getCell(index, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) {
            return 0;
        }

        try {
            switch (cell.getCellType()) {
                case NUMERIC:
                    return cell.getNumericCellValue();
                case STRING:
                    String value = cell.getStringCellValue().trim();
                    return value.isEmpty() ? 0 : Double.parseDouble(value);
                case FORMULA:
                    return cell.getNumericCellValue();
                default:
                    return 0;
            }
        } catch (NumberFormatException e) {
            log.warn(
                    "Không thể chuyển đổi giá trị ở dòng {}, cột {} thành số: {}",
                    row.getRowNum() + 1,
                    index + 1,
                    e.getMessage());
            return 0;
        }
    }

    private Date getDateCellValue(Row row, int index) {
        Cell cell = row.getCell(index, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) {
            return null; // Cho phép null vì Date không có annotation @NotNull
        }

        Date dateValue = null;

        try {
            switch (cell.getCellType()) {
                case STRING:
                    String stringValue = cell.getStringCellValue().trim();
                    if (stringValue.isEmpty()) {
                        return null;
                    }
                    dateValue = DATE_FORMAT.parse(stringValue);
                    break;
                case NUMERIC:
                    if (DateUtil.isCellDateFormatted(cell)) {
                        dateValue = cell.getDateCellValue();
                    } else {
                        throw new IllegalArgumentException("Cell không phải là định dạng ngày");
                    }
                    break;
                default:
                    throw new IllegalArgumentException("Loại cell không hỗ trợ cho ngày tháng");
            }
        } catch (ParseException e) {
            log.error(
                    "Định dạng ngày không hợp lệ ở dòng {}, cột {}: {}",
                    row.getRowNum() + 1,
                    index + 1,
                    e.getMessage());
            throw new AppException(ErrorCode.INVALID_FILE_EXCEL_FORMAT);
        } catch (Exception e) {
            log.error("Lỗi xử lý ngày ở dòng {}, cột {}: {}", row.getRowNum() + 1, index + 1, e.getMessage());
            throw new AppException(ErrorCode.INVALID_FILE_EXCEL_FORMAT);
        }

        return dateValue;
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) {
            return true;
        }

        for (int i = 0; i < 6; i++) { // Kiểm tra 6 cột đầu tiên
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String value = getStringCellValue(row, i);
                if (value != null && !value.isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }
}
