package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.entities.InventoryReceipt;
import com.dotuandat.thesis.freshmarket.enums.InventoryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface InventoryReceiptRepository
        extends JpaRepository<InventoryReceipt, String>, JpaSpecificationExecutor<InventoryReceipt> {
    Page<InventoryReceipt> findAllByStatus(InventoryStatus status, Pageable pageable);

    int countByStatus(InventoryStatus status);
}
