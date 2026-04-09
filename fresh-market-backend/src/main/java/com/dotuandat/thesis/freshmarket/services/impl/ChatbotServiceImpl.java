package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.converters.ProductConverter;
import com.dotuandat.thesis.freshmarket.dtos.request.chatbot.ChatbotRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.chatbot.ChatbotResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
import com.dotuandat.thesis.freshmarket.entities.Category;
import com.dotuandat.thesis.freshmarket.entities.Product;
import com.dotuandat.thesis.freshmarket.repositories.CategoryRepository;
import com.dotuandat.thesis.freshmarket.repositories.ProductRepository;
import com.dotuandat.thesis.freshmarket.services.ChatbotService;
import com.dotuandat.thesis.freshmarket.specifications.ProductSpecification;
import com.dotuandat.thesis.freshmarket.utils.AIChatbotHelper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

    AIChatbotHelper aiChatbotHelper;
    CategoryRepository categoryRepository;
    ProductRepository productRepository;
    ProductConverter productConverter;

    private static final int MAX_PRODUCTS = 10;

    @Override
    @Transactional(readOnly = true)
    public ChatbotResponse chat(ChatbotRequest request) {
        // 1. Lấy tất cả categories cho AI ánh xạ
        List<Category> allCategories = categoryRepository.findAllByIsActive(
                StatusConstant.ACTIVE, Sort.by(Sort.Direction.ASC, "name"));

        List<String> allCategoryNames = allCategories.stream()
                .map(Category::getName).distinct().toList();

        // 2. Gọi AI phân tích intent
        Map<String, Object> intent = aiChatbotHelper.analyzeIntent(
                request.getMessage(), request.getHistory(), allCategoryNames);
        log.info("[Chatbot] Intent: {}", intent);

        String intentType = (String) intent.getOrDefault("intent", "UNKNOWN");
        String reply = (String) intent.getOrDefault("reply", "Xin lỗi, tôi không hiểu câu hỏi của bạn.");

        // 3. Không phải hỏi về sản phẩm → chỉ trả lời text
        if (!"PRODUCT_QUERY".equals(intentType)) {
            return ChatbotResponse.builder()
                    .reply(reply)
                    .products(List.of())
                    .build();
        }

        // 4. Ánh xạ tên category → tất cả codes (đệ quy con cấp 2, 3)
        @SuppressWarnings("unchecked")
        List<String> categoryNames = (List<String>) intent.getOrDefault("categoryNames", List.of());
        List<String> categoryCodes = resolveCategoryCodes(categoryNames, allCategories);
        log.info("[Chatbot] Category codes: {}", categoryCodes);

        // 5. Lấy filter
        Object rawKeywords = intent.get("keywords");
        String keywords = (rawKeywords != null) ? rawKeywords.toString().trim() : "";
        Long minPrice = parseLong(intent.get("minPrice"));
        Long maxPrice = parseLong(intent.get("maxPrice"));

        Object rawSort = intent.get("sort");
        String sort = (rawSort != null) ? rawSort.toString() : "NEWEST";
        
        Integer limit = null;
        if (intent.get("limit") instanceof Number num) {
            limit = num.intValue();
        }

        Specification<Product> searchCriteria;
        if (!keywords.isEmpty()) {
            searchCriteria = ProductSpecification.withName(keywords);
        } else {
            searchCriteria = ProductSpecification.withCategoryCodes(categoryCodes.isEmpty() ? null : categoryCodes);
        }

        // 6. Query sản phẩm
        Specification<Product> spec = Specification
                .where(searchCriteria)
                .and(ProductSpecification.withMinPrice(minPrice))
                .and(ProductSpecification.withMaxPrice(maxPrice))
                .and(ProductSpecification.withIsActive(StatusConstant.ACTIVE));

        if ("BEST_SELLER".equals(sort)) {
            spec = spec.and((root, query, criteriaBuilder) -> 
                    criteriaBuilder.greaterThan(root.get("soldQuantity"), 0));
        }

        PageRequest pageable = buildPageable(sort, limit);
        List<ProductResponse> products = productRepository.findAll(spec, pageable)
                .getContent().stream().map(productConverter::toResponse).toList();

        log.info("[Chatbot] Found {} products", products.size());

        String finalReply = reply;
        if (products.isEmpty()) {
            finalReply = (String) intent.getOrDefault("noResultReply", 
                "Xin lỗi, hiện tại Bich Thuy Market không tìm thấy sản phẩm phù hợp. Bạn thử tìm với từ khóa khác nhé!");
        }

        return ChatbotResponse.builder()
                .reply(finalReply)
                .products(products)
                .build();
    }

    // ==================== HELPERS ====================

    /**
     * Ánh xạ danh sách tên category từ AI → tập hợp codes bao gồm cả con cháu.
     */
    private List<String> resolveCategoryCodes(List<String> categoryNames, List<Category> allCategories) {
        if (categoryNames.isEmpty()) return List.of();

        Set<String> codeSet = new LinkedHashSet<>();
        for (Category c : allCategories) {
            boolean matched = categoryNames.stream().anyMatch(name ->
                    c.getName().toLowerCase().contains(name.toLowerCase())
                    || name.toLowerCase().contains(c.getName().toLowerCase()));
            if (matched) collectAllDescendantCodes(c, codeSet);
        }
        return new ArrayList<>(codeSet);
    }

    /** Đệ quy thu thập code của category + tất cả con cháu (cấp 2, 3, ...). */
    private void collectAllDescendantCodes(Category category, Set<String> codeSet) {
        if (category == null || codeSet.contains(category.getCode())) return;
        codeSet.add(category.getCode());
        if (category.getChildren() != null) {
            category.getChildren().forEach(child -> collectAllDescendantCodes(child, codeSet));
        }
    }

    private PageRequest buildPageable(String sort, Integer customLimit) {
        int limit = (customLimit != null && customLimit > 0) ? customLimit : MAX_PRODUCTS;
        if ("BEST_SELLER".equals(sort)) {
            limit = 5;
        }
        return switch (sort) {
            case "CHEAPEST"       -> PageRequest.of(0, limit, Sort.by(Sort.Direction.ASC,  "price"));
            case "MOST_EXPENSIVE" -> PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "price"));
            case "BEST_RATED"     -> PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "avgRating"));
            case "BEST_SELLER"    -> PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "soldQuantity"));
            default               -> PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdDate"));
        };
    }

    private Long parseLong(Object value) {
        if (value == null) return null;
        try { return Long.parseLong(value.toString()); }
        catch (NumberFormatException e) { return null; }
    }
}
