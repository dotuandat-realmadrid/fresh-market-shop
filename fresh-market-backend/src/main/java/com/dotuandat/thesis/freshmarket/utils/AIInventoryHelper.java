package com.dotuandat.thesis.freshmarket.utils;

import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptDetailRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptRequest;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class AIInventoryHelper {

    private final ObjectMapper objectMapper;
    private final WebClient webClient;
    private final QRInventoryHelper qrInventoryHelper;

    @NonFinal
    @Value("${ai.gemini.apiKey}")
    private String geminiApiKey;

    @NonFinal
    @Value("${ai.gemini_3.1_flash_lite.apiUrl}")
//    @Value("${ai.gemini_2.5_flash_lite.apiUrl}")
//    @Value("${ai.gemini_2.5_flash.apiUrl}")
    private String geminiApiUrl;

    // =========================================================
    // Public API
    // =========================================================

    /**
     * Sinh dữ liệu phiếu nhập bằng Gemini AI.
     * Bỏ @Transactional để tránh giữ DB connection trong khi gọi AI.
     * Repository tự quản lý transaction riêng cho từng câu query.
     */
    public List<InventoryReceiptRequest> generateInventoryData(
            List<String> validProductCodes,
            Map<String, Long> productPriceMap,
            int quantity) {

        if (validProductCodes.isEmpty()) {
            throw new AppException(ErrorCode.PRODUCT_NOT_EXISTED);
        }

        String prompt = createDetailedPrompt(validProductCodes, productPriceMap, quantity);

        try {
            String aiResponse = callGeminiAPI(prompt).block();
            log.info("Phản hồi thô từ Gemini API: {}", aiResponse);

            assert aiResponse != null;
            String cleanedResponse = cleanResponse(aiResponse);
            log.info("Phản hồi đã làm sạch từ Gemini API: {}", cleanedResponse);

            List<InventoryReceiptRequest> requests = parseAIResponseToRequests(cleanedResponse);
            validateGeneratedRequests(requests, validProductCodes);

            log.info("Đã sinh {} phiếu nhập từ Gemini API", requests.size());
            return requests;
        } catch (Exception e) {
            log.error("Lỗi khi gọi Gemini API: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi gọi Gemini API: " + e.getMessage());
        }
    }

    // =========================================================
    // Private helpers
    // =========================================================

    /**
     * Tạo prompt chi tiết gửi cho Gemini.
     */
    private String createDetailedPrompt(List<String> validProductCodes, Map<String, Long> productPriceMap, int quantity) {
        String codeWithPrices = validProductCodes.stream()
                .map(code -> code + ": " + productPriceMap.getOrDefault(code, 0L) + " VND")
                .collect(Collectors.joining(", "));

        return "Bạn là hệ thống khởi tạo dữ liệu phiếu nhập kho chuyên nghiệp. Hãy tạo đúng " + quantity + " phiếu nhập dưới dạng mảng JSON.\n\n" +
                "=== DANH SÁCH MÃ SẢN PHẨM VÀ GIÁ (BẮT BUỘC) ===\n" +
                "[" + codeWithPrices + "]\n\n" +
                "=== QUY TẮC DỮ LIỆU ===\n" +
                "1. 'productCode': CHỈ ĐƯỢC CHỌN từ danh sách hợp lệ bên trên.\n" +
                "2. 'quantity': Số nguyên từ 1 đến 100.\n" +
                "3. 'price': PHẢI LẤY ĐÚNG GIÁ từ danh sách trên tương ứng với productCode đã chọn.\n" +
                "4. 'manufacturedDate': Định dạng 'dd/MM/yyyy'.\n" +
                "5. 'expiryDate': Định dạng 'dd/MM/yyyy' (sau ngày sản xuất ít nhất 30 ngày).\n" +
                "6. 'note': Ghi chú tiếng Việt thực tế.\n" +
                "7. 'totalAmount': PHẢI BẰNG (price * quantity).\n\n" +
                "=== ĐỊNH DẠNG ĐẦU RA ===\n" +
                "- Trả về duy nhất mảng JSON.\n" +
                "- Mỗi phiếu nhập chỉ chứa 1 đối tượng trong mảng 'details'.\n" +
                "- Ví dụ: [{\"totalAmount\":200000, \"note\":\"...\", \"details\":[{\"productCode\":\"ma-sp\", \"quantity\":10, \"price\":20000}]}]";
    }

    /**
     * Gọi Gemini API và trả về nội dung text từ response.
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

    /**
     * Parse chuỗi JSON từ AI thành danh sách InventoryReceiptRequest.
     */
    private List<InventoryReceiptRequest> parseAIResponseToRequests(String jsonResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
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
                            .manufacturedDate(qrInventoryHelper.parseDate(detailNode.path("manufacturedDate").asText(null)))
                            .expiryDate(qrInventoryHelper.parseDate(detailNode.path("expiryDate").asText(null)))
                            .build());
                }

                if (details.isEmpty()) {
                    throw new RuntimeException("Danh sách details trống trong AI response");
                }

                request.setDetails(details);
                request.setTotalAmount(details.stream().mapToLong(d -> d.getPrice() * d.getQuantity()).sum());
                requests.add(request);
            }

            return requests;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi parse AI response: " + e.getMessage());
        }
    }

    /**
     * Validate và tự động sửa dữ liệu phiếu nhập sinh từ AI.
     */
    private void validateGeneratedRequests(List<InventoryReceiptRequest> requests, List<String> validProductCodes) {
        if (requests == null || requests.isEmpty()) {
            throw new AppException(ErrorCode.INVENTORY_NOT_ENOUGH);
        }

        for (InventoryReceiptRequest request : requests) {
            if (request.getDetails() == null || request.getDetails().isEmpty()) {
                throw new AppException(ErrorCode.PRODUCT_NOT_EXISTED);
            }

            // Gán note mặc định nếu AI bỏ qua
            if (request.getNote() == null || request.getNote().trim().isEmpty()) {
                request.setNote("Phiếu nhập kho sinh tự động bằng AI");
            }

            long calculatedTotal = 0;
            for (InventoryReceiptDetailRequest detail : request.getDetails()) {
                if (detail.getProductCode() == null || !validProductCodes.contains(detail.getProductCode())) {
                    log.error("AI sinh sai mã sản phẩm: {}", detail.getProductCode());
                    throw new AppException(ErrorCode.PRODUCT_NOT_EXISTED);
                }
                if (detail.getManufacturedDate() != null && detail.getExpiryDate() != null
                        && detail.getManufacturedDate().after(detail.getExpiryDate())) {
                    log.error("Ngày sản xuất sau ngày hết hạn cho SP: {}", detail.getProductCode());
                    throw new AppException(ErrorCode.INVALID_FILE_EXCEL_FORMAT);
                }
                calculatedTotal += detail.getPrice() * detail.getQuantity();
            }

            // Ép tổng tiền theo tính toán thực tế để tránh sai lệch do AI tính nhẩm
            request.setTotalAmount(calculatedTotal);
        }
    }

    /**
     * Làm sạch phản hồi raw từ AI (xóa markdown code fences).
     */
    private String cleanResponse(String rawResponse) {
        String cleaned = rawResponse.trim();
        cleaned = cleaned.replaceAll("^```[a-zA-Z]*\\s*", "").replaceAll("\\s*```$", "");
        return cleaned.replaceAll("^[\\s\\n]+", "").replaceAll("[\\s\\n]+$", "");
    }
}