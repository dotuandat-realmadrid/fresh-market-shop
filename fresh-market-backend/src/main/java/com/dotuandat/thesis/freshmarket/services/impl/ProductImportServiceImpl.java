package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
import com.dotuandat.thesis.freshmarket.entities.Product;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.CategoryRepository;
import com.dotuandat.thesis.freshmarket.repositories.ProductRepository;
import com.dotuandat.thesis.freshmarket.repositories.SupplierRepository;
import com.dotuandat.thesis.freshmarket.services.ProductImportService;
import com.dotuandat.thesis.freshmarket.services.ProductService;
import com.dotuandat.thesis.freshmarket.utils.ExcelProdHelper;
import com.dotuandat.thesis.freshmarket.utils.PdfProdHelper;
import com.dotuandat.thesis.freshmarket.utils.QRProdHelper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.util.Pair;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.io.StringReader;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductImportServiceImpl implements ProductImportService {

    ProductService productService;
    ProductRepository productRepository;
    CategoryRepository categoryRepository;
    SupplierRepository supplierRepository;
    QRProdHelper qrProdHelper;
    ObjectMapper objectMapper;
    ExcelProdHelper excelProdHelper;
    PdfProdHelper pdfProdHelper;
    WebClient webClient;

    @NonFinal
    @Value("${ai.gemini.apiKey}")
    private String geminiApiKey;

    @NonFinal
    @Value("${ai.gemini_3.1_flash_lite.apiUrl}")
//    @Value("${ai.gemini_2.5_flash_lite.apiUrl}")
//    @Value("${ai.gemini_2.5_flash.apiUrl}")
    private String geminiApiUrl;

    /**
     * Parse categoryCodes từ map JSON, chỉ dùng key "categoryCodes", hỗ trợ:
     * - "categoryCodes": ["rau-cu", "thuc-pham"]  -> List trực tiếp
     * - "categoryCodes": "rau-cu, thuc-pham"       -> split String bằng dấu ,
     */
    private List<String> parseCategoryCodesFromMap(Map<String, Object> map) {
        Object raw = map.get("categoryCodes");

        if (raw instanceof List) {
            return ((List<?>) raw).stream()
                    .map(Object::toString)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toCollection(ArrayList::new));
        } else if (raw instanceof String) {
            return Arrays.stream(((String) raw).split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toCollection(ArrayList::new));
        }
        return new ArrayList<>();
    }

    /**
     * Import Excel có hình ảnh
     */
    @Override
    @Async
    public void importCreateFromExcel(MultipartFile file) {
        List<Pair<ProductCreateRequest, List<String>>> requests = excelProdHelper.parseCreateExcel(file);

        for (Pair<ProductCreateRequest, List<String>> pair : requests) {
            ProductCreateRequest request = pair.getFirst();
            List<String> imagePaths = pair.getSecond();

            try {
                ProductResponse createdProductResponse = productService.create(request);

                Product product = productRepository
                        .findById(createdProductResponse.getId())
                        .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_EXISTED));

                if (product.getImages() == null) {
                    product.setImages(new ArrayList<>());
                    productRepository.save(product);
                }

                if (!imagePaths.isEmpty()) {
                    productService.saveProductImages(createdProductResponse.getId(), imagePaths);
                }

                log.info("Thêm sản phẩm {} thành công!", request.getCode());
            } catch (AppException e) {
                log.error(
                        "Lỗi khi thêm sản phẩm {}: {}",
                        request.getCode(),
                        e.getErrorCode().getMessage());
            }
        }
    }

    /*
     * Hàm móc tạo/thêm sản phẩm
     */
    @Async
    public void asyncCreate(ProductCreateRequest request) {
        try {
            productService.create(request);
            log.info("Thêm sản phẩm {} thành công!", request.getCode());
        } catch (AppException e) {
            log.error(
                    "Lỗi khi thêm sản phẩm {}: {}",
                    request.getCode(),
                    e.getErrorCode().getMessage());
        }
    }

    /*
     * Import update Excel
     */
    @Override
    @Async
    public void importUpdateFromExcel(MultipartFile file) {
        List<Pair<String, ProductUpdateRequest>> requests = excelProdHelper.parseUpdateExcel(file);
        for (Pair<String, ProductUpdateRequest> pair : requests) {
            String code = pair.getFirst();
            ProductUpdateRequest request = pair.getSecond();
            asyncUpdate(code, request);
        }
    }

    /*
     * Hàm móc cập nhật sản phẩm
     */
    @Async
    public void asyncUpdate(String code, ProductUpdateRequest request) {
        try {
            productService.updateImport(code, request);
            log.info("Cập nhật sản phẩm {} thành công!", code);
        } catch (AppException e) {
            log.error("Lỗi khi cập nhật sản phẩm {}: {}", code, e.getErrorCode().getMessage());
        }
    }

    /*
     * Import QR
     */
    @Override
    @Async
    public void importCreateFromQR(MultipartFile file, String qrContent, String source) {
        try {
            List<ProductCreateRequest> requests = parseQRContent(file, qrContent, source, "create");
            for (ProductCreateRequest request : requests) {
                asyncCreate(request);
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi import QR: " + e.getMessage());
        }
    }

    /*
     * Import update QR
     */
    @Override
    @Async
    public void importUpdateFromQR(MultipartFile file, String qrContent, String source) {
        try {
            List<Pair<String, ProductUpdateRequest>> requests = parseQRContent(file, qrContent, source, "update");
            for (Pair<String, ProductUpdateRequest> pair : requests) {
                String code = pair.getFirst();
                ProductUpdateRequest request = pair.getSecond();
                asyncUpdate(code, request);
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi import QR: " + e.getMessage());
        }
    }

    /*
     * Đọc dữ liệu từ QR
     */
    @SuppressWarnings("unchecked")
    private <T> List<T> parseQRContent(MultipartFile file, String qrContent, String source, String action) {
        String contentToProcess = qrContent != null && !qrContent.isEmpty() ? qrContent : "";

        if (file != null && !file.isEmpty()) {
            try {
                contentToProcess = qrProdHelper.readQRFromImage(file);
                log.info("Đọc nội dung QR từ file: {}", contentToProcess);
            } catch (Exception e) {
                throw new RuntimeException("Không thể đọc nội dung mã QR từ file: " + e.getMessage());
            }
        }

        if (contentToProcess == null || contentToProcess.isEmpty()) {
            throw new RuntimeException("Nội dung mã QR trống");
        }

        log.info("Nội dung QR đầy đủ: {}", contentToProcess);

        if ("create".equalsIgnoreCase(action)) {
            List<ProductCreateRequest> products = smartParseContent(contentToProcess, action);
            log.info("Đã parse thành công {} sản phẩm", products.size());
            return (List<T>) products;
        } else {
            List<Pair<String, ProductUpdateRequest>> updateProducts = smartParseContent(contentToProcess, action);
            log.info("Đã parse thành công {} sản phẩm cập nhật", updateProducts.size());
            return (List<T>) updateProducts;
        }
    }

    /*
     * Kiểm tra định dạng QR (format)
     */
    private <T> List<T> smartParseContent(String content, String action) {
        log.info("Thử phát hiện tự động...");

        try {
            log.info("Thử parse JSON...");
            return parseJsonToProducts(content, action);
        } catch (Exception e) {
            log.debug("Không phải JSON: {}", e.getMessage());
        }

        try {
            log.info("Thử parse CSV...");
            return parseCsvToProducts(content, action);
        } catch (Exception e) {
            log.debug("Không phải CSV: {}", e.getMessage());
        }

        try {
            log.info("Thử parse Multi-line...");
            return parseMultiLineToProducts(content, action);
        } catch (Exception e) {
            log.debug("Không phải Multi-line: {}", e.getMessage());
        }

        try {
            log.info("Thử parse Base64 JSON...");
            return handleBase64Content(content, "BASE64_JSON", action);
        } catch (Exception e) {
            log.debug("Không phải Base64 JSON: {}", e.getMessage());
        }

        try {
            log.info("Thử parse Base64 CSV...");
            return handleBase64Content(content, "BASE64_CSV", action);
        } catch (Exception e) {
            log.debug("Không phải Base64 CSV: {}", e.getMessage());
        }

        try {
            log.info("Thử parse Base64 Multi-line...");
            return handleBase64Content(content, "BASE64_MULTI_LINE", action);
        } catch (Exception e) {
            log.debug("Không phải Base64 Multi-line: {}", e.getMessage());
        }

        try {
            log.info("Thử parse URL...");
            return handleUrlContent(content, action);
        } catch (Exception e) {
            log.debug("Không phải URL: {}", e.getMessage());
        }

        throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
    }

    /*
     * Đọc QR bằng Json — chỉ dùng key "categoryCodes"
     */
    @SuppressWarnings("unchecked")
    private <T> List<T> parseJsonToProducts(String content, String action) {
        try {
            String data = content.contains("|data:") ? content.split("\\|data:")[1] : content;
            data = data.trim();

            if (!data.startsWith("[") && !data.startsWith("{")) {
                throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
            }

            List<Map<String, Object>> rawList =
                    objectMapper.readValue(data, new TypeReference<List<Map<String, Object>>>() {});

            if ("create".equalsIgnoreCase(action)) {
                List<ProductCreateRequest> createRequests = rawList.stream()
                        .map(map -> ProductCreateRequest.builder()
                                .categoryCodes(parseCategoryCodesFromMap(map))
                                .supplierCode((String) map.getOrDefault("supplierCode", ""))
                                .code((String) map.getOrDefault("code", ""))
                                .name((String) map.getOrDefault("name", ""))
                                .branch((String) map.getOrDefault("branch", ""))
                                .description((String) map.getOrDefault("description", ""))
                                .price(map.containsKey("price")
                                        ? Long.parseLong(map.get("price").toString()) : 0L)
                                .build())
                        .collect(Collectors.toList());
                return (List<T>) createRequests;
            } else {
                List<Pair<String, ProductUpdateRequest>> updateRequests = rawList.stream()
                        .map(map -> {
                            String code = (String) map.get("code");
                            if (code == null || code.trim().isEmpty()) {
                                throw new RuntimeException("Mã sản phẩm không được để trống");
                            }
                            ProductUpdateRequest request = ProductUpdateRequest.builder()
                                    .categoryCodes(parseCategoryCodesFromMap(map))
                                    .supplierCode((String) map.getOrDefault("supplierCode", ""))
                                    .name((String) map.getOrDefault("name", ""))
                                    .branch((String) map.getOrDefault("branch", ""))
                                    .description((String) map.getOrDefault("description", ""))
                                    .price(map.containsKey("price")
                                            ? Long.parseLong(map.get("price").toString()) : 0L)
                                    .discountId((String) map.getOrDefault("discountId", null))
                                    .build();
                            return Pair.of(code, request);
                        })
                        .collect(Collectors.toList());
                return (List<T>) updateRequests;
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi phân tích JSON: " + e.getMessage());
        }
    }

    /*
     * Đọc QR bằng CSV
     * Cột 0: categoryCodes, nhiều category phân cách bằng |
     * Create: categoryCodes, supplierCode, code, name, branch, description, price
     * Update: categoryCodes, supplierCode, code, name, branch, description, price, discountId
     */
    @SuppressWarnings("unchecked")
    private <T> List<T> parseCsvToProducts(String content, String action) {
        List<T> requests = new ArrayList<>();
        String data = content.contains("|data:") ? content.split("\\|data:")[1] : content;
        data = data.trim();

        if (!data.contains(",") || data.contains("{") || data.contains("[")) {
            throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
        }

        try (CSVReader csvReader = new CSVReader(new StringReader(data))) {
            List<String[]> lines = csvReader.readAll();
            if (lines.isEmpty()) {
                throw new RuntimeException("Không có dữ liệu trong CSV");
            }

            log.info("Tổng số dòng CSV: {}", lines.size());

            boolean hasHeader = false;
            String[] firstLine = lines.get(0);
            if (firstLine.length > 0
                    && (firstLine[0].toLowerCase().contains("category")
                    || firstLine[0].toLowerCase().contains("supplier")
                    || firstLine[0].toLowerCase().contains("code"))) {
                hasHeader = true;
                log.info("Phát hiện header, bỏ qua dòng đầu");
            }

            int startIndex = hasHeader ? 1 : 0;

            for (int i = startIndex; i < lines.size(); i++) {
                String[] fields = lines.get(i);

                if ("create".equalsIgnoreCase(action)) {
                    if (fields.length >= 7) {
                        try {
                            List<String> categoryCodes = Arrays.stream(fields[0].trim().split("\\|"))
                                    .map(String::trim)
                                    .filter(s -> !s.isEmpty())
                                    .collect(Collectors.toCollection(ArrayList::new));
                            ProductCreateRequest request = ProductCreateRequest.builder()
                                    .categoryCodes(categoryCodes)
                                    .supplierCode(fields[1].trim())
                                    .code(fields[2].trim())
                                    .name(fields[3].trim())
                                    .branch(fields[4].trim())
                                    .description(fields[5].trim())
                                    .price(Long.parseLong(fields[6].trim()))
                                    .build();
                            requests.add((T) request);
                            log.debug("Đã tạo request cho sản phẩm: {}", request.getCode());
                        } catch (NumberFormatException e) {
                            throw new RuntimeException(
                                    "Lỗi phân tích giá trị price thành số ở dòng " + i + ": " + e.getMessage());
                        }
                    } else {
                        throw new RuntimeException("Dòng " + i + " không đủ 7 cột: " + String.join(",", fields));
                    }
                } else {
                    if (fields.length >= 8) {
                        try {
                            String code = fields[2].trim();
                            if (code.isEmpty()) {
                                throw new RuntimeException("Mã sản phẩm không được để trống ở dòng " + i);
                            }
                            List<String> categoryCodes = Arrays.stream(fields[0].trim().split("\\|"))
                                    .map(String::trim)
                                    .filter(s -> !s.isEmpty())
                                    .collect(Collectors.toCollection(ArrayList::new));
                            ProductUpdateRequest request = ProductUpdateRequest.builder()
                                    .categoryCodes(categoryCodes)
                                    .supplierCode(fields[1].trim())
                                    .name(fields[3].trim())
                                    .branch(fields[4].trim())
                                    .description(fields[5].trim())
                                    .price(Long.parseLong(fields[6].trim()))
                                    .discountId(fields[7].trim().isEmpty() ? null : fields[7].trim())
                                    .build();
                            requests.add((T) Pair.of(code, request));
                            log.debug("Đã tạo request cập nhật cho sản phẩm: {}", code);
                        } catch (NumberFormatException e) {
                            throw new RuntimeException(
                                    "Lỗi phân tích giá trị price thành số ở dòng " + i + ": " + e.getMessage());
                        }
                    } else {
                        throw new RuntimeException("Dòng " + i + " không đủ 8 cột: " + String.join(",", fields));
                    }
                }
            }

            if (requests.isEmpty()) {
                throw new RuntimeException("Không có dữ liệu sản phẩm hợp lệ trong CSV");
            }

            log.info("Đã parse thành công {} sản phẩm từ CSV", requests.size());

        } catch (IOException | CsvException e) {
            throw new RuntimeException("Lỗi phân tích CSV: " + e.getMessage());
        }

        return requests;
    }

    /*
     * Đọc QR bằng Multi-line
     * Key "categoryCodes" phân cách bằng |
     */
    @SuppressWarnings("unchecked")
    private <T> List<T> parseMultiLineToProducts(String content, String action) {
        List<T> requests = new ArrayList<>();
        String data = content.contains("|data:") ? content.split("\\|data:")[1] : content;
        data = data.trim();

        if (!data.contains("=") || !data.contains("\n")) {
            throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
        }

        String[] lines = data.split("\n");
        for (String line : lines) {
            if (line == null || line.trim().isEmpty()) continue;

            Map<String, String> map = Arrays.stream(line.split(","))
                    .map(s -> s.split("=", 2))
                    .filter(arr -> arr.length == 2)
                    .collect(Collectors.toMap(arr -> arr[0].trim(), arr -> arr[1].trim()));

            if (map.isEmpty()) continue;

            // Chỉ dùng key "categoryCodes", phân cách bằng |
            String rawCategoryCodes = map.getOrDefault("categoryCodes", "");
            List<String> categoryCodes = Arrays.stream(rawCategoryCodes.split("\\|"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toCollection(ArrayList::new));

            if ("create".equalsIgnoreCase(action)) {
                ProductCreateRequest request = ProductCreateRequest.builder()
                        .code(map.getOrDefault("code", ""))
                        .categoryCodes(categoryCodes)
                        .supplierCode(map.getOrDefault("supplierCode", ""))
                        .name(map.getOrDefault("name", ""))
                        .branch(map.getOrDefault("branch", ""))
                        .description(map.getOrDefault("description", ""))
                        .price(map.containsKey("price")
                                ? Long.parseLong(map.get("price").trim()) : 0L)
                        .build();
                requests.add((T) request);
            } else {
                String code = map.getOrDefault("code", "");
                if (code.isEmpty()) {
                    throw new RuntimeException("Mã sản phẩm không được để trống");
                }
                ProductUpdateRequest request = ProductUpdateRequest.builder()
                        .categoryCodes(categoryCodes)
                        .supplierCode(map.getOrDefault("supplierCode", ""))
                        .name(map.getOrDefault("name", ""))
                        .branch(map.getOrDefault("branch", ""))
                        .description(map.getOrDefault("description", ""))
                        .price(map.containsKey("price")
                                ? Long.parseLong(map.get("price").trim()) : 0L)
                        .discountId(map.getOrDefault("discountId", null))
                        .build();
                requests.add((T) Pair.of(code, request));
            }
        }

        if (requests.isEmpty()) {
            throw new RuntimeException("Không có dữ liệu sản phẩm hợp lệ trong Multi-line");
        }

        return requests;
    }

    /*
     * Đọc QR bằng base64 (Json, Csv, Multi-line)
     */
    private <T> List<T> handleBase64Content(String content, String format, String action) {
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
                    return parseJsonToProducts(decodedContent, action);
                case "BASE64_CSV":
                    return parseCsvToProducts(decodedContent, action);
                case "BASE64_MULTI_LINE":
                    return parseMultiLineToProducts(decodedContent, action);
                default:
                    throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
            }
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
        }
    }

    /*
     * Đọc QR bằng Url
     */
    @SuppressWarnings("unchecked")
    private <T> List<T> handleUrlContent(String content, String action) {
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

            return (List<T>) smartParseContent(response, action);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi xử lý URL: " + e.getMessage());
        }
    }

    /*
     * Kiểm tra base64
     */
    private boolean isValidBase64(String str) {
        try {
            Base64.getDecoder().decode(str);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /*
     * Import AI
     */
    @Override
    @Async
    public void importCreateByAI(int quantity) {
        if (quantity < 1 || quantity > 50) {
            throw new AppException(ErrorCode.MIN_QUANTITY);
        }

        try {
            List<ProductCreateRequest> requests = generateProductDataByAI(quantity);
            for (ProductCreateRequest request : requests) {
                asyncCreate(request);
            }
            log.info("Đã sinh và tạo {} sản phẩm thành công bằng AI", quantity);
        } catch (Exception e) {
            log.error("Lỗi khi sinh sản phẩm bằng AI: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi sinh sản phẩm bằng AI: " + e.getMessage());
        }
    }

    /*
     * Sinh dữ liệu bằng AI (chỉ dùng Gemini)
     */
    private List<ProductCreateRequest> generateProductDataByAI(int quantity) {
        List<String> validCategoryCodes = categoryRepository.findAllCategoryCodes();
        List<String> validSupplierCodes = supplierRepository.findAllSupplierCodes();

        if (validCategoryCodes.isEmpty() || validSupplierCodes.isEmpty()) {
            throw new RuntimeException("Không có danh mục hoặc nhà cung cấp hợp lệ trong cơ sở dữ liệu");
        }

        List<ProductCreateRequest> requests = new ArrayList<>();
        String prompt = createDetailedPrompt(validCategoryCodes, validSupplierCodes, quantity);

        try {
            String aiResponse = callGeminiAPI(prompt).block();
            log.info("Phản hồi thô từ Gemini API: {}", aiResponse);

            String cleanedResponse = cleanResponse(aiResponse);
            log.info("Phản hồi đã làm sạch từ Gemini API: {}", cleanedResponse);

            List<Map<String, Object>> rawList =
                    objectMapper.readValue(cleanedResponse, new TypeReference<List<Map<String, Object>>>() {});

            List<ProductCreateRequest> apiRequestsList = rawList.stream()
                    .map(map -> ProductCreateRequest.builder()
                            .categoryCodes(parseCategoryCodesFromMap(map))
                            .supplierCode((String) map.getOrDefault("supplierCode", ""))
                            .code((String) map.getOrDefault("code", ""))
                            .name((String) map.getOrDefault("name", ""))
                            .branch((String) map.getOrDefault("branch", ""))
                            .description((String) map.getOrDefault("description", ""))
                            .price(map.containsKey("price")
                                    ? Long.parseLong(map.get("price").toString()) : 0L)
                            .build())
                    .collect(Collectors.toList());

            validateAIGeneratedData(apiRequestsList, validCategoryCodes, validSupplierCodes);
            requests.addAll(apiRequestsList);

            log.info("Đã sinh {} sản phẩm từ Gemini API", apiRequestsList.size());
        } catch (Exception e) {
            log.error("Lỗi khi gọi Gemini API: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi gọi Gemini API: " + e.getMessage());
        }

        if (requests.isEmpty()) {
            throw new RuntimeException("Không thể sinh dữ liệu sản phẩm từ Gemini API");
        }

        return requests.subList(0, Math.min(quantity, requests.size()));
    }

    /*
     * Tạo prompt chi tiết
     */
    private String createDetailedPrompt(List<String> validCategoryCodes, List<String> validSupplierCodes, int quantity) {
        String categories = String.join(", ", validCategoryCodes);
        String suppliers = String.join(", ", validSupplierCodes);

        return "Bạn là hệ thống sinh dữ liệu sản phẩm thực phẩm/hàng tiêu dùng. Tạo đúng " + quantity + " sản phẩm dạng JSON array.\n\n" +
                "DANH SÁCH CATEGORY CODES HỢP LỆ (chỉ được dùng đúng các giá trị này):\n" +
                "[" + categories + "]\n\n" +
                "DANH SÁCH SUPPLIER CODES HỢP LỆ (chỉ được dùng đúng các giá trị này):\n" +
                "[" + suppliers + "]\n\n" +
                "QUY TẮC TUYỆT ĐỐI:\n" +
                "- categoryCodes: PHẢI lấy từ danh sách CATEGORY CODES ở trên, KHÔNG được tự tạo\n" +
                "- supplierCode: PHẢI lấy từ danh sách SUPPLIER CODES ở trên, KHÔNG được tự tạo\n" +
                "- code: chữ thường, không dấu, dùng dấu gạch ngang, ví dụ: \"tao-do-uc\"\n" +
                "- name: tên sản phẩm tiếng Việt, có thể kèm xuất xứ, ví dụ: \"Táo Đỏ Úc\"\n" +
                "- branch: thương hiệu/xuất xứ của sản phẩm, PHẢI là một trong các giá trị sau: \"Việt Nam\", \"Hàn Quốc\", \"Anh\", \"Hà Lan\", \"Úc\", \"Mỹ\", \"Nhật Bản\", \"Thái Lan\", \"New Zealand\", \"Pháp\", \"Ý\" — chọn phù hợp với loại sản phẩm\n" +
                "- price: giá thị trường VNĐ, số nguyên, không có dấu phẩy\n" +
                "- description: mô tả ngắn 20-30 từ tiếng Việt\n\n" +
                "CHỈ trả về JSON array hợp lệ, không markdown, không giải thích.\n" +
                "Ví dụ 1 phần tử:\n" +
                "[{" +
                "\"categoryCodes\":[\"" + validCategoryCodes.get(0) + "\"]," +
                "\"supplierCode\":\"" + validSupplierCodes.get(0) + "\"," +
                "\"code\":\"tao-do-uc\"," +
                "\"name\":\"Táo Đỏ Úc\"," +
                "\"branch\":\"Úc\"," +
                "\"price\":85000," +
                "\"description\":\"Táo đỏ nhập khẩu từ Úc, vị ngọt giòn tự nhiên, giàu vitamin và chất xơ tốt cho sức khỏe.\"" +
                "}]";
    }

    /*
     * Gọi Gemini API
     */
    private Mono<String> callGeminiAPI(String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
        requestBody.put("generationConfig", Map.of(
                "maxOutputTokens", 40000,
                "temperature", 0.1,
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
     * Xác thực dữ liệu sinh từ AI
     */
    private void validateAIGeneratedData(
            List<ProductCreateRequest> requests,
            List<String> validCategoryCodes,
            List<String> validSupplierCodes) {
        for (ProductCreateRequest request : requests) {
            if (request.getCategoryCodes() == null || request.getCategoryCodes().isEmpty()
                    || !validCategoryCodes.containsAll(request.getCategoryCodes())) {
                log.error("Mã danh mục không hợp lệ từ AI: {}", request.getCategoryCodes());
                throw new AppException(ErrorCode.CATEGORY_NOT_EXISTED);
            }
            if (!validSupplierCodes.contains(request.getSupplierCode())) {
                log.error("Mã nhà cung cấp không hợp lệ từ AI: {}", request.getSupplierCode());
                throw new AppException(ErrorCode.SUPPLIER_NOT_EXISTED);
            }
        }
    }

    /*
     * Import Pdf tạo mới
     */
    @Override
    @Async
    public void importCreateFromPdf(MultipartFile file) {
        try {
            List<Pair<ProductCreateRequest, List<String>>> requests =
                    pdfProdHelper.readProductsForCreateFromPdf(file.getInputStream());
            for (Pair<ProductCreateRequest, List<String>> pair : requests) {
                ProductCreateRequest request = pair.getFirst();
                List<String> imagePaths = pair.getSecond();
                try {
                    ProductResponse createdProductResponse = productService.create(request);
                    Product product = productRepository
                            .findById(createdProductResponse.getId())
                            .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_EXISTED));
                    if (product.getImages() == null) {
                        product.setImages(new ArrayList<>());
                        productRepository.save(product);
                    }
                    if (!imagePaths.isEmpty()) {
                        productService.saveProductImages(createdProductResponse.getId(), imagePaths);
                    }
                    log.info("Thêm sản phẩm {} thành công với {} hình ảnh!", request.getCode(), imagePaths.size());
                } catch (AppException e) {
                    log.error(
                            "Lỗi khi thêm sản phẩm {}: {}",
                            request.getCode(),
                            e.getErrorCode().getMessage());
                }
            }
        } catch (IOException e) {
            log.error("Lỗi khi import PDF: {}", e.getMessage());
            throw new RuntimeException("Lỗi import PDF: " + e.getMessage());
        }
    }

    /*
     * Import Pdf cập nhật
     */
    @Override
    @Async
    public void importUpdateFromPdf(MultipartFile file) {
        try {
            List<Pair<String, ProductUpdateRequest>> requests =
                    pdfProdHelper.readProductsForUpdateFromPdf(file.getInputStream());
            for (Pair<String, ProductUpdateRequest> pair : requests) {
                String code = pair.getFirst();
                ProductUpdateRequest request = pair.getSecond();
                asyncUpdate(code, request);
            }
        } catch (IOException e) {
            log.error("Lỗi khi import PDF: {}", e.getMessage());
            throw new RuntimeException("Lỗi import PDF: " + e.getMessage());
        }
    }
}