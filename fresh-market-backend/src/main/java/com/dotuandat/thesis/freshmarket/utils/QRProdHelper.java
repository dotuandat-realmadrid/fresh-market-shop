package com.dotuandat.thesis.freshmarket.utils;

import boofcv.alg.fiducial.qrcode.QrCode;
import boofcv.factory.fiducial.FactoryFiducial;
import boofcv.io.image.ConvertBufferedImage;
import boofcv.struct.image.GrayU8;
import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductUpdateRequest;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.StringReader;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class QRProdHelper {

    private final ObjectMapper objectMapper;
    private final WebClient webClient;

    // ==================== ĐỌC QR TỪ ẢNH ====================

    public String readQRFromImage(MultipartFile file) {
        try {
            BufferedImage bufferedImage = ImageIO.read(file.getInputStream());
            GrayU8 gray = ConvertBufferedImage.convertFrom(bufferedImage, (GrayU8) null);
            boofcv.abst.fiducial.QrCodeDetector<GrayU8> detector = FactoryFiducial.qrcode(null, GrayU8.class);
            detector.process(gray);
            List<QrCode> detections = detector.getDetections();
            if (!detections.isEmpty() && detections.get(0).message != null) {
                return detections.get(0).message;
            }
            return null;
        } catch (IOException e) {
            throw new AppException(ErrorCode.FILE_READ_QR_ERROR);
        }
    }

    // ==================== PARSE CREATE / UPDATE ====================

    public List<ProductCreateRequest> parseCreateFromQR(MultipartFile file, String qrContent) {
        String content = resolveContent(file, qrContent);
        return smartParseContent(content, "create");
    }

    public List<Pair<String, ProductUpdateRequest>> parseUpdateFromQR(MultipartFile file, String qrContent) {
        String content = resolveContent(file, qrContent);
        return smartParseContent(content, "update");
    }

    private String resolveContent(MultipartFile file, String qrContent) {
        if (file != null && !file.isEmpty()) {
            String read = readQRFromImage(file);
            log.info("Đọc nội dung QR từ file: {}", read);
            return read;
        }
        if (qrContent != null && !qrContent.isEmpty()) return qrContent;
        throw new RuntimeException("Nội dung mã QR trống");
    }

    // ==================== SMART PARSE ====================

    private <T> List<T> smartParseContent(String content, String action) {
        for (var parser : List.<java.util.function.Supplier<List<T>>>of(
                () -> parseJsonToProducts(content, action),
                () -> parseCsvToProducts(content, action),
                () -> parseMultiLineToProducts(content, action),
                () -> handleBase64Content(content, "BASE64_JSON", action),
                () -> handleBase64Content(content, "BASE64_CSV", action),
                () -> handleBase64Content(content, "BASE64_MULTI_LINE", action),
                () -> handleUrlContent(content, action)
        )) {
            try {
                return parser.get();
            } catch (Exception e) {
                log.debug("Parse thất bại: {}", e.getMessage());
            }
        }
        throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
    }

    // ==================== JSON ====================

    @SuppressWarnings("unchecked")
    private <T> List<T> parseJsonToProducts(String content, String action) {
        try {
            String data = stripDataPrefix(content).trim();
            if (!data.startsWith("[") && !data.startsWith("{"))
                throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);

            List<Map<String, Object>> rawList =
                    objectMapper.readValue(data, new TypeReference<List<Map<String, Object>>>() {});

            if ("create".equalsIgnoreCase(action)) {
                return (List<T>) rawList.stream().map(this::mapToCreateRequest).collect(Collectors.toList());
            } else {
                return (List<T>) rawList.stream().map(this::mapToUpdatePair).collect(Collectors.toList());
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi phân tích JSON: " + e.getMessage());
        }
    }

    // ==================== CSV ====================

    @SuppressWarnings("unchecked")
    private <T> List<T> parseCsvToProducts(String content, String action) {
        List<T> requests = new ArrayList<>();
        String data = stripDataPrefix(content).trim();

        if (!data.contains(",") || data.contains("{") || data.contains("["))
            throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);

        try (CSVReader csvReader = new CSVReader(new StringReader(data))) {
            List<String[]> lines = csvReader.readAll();
            if (lines.isEmpty()) throw new RuntimeException("Không có dữ liệu trong CSV");

            String[] first = lines.get(0);
            boolean hasHeader = first.length > 0 && (
                    first[0].toLowerCase().contains("category") ||
                            first[0].toLowerCase().contains("supplier") ||
                            first[0].toLowerCase().contains("code"));
            int start = hasHeader ? 1 : 0;

            for (int i = start; i < lines.size(); i++) {
                String[] f = lines.get(i);
                List<String> cats = splitPipe(f[0]);
                if ("create".equalsIgnoreCase(action)) {
                    if (f.length < 7) throw new RuntimeException("Dòng " + i + " không đủ 7 cột");
                    requests.add((T) ProductCreateRequest.builder()
                            .categoryCodes(cats)
                            .supplierCode(f[1].trim()).code(f[2].trim()).name(f[3].trim())
                            .branch(f[4].trim()).description(f[5].trim())
                            .price(Long.parseLong(f[6].trim())).build());
                } else {
                    if (f.length < 8) throw new RuntimeException("Dòng " + i + " không đủ 8 cột");
                    String code = f[2].trim();
                    if (code.isEmpty()) throw new RuntimeException("Mã sản phẩm trống ở dòng " + i);
                    requests.add((T) Pair.of(code, ProductUpdateRequest.builder()
                            .categoryCodes(cats)
                            .supplierCode(f[1].trim()).name(f[3].trim())
                            .branch(f[4].trim()).description(f[5].trim())
                            .price(Long.parseLong(f[6].trim()))
                            .discountId(f[7].trim().isEmpty() ? null : f[7].trim()).build()));
                }
            }
        } catch (IOException | CsvException e) {
            throw new RuntimeException("Lỗi phân tích CSV: " + e.getMessage());
        }

        if (requests.isEmpty()) throw new RuntimeException("Không có dữ liệu hợp lệ trong CSV");
        return requests;
    }

    // ==================== MULTI-LINE ====================

    @SuppressWarnings("unchecked")
    private <T> List<T> parseMultiLineToProducts(String content, String action) {
        List<T> requests = new ArrayList<>();
        String data = stripDataPrefix(content).trim();

        if (!data.contains("=") || !data.contains("\n"))
            throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);

        for (String line : data.split("\n")) {
            if (line == null || line.trim().isEmpty()) continue;
            Map<String, String> map = Arrays.stream(line.split(","))
                    .map(s -> s.split("=", 2))
                    .filter(a -> a.length == 2)
                    .collect(Collectors.toMap(a -> a[0].trim(), a -> a[1].trim()));
            if (map.isEmpty()) continue;

            List<String> cats = splitPipe(map.getOrDefault("categoryCodes", ""));
            if ("create".equalsIgnoreCase(action)) {
                requests.add((T) ProductCreateRequest.builder()
                        .code(map.getOrDefault("code", ""))
                        .categoryCodes(cats)
                        .supplierCode(map.getOrDefault("supplierCode", ""))
                        .name(map.getOrDefault("name", ""))
                        .branch(map.getOrDefault("branch", ""))
                        .description(map.getOrDefault("description", ""))
                        .price(map.containsKey("price") ? Long.parseLong(map.get("price").trim()) : 0L)
                        .build());
            } else {
                String code = map.getOrDefault("code", "");
                if (code.isEmpty()) throw new RuntimeException("Mã sản phẩm không được để trống");
                requests.add((T) Pair.of(code, ProductUpdateRequest.builder()
                        .categoryCodes(cats)
                        .supplierCode(map.getOrDefault("supplierCode", ""))
                        .name(map.getOrDefault("name", ""))
                        .branch(map.getOrDefault("branch", ""))
                        .description(map.getOrDefault("description", ""))
                        .price(map.containsKey("price") ? Long.parseLong(map.get("price").trim()) : 0L)
                        .discountId(map.getOrDefault("discountId", null))
                        .build()));
            }
        }

        if (requests.isEmpty()) throw new RuntimeException("Không có dữ liệu hợp lệ trong Multi-line");
        return requests;
    }

    // ==================== BASE64 / URL ====================

    private <T> List<T> handleBase64Content(String content, String format, String action) {
        String data = stripDataPrefix(content).trim();
        if (!isValidBase64(data)) throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
        String decoded = new String(Base64.getDecoder().decode(data));
        return switch (format.toUpperCase()) {
            case "BASE64_JSON" -> parseJsonToProducts(decoded, action);
            case "BASE64_CSV" -> parseCsvToProducts(decoded, action);
            case "BASE64_MULTI_LINE" -> parseMultiLineToProducts(decoded, action);
            default -> throw new AppException(ErrorCode.INVALID_FILE_QR_FORMAT);
        };
    }

    @SuppressWarnings("unchecked")
    private <T> List<T> handleUrlContent(String content, String action) {
        String url = stripDataPrefix(content).trim();
        if (!url.startsWith("http://") && !url.startsWith("https://"))
            throw new RuntimeException("Không phải URL hợp lệ");
        String response = webClient.get().uri(url).retrieve().bodyToMono(String.class).block();
        if (response == null || response.isEmpty()) throw new RuntimeException("Không nhận được phản hồi từ URL");
        return (List<T>) smartParseContent(response, action);
    }

    // ==================== PRIVATE UTILS ====================

    private ProductCreateRequest mapToCreateRequest(Map<String, Object> map) {
        return ProductCreateRequest.builder()
                .categoryCodes(parseCategoryCodes(map))
                .supplierCode((String) map.getOrDefault("supplierCode", ""))
                .code((String) map.getOrDefault("code", ""))
                .name((String) map.getOrDefault("name", ""))
                .branch((String) map.getOrDefault("branch", ""))
                .description((String) map.getOrDefault("description", ""))
                .price(map.containsKey("price") ? Long.parseLong(map.get("price").toString()) : 0L)
                .build();
    }

    private Pair<String, ProductUpdateRequest> mapToUpdatePair(Map<String, Object> map) {
        String code = (String) map.get("code");
        if (code == null || code.trim().isEmpty()) throw new RuntimeException("Mã sản phẩm không được để trống");
        return Pair.of(code, ProductUpdateRequest.builder()
                .categoryCodes(parseCategoryCodes(map))
                .supplierCode((String) map.getOrDefault("supplierCode", ""))
                .name((String) map.getOrDefault("name", ""))
                .branch((String) map.getOrDefault("branch", ""))
                .description((String) map.getOrDefault("description", ""))
                .price(map.containsKey("price") ? Long.parseLong(map.get("price").toString()) : 0L)
                .discountId((String) map.getOrDefault("discountId", null))
                .build());
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

    private List<String> splitPipe(String value) {
        return Arrays.stream(value.trim().split("\\|"))
                .map(String::trim).filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private String stripDataPrefix(String content) {
        return content.contains("|data:") ? content.split("\\|data:")[1] : content;
    }

    private boolean isValidBase64(String str) {
        try { Base64.getDecoder().decode(str); return true; }
        catch (IllegalArgumentException e) { return false; }
    }
}