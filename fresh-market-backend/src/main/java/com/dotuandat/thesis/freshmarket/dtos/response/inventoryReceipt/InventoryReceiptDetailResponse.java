package com.dotuandat.thesis.freshmarket.dtos.response.inventoryReceipt;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import java.io.Serializable;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryReceiptDetailResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    String id;
    String productId;
    String productCode;
    int quantity;
    long price;
    Date expiryDate;
    Date manufacturedDate;
}
