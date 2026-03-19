package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.inventoryReceipt.ReceiptDetailByProductResponse;
import org.springframework.data.domain.Pageable;

public interface InventoryReceiptDetailService {
    PageResponse<ReceiptDetailByProductResponse> getAllByProductId(String productId, Pageable pageable);
}
