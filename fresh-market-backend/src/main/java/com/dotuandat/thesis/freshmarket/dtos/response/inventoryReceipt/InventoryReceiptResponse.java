package com.dotuandat.thesis.freshmarket.dtos.response.inventoryReceipt;

import com.dotuandat.thesis.freshmarket.enums.InventoryStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.io.Serializable;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryReceiptResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    String id;
    long totalAmount;
    InventoryStatus status;
    String note;
    LocalDateTime createdDate;
    String createdBy;
    LocalDateTime modifiedDate;
    String modifiedBy;
    List<InventoryReceiptDetailResponse> detailResponses;
}
