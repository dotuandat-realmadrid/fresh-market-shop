package com.dotuandat.thesis.freshmarket.controllers;

import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventorySearchRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryStatusRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.inventoryReceipt.InventoryReceiptResponse;
import com.dotuandat.thesis.freshmarket.enums.InventoryStatus;
import com.dotuandat.thesis.freshmarket.services.InventoryImportService;
import com.dotuandat.thesis.freshmarket.services.InventoryReceiptService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/inventory-receipts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Validated
public class InventoryReceiptController {
    InventoryReceiptService inventoryReceiptService;
    InventoryImportService inventoryImportService;

    @GetMapping
    public ApiResponse<PageResponse<InventoryReceiptResponse>> search(
            InventorySearchRequest request,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdDate").and(Sort.by(Sort.Direction.ASC, "id"));

        Pageable pageable = PageRequest.of(page - 1, size, sort);

        return ApiResponse.<PageResponse<InventoryReceiptResponse>>builder()
                .result(inventoryReceiptService.search(request, pageable))
                .build();
    }

    @GetMapping("/status/{status}")
    public ApiResponse<PageResponse<InventoryReceiptResponse>> getAllByStatus(
            @PathVariable InventoryStatus status,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdDate").and(Sort.by(Sort.Direction.ASC, "id"));

        Pageable pageable = PageRequest.of(page - 1, size, sort);

        return ApiResponse.<PageResponse<InventoryReceiptResponse>>builder()
                .result(inventoryReceiptService.getAllByStatus(status, pageable))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<InventoryReceiptResponse> getById(@PathVariable String id) {
        return ApiResponse.<InventoryReceiptResponse>builder()
                .result(inventoryReceiptService.getById(id))
                .build();
    }

    @PostMapping
    public ApiResponse<InventoryReceiptResponse> create(@RequestBody @Valid InventoryReceiptRequest request) {
        return ApiResponse.<InventoryReceiptResponse>builder()
                .result(inventoryReceiptService.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<InventoryReceiptResponse> update(
            @PathVariable String id, @RequestBody @Valid InventoryReceiptRequest request) {
        return ApiResponse.<InventoryReceiptResponse>builder()
                .result(inventoryReceiptService.update(id, request))
                .build();
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<InventoryReceiptResponse> updateStatus(
            @PathVariable String id, @RequestBody InventoryStatusRequest request) {
        return ApiResponse.<InventoryReceiptResponse>builder()
                .result(inventoryReceiptService.updateStatus(id, request))
                .build();
    }

    @GetMapping("/status/PENDING/count")
    public ApiResponse<Integer> countTotalPendingReceipts() {
        return ApiResponse.<Integer>builder()
                .result(inventoryReceiptService.countTotalPendingReceipts())
                .build();
    }

    @PostMapping("/import-excel")
    public ApiResponse<Void> importProducts(@RequestParam MultipartFile file) {
        inventoryImportService.importFromExcel(file);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/import-qr")
    public ApiResponse<Void> importCreateFromQR(
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String qrContent,
            @RequestParam(defaultValue = "file") String source) {
        inventoryImportService.importFromQR(file, qrContent, source);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/import-ai")
    public ApiResponse<Void> importCreateByAI(@RequestParam int quantity) {
        inventoryImportService.importFromAI(quantity);
        return ApiResponse.<Void>builder()
                .message("Generated and created products successfully")
                .build();
    }

    @PostMapping("/import-pdf")
    public ApiResponse<Void> importCreateFromPdf(@RequestParam MultipartFile file) {
        inventoryImportService.importFromPdf(file);
        return ApiResponse.<Void>builder().build();
    }
}
