package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventorySearchRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryStatusRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.inventoryReceipt.InventoryReceiptResponse;
import com.dotuandat.thesis.freshmarket.enums.InventoryStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InventoryReceiptService {
    PageResponse<InventoryReceiptResponse> search(InventorySearchRequest request, Pageable pageable);

    PageResponse<InventoryReceiptResponse> getAllByStatus(InventoryStatus status, Pageable pageable);

    InventoryReceiptResponse getById(String id);

    InventoryReceiptResponse create(InventoryReceiptRequest request);

    InventoryReceiptResponse update(String id, InventoryReceiptRequest request);

    InventoryReceiptResponse updateStatus(String id, InventoryStatusRequest request);

    int countTotalPendingReceipts();

    List<InventoryReceiptResponse> getExpiringProducts(String filter);
}
