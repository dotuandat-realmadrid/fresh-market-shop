package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.dtos.response.order.OrderDetailResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.order.OrderResponse;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.services.OrderPdfService;
import com.dotuandat.thesis.freshmarket.services.OrderService;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderPdfServiceImpl implements OrderPdfService {

    OrderService orderService;

    private static final NumberFormat VND_FORMAT = NumberFormat.getInstance(new Locale("vi", "VN"));

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    @Override
    public byte[] exportInvoicePdf(String orderId) {
        OrderResponse order = orderService.getById(orderId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 40, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            BaseFont baseFontRegular = loadBaseFont("static/assets/fonts/arial.ttf");
            BaseFont baseFontBold    = loadBaseFont("static/assets/fonts/arialbd.ttf");

            Font fontTitle    = new Font(baseFontBold,    16, Font.BOLD,   Color.BLACK);
            Font fontLabel    = new Font(baseFontBold,    13, Font.BOLD,   Color.BLACK);
            Font fontNormal   = new Font(baseFontRegular, 13, Font.NORMAL, Color.BLACK);
            Font fontSmall    = new Font(baseFontRegular, 11, Font.NORMAL, Color.BLACK);
            Font fontSmallB   = new Font(baseFontBold,    11, Font.BOLD,   Color.BLACK);

            buildInvoice(document, order,
                    fontTitle, fontLabel, fontNormal, fontSmall, fontSmallB);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    // -------------------------------------------------------------------------
    // Invoice layout
    // -------------------------------------------------------------------------

    private void buildInvoice(Document doc, OrderResponse order,
                              Font fontTitle, Font fontLabel,
                              Font fontNormal, Font fontSmall, Font fontSmallB) throws DocumentException {

        LocalDateTime createdDate = order.getCreatedDate();
        final float FIELD_SPACING = 6f;

        // ── Title ─────────────────────────────────────────────────────────────
        Paragraph title = new Paragraph("HÓA ĐƠN MUA HÀNG", fontTitle);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(FIELD_SPACING * 2);
        doc.add(title);

        // ── Tên khách hàng ────────────────────────────────────────────────────
        doc.add(labelParagraph("Tên khách hàng: ", safeStr(order.getFullName()),
                fontLabel, fontNormal, FIELD_SPACING + 2f));

        // ── Email | Phone ─────────────────────────────────────────────────────
        // PdfPTable tự thêm ~2pt spacing ẩn bên trên → bù lại bằng spacingBefore âm
        PdfPTable contactTable = new PdfPTable(new float[]{1f, 1f});
        contactTable.setWidthPercentage(100);
        contactTable.setSpacingBefore(0);  // bù spacing ẩn của PdfPTable
        contactTable.setSpacingAfter(FIELD_SPACING); // bù để after cũng đều

        PdfPCell emailCell = new PdfPCell(labelParagraph("Email: ",
                safeStr(order.getUsername()), fontLabel, fontNormal, 0f));
        emailCell.setBorder(Rectangle.NO_BORDER);
        emailCell.setPaddingTop(0f);
        emailCell.setPaddingBottom(0f);
        emailCell.setPaddingLeft(0f);
        emailCell.setPaddingRight(0f);

        PdfPCell phoneCell = new PdfPCell(labelParagraph("Điện thoại: ",
                safeStr(order.getPhone()), fontLabel, fontNormal, 0f));
        phoneCell.setBorder(Rectangle.NO_BORDER);
        phoneCell.setPaddingTop(0f);
        phoneCell.setPaddingBottom(0f);
        phoneCell.setPaddingLeft(0f);
        phoneCell.setPaddingRight(0f);

        contactTable.addCell(emailCell);
        contactTable.addCell(phoneCell);
        doc.add(contactTable);

        // ── Địa chỉ ───────────────────────────────────────────────────────────
        doc.add(labelParagraph("Địa chỉ: ", safeStr(order.getAddress()),
                fontLabel, fontNormal, FIELD_SPACING + 8f));

        // ── Bảng sản phẩm ─────────────────────────────────────────────────────
        PdfPTable productTable = buildProductTable(order.getDetails(), order.getTotalPrice(),
                fontSmall, fontSmallB);
        productTable.setSpacingBefore(0f);
        productTable.setSpacingAfter(FIELD_SPACING);
        doc.add(productTable);

        // ── Thành tiền (viết bằng chữ) ────────────────────────────────────────
        String words = numberToVietnameseWords(order.getTotalPrice()) + " đồng";
        doc.add(labelParagraph("Thành tiền (viết bằng chữ): ", words,
                fontLabel, fontNormal, FIELD_SPACING));

        // ── Ghi chú ───────────────────────────────────────────────────────────
        String note = (order.getNote() != null && !order.getNote().isBlank()) ? order.getNote() : "";
        doc.add(labelParagraph("Ghi chú: ", note, fontLabel, fontNormal, 40f));

        // ── Date + Signatures ──────────────────────────────────────────────────
        String dateStr = String.format("Ngày %02d tháng %02d năm %d",
                createdDate.getDayOfMonth(), createdDate.getMonthValue(), createdDate.getYear());

        PdfPTable signTable = new PdfPTable(2);
        signTable.setWidthPercentage(100);
        signTable.setSpacingBefore(0f);

        signTable.addCell(noBorderCell(new Paragraph("", fontNormal)));

        Paragraph datePara = new Paragraph(dateStr, fontNormal);
        datePara.setAlignment(Element.ALIGN_CENTER);
        PdfPCell rightTop = noBorderCell(datePara);
        rightTop.setHorizontalAlignment(Element.ALIGN_CENTER);
        rightTop.setPaddingLeft(8f);
        signTable.addCell(rightTop);

        Paragraph customerLabel = new Paragraph("Khách hàng", fontLabel);
        customerLabel.setAlignment(Element.ALIGN_CENTER);
        PdfPCell leftBottom = noBorderCell(customerLabel);
        leftBottom.setPaddingTop(8f);
        leftBottom.setPaddingLeft(50f);
        signTable.addCell(leftBottom);

        Paragraph invoicerLabel = new Paragraph("Người viết hóa đơn", fontLabel);
        invoicerLabel.setAlignment(Element.ALIGN_CENTER);
        PdfPCell rightBottom = noBorderCell(invoicerLabel);
        rightBottom.setPaddingTop(8f);
        rightBottom.setPaddingLeft(68f);
        signTable.addCell(rightBottom);

        doc.add(signTable);
    }

    // -------------------------------------------------------------------------
    // Product table
    // -------------------------------------------------------------------------

    private PdfPTable buildProductTable(List<OrderDetailResponse> details,
                                        long totalPrice,
                                        Font fontSmall, Font fontSmallB) throws DocumentException {

        float[] colWidths = {1f, 4f, 1.5f, 2f, 2f};
        PdfPTable table = new PdfPTable(colWidths);
        table.setWidthPercentage(100);
        // spacingAfter được set từ buildInvoice để đồng nhất

        // Header
        String[] headers = {"STT", "Tên sản phẩm", "Số lượng", "Đơn giá", "Thành tiền"};
        for (String h : headers) {
            PdfPCell cell = borderedCell(new Paragraph(h, fontSmallB));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setBackgroundColor(Color.WHITE);
            table.addCell(cell);
        }

        // Data rows
        int idx = 1;
        for (OrderDetailResponse detail : details) {
            long lineTotal = (long) (detail.getPriceAtPurchase() * detail.getQuantity());

            table.addCell(centeredCell(String.valueOf(idx++), fontSmall));
            table.addCell(leftCell(detail.getProductName(), fontSmall));
            table.addCell(centeredCell(String.valueOf(detail.getQuantity()), fontSmall));
            table.addCell(rightCell(formatVnd(detail.getPriceAtPurchase()), fontSmall));
            table.addCell(rightCell(formatVnd(lineTotal), fontSmall));
        }

        // Total row
        PdfPCell totalLabel = borderedCell(new Paragraph("Tổng cộng:", fontSmallB));
        totalLabel.setColspan(2);
        totalLabel.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(totalLabel);

        PdfPCell totalValue = borderedCell(new Paragraph(formatVnd(totalPrice), fontSmallB));
        totalValue.setColspan(3);
        totalValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(totalValue);

        return table;
    }

    // -------------------------------------------------------------------------
    // Cell helpers
    // -------------------------------------------------------------------------

    private PdfPCell noBorderCell(Paragraph p) {
        PdfPCell cell = new PdfPCell(p);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(0f);   // đổi từ 3f → 0f
        return cell;
    }

    private PdfPCell borderedCell(Paragraph p) {
        PdfPCell cell = new PdfPCell(p);
        cell.setBorderColor(Color.BLACK);
        cell.setBorderWidth(0.5f);
        cell.setPadding(4f);
        return cell;
    }

    private PdfPCell centeredCell(String text, Font font) {
        PdfPCell cell = borderedCell(new Paragraph(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }

    private PdfPCell leftCell(String text, Font font) {
        PdfPCell cell = borderedCell(new Paragraph(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        return cell;
    }

    private PdfPCell rightCell(String text, Font font) {
        PdfPCell cell = borderedCell(new Paragraph(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        return cell;
    }

    // -------------------------------------------------------------------------
    // Paragraph helpers
    // -------------------------------------------------------------------------

    /**
     * Tạo paragraph với label in đậm (không gạch chân) + value chữ thường.
     */
    private Paragraph labelParagraph(String label, String value,
                                     Font fontLabel, Font fontNormal,
                                     float spacingAfter) {
        Chunk labelChunk = new Chunk(label, fontLabel);
        Chunk valueChunk = new Chunk(value, fontNormal);

        Paragraph p = new Paragraph();
        p.add(labelChunk);
        p.add(valueChunk);
        p.setSpacingAfter(spacingAfter);
        return p;
    }

    // -------------------------------------------------------------------------
    // Font loading
    // -------------------------------------------------------------------------

    private BaseFont loadBaseFont(String classpathPath) throws Exception {
        InputStream is = new ClassPathResource(classpathPath).getInputStream();
        byte[] fontBytes = is.readAllBytes();
        is.close();
        return BaseFont.createFont(classpathPath, BaseFont.IDENTITY_H,
                BaseFont.EMBEDDED, true, fontBytes, null);
    }

    // -------------------------------------------------------------------------
    // Formatting helpers
    // -------------------------------------------------------------------------

    private String formatVnd(long amount) {
        return VND_FORMAT.format(amount) + "đ";
    }

    private String formatVnd(double amount) {
        return formatVnd((long) amount);
    }

    private String safeStr(String s) {
        return s != null ? s : "";
    }

    /**
     * Converts a non-negative long to Vietnamese words.
     */
    private String numberToVietnameseWords(long number) {
        if (number == 0) return "Không";

        String[] ones = {"", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"};
        String[] teens = {"mười", "mười một", "mười hai", "mười ba", "mười bốn",
                "mười lăm", "mười sáu", "mười bảy", "mười tám", "mười chín"};

        StringBuilder sb = new StringBuilder();

        if (number >= 1_000_000_000L) {
            sb.append(numberToVietnameseWords(number / 1_000_000_000L)).append(" tỷ ");
            number %= 1_000_000_000L;
        }
        if (number >= 1_000_000L) {
            sb.append(numberToVietnameseWords(number / 1_000_000L)).append(" triệu ");
            number %= 1_000_000L;
        }
        if (number >= 1_000L) {
            sb.append(numberToVietnameseWords(number / 1_000L)).append(" nghìn ");
            number %= 1_000L;
        }
        if (number >= 100L) {
            sb.append(ones[(int) (number / 100)]).append(" trăm ");
            number %= 100L;
        }
        if (number >= 20L) {
            sb.append(ones[(int) (number / 10)]).append(" mươi");
            long unit = number % 10;
            if (unit == 1) sb.append(" mốt");
            else if (unit == 5) sb.append(" lăm");
            else if (unit > 1) sb.append(" ").append(ones[(int) unit]);
            number = 0;
        } else if (number >= 10L) {
            sb.append(teens[(int) (number - 10)]);
            number = 0;
        }
        if (number > 0) {
            sb.append(ones[(int) number]);
        }

        String result = sb.toString().trim().replaceAll(" +", " ");
        return Character.toUpperCase(result.charAt(0)) + result.substring(1);
    }
}