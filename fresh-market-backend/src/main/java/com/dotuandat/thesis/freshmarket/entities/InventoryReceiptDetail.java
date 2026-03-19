package com.dotuandat.thesis.freshmarket.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.Date;

@Entity
@Table(name = "inventory_receipt_detail")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryReceiptDetail extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "receipt_id", nullable = false)
    InventoryReceipt receipt;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    Product product;

    int quantity;

    long price;

    Date manufacturedDate;

    Date expiryDate;
}
