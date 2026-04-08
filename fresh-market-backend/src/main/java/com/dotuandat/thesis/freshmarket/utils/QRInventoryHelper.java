package com.dotuandat.thesis.freshmarket.utils;

import boofcv.alg.fiducial.qrcode.QrCode;
import boofcv.factory.fiducial.FactoryFiducial;
import boofcv.io.image.ConvertBufferedImage;
import boofcv.struct.image.GrayU8;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptDetailRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptRequest;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class QRInventoryHelper {

    private final ObjectMapper objectMapper;
    private final WebClient webClient;

    // Date formatters cho QR parsing
    private static final SimpleDateFormat[] DATE_FORMATS = {
            new SimpleDateFormat("dd/MM/yyyy"),
            new SimpleDateFormat("yyyy-MM-dd"),
            new SimpleDateFormat("MM/dd/yyyy"),
            new SimpleDateFormat("dd-MM-yyyy")
    };

    static {
        for (SimpleDateFormat format : DATE_FORMATS) {
            format.setLenient(false);
        }
    }

    // =========================================================
    // Public API
    // =========================================================

    public String readQRFromImage(MultipartFile file) {
        try {
            BufferedImage bufferedImage = ImageIO.read(file.getInputStream());
            GrayU8 gray = ConvertBufferedImage.convertFrom(bufferedImage, (GrayU8) null);

            boofcv.abst.fiducial.QrCodeDetector<GrayU8> detector =
                    FactoryFiducial.qrcode(null, GrayU8.class);
            detector.process(gray);

            List<QrCode> detections = detector.getDetections();
            if (!detections.isEmpty()) {
                QrCode qrCode = detections.get(0);
                if (qrCode.message != null) {
                    return qrCode.message;
                }
            }
            return null;
        } catch (IOException e) {
            throw new AppException(ErrorCode.FILE_READ_QR_ERROR);
        }
    }

    /**
     * Tự động nhận diện định dạng và parse nội dung QR thành danh sách phiếu nhập.
     */
    public List<InventoryReceiptRequest> smartParseContent(String content) {
        log.info("Thử phát hiện tự động...");

        try {
            log.info("Thử parse JSON...");
            return parseJsonToReceipts(content);
        } catch (Exception e) {
            log.debug("Không phải JSON: {}", e.getMessage());
        }

        try {
            log.info("Thử parse CSV...");
            return parseCsvToReceipts(content);
        } catch (Exception e) {
            log.debug("Không phải CSV: {}", e.getMessage());
        }

        try {
            log.info("Thử parse Multi-line...");
            return parseMultiLineToReceipts(content);
        } catch (Exception e) {
            log.debug("Không phải Multi-line: {}", e.getMessage());
        }

        try {
            log.info("Thử parse Base64 JSON...");
            return handleBase64Content(content, "BASE64_JSON");
        } catch (Exception e) {
            log.debug("Không phải Base64 JSON: {}", e.getMessage());
        }

        try {
            log.info("Thử parse Base64 CSV...");
            return handleBase64Content(content, "BASE64_CSV");
        } catch (Exception e) {
            log.debug("Không phải Base64 CSV: {}", e.getMessage());
        }

        try {
            log.info("Thử parse Base64 Multi-line...");
            return handleBase64Content(content, "BASE64_MULTI_LINE");
        } catch (Exception e) {
            log.debug("Không phải Base64 Multi-line: {}", e.getMessage());
        }

        try {
            log.info("Thử parse URL...");
            return handleUrlContent(content);
        } catch (Exception e) {
            log.debug("Không phải URL: {}", e.getMessage());
        }

        throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
    }

    // =========================================================
    // Parse implementations
    // =========================================================

    public List<InventoryReceiptRequest> parseJsonToReceipts(String content) {
        try {
            String data = content.contains("|data:") ? content.split("\\|data:")[1] : content;
            data = data.trim();

            if (!data.startsWith("[")) {
                throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
            }

            JsonNode rootNode = objectMapper.readTree(data);
            List<InventoryReceiptRequest> requests = new ArrayList<>();

            for (JsonNode requestNode : rootNode) {
                InventoryReceiptRequest request = new InventoryReceiptRequest();
                request.setNote(requestNode.path("note").asText(null));

                List<InventoryReceiptDetailRequest> details = new ArrayList<>();
                for (JsonNode detailNode : requestNode.path("details")) {
                    details.add(InventoryReceiptDetailRequest.builder()
                            .productCode(detailNode.path("productCode").asText())
                            .quantity(detailNode.path("quantity").asInt())
                            .price(detailNode.path("price").asLong())
                            .manufacturedDate(parseDate(detailNode.path("manufacturedDate").asText(null)))
                            .expiryDate(parseDate(detailNode.path("expiryDate").asText(null)))
                            .build());
                }

                if (details.isEmpty()) {
                    throw new RuntimeException("Danh sách details trống trong JSON");
                }

                request.setDetails(details);
                request.setTotalAmount(calcTotal(details));
                requests.add(request);
            }

            log.info("Đã parse thành công {} phiếu nhập từ JSON", requests.size());
            return requests;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi phân tích JSON: " + e.getMessage());
        }
    }

    public List<InventoryReceiptRequest> parseCsvToReceipts(String content) {
        List<InventoryReceiptDetailRequest> details = new ArrayList<>();
        String note = null;
        String data = stripDataPrefix(content).trim();

        try {
            String[] lines = data.split("\n");
            int startIndex = 0;
            if (lines.length > 0) {
                String header = lines[0].trim().toLowerCase();
                if (header.contains("productcode") && header.contains("quantity") && header.contains("price")) {
                    startIndex = 1;
                    log.info("Phát hiện header, bỏ qua dòng đầu");
                }
            }

            for (int i = startIndex; i < lines.length; i++) {
                String line = lines[i].trim();
                if (line.isEmpty()) continue;

                String[] fields = line.split(",", 6);
                if (fields.length < 3) {
                    throw new RuntimeException("Dòng " + (i + 1) + " không đủ các trường bắt buộc");
                }

                try {
                    Date manufacturedDate = fields.length > 3 && !fields[3].trim().isEmpty()
                            ? parseDate(fields[3].trim()) : null;
                    Date expiryDate = fields.length > 4 && !fields[4].trim().isEmpty()
                            ? parseDate(fields[4].trim()) : null;
                    String noteValue = fields.length > 5 && !fields[5].trim().isEmpty()
                            ? fields[5].trim().replaceAll("^\"|\"$", "") : null;

                    details.add(InventoryReceiptDetailRequest.builder()
                            .productCode(fields[0].trim())
                            .quantity(Integer.parseInt(fields[1].trim()))
                            .price(Long.parseLong(fields[2].trim()))
                            .manufacturedDate(manufacturedDate)
                            .expiryDate(expiryDate)
                            .build());

                    if (note == null && noteValue != null) {
                        note = noteValue;
                    }
                    log.debug("Đã thêm detail cho phiếu nhập với productCode: {}", fields[0]);
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Lỗi phân tích giá trị số ở dòng " + (i + 1) + ": " + e.getMessage());
                }
            }

            if (details.isEmpty()) {
                throw new RuntimeException("Không có dữ liệu phiếu nhập hợp lệ trong CSV");
            }

            InventoryReceiptRequest request = InventoryReceiptRequest.builder()
                    .details(details)
                    .note(note)
                    .totalAmount(calcTotal(details))
                    .build();

            log.info("Đã parse thành công 1 phiếu nhập với {} sản phẩm từ CSV", details.size());
            return List.of(request);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi phân tích CSV: " + e.getMessage());
        }
    }

    public List<InventoryReceiptRequest> parseMultiLineToReceipts(String content) {
        List<InventoryReceiptDetailRequest> details = new ArrayList<>();
        String note = null;
        String data = stripDataPrefix(content).trim();

        String[] lines = data.split("\n");
        int startIndex = 0;
        if (lines.length > 0 && lines[0].toLowerCase().contains("productcode")) {
            startIndex = 1;
            log.info("Phát hiện header, bỏ qua dòng đầu");
        }

        for (int i = startIndex; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            Map<String, String> map = Arrays.stream(line.split(","))
                    .map(s -> s.split("=", 2))
                    .filter(arr -> arr.length == 2)
                    .collect(Collectors.toMap(arr -> arr[0].trim(), arr -> arr[1].trim()));

            if (map.isEmpty()
                    || !map.containsKey("productCode")
                    || !map.containsKey("quantity")
                    || !map.containsKey("price")) {
                throw new RuntimeException(
                        "Dòng " + (i + 1) + " không đủ các trường bắt buộc: productCode, quantity, price");
            }

            try {
                details.add(InventoryReceiptDetailRequest.builder()
                        .productCode(map.get("productCode"))
                        .quantity(Integer.parseInt(map.get("quantity")))
                        .price(Long.parseLong(map.get("price")))
                        .manufacturedDate(map.containsKey("manufacturedDate") ? parseDate(map.get("manufacturedDate")) : null)
                        .expiryDate(map.containsKey("expiryDate") ? parseDate(map.get("expiryDate")) : null)
                        .build());

                if (note == null && map.containsKey("note")) {
                    note = map.get("note");
                }
                log.debug("Đã thêm detail cho phiếu nhập với productCode: {}", map.get("productCode"));
            } catch (NumberFormatException e) {
                throw new RuntimeException("Lỗi phân tích giá trị số ở dòng " + (i + 1) + ": " + e.getMessage());
            }
        }

        if (details.isEmpty()) {
            throw new RuntimeException("Không có dữ liệu phiếu nhập hợp lệ trong Multi-line");
        }

        InventoryReceiptRequest request = InventoryReceiptRequest.builder()
                .details(details)
                .note(note)
                .totalAmount(calcTotal(details))
                .build();

        log.info("Đã parse thành công 1 phiếu nhập với {} sản phẩm từ Multi-line", details.size());
        return List.of(request);
    }

    // =========================================================
    // Private helpers
    // =========================================================

    private List<InventoryReceiptRequest> handleBase64Content(String content, String format) {
        try {
            String data = stripDataPrefix(content).trim();
            if (!isValidBase64(data)) {
                throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
            }
            String decoded = new String(Base64.getDecoder().decode(data));
            return switch (format.toUpperCase()) {
                case "BASE64_JSON"       -> parseJsonToReceipts(decoded);
                case "BASE64_CSV"        -> parseCsvToReceipts(decoded);
                case "BASE64_MULTI_LINE" -> parseMultiLineToReceipts(decoded);
                default -> throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
            };
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
        }
    }

    private List<InventoryReceiptRequest> handleUrlContent(String content) {
        try {
            String url = stripDataPrefix(content).trim();
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                throw new RuntimeException("Không phải URL hợp lệ");
            }
            String response = webClient.get().uri(url).retrieve().bodyToMono(String.class).block();
            if (response == null || response.isEmpty()) {
                throw new RuntimeException("Không nhận được phản hồi từ URL");
            }
            return smartParseContent(response);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi xử lý URL: " + e.getMessage());
        }
    }

    public Date parseDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty() || dateString.equalsIgnoreCase("null")) {
            return null;
        }
        String clean = dateString.trim();
        for (SimpleDateFormat fmt : DATE_FORMATS) {
            try {
                return fmt.parse(clean);
            } catch (ParseException ignored) {
                // Tiếp tục thử format tiếp theo
            }
        }
        log.warn("Không thể parse ngày: {}", dateString);
        return null;
    }

    private String stripDataPrefix(String content) {
        return content.contains("|data:") ? content.split("\\|data:")[1] : content;
    }

    private boolean isValidBase64(String str) {
        try {
            Base64.getDecoder().decode(str);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private long calcTotal(List<InventoryReceiptDetailRequest> details) {
        return details.stream().mapToLong(d -> d.getPrice() * d.getQuantity()).sum();
    }
}