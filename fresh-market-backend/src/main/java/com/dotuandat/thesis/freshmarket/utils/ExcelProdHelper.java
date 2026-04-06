package com.dotuandat.thesis.freshmarket.utils;

import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductUpdateRequest;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
@Slf4j
public class ExcelProdHelper {
    private static final String SHEET_NAME = "products";
    private static final int IMAGE_COLUMN_INDEX = 7; // Cột imagePath

    @NonFinal
    @Value("${app.file.storage-dir}")
    private String STORAGE_DIR;

    public List<Pair<ProductCreateRequest, List<String>>> parseCreateExcel(MultipartFile file) {
        List<Pair<ProductCreateRequest, List<String>>> products = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheet(SHEET_NAME);
            if (sheet == null) {
                throw new AppException(ErrorCode.INVALID_FILE_EXCEL_FORMAT);
            }

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Bỏ qua header

                Pair<ProductCreateRequest, List<String>> pair = parseCreateRow(row, (XSSFWorkbook) workbook);
                if (pair != null) {
                    products.add(pair);
                }
            }
        } catch (IOException e) {
            throw new AppException(ErrorCode.FILE_READ_EXCEL_ERROR);
        }

        return products;
    }

    private Pair<ProductCreateRequest, List<String>> parseCreateRow(Row row, XSSFWorkbook workbook) {
        try {
            String categoryCodes = getStringCellValue(row, 0);
            List<String> listCategoryCodes = (categoryCodes == null || categoryCodes.isEmpty())
                    ? List.of()
                    : Arrays.stream(categoryCodes.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
            String code = getStringCellValue(row, 2);
            String name = getStringCellValue(row, 3);

            if (isEmpty(categoryCodes) || isEmpty(code) || isEmpty(name)) {
                log.warn("Bỏ qua dòng {} do thiếu các trường bắt buộc", row.getRowNum());
                return null;
            }

            List<String> imagePaths = extractImagesFromCell(row, workbook);
            ProductCreateRequest request = ProductCreateRequest.builder()
                    .categoryCodes(listCategoryCodes)
                    .supplierCode(getStringCellValue(row, 1))
                    .code(code)
                    .name(name)
                    .branch(getStringCellValue(row, 4))       // thêm branch
                    .description(getStringCellValue(row, 5))  // dời xuống col 5
                    .price((long) getNumericCellValue(row, 6)) // dời xuống col 6
                    .build();

            return Pair.of(request, imagePaths);
        } catch (Exception e) {
            log.warn("Bỏ qua dòng {} do lỗi: {}", row.getRowNum(), e.getMessage());
            return null;
        }
    }

    private List<String> extractImagesFromCell(Row row, XSSFWorkbook workbook) {
        List<String> imagePaths = new ArrayList<>();
        Cell cell = row.getCell(IMAGE_COLUMN_INDEX, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);

        if (cell != null && cell.getCellType() == CellType.STRING) {
            // Nếu cột chứa đường dẫn văn bản
            String imagePath = cell.getStringCellValue().trim();
            if (!isEmpty(imagePath)) {
                imagePaths.add(imagePath);
            }
        } else {
            // Xử lý hình ảnh nhúng
            XSSFDrawing drawing = (XSSFDrawing) row.getSheet().createDrawingPatriarch();
            if (drawing != null) {
                for (XSSFShape shape : drawing.getShapes()) {
                    if (shape instanceof XSSFPicture) {
                        XSSFPicture picture = (XSSFPicture) shape;
                        XSSFClientAnchor anchor = (XSSFClientAnchor) picture.getAnchor();
                        if (anchor.getRow1() == row.getRowNum() && anchor.getCol1() == IMAGE_COLUMN_INDEX) {
                            String fileName = UUID.randomUUID().toString() + ".png";
                            Path storagePath = Paths.get(STORAGE_DIR, fileName);

                            try {
                                // Tạo thư mục nếu chưa tồn tại
                                Files.createDirectories(storagePath.getParent());

                                // Lưu file hình ảnh
                                try (FileOutputStream out = new FileOutputStream(storagePath.toFile())) {
                                    byte[] pictureData =
                                            picture.getPictureData().getData();
                                    out.write(pictureData);
                                    imagePaths.add(fileName);
                                    log.info("Đã lưu hình ảnh: {} vào thư mục: {}", fileName, STORAGE_DIR);
                                }
                            } catch (IOException e) {
                                log.error("Lỗi khi lưu hình ảnh: {}", e.getMessage());
                            }
                        }
                    }
                }
            }
        }
        return imagePaths;
    }

    //    public List<ProductCreateRequest> parseCreateExcel(MultipartFile file) {
    //        List<ProductCreateRequest> products = new ArrayList<>();
    //
    //        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
    //            Sheet sheet = workbook.getSheet(SHEET_NAME);
    //            if (sheet == null) {
    //                throw new AppException(ErrorCode.INVALID_FILE_EXCEL_FORMAT);
    //            }
    //
    //            for (Row row : sheet) {
    //                if (row.getRowNum() == 0) continue; // Bỏ qua header
    //
    //                ProductCreateRequest request = parseCreateRow(row);
    //                if (request != null) {
    //                    products.add(request);
    //                }
    //            }
    //        } catch (IOException e) {
    //            throw new AppException(ErrorCode.FILE_READ_EXCEL_ERROR);
    //        }
    //
    //        return products;
    //    }
    //
    //    private ProductCreateRequest parseCreateRow(Row row) {
    //        try {
    //            String categoryCode = getStringCellValue(row, 0);
    //            String code = getStringCellValue(row, 2);
    //            String name = getStringCellValue(row, 3);
    //
    //            // Bỏ qua dòng nếu các trường bắt buộc là null hoặc rỗng
    //            if (isEmpty(categoryCode) || isEmpty(code) || isEmpty(name)) {
    //                log.warn("Bỏ qua dòng {} do thiếu các trường bắt buộc", row.getRowNum());
    //                return null;
    //            }
    //
    //            return ProductCreateRequest.builder()
    //                    .categoryCode(categoryCode)
    //                    .supplierCode(getStringCellValue(row, 1))
    //                    .code(code)
    //                    .name(name)
    //                    .description(getStringCellValue(row, 4))
    //                    .price((long) getNumericCellValue(row, 5))
    //                    .build();
    //        } catch (Exception e) {
    //            log.warn("Bỏ qua dòng {} do lỗi: {}", row.getRowNum(), e.getMessage());
    //            return null;
    //        }
    //    }

    public List<Pair<String, ProductUpdateRequest>> parseUpdateExcel(MultipartFile file) {
        List<Pair<String, ProductUpdateRequest>> products = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheet(SHEET_NAME);
            if (sheet == null) {
                throw new AppException(ErrorCode.INVALID_FILE_EXCEL_FORMAT);
            }

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Bỏ qua header

                Pair<String, ProductUpdateRequest> pair = parseUpdateRow(row);
                if (pair != null) {
                    products.add(pair);
                }
            }
        } catch (IOException e) {
            throw new AppException(ErrorCode.FILE_READ_EXCEL_ERROR);
        }

        return products;
    }

    private Pair<String, ProductUpdateRequest> parseUpdateRow(Row row) {
        try {
            String categoryCodes = getStringCellValue(row, 0);
            List<String> listCategoryCodes = (categoryCodes == null || categoryCodes.isEmpty())
                    ? List.of()
                    : Arrays.stream(categoryCodes.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
            String supplierCode = getStringCellValue(row, 1);
            String code = getStringCellValue(row, 2);
            String name = getStringCellValue(row, 3);

            if (isEmpty(categoryCodes) || isEmpty(supplierCode) || isEmpty(code) || isEmpty(name)) {
                log.warn("Bỏ qua dòng {} do thiếu các trường bắt buộc", row.getRowNum());
                return null;
            }

            String discountId = getStringCellValue(row, 7); // dời xuống col 7
            if (isEmpty(discountId)) {
                discountId = null;
            }

            ProductUpdateRequest request = ProductUpdateRequest.builder()
                    .categoryCodes(listCategoryCodes)
                    .supplierCode(supplierCode)
                    .name(name)
                    .branch(getStringCellValue(row, 4))        // thêm branch
                    .description(getStringCellValue(row, 5))   // dời xuống col 5
                    .price((long) getNumericCellValue(row, 6)) // dời xuống col 6
                    .discountId(discountId)
                    .build();

            return Pair.of(code, request);
        } catch (Exception e) {
            log.warn("Bỏ qua dòng {} do lỗi: {}", row.getRowNum(), e.getMessage());
            return null;
        }
    }

    private String getStringCellValue(Row row, int index) {
        Cell cell = row.getCell(index, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        return (cell == null) ? null : cell.getStringCellValue().trim();
    }

    private double getNumericCellValue(Row row, int index) {
        Cell cell = row.getCell(index, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        return (cell == null) ? 0 : cell.getNumericCellValue();
    }

    private boolean isEmpty(String value) {
        return value == null || value.trim().isEmpty();
    }
}
