package com.dotuandat.thesis.freshmarket.utils;

import com.dotuandat.thesis.freshmarket.dtos.request.chatbot.ChatbotRequest;
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

/**
 * Helper gọi Gemini API để phân tích ngữ nghĩa câu hỏi của chatbot sản phẩm.
 * Trả về JSON structured intent bao gồm:
 *   - intent: PRODUCT_QUERY | GREETING | UNKNOWN
 *   - reply: câu trả lời văn bản
 *   - categoryNames: danh sách tên category mà user đề cập (để map sang codes)
 *   - keywords: từ khóa tên sản phẩm
 *   - minPrice / maxPrice: khoảng giá (nếu có)
 *   - sort: BEST_SELLER | CHEAPEST | NEWEST (mặc định NEWEST)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AIChatbotHelper {

    private final ObjectMapper objectMapper;
    private final WebClient webClient;

    @NonFinal
    @Value("${ai.gemini.apiKey}")
    private String geminiApiKey;

    @NonFinal
    @Value("${ai.gemini_3.1_flash_lite.apiUrl}")
    private String geminiApiUrl;

    // ==================== PUBLIC ENTRY POINT ====================

    /**
     * Phân tích intent của câu hỏi người dùng.
     *
     * @param message          câu hỏi hiện tại
     * @param history          lịch sử hội thoại (có thể null)
     * @param allCategoryNames tên đầy đủ của tất cả categories trong DB (để AI ánh xạ)
     * @return Map chứa structured intent
     */
    public Map<String, Object> analyzeIntent(
            String message,
            List<ChatbotRequest.ChatbotHistory> history,
            List<String> allCategoryNames) {

        try {
            String systemPrompt = buildSystemPrompt(allCategoryNames);
            String raw = callGeminiWithHistory(systemPrompt, message, history).block();
            log.info("[Chatbot] Raw Gemini response: {}", raw);

            String cleaned = cleanResponse(raw);
            log.info("[Chatbot] Cleaned Gemini response: {}", cleaned);

            @SuppressWarnings("unchecked")
            Map<String, Object> result = objectMapper.readValue(cleaned, Map.class);
            return result;

        } catch (Exception e) {
            log.error("[Chatbot] Lỗi phân tích intent: {}", e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("intent", "UNKNOWN");
            fallback.put("reply", "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể hỏi về sản phẩm, giá cả hoặc danh mục hàng hóa.");
            return fallback;
        }
    }

    // ==================== SYSTEM PROMPT ====================

    private String buildSystemPrompt(List<String> allCategoryNames) {
        String categoriesJson = String.join(", ", allCategoryNames
                .stream()
                .map(n -> "\"" + n + "\"")
                .toList());

        return """
                Bạn là trợ lý AI của cửa hàng thực phẩm "Bich Thuy Market".
                Phân tích tin nhắn khách hàng và trả về JSON theo đúng cấu trúc sau.

                DANH SÁCH CATEGORY:
                [%s]

                JSON schema:
                {
                  "intent": "PRODUCT_QUERY" | "GREETING" | "INFO",
                  "reply": "<Câu trả lời linh hoạt khi CÓ sản phẩm>",
                  "noResultReply": "<Câu trả lời tự nhiên, lịch sự khi KHÔNG tìm thấy sản phẩm/danh mục khách yêu cầu>",
                  "categoryNames": ["<tên category trong danh sách trên, [] nếu không đề cập>"],
                  "keywords": "<chỉ ghi TÊN SẢN PHẨM CỤ THỂ (vd: táo, nho xanh, thịt bò). TUYỆT ĐỐI KHÔNG ghi các từ như 'bán chạy', 'giá rẻ', 'mới nhất', hoặc từ nhóm chung vào đây. Trống nếu không có>",
                  "minPrice": <số nguyên VNĐ hoặc null>,
                  "maxPrice": <số nguyên VNĐ hoặc null>,
                  "sort": "NEWEST" | "CHEAPEST" | "MOST_EXPENSIVE" | "BEST_RATED" | "BEST_SELLER",
                  "limit": <số lượng cần lấy, mặc định null nếu không nói rõ>
                }

                QUY TẮC:
                - intent = PRODUCT_QUERY nếu hỏi mua sản phẩm/danh mục/giá/bán chạy.
                - ĐẶC BIỆT CHÚ Ý: Các mẫu câu hỏi như "có sản phẩm [X] không?", "có bán sản phẩm [X] không?", "có bán [X] không?" mang ý nghĩa xem cửa hàng có [X] không. Bạn phải đặt intent = PRODUCT_QUERY. Nếu [X] là tên một danh mục trong DANH SÁCH CATEGORY, thêm [X] vào `categoryNames` và để trống `keywords`. Nếu [X] là tên cụ thể không có trong DANH SÁCH CATEGORY (như táo, thịt bò), trích xuất [X] làm `keywords`.
                - intent = INFO nếu hỏi về số lượng sản phẩm/số loại sản phẩm, hoặc liệt kê danh mục.
                - intent = GREETING nếu chào hỏi.
                - categoryNames: TUYỆT ĐỐI KHÔNG chọn danh mục "Sản phẩm bán chạy" hay các cụm từ tương tự khi khách hỏi "bán chạy nhất". Câu hỏi "bán chạy" phải được hiểu là thuộc trường "sort": "BEST_SELLER" và categoryNames=[] (trừ khi khách nói rõ nhánh như "trái cây bán chạy").
                - Quy tắc cho thuộc tính `reply` (khi tìm thấy sản phẩm): BẮT BUỘC phải tuân theo format sau:
                  + Nếu intent = INFO: CHỈ ĐẾM TỔNG SỐ LƯỢNG các danh mục có trong danh sách và trả lời cực ngắn gọn. Ví dụ: "Bich Thuy Market hiện có phân phối khoảng N loại sản phẩm khác nhau!" (N là con số, không liệt kê chữ).
                  + Nếu khách hỏi top/sản phẩm bán chạy: "Dưới đây là các sản phẩm bán chạy nhất tại Bich Thuy Market!".
                  + Nếu khách hỏi danh mục chung chung: "Bich Thuy Market có bán rất nhiều loại <tên danh mục>".
                  + Nếu khách tìm tên sản phẩm cụ thể: "Bich Thuy Market có bán <tên sản phẩm>".
                  + Nếu câu hỏi có kèm khoảng giá, gắn thêm giá: "... dưới 500k!", "... từ 50k đến 100k!".
                - Quy tắc cho `noResultReply` (khi KHÔNG tìm thấy sản phẩm):
                  + Phải tự nhiên, lịch sự và nhắc lại đúng tên sản phẩm/danh mục khách tìm nhưng không có.
                  + Ví dụ: "Rất tiếc, hiện tại Bich Thuy Market chưa có sản phẩm trái cây mà bạn đang tìm kiếm. Bạn có muốn tham khảo các nhóm hàng khác không?", "Bich Thuy Market xin lỗi, hiện tại chúng mình chưa kinh doanh thịt cừu. Bạn thử tìm loại thịt khác xem sao nhé!".
                - CHỈ trả về JSON thuần, không markdown.
                """.formatted(categoriesJson);
    }

    // ==================== GEMINI API (với lịch sử hội thoại) ====================

    private Mono<String> callGeminiWithHistory(
            String systemPrompt,
            String userMessage,
            List<ChatbotRequest.ChatbotHistory> history) {

        List<Map<String, Object>> contents = new ArrayList<>();

        // System instruction
        Map<String, Object> systemContent = new HashMap<>();
        systemContent.put("role", "user");
        systemContent.put("parts", List.of(Map.of("text", systemPrompt)));
        contents.add(systemContent);

        // Thêm lịch sử hội thoại (nếu có)
        if (history != null && !history.isEmpty()) {
            for (ChatbotRequest.ChatbotHistory h : history) {
                Map<String, Object> historyContent = new HashMap<>();
                historyContent.put("role", h.getRole()); // "user" hoặc "model"
                historyContent.put("parts", List.of(Map.of("text", h.getText())));
                contents.add(historyContent);
            }
        }

        // Tin nhắn hiện tại
        Map<String, Object> currentContent = new HashMap<>();
        currentContent.put("role", "user");
        currentContent.put("parts", List.of(Map.of("text", userMessage)));
        contents.add(currentContent);

        Map<String, Object> body = new HashMap<>();
        body.put("contents", contents);
        body.put("generationConfig", Map.of(
                "maxOutputTokens", 2000,
                "temperature", 0.2,
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

    // ==================== UTILS ====================

    private String cleanResponse(String raw) {
        return raw.trim()
                .replaceAll("^```[a-zA-Z]*\\s*", "")
                .replaceAll("\\s*```$", "")
                .strip();
    }
}
