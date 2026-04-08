package com.dotuandat.thesis.freshmarket.utils;

import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductCreateRequest;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.fasterxml.jackson.core.type.TypeReference;
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
public class AIProdHelper {

    private final ObjectMapper objectMapper;
    private final WebClient webClient;

    @NonFinal
    @Value("${ai.gemini.apiKey}")
    private String geminiApiKey;

    @NonFinal
    @Value("${ai.gemini_3.1_flash_lite.apiUrl}")
//    @Value("${ai.gemini_2.5_flash_lite.apiUrl}")
//    @Value("${ai.gemini_2.5_flash.apiUrl}")
    private String geminiApiUrl;

    // ==================== ENTRY POINT ====================

    public List<ProductCreateRequest> generateProducts(
            int quantity,
            List<String> validCategoryCodes,
            List<String> validSupplierCodes) {

        if (validCategoryCodes.isEmpty() || validSupplierCodes.isEmpty()) {
            throw new RuntimeException("Không có danh mục hoặc nhà cung cấp hợp lệ trong cơ sở dữ liệu");
        }

        try {
            String prompt = buildPrompt(validCategoryCodes, validSupplierCodes, quantity);
            String raw = callGeminiAPI(prompt).block();
            log.info("Phản hồi thô từ Gemini API: {}", raw);

            String cleaned = cleanResponse(raw);
            log.info("Phản hồi đã làm sạch: {}", cleaned);

            List<Map<String, Object>> rawList =
                    objectMapper.readValue(cleaned, new TypeReference<List<Map<String, Object>>>() {});

            List<ProductCreateRequest> requests = rawList.stream()
                    .map(map -> ProductCreateRequest.builder()
                            .categoryCodes(parseCategoryCodes(map))
                            .supplierCode((String) map.getOrDefault("supplierCode", ""))
                            .code((String) map.getOrDefault("code", ""))
                            .name((String) map.getOrDefault("name", ""))
                            .branch((String) map.getOrDefault("branch", ""))
                            .description((String) map.getOrDefault("description", ""))
                            .price(map.containsKey("price") ? Long.parseLong(map.get("price").toString()) : 0L)
                            .build())
                    .collect(Collectors.toList());

            validate(requests, validCategoryCodes, validSupplierCodes);
            log.info("Đã sinh {} sản phẩm từ Gemini API", requests.size());

            return requests.subList(0, Math.min(quantity, requests.size()));

        } catch (Exception e) {
            log.error("Lỗi khi gọi Gemini API: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi gọi Gemini API: " + e.getMessage());
        }
    }

    // ==================== PROMPT ====================

    private String buildPrompt(List<String> validCategoryCodes, List<String> validSupplierCodes, int quantity) {
        return "Bạn là hệ thống sinh dữ liệu sản phẩm thực phẩm/hàng tiêu dùng. Tạo đúng " + quantity + " sản phẩm dạng JSON array.\n\n" +
                "DANH SÁCH CATEGORY CODES HỢP LỆ:\n[" + String.join(", ", validCategoryCodes) + "]\n\n" +
                "DANH SÁCH SUPPLIER CODES HỢP LỆ:\n[" + String.join(", ", validSupplierCodes) + "]\n\n" +
                "QUY TẮC TUYỆT ĐỐI:\n" +
                "- categoryCodes: PHẢI lấy từ danh sách CATEGORY CODES ở trên\n" +
                "- supplierCode: PHẢI lấy từ danh sách SUPPLIER CODES ở trên\n" +
                "- code: chữ thường, không dấu, dùng gạch ngang, ví dụ: \"tao-do-uc\"\n" +
                "- name: tên sản phẩm tiếng Việt, ví dụ: \"Táo Đỏ Úc\"\n" +
                "- branch: PHẢI là một trong: \"Việt Nam\", \"Hàn Quốc\", \"Anh\", \"Hà Lan\", \"Úc\", \"Mỹ\", \"Nhật Bản\", \"Thái Lan\", \"New Zealand\", \"Pháp\", \"Ý\"\n" +
                "- price: giá thị trường VNĐ, số nguyên\n" +
                "- description: mô tả ngắn 20-30 từ tiếng Việt\n\n" +
                "CHỈ trả về JSON array hợp lệ, không markdown, không giải thích.\n" +
                "Ví dụ:\n[{" +
                "\"categoryCodes\":[\"" + validCategoryCodes.get(0) + "\"]," +
                "\"supplierCode\":\"" + validSupplierCodes.get(0) + "\"," +
                "\"code\":\"tao-do-uc\",\"name\":\"Táo Đỏ Úc\",\"branch\":\"Úc\"," +
                "\"price\":85000,\"description\":\"Táo đỏ nhập khẩu từ Úc, vị ngọt giòn tự nhiên.\"" +
                "}]";
    }

    // ==================== GEMINI API ====================

    private Mono<String> callGeminiAPI(String prompt) {
        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
        body.put("generationConfig", Map.of(
                "maxOutputTokens", 40000,
                "temperature", 0.1,
                "response_mime_type", "application/json"
        ));

        return webClient.post()
                .uri(geminiApiUrl + "?key=" + geminiApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .flatMap(raw -> {
                    try {
                        JsonNode root = objectMapper.readTree(raw);
                        String text = root.path("candidates").get(0)
                                .path("content").path("parts").get(0)
                                .path("text").asText();
                        return Mono.just(text);
                    } catch (Exception e) {
                        return Mono.error(new RuntimeException("Lỗi parse phản hồi Gemini: " + e.getMessage()));
                    }
                });
    }

    // ==================== PRIVATE UTILS ====================

    private String cleanResponse(String raw) {
        return raw.trim()
                .replaceAll("^```[a-zA-Z]*\\s*", "")
                .replaceAll("\\s*```$", "")
                .strip();
    }

    private void validate(List<ProductCreateRequest> requests,
                          List<String> validCategoryCodes,
                          List<String> validSupplierCodes) {
        for (ProductCreateRequest r : requests) {
            if (r.getCategoryCodes() == null || r.getCategoryCodes().isEmpty()
                    || !validCategoryCodes.containsAll(r.getCategoryCodes())) {
                log.error("Mã danh mục không hợp lệ từ AI: {}", r.getCategoryCodes());
                throw new AppException(ErrorCode.CATEGORY_NOT_EXISTED);
            }
            if (!validSupplierCodes.contains(r.getSupplierCode())) {
                log.error("Mã nhà cung cấp không hợp lệ từ AI: {}", r.getSupplierCode());
                throw new AppException(ErrorCode.SUPPLIER_NOT_EXISTED);
            }
        }
    }

    private List<String> parseCategoryCodes(Map<String, Object> map) {
        Object raw = map.get("categoryCodes");
        if (raw instanceof List) {
            return ((List<?>) raw).stream().map(Object::toString).map(String::trim)
                    .filter(s -> !s.isEmpty()).collect(Collectors.toCollection(ArrayList::new));
        } else if (raw instanceof String) {
            return Arrays.stream(((String) raw).split(",")).map(String::trim)
                    .filter(s -> !s.isEmpty()).collect(Collectors.toCollection(ArrayList::new));
        }
        return new ArrayList<>();
    }
}
