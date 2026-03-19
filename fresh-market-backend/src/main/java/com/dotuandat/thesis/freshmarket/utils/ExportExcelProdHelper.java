package com.dotuandat.thesis.freshmarket.utils;

import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.IOException;
import java.util.List;

public class ExportExcelProdHelper {
    private List<ProductResponse> products;

    public ExportExcelProdHelper(List<ProductResponse> products) {
        this.products = products;
    }

    public void export(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=products.xlsx");

        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("Products");

        // Styles
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);

        CellStyle decimalStyle = workbook.createCellStyle();
        decimalStyle.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
        decimalStyle.setBorderTop(BorderStyle.THIN);
        decimalStyle.setBorderBottom(BorderStyle.THIN);
        decimalStyle.setBorderLeft(BorderStyle.THIN);
        decimalStyle.setBorderRight(BorderStyle.THIN);
        decimalStyle.setAlignment(HorizontalAlignment.LEFT);
        decimalStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        CellStyle textStyle = workbook.createCellStyle();
        textStyle.setBorderTop(BorderStyle.THIN);
        textStyle.setBorderBottom(BorderStyle.THIN);
        textStyle.setBorderLeft(BorderStyle.THIN);
        textStyle.setBorderRight(BorderStyle.THIN);
        textStyle.setAlignment(HorizontalAlignment.LEFT);
        textStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        textStyle.setWrapText(true); // Cho phép văn bản xuống dòng

        // Header row
        String[] headers = {
            "Mã danh mục",
            "Mã nhà cung cấp",
            "Mã sản phẩm",
            "Tên sản phẩm",
            "Mô tả",
            "Giá",
            "Giá giảm",
            "Số lượng tồn",
            "Số lượng bán",
            "Điểm",
            "Đánh giá trung bình",
            "Số lượng đánh giá",
            "Tên giảm giá"
        };

        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data rows
        int rowCount = 1;
        for (ProductResponse p : products) {
            Row row = sheet.createRow(rowCount++);
            int col = 0;

            row.createCell(col).setCellValue(p.getCategoryCode() != null ? p.getCategoryCode() : "");
            row.getCell(col++).setCellStyle(textStyle);

            row.createCell(col).setCellValue(p.getSupplierCode() != null ? p.getSupplierCode() : "");
            row.getCell(col++).setCellStyle(textStyle);

            row.createCell(col).setCellValue(p.getCode() != null ? p.getCode() : "");
            row.getCell(col++).setCellStyle(textStyle);

            row.createCell(col).setCellValue(p.getName() != null ? p.getName() : "");
            row.getCell(col++).setCellStyle(textStyle);

            // Ghi toàn bộ mô tả, cho phép xuống dòng
            row.createCell(col).setCellValue(p.getDescription() != null ? p.getDescription() : "");
            row.getCell(col++).setCellStyle(textStyle);

            Cell priceCell = row.createCell(col++);
            priceCell.setCellValue(p.getPrice());
            priceCell.setCellStyle(decimalStyle);

            Cell discountPriceCell = row.createCell(col++);
            if (p.getDiscountPrice() != null) {
                discountPriceCell.setCellValue(p.getDiscountPrice());
            }
            discountPriceCell.setCellStyle(decimalStyle);

            Cell inventoryCell = row.createCell(col++);
            inventoryCell.setCellValue(p.getInventoryQuantity());
            inventoryCell.setCellStyle(decimalStyle);

            Cell soldCell = row.createCell(col++);
            soldCell.setCellValue(p.getSoldQuantity());
            soldCell.setCellStyle(decimalStyle);

            Cell pointCell = row.createCell(col++);
            pointCell.setCellValue(p.getPoint());
            pointCell.setCellStyle(decimalStyle);

            Cell avgRatingCell = row.createCell(col++);
            avgRatingCell.setCellValue(p.getAvgRating());
            avgRatingCell.setCellStyle(decimalStyle);

            Cell reviewCountCell = row.createCell(col++);
            reviewCountCell.setCellValue(p.getReviewCount());
            reviewCountCell.setCellStyle(decimalStyle);

            row.createCell(col).setCellValue(p.getDiscountName() != null ? p.getDiscountName() : "");
            row.getCell(col++).setCellStyle(textStyle);
        }

        sheet.setColumnWidth(4, 50 * 256);

        // Auto-size other columns
        for (int i = 0; i < headers.length; i++) {
            if (i != 4) { // Bỏ qua cột "Mô tả"
                sheet.autoSizeColumn(i);
            }
        }

        workbook.write(response.getOutputStream());
        workbook.close();
    }
}
