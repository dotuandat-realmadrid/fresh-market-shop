package com.dotuandat.thesis.freshmarket.converters;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptDetailRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.inventoryReceipt.InventoryReceiptDetailResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.inventoryReceipt.InventoryReceiptResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.inventoryReceipt.ReceiptDetailByProductResponse;
import com.dotuandat.thesis.freshmarket.entities.InventoryReceipt;
import com.dotuandat.thesis.freshmarket.entities.InventoryReceiptDetail;
import com.dotuandat.thesis.freshmarket.entities.Product;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.ProductRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class InventoryReceiptConverter {
    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private ProductRepository productRepository;

    public InventoryReceiptResponse toResponse(InventoryReceipt receipt, List<InventoryReceiptDetail> details) {
        List<InventoryReceiptDetailResponse> detailResponses = details.stream()
                .map(detail -> InventoryReceiptDetailResponse.builder()
                        .id(detail.getId())
                        .productId(detail.getProduct().getId())
                        .productCode(detail.getProduct().getCode())
                        .quantity(detail.getQuantity())
                        .price(detail.getPrice())
                        .manufacturedDate(detail.getManufacturedDate())
                        .expiryDate(detail.getExpiryDate())
                        .build())
                .collect(Collectors.toList());

        InventoryReceiptResponse receiptResponse = modelMapper.map(receipt, InventoryReceiptResponse.class);
        receiptResponse.setDetailResponses(detailResponses);
        return receiptResponse;
    }

    public List<ReceiptDetailByProductResponse> toDetailResponse(Page<InventoryReceiptDetail> receiptDetails) {
        return receiptDetails.stream()
                .map(receiptDetail -> {
                    var detailResponse = modelMapper.map(receiptDetail, ReceiptDetailByProductResponse.class);

                    detailResponse.setReceiptId(receiptDetail.getReceipt().getId());
                    detailResponse.setProductId(receiptDetail.getProduct().getId());
                    detailResponse.setProductCode(receiptDetail.getProduct().getCode());
                    detailResponse.setStatus(receiptDetail.getReceipt().getStatus());
                    detailResponse.setManufacturedDate(receiptDetail.getManufacturedDate());
                    detailResponse.setExpiryDate(receiptDetail.getExpiryDate());

                    return detailResponse;
                })
                .toList();
    }

    public List<InventoryReceiptDetail> toDetailEntity(
            InventoryReceipt receipt, List<InventoryReceiptDetailRequest> details) {
        return details.stream()
                .map(detailRequest -> {
                    Product product = productRepository
                            .findByCodeAndIsActive(detailRequest.getProductCode(), StatusConstant.ACTIVE)
                            .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_EXISTED));

                    return InventoryReceiptDetail.builder()
                            .receipt(receipt)
                            .product(product)
                            .quantity(detailRequest.getQuantity())
                            .price(detailRequest.getPrice())
                            .manufacturedDate(detailRequest.getManufacturedDate())
                            .expiryDate(detailRequest.getExpiryDate())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
