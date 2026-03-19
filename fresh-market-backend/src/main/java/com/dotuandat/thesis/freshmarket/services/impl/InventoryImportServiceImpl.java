package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptDetailRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptRequest;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.ProductRepository;
import com.dotuandat.thesis.freshmarket.services.InventoryImportService;
import com.dotuandat.thesis.freshmarket.services.InventoryReceiptService;
import com.dotuandat.thesis.freshmarket.utils.ExcelInventoryHelper;
import com.dotuandat.thesis.freshmarket.utils.PdfInventoryHelper;
import com.dotuandat.thesis.freshmarket.utils.QRInventoryHelper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class InventoryImportServiceImpl implements InventoryImportService {

    InventoryReceiptService inventoryReceiptService;
    ProductRepository productRepository;
    QRInventoryHelper qrInvHelper;
    ObjectMapper objectMapper;
    ExcelInventoryHelper excelInventoryHelper;
    PdfInventoryHelper pdfInventoryHelper;
    WebClient webClient;

    @NonFinal
    @Value("${ai.gemini.apiKey}")
    private String geminiApiKey;

    @NonFinal
    @Value("${ai.gemini.apiUrl}")
    private String geminiApiUrl;

    @Override
    @Async
    public void importFromExcel(MultipartFile file) {
        InventoryReceiptRequest request = excelInventoryHelper.parseExcel(file);
        asyncCreate(request);
    }

    @Override
    @Async
    public void importFromPdf(MultipartFile file) {
        InventoryReceiptRequest request = pdfInventoryHelper.parsePdf(file);
        asyncCreate(request);
    }

    @Override
    @Async
    public void importFromQR(MultipartFile file, String qrContent, String source) {
        try {
            List<InventoryReceiptRequest> requests = parseQRContent(file, qrContent, source);
            for (InventoryReceiptRequest request : requests) {
                asyncCreate(request);
            }
        } catch (Exception e) {
            log.error("Lỗi import QR: {}", e.getMessage());
            throw new RuntimeException("Lỗi import QR: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void importFromAI(int quantity) {
        if (quantity < 1 || quantity > 100) {
            throw new AppException(ErrorCode.MIN_QUANTITY);
        }

        try {
            List<InventoryReceiptRequest> requests = generateInventoryDataByAI(quantity);
            for (InventoryReceiptRequest request : requests) {
                asyncCreate(request);
            }
            log.info("Đã sinh và tạo {} phiếu nhập thành công", quantity);
        } catch (Exception e) {
            log.error("Lỗi khi sinh phiếu nhập bằng AI: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi sinh phiếu nhập bằng AI: " + e.getMessage());
        }
    }

    /*
     * Hàm móc tạo phiếu nhập kho
     */
    @Async
    private void asyncCreate(InventoryReceiptRequest request) {
        try {
            validateReceiptRequest(request);
            inventoryReceiptService.create(request);
            log.info(
                    "Thêm phiếu nhập kho với productCode {} thành công!",
                    request.getDetails().get(0).getProductCode());
        } catch (AppException e) {
            log.error(
                    "Lỗi khi thêm phiếu nhập kho với productCode {}: {}",
                    request.getDetails().get(0).getProductCode(),
                    e.getErrorCode().getMessage());
        }
    }

    /*
     * Validate phiếu nhập kho
     */
    private void validateReceiptRequest(InventoryReceiptRequest request) {
        if (request.getDetails() == null || request.getDetails().isEmpty()) {
            throw new AppException(ErrorCode.PRODUCT_NOT_EXISTED);
        }
        if (request.getTotalAmount() == null || request.getTotalAmount() < 1) {
            throw new AppException(ErrorCode.MIN_QUANTITY);
        }
        List<String> validProductCodes = productRepository.findAll().stream()
                .map(product -> product.getCode())
                .collect(Collectors.toList());
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

    private List<InventoryReceiptRequest> parseQRContent(MultipartFile file, String qrContent, String source) {
        String contentToProcess = qrContent != null && !qrContent.isEmpty() ? qrContent : "";

        if (file != null && !file.isEmpty()) {
            try {
                contentToProcess = qrInvHelper.readQRFromImage(file);
                log.info("Đọc nội dung QR từ file: {}", contentToProcess);
            } catch (Exception e) {
                throw new RuntimeException("Không thể đọc nội dung mã QR từ file: " + e.getMessage());
            }
        }

        if (contentToProcess.isEmpty()) {
            throw new RuntimeException("Nội dung mã QR trống");
        }

        log.info("Nội dung QR đầy đủ: {}", contentToProcess);

        List<InventoryReceiptRequest> receipts = smartParseContent(contentToProcess);
        log.info("Đã parse thành công {} phiếu nhập", receipts.size());
        return receipts;
    }

    private List<InventoryReceiptRequest> smartParseContent(String content) {
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

    private List<InventoryReceiptRequest> parseJsonToReceipts(String content) {
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
                JsonNode detailsArray = requestNode.path("details");

                for (JsonNode detailNode : detailsArray) {
                    InventoryReceiptDetailRequest detail = InventoryReceiptDetailRequest.builder()
                            .productCode(detailNode.path("productCode").asText())
                            .quantity(detailNode.path("quantity").asInt())
                            .price(detailNode.path("price").asLong())
                            .manufacturedDate(parseJsonDate(
                                    detailNode.path("manufacturedDate").asText(null)))
                            .expiryDate(parseJsonDate(
                                    detailNode.path("expiryDate").asText(null)))
                            .build();
                    details.add(detail);
                }

                if (details.isEmpty()) {
                    throw new RuntimeException("Danh sách details trống trong JSON");
                }

                request.setDetails(details);

                long calculatedTotal = details.stream()
                        .mapToLong(detail -> detail.getPrice() * detail.getQuantity())
                        .sum();
                request.setTotalAmount(calculatedTotal);

                requests.add(request);
            }

            log.info("Đã parse thành công {} phiếu nhập từ JSON", requests.size());
            return requests;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi phân tích JSON: " + e.getMessage());
        }
    }

    private List<InventoryReceiptRequest> parseCsvToReceipts(String content) {
        List<InventoryReceiptDetailRequest> details = new ArrayList<>();
        String note = null;
        String data = content.contains("|data:") ? content.split("\\|data:")[1] : content;
        data = data.trim();

        try {
            String[] lines = data.split("\n");
            boolean hasHeader = false;
            if (lines.length > 0) {
                String headerLine = lines[0].trim().toLowerCase();
                if (headerLine.contains("productcode")
                        && headerLine.contains("quantity")
                        && headerLine.contains("price")) {
                    hasHeader = true;
                    log.info("Phát hiện header, bỏ qua dòng đầu");
                }
            }

            int startIndex = hasHeader ? 1 : 0;

            for (int i = startIndex; i < lines.length; i++) {
                String line = lines[i].trim();
                if (line.isEmpty()) continue;

                String[] fields = line.split(",", 6);
                if (fields.length < 3) {
                    throw new RuntimeException("Dòng " + (i + 1) + " không đủ các trường bắt buộc");
                }

                try {
                    Date manufacturedDate = null;
                    Date expiryDate = null;
                    String noteValue = null;

                    if (fields.length > 3 && !fields[3].trim().isEmpty()) {
                        manufacturedDate = parseQRDate(fields[3].trim());
                    }
                    if (fields.length > 4 && !fields[4].trim().isEmpty()) {
                        expiryDate = parseQRDate(fields[4].trim());
                    }
                    if (fields.length > 5 && !fields[5].trim().isEmpty()) {
                        noteValue = fields[5].trim().replaceAll("^\"|\"$", "");
                    }

                    InventoryReceiptDetailRequest detail = InventoryReceiptDetailRequest.builder()
                            .productCode(fields[0].trim())
                            .quantity(Integer.parseInt(fields[1].trim()))
                            .price(Long.parseLong(fields[2].trim()))
                            .manufacturedDate(manufacturedDate)
                            .expiryDate(expiryDate)
                            .build();
                    details.add(detail);

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

            long totalAmount = details.stream()
                    .mapToLong(detail -> detail.getQuantity() * detail.getPrice())
                    .sum();

            InventoryReceiptRequest request = InventoryReceiptRequest.builder()
                    .details(details)
                    .note(note)
                    .totalAmount(totalAmount)
                    .build();

            log.info("Đã parse thành công 1 phiếu nhập với {} sản phẩm từ CSV", details.size());
            return List.of(request);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi phân tích CSV: " + e.getMessage());
        }
    }

    private List<InventoryReceiptRequest> parseMultiLineToReceipts(String content) {
        List<InventoryReceiptDetailRequest> details = new ArrayList<>();
        String note = null;
        String data = content.contains("|data:") ? content.split("\\|data:")[1] : content;
        data = data.trim();

        String[] lines = data.split("\n");
        boolean hasHeader = false;
        if (lines.length > 0 && lines[0].toLowerCase().contains("productcode")) {
            hasHeader = true;
            log.info("Phát hiện header, bỏ qua dòng đầu");
        }

        int startIndex = hasHeader ? 1 : 0;

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
                Date manufacturedDate = null;
                Date expiryDate = null;

                if (map.containsKey("manufacturedDate")) {
                    manufacturedDate = parseQRDate(map.get("manufacturedDate"));
                }
                if (map.containsKey("expiryDate")) {
                    expiryDate = parseQRDate(map.get("expiryDate"));
                }

                InventoryReceiptDetailRequest detail = InventoryReceiptDetailRequest.builder()
                        .productCode(map.get("productCode"))
                        .quantity(Integer.parseInt(map.get("quantity")))
                        .price(Long.parseLong(map.get("price")))
                        .manufacturedDate(manufacturedDate)
                        .expiryDate(expiryDate)
                        .build();
                details.add(detail);

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

        long totalAmount = details.stream()
                .mapToLong(detail -> detail.getQuantity() * detail.getPrice())
                .sum();

        InventoryReceiptRequest request = InventoryReceiptRequest.builder()
                .details(details)
                .note(note)
                .totalAmount(totalAmount)
                .build();

        log.info("Đã parse thành công 1 phiếu nhập với {} sản phẩm từ Multi-line", details.size());
        return List.of(request);
    }

    private Date parseJsonDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty() || dateString.equalsIgnoreCase("null")) {
            return null;
        }
        return parseQRDate(dateString.trim());
    }

    private Date parseQRDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }

        String cleanDate = dateString.trim();

        for (SimpleDateFormat format : DATE_FORMATS) {
            try {
                return format.parse(cleanDate);
            } catch (ParseException ignored) {
                // Tiếp tục thử format tiếp theo
            }
        }

        log.warn("Không thể parse ngày: {}", dateString);
        return null;
    }

    private List<InventoryReceiptRequest> handleBase64Content(String content, String format) {
        try {
            String data = content.contains("|data:") ? content.split("\\|data:")[1] : content;
            data = data.trim();

            if (!isValidBase64(data)) {
                throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
            }

            byte[] decoded = Base64.getDecoder().decode(data);
            String decodedContent = new String(decoded);

            switch (format.toUpperCase()) {
                case "BASE64_JSON":
                    return parseJsonToReceipts(decodedContent);
                case "BASE64_CSV":
                    return parseCsvToReceipts(decodedContent);
                case "BASE64_MULTI_LINE":
                    return parseMultiLineToReceipts(decodedContent);
                default:
                    throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
            }
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
        }
    }

    private List<InventoryReceiptRequest> handleUrlContent(String content) {
        try {
            String url = content.contains("|data:") ? content.split("\\|data:")[1] : content;
            url = url.trim();

            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                throw new RuntimeException("Không phải URL hợp lệ");
            }

            String response =
                    webClient.get().uri(url).retrieve().bodyToMono(String.class).block();

            if (response == null || response.isEmpty()) {
                throw new RuntimeException("Không nhận được phản hồi từ URL");
            }

            return smartParseContent(response);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi xử lý URL: " + e.getMessage());
        }
    }

    private boolean isValidBase64(String str) {
        try {
            Base64.getDecoder().decode(str);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /*
     * Sinh dữ liệu phiếu nhập bằng AI (chỉ dùng Gemini)
     * Bỏ @Transactional để tránh giữ DB connection trong khi gọi AI
     * Repository tự quản lý transaction riêng cho từng câu query
     */
    private List<InventoryReceiptRequest> generateInventoryDataByAI(int quantity) {
        // Query tự mở/đóng transaction → connection trả về pool ngay
        List<String> validProductCodes = productRepository.findAllProductCodes();

        if (validProductCodes.isEmpty()) {
            throw new AppException(ErrorCode.PRODUCT_NOT_EXISTED);
        }

        // Từ đây không còn giữ connection, gọi AI thoải mái
        List<InventoryReceiptRequest> requests = new ArrayList<>();
        String prompt = createDetailedPrompt(validProductCodes, quantity);

        try {
            String aiResponse = callGeminiAPI(prompt).block();
            log.info("Phản hồi thô từ Gemini API: {}", aiResponse);

            String cleanedResponse = cleanResponse(aiResponse);
            log.info("Phản hồi đã làm sạch từ Gemini API: {}", cleanedResponse);

            List<InventoryReceiptRequest> apiRequestsList = parseAIResponseToRequests(cleanedResponse);
            validateGeneratedRequests(apiRequestsList, validProductCodes);
            requests.addAll(apiRequestsList);

            log.info("Đã sinh {} phiếu nhập từ Gemini API", apiRequestsList.size());
        } catch (Exception e) {
            log.error("Lỗi khi gọi Gemini API: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi gọi Gemini API: " + e.getMessage());
        }

        if (requests.isEmpty()) {
            throw new RuntimeException("Không thể sinh dữ liệu phiếu nhập từ Gemini API");
        }

        if (requests.size() < quantity) {
            throw new RuntimeException("Gemini không sinh đủ số lượng phiếu nhập yêu cầu: " + quantity);
        }

        return requests.subList(0, quantity);
    }

    private List<InventoryReceiptRequest> parseAIResponseToRequests(String jsonResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            List<InventoryReceiptRequest> requests = new ArrayList<>();

            for (JsonNode requestNode : rootNode) {
                InventoryReceiptRequest request = new InventoryReceiptRequest();
                request.setNote(requestNode.path("note").asText(null));

                List<InventoryReceiptDetailRequest> details = new ArrayList<>();
                JsonNode detailsArray = requestNode.path("details");

                for (JsonNode detailNode : detailsArray) {
                    Date manufacturedDate =
                            parseAIDate(detailNode.path("manufacturedDate").asText(null));
                    Date expiryDate = parseAIDate(detailNode.path("expiryDate").asText(null));

                    InventoryReceiptDetailRequest detail = InventoryReceiptDetailRequest.builder()
                            .productCode(detailNode.path("productCode").asText())
                            .quantity(detailNode.path("quantity").asInt())
                            .price(detailNode.path("price").asLong())
                            .manufacturedDate(manufacturedDate)
                            .expiryDate(expiryDate)
                            .build();
                    details.add(detail);
                }

                if (details.isEmpty()) {
                    throw new RuntimeException("Danh sách details trống trong AI response");
                }

                request.setDetails(details);

                long calculatedTotal = details.stream()
                        .mapToLong(detail -> detail.getPrice() * detail.getQuantity())
                        .sum();
                request.setTotalAmount(calculatedTotal);

                requests.add(request);
            }

            return requests;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi parse AI response: " + e.getMessage());
        }
    }

    private Date parseAIDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty() || dateString.equalsIgnoreCase("null")) {
            return null;
        }
        return parseQRDate(dateString.trim());
    }

    /*
     * Tạo prompt chi tiết
     */
    private String createDetailedPrompt(List<String> validProductCodes, int quantity) {
        String codes = String.join(", ", validProductCodes);

        return "Bạn là hệ thống khởi tạo dữ liệu phiếu nhập kho chuyên nghiệp. Hãy tạo đúng " + quantity + " phiếu nhập dưới dạng mảng JSON.\n\n" +
                "=== DANH SÁCH MÃ SẢN PHẨM HỢP LỆ (BẮT BUỘC) ===\n" +
                "[" + codes + "]\n\n" +
                "=== QUY TẮC DỮ LIỆU ===\n" +
                "1. 'productCode': CHỈ ĐƯỢC CHỌN từ danh sách hợp lệ bên trên. Tuyệt đối không tự sinh mã mới.\n" +
                "2. 'quantity': Số nguyên từ 1 đến 100.\n" +
                "3. 'price': Số nguyên từ 10.000 đến 1.000.000 (VND).\n" +
                "4. 'manufacturedDate': Định dạng 'dd/MM/yyyy' (Ngày trong quá khứ hoặc hiện tại).\n" +
                "5. 'expiryDate': Định dạng 'dd/MM/yyyy' (Ngày trong tương lai, sau ngày sản xuất ít nhất 30 ngày).\n" +
                "6. 'note': Ghi chú tiếng Việt thực tế (ví dụ: 'Nhập hàng rau củ tươi sáng thứ 2', 'Bổ sung kho hàng khô').\n" +
                "7. 'totalAmount': PHẢI BẰNG (price * quantity).\n\n" +
                "=== ĐỊNH DẠNG ĐẦU RA ===\n" +
                "- Trả về duy nhất mảng JSON.\n" +
                "- Mỗi phiếu nhập chỉ chứa 1 đối tượng trong mảng 'details'.\n" +
                "- Ví dụ: [{\"totalAmount\":200000, \"note\":\"...\", \"details\":[{\"productCode\":\"ma-sp\", \"quantity\":10, \"price\":20000}]}]";
    }

    /*
     * Gọi Gemini API
     */
    private Mono<String> callGeminiAPI(String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));

        requestBody.put("generationConfig", Map.of(
                "maxOutputTokens", 40000,
                "temperature", 0.1, // Rất thấp để đảm bảo tính chính xác
                "response_mime_type", "application/json"
        ));

        return webClient.post()
                .uri(geminiApiUrl + "?key=" + geminiApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .flatMap(body -> {
                    try {
                        JsonNode root = objectMapper.readTree(body);
                        String content = root.path("candidates")
                                .get(0)
                                .path("content")
                                .path("parts")
                                .get(0)
                                .path("text")
                                .asText();
                        return Mono.just(content);
                    } catch (Exception e) {
                        return Mono.error(new RuntimeException("Lỗi parse phản hồi từ Gemini: " + e.getMessage()));
                    }
                });
    }

    /*
     * Làm sạch phản hồi từ AI
     */
    private String cleanResponse(String rawResponse) {
        String cleaned = rawResponse.trim();
        cleaned = cleaned.replaceAll("^```[a-zA-Z]*\\s*", "").replaceAll("\\s*```$", "");
        cleaned = cleaned.replaceAll("^[\\s\\n]+", "").replaceAll("[\\s\\n]+$", "");
        return cleaned;
    }

    /*
     * Validate phiếu nhập sinh từ AI
     */
    private void validateGeneratedRequests(List<InventoryReceiptRequest> requests, List<String> validProductCodes) {
        if (requests == null || requests.isEmpty()) {
            throw new AppException(ErrorCode.INVENTORY_NOT_ENOUGH);
        }

        for (InventoryReceiptRequest request : requests) {
            if (request.getDetails() == null || request.getDetails().isEmpty()) {
                throw new AppException(ErrorCode.PRODUCT_NOT_EXISTED);
            }

            // 1. Kiểm tra Note
            if (request.getNote() == null || request.getNote().trim().isEmpty()) {
                request.setNote("Phiếu nhập kho sinh tự động bằng AI"); // Gán mặc định nếu AI quên
            }

            long calculatedTotal = 0;
            for (InventoryReceiptDetailRequest detail : request.getDetails()) {
                // 2. Kiểm tra mã sản phẩm (Quan trọng nhất)
                if (detail.getProductCode() == null || !validProductCodes.contains(detail.getProductCode())) {
                    log.error("AI sinh sai mã sản phẩm: {}", detail.getProductCode());
                    throw new AppException(ErrorCode.PRODUCT_NOT_EXISTED);
                }

                // 3. Kiểm tra ngày sản xuất và hạn sử dụng
                if (detail.getManufacturedDate() != null && detail.getExpiryDate() != null) {
                    if (detail.getManufacturedDate().after(detail.getExpiryDate())) {
                        log.error("Ngày sản xuất sau ngày hết hạn cho SP: {}", detail.getProductCode());
                        throw new AppException(ErrorCode.INVALID_FILE_EXCEL_FORMAT);
                    }
                }

                calculatedTotal += (detail.getPrice() * detail.getQuantity());
            }

            // 4. Ép tổng tiền theo tính toán thực tế (để tránh sai lệch 1 vài đồng do AI tính nhẩm)
            request.setTotalAmount(calculatedTotal);
        }
    }

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
}