package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.entities.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String>, JpaSpecificationExecutor<Product> {
	Optional<Product> findByCodeAndIsActive(String code, byte isActive);

	boolean existsByCode(String code);

	@Transactional(readOnly = true)
	@Query("SELECT p.code FROM Product p")
	List<String> findAllProductCodes();

	// Trả về Object[]: [0] = Product, [1] = SUM(od.quantity)
	@Query("""
            SELECT p, SUM(od.quantity)
            FROM OrderDetail od
            JOIN od.product p
            JOIN od.order o
            WHERE o.createdDate >= :startDate AND o.createdDate < :endDate AND o.status = 'COMPLETED'
            GROUP BY p
            ORDER BY SUM(od.quantity) DESC
            """)
	List<Object[]> findTop5BestSellersToday(
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

	@Query("""
            SELECT p, SUM(od.quantity)
            FROM OrderDetail od
            JOIN od.product p
            JOIN od.order o
            WHERE o.createdDate >= :startDate AND o.createdDate < :endDate AND o.status = 'COMPLETED'
            GROUP BY p
            ORDER BY SUM(od.quantity) DESC
            """)
	List<Object[]> findTop5BestSellersThisMonth(
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

	@Query("""
            SELECT p, SUM(od.quantity)
            FROM OrderDetail od
            JOIN od.product p
            JOIN od.order o
            WHERE o.createdDate >= :startDate AND o.createdDate < :endDate AND o.status = 'COMPLETED'
            GROUP BY p
            ORDER BY SUM(od.quantity) DESC
            """)
	List<Object[]> findTop5BestSellersThisYear(
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

	@Query("""
            SELECT DISTINCT p
            FROM Product p
            LEFT JOIN FETCH p.categories
            LEFT JOIN FETCH p.supplier
            LEFT JOIN FETCH p.discount
            WHERE p.inventoryQuantity <= :threshold
            ORDER BY p.inventoryQuantity ASC
            """)
	List<Product> findLowStockProducts(@Param("threshold") int threshold, Pageable pageable);

	@Query("""
            SELECT p, SUM(d.quantity)
            FROM InventoryReceiptDetail d
            JOIN d.product p
            JOIN d.receipt r
            WHERE d.expiryDate >= :startDate AND d.expiryDate <= :endDate
                AND r.status = com.dotuandat.thesis.freshmarket.enums.InventoryStatus.COMPLETED
            GROUP BY p
            """)
	List<Object[]> findProductsByExpiryDateRange(
			@Param("startDate") Date startDate, @Param("endDate") Date endDate);
}