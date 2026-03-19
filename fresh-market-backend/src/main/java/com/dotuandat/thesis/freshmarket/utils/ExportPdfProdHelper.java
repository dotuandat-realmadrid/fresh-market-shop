package com.dotuandat.thesis.freshmarket.utils;

import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
import com.lowagie.text.*;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class ExportPdfProdHelper {

    public static void export(HttpServletResponse response, List<ProductResponse> productList) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=products.pdf");

        Document document = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        Font titleFont = getArialBoldFont(16f);
        Paragraph title = new Paragraph("DANH SÁCH SẢN PHẨM", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Sử dụng bảng 13 cột
        PdfPTable table = new PdfPTable(13);
        table.setWidthPercentage(100f);
        table.setSpacingBefore(10f);

        // Điều chỉnh độ rộng cột dựa trên độ dài tiêu đề
        table.setWidths(new float[] {
            2f, // "Mã danh mục" (~10 ký tự)
            3f, // "Mã nhà cung cấp" (~12 ký tự)
            3f, // "Mã sản phẩm" (~12 ký tự)
            3f, // "Tên sản phẩm" (~12 ký tự)
            10f, // "Mô tả" (tương đương 50 ký tự hoặc hơn)
            2f, // "Giá" (~3 ký tự)
            2f, // "Giá giảm" (~6 ký tự)
            2f, // "Số lượng tồn" (~6 ký tự)
            2f, // "Số lượng bán" (~6 ký tự)
            2f, // "Điểm" (~4 ký tự)
            2f, // "Đánh giá trung bình" (~9 ký tự)
            2f, // "Số lượng đánh giá" (~9 ký tự)
            2f // "Tên giảm giá" (~6 ký tự)
        });

        Font headFont = getArialBoldFont(12f);
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

        // Header
        table.addCell(new Phrase("Mã danh mục", headFont));
        table.addCell(new Phrase("Mã nhà cung cấp", headFont));
        table.addCell(new Phrase("Mã sản phẩm", headFont));
        table.addCell(new Phrase("Tên sản phẩm", headFont));
        table.addCell(new Phrase("Mô tả", headFont));
        table.addCell(new Phrase("Giá", headFont));
        table.addCell(new Phrase("Giá giảm", headFont));
        table.addCell(new Phrase("Số lượng tồn", headFont));
        table.addCell(new Phrase("Số lượng bán", headFont));
        table.addCell(new Phrase("Điểm", headFont));
        table.addCell(new Phrase("Đánh giá trung bình", headFont));
        table.addCell(new Phrase("Số lượng đánh giá", headFont));
        table.addCell(new Phrase("Tên giảm giá", headFont));

        // Dữ liệu
        for (ProductResponse p : productList) {
            table.addCell(p.getCategoryCode() != null ? p.getCategoryCode() : "");
            table.addCell(p.getSupplierCode() != null ? p.getSupplierCode() : "");
            table.addCell(p.getCode() != null ? p.getCode() : "");
            table.addCell(p.getName() != null ? p.getName() : "");
            table.addCell(p.getDescription() != null ? p.getDescription() : "");
            table.addCell(String.valueOf(p.getPrice()));
            table.addCell(p.getDiscountPrice() != null ? String.valueOf(p.getDiscountPrice()) : "");
            table.addCell(String.valueOf(p.getInventoryQuantity()));
            table.addCell(String.valueOf(p.getSoldQuantity()));
            table.addCell(String.valueOf(p.getPoint()));
            table.addCell(String.format("%.2f", p.getAvgRating()));
            table.addCell(String.valueOf(p.getReviewCount()));
            table.addCell(p.getDiscountName() != null ? p.getDiscountName() : "");
        }

        document.add(table);
        document.close();
    }

    private static Font getArialFont(float size) {
        try {
            InputStream fontStream =
                    ExportPdfProdHelper.class.getResourceAsStream("/static/assets/fonts/times.ttf");
            if (fontStream == null) {
                throw new RuntimeException("Times font file not found at /static/assets/fonts/times.ttf");
            }
            BaseFont baseFont = BaseFont.createFont(
                    "times.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, false, fontStream.readAllBytes(), null);
            return new Font(baseFont, size);
        } catch (Exception e) {
            throw new RuntimeException("Could not load Times font", e);
        }
    }

    private static Font getArialBoldFont(float size) {
        try {
            InputStream fontStream =
                    ExportPdfProdHelper.class.getResourceAsStream("/static/assets/fonts/timesbd.ttf");
            if (fontStream == null) {
                throw new RuntimeException("Times Bold font file not found at /static/assets/fonts/timesbd.ttf");
            }
            BaseFont baseFont = BaseFont.createFont(
                    "timesbd.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, false, fontStream.readAllBytes(), null);
            return new Font(baseFont, size, Font.BOLD);
        } catch (Exception e) {
            throw new RuntimeException("Could not load Times Bold font", e);
        }
    }
}
