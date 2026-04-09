package com.dotuandat.thesis.freshmarket.utils;

import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductUpdateRequest;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Component;
import technology.tabula.ObjectExtractor;
import technology.tabula.Page;
import technology.tabula.RectangularTextContainer;
import technology.tabula.Table;
import technology.tabula.extractors.SpreadsheetExtractionAlgorithm;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.*;

@Component
@Slf4j
public class PdfProdHelper {

    @NonFinal
    @Value("${app.file.storage-dir}")
    private String STORAGE_DIR;

    @SuppressWarnings("rawtypes")
    public List<Pair<ProductCreateRequest, List<String>>> readProductsForCreateFromPdf(InputStream input)
            throws IOException {
        List<Pair<ProductCreateRequest, List<String>>> requests = new ArrayList<>();

        try (PDDocument document = PDDocument.load(input);
             ObjectExtractor extractor = new ObjectExtractor(document)) {
            SpreadsheetExtractionAlgorithm algorithm = new SpreadsheetExtractionAlgorithm();

            for (int pageNum = 1; pageNum <= document.getNumberOfPages(); pageNum++) {
                Page page = extractor.extract(pageNum);
                List<Table> tables = algorithm.extract(page);
                PDPage pdPage = document.getPage(pageNum - 1);

                for (Table table : tables) {
                    List<List<RectangularTextContainer>> rows = table.getRows();

                    if (rows.isEmpty()) {
                        log.warn("Bảng rỗng trên trang {}", pageNum);
                        continue;
                    }

                    List<RectangularTextContainer> headerRow = rows.get(0);
                    Map<String, Integer> columnMap = new HashMap<>();
                    for (int i = 0; i < headerRow.size(); i++) {
                        String header = headerRow.get(i).getText().toLowerCase().replaceAll("[^a-z0-9]", "");
                        columnMap.put(header, i);
                    }

                    int categoryCodeIdx = columnMap.getOrDefault("categorycodes", -1);
                    int supplierCodeIdx = columnMap.getOrDefault("suppliercode", -1);
                    int codeIdx = columnMap.getOrDefault("code", -1);
                    int nameIdx = columnMap.getOrDefault("name", -1);
                    int branchIdx = columnMap.getOrDefault("branch", -1);
                    int descriptionIdx = columnMap.getOrDefault("description", -1);
                    int priceIdx = columnMap.getOrDefault("price", -1);
                    int imagePathIdx = columnMap.getOrDefault("imagepath", -1);

                    if (categoryCodeIdx == -1
                            || supplierCodeIdx == -1
                            || codeIdx == -1
                            || nameIdx == -1
                            || branchIdx == -1
                            || descriptionIdx == -1
                            || priceIdx == -1) {
                        log.error("Thiếu cột bắt buộc trong bảng trên trang {}", pageNum);
                        continue;
                    }

                    for (int i = 1; i < rows.size(); i++) {
                        List<RectangularTextContainer> cells = rows.get(i);

                        if (cells.size() <= priceIdx) {
                            log.warn("Dòng {} không đủ cột, bỏ qua", i);
                            continue;
                        }

                        try {
                            String categoryCodes = getRawValue(cells, categoryCodeIdx);
                            List<String> listCategoryCodes = categoryCodes.isEmpty()
                                    ? List.of()
                                    : Arrays.stream(categoryCodes.split(","))
                                    .map(String::trim)
                                    .filter(s -> !s.isEmpty())
                                    .toList();
                            String supplierCode = getRawValue(cells, supplierCodeIdx);
                            String code = getRawValue(cells, codeIdx);
                            String name = getRawValue(cells, nameIdx);
                            String branch = getRawValue(cells, branchIdx);
                            String description = getRawValue(cells, descriptionIdx);
                            String priceStr = getRawValue(cells, priceIdx).replaceAll("[^0-9]", "");
                            Long price = priceStr.isEmpty() ? 0L : Long.parseLong(priceStr);
                            List<String> imagePaths = extractImagesFromPdf(pdPage, cells, imagePathIdx);

                            if (categoryCodes.isEmpty() || supplierCode.isEmpty() || code.isEmpty() || name.isEmpty()) {
                                log.warn(
                                        "Dữ liệu không hợp lệ tại dòng {}: categoryCode={}, supplierCode={}, code={}, name={}",
                                        i,
                                        categoryCodes,
                                        supplierCode,
                                        code,
                                        name);
                                continue;
                            }

                            ProductCreateRequest request = ProductCreateRequest.builder()
                                    .categoryCodes(listCategoryCodes)
                                    .supplierCode(supplierCode)
                                    .code(code)
                                    .name(name)
                                    .branch(branch)
                                    .description(description)
                                    .price(price)
                                    .build();
                            requests.add(Pair.of(request, imagePaths));
                        } catch (NumberFormatException e) {
                            log.error("Lỗi phân tích giá trị price tại dòng {}: {}", i, e.getMessage());
                        } catch (Exception e) {
                            log.error("Lỗi khi đọc dòng {}: {}", i, e.getMessage());
                        }
                    }
                }
            }

            if (requests.isEmpty()) {
                log.warn("Không có sản phẩm nào được đọc từ file PDF.");
            } else {
                log.info("Đã đọc thành công {} sản phẩm từ PDF.", requests.size());
            }
        } catch (Exception e) {
            throw new IOException("Lỗi khi xử lý file PDF: " + e.getMessage(), e);
        }
        return requests;
    }

