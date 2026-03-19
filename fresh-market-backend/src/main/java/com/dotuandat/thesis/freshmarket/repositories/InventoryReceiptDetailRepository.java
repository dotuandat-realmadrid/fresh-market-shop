package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.dtos.response.inventoryReceipt.InventoryReceiptDetailResponse;
import com.dotuandat.thesis.freshmarket.entities.InventoryReceiptDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface InventoryReceiptDetailRepository extends JpaRepository<InventoryReceiptDetail, String> {
    Page<InventoryReceiptDetail> findByProductId(String productId, Pageable pageable);

    @Query(
            """
		SELECT new com.dotuandat.thesis.freshmarket.dtos.response.inventoryReceipt.InventoryReceiptDetailResponse(
			d.id, p.id, p.code, CAST(SUM(d.quantity) AS integer), d.price,
			d.expiryDate, d.manufacturedDate
		)
		FROM InventoryReceiptDetail d
		LEFT JOIN d.product p
		JOIN d.receipt r
		WHERE d.expiryDate >= :startDate AND d.expiryDate <= :endDate
			AND r.status = com.dotuandat.thesis.freshmarket.enums.InventoryStatus.COMPLETED
		GROUP BY d.id, p.id, p.code, d.price, d.expiryDate, d.manufacturedDate
	""")
    List<InventoryReceiptDetailResponse> findProductsByExpiryDateRange(
            @Param("startDate") Date startDate, @Param("endDate") Date endDate);
}
