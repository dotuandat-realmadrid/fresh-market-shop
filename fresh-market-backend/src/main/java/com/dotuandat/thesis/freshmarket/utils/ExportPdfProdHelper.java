package com.dotuandat.thesis.freshmarket.utils;

import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
import com.lowagie.text.*;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.InputStream;
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

        PdfPTable table = new PdfPTable(14); // tăng lên 14 cột
        table.setWidthPercentage(100f);
        table.setSpacingBefore(10f);

        table.setWidths(new float[] {
                2f,  // Mã danh mục
                3f,  // Mã nhà cung cấp
                3f,  // Mã sản phẩm
                3f,  // Tên sản phẩm
                3f,  // Thương hiệu (branch)
                8f,  // Mô tả
                2f,  // Giá
                2f,  // Giá giảm
                2f,  // Số lượng tồn
                2f,  // Số lượng bán
                2f,  // Điểm
                2f,  // Đánh giá trung bình
                2f,  // Số lượng đánh giá
                2f   // Tên giảm giá
        });

        Font headFont = getArialBoldFont(12f);

        table.addCell(new Phrase("Mã danh mục", headFont));
        table.addCell(new Phrase("Mã nhà cung cấp", headFont));
        table.addCell(new Phrase("Mã sản phẩm", headFont));
        table.addCell(new Phrase("Tên sản phẩm", headFont));
        table.addCell(new Phrase("Thương hiệu", headFont)); // thêm branch
        table.addCell(new Phrase("Mô tả", headFont));
        table.addCell(new Phrase("Giá", headFont));
        table.addCell(new Phrase("Giá giảm", headFont));
        table.addCell(new Phrase("Số lượng tồn", headFont));
        table.addCell(new Phrase("Số lượng bán", headFont));
        table.addCell(new Phrase("Điểm", headFont));
        table.addCell(new Phrase("Đánh giá trung bình", headFont));
        table.addCell(new Phrase("Số lượng đánh giá", headFont));
        table.addCell(new Phrase("Tên giảm giá", headFont));

        for (ProductResponse p : productList) {
            table.addCell(p.getCategoryCodes() != null && !p.getCategoryCodes().isEmpty()
                    ? String.join(", ", p.getCategoryCodes()) : "");
            table.addCell(p.getSupplierCode() != null ? p.getSupplierCode() : "");
            table.addCell(p.getCode() != null ? p.getCode() : "");
            table.addCell(p.getName() != null ? p.getName() : "");
            table.addCell(p.getBranch() != null ? p.getBranch() : ""); // thêm branch
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

    // private static Font getArialFont(float size) {
    //     try {
    //         InputStream fontStream =
    //                 ExportPdfProdHelper.class.getResourceAsStream("/static/assets/fonts/times.ttf");
    //         if (fontStream == null) {
    //             throw new RuntimeException("Times font file not found at /static/assets/fonts/times.ttf");
    //         }
    //         BaseFont baseFont = BaseFont.createFont(
    //                 "times.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, false, fontStream.readAllBytes(), null);
    //         return new Font(baseFont, size);
    //     } catch (Exception e) {
    //         throw new RuntimeException("Could not load Times font", e);
    //     }
    // }

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
