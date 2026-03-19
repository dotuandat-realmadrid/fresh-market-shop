package com.dotuandat.thesis.freshmarket.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "supplier_trash")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierTrashBin {
    @Id
    @Column(columnDefinition = "VARCHAR(36)")
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne
    @JoinColumn(name = "supplier_id", referencedColumnName = "id", unique = true, columnDefinition = "VARCHAR(36)")
    private Supplier supplier;

    @Column(name = "deleted_date", nullable = false)
    private LocalDateTime deletedDate = LocalDateTime.now();
}