    @SuppressWarnings("rawtypes")
    public List<Pair<String, ProductUpdateRequest>> readProductsForUpdateFromPdf(InputStream input) throws IOException {
        List<Pair<String, ProductUpdateRequest>> requests = new ArrayList<>();

        try (PDDocument document = PDDocument.load(input);
             ObjectExtractor extractor = new ObjectExtractor(document)) {
            SpreadsheetExtractionAlgorithm algorithm = new SpreadsheetExtractionAlgorithm();

            for (int pageNum = 1; pageNum <= document.getNumberOfPages(); pageNum++) {
                Page page = extractor.extract(pageNum);
                List<Table> tables = algorithm.extract(page);

                for (Table table : tables) {
                    List<List<RectangularTextContainer>> rows = table.getRows();

                    if (rows.isEmpty()) {
                        log.warn("Bảng rỗng trên trang {}", pageNum);
                        continue;
                    }

                    List<RectangularTextContainer> headerRow = rows.get(0);
                    Map<String, Integer> columnMap = new HashMap<>();
                    for (int i = 0; i < headerRow.size(); i++) {
                        String header = headerRow.get(i).getText().toLowerCase().replaceAll("[^a-z0-9]", "");
                        columnMap.put(header, i);
                    }

                    int categoryCodeIdx = columnMap.getOrDefault("categorycodes", -1);
                    int supplierCodeIdx = columnMap.getOrDefault("suppliercode", -1);
                    int codeIdx = columnMap.getOrDefault("code", -1);
                    int nameIdx = columnMap.getOrDefault("name", -1);
                    int branchIdx = columnMap.getOrDefault("branch", -1);
                    int descriptionIdx = columnMap.getOrDefault("description", -1);
                    int priceIdx = columnMap.getOrDefault("price", -1);
                    int discountIdx = columnMap.getOrDefault("discountid", -1);

                    if (categoryCodeIdx == -1
                            || supplierCodeIdx == -1
                            || codeIdx == -1
                            || nameIdx == -1
                            || branchIdx == -1
                            || descriptionIdx == -1
                            || priceIdx == -1) {
                        log.error("Thiếu cột bắt buộc trong bảng trên trang {}", pageNum);
                        continue;
                    }

                    for (int i = 1; i < rows.size(); i++) {
                        List<RectangularTextContainer> cells = rows.get(i);

                        if (cells.size() <= priceIdx) {
                            log.warn("Dòng {} không đủ cột, bỏ qua", i);
                            continue;
                        }

                        try {
                            String categoryCodes = getRawValue(cells, categoryCodeIdx);
                            List<String> listCategoryCodes = categoryCodes.isEmpty()
                                    ? List.of()
                                    : Arrays.stream(categoryCodes.split(","))
                                    .map(String::trim)
                                    .filter(s -> !s.isEmpty())
                                    .toList();
                            String supplierCode = getRawValue(cells, supplierCodeIdx);
                            String code = getRawValue(cells, codeIdx);
                            String name = getRawValue(cells, nameIdx);
                            String branch = getRawValue(cells, branchIdx);
                            String description = getRawValue(cells, descriptionIdx);
                            String priceStr = getRawValue(cells, priceIdx).replaceAll("[^0-9]", "");
                            Long price = priceStr.isEmpty() ? 0L : Long.parseLong(priceStr);
                            String discountId = discountIdx >= 0 && discountIdx < cells.size()
                                    ? getRawValue(cells, discountIdx)
                                    : null;

                            if (code.isEmpty()) {
                                log.warn("Mã sản phẩm trống tại dòng {}, bỏ qua", i);
                                continue;
                            }

                            ProductUpdateRequest request = ProductUpdateRequest.builder()
                                    .categoryCodes(listCategoryCodes)
                                    .supplierCode(supplierCode)
                                    .name(name)
                                    .branch(branch)
                                    .description(description)
                                    .price(price)
                                    .discountId(discountId)
                                    .build();
                            requests.add(Pair.of(code, request));
                        } catch (NumberFormatException e) {
                            log.error("Lỗi phân tích giá trị price tại dòng {}: {}", i, e.getMessage());
                        } catch (Exception e) {
                            log.error("Lỗi khi đọc dòng {}: {}", i, e.getMessage());
                        }
                    }
                }
            }

            if (requests.isEmpty()) {
                log.warn("Không có sản phẩm nào được đọc từ file PDF.");
            } else {
                log.info("Đã đọc thành công {} sản phẩm từ PDF.", requests.size());
            }
        } catch (Exception e) {
            throw new IOException("Lỗi khi xử lý file PDF: " + e.getMessage(), e);
        }
        return requests;
    }

    @SuppressWarnings("rawtypes")
    private String getRawValue(List<RectangularTextContainer> cells, int index) {
        return index >= 0 && index < cells.size() ? cells.get(index).getText().trim() : "";
    }

    @SuppressWarnings("rawtypes")
    private List<String> extractImagesFromPdf(PDPage page, List<RectangularTextContainer> cells, int imagePathIdx)
            throws IOException {
        List<String> imagePaths = new ArrayList<>();
        if (imagePathIdx >= 0 && imagePathIdx < cells.size()) {
            PDResources resources = page.getResources();
            for (var entry : resources.getXObjectNames()) {
                if (resources.isImageXObject(entry)) {
                    PDImageXObject image = (PDImageXObject) resources.getXObject(entry);
                    BufferedImage bufferedImage = image.getImage();
                    String fileName = saveImage(bufferedImage);
                    imagePaths.add(fileName);
                }
            }
        }
        return imagePaths;
    }

    private String saveImage(BufferedImage image) throws IOException {
        Path folder = Paths.get(STORAGE_DIR);
        Files.createDirectories(folder);

        String fileName = UUID.randomUUID().toString() + ".png";
        Path filePath = folder.resolve(fileName);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(image, "png", baos);
            Files.write(filePath, baos.toByteArray(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        }

        return fileName;
    }
}
