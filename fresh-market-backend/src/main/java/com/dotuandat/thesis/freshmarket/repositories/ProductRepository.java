package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
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

    @Query(
            """
			SELECT new com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse(
				p.id, COALESCE(c.code, ''), COALESCE(s.code, ''), p.code, p.name, p.description,
				CAST(p.price AS integer), CAST(p.discountPrice AS integer),
				CAST(p.inventoryQuantity AS integer), CAST(SUM(od.quantity) AS integer),
				CAST(p.point AS integer), p.avgRating, CAST(p.reviewCount AS integer),
				COALESCE(d.name, ''), null,
				p.createdDate, COALESCE(p.createdBy, ''), p.modifiedDate, COALESCE(p.modifiedBy, '')
			)
			FROM OrderDetail od
			JOIN od.product p
			JOIN od.order o
			LEFT JOIN p.category c
			LEFT JOIN p.supplier s
			LEFT JOIN p.discount d
			WHERE o.createdDate >= :startDate AND o.createdDate < :endDate AND o.status = 'COMPLETED'
			GROUP BY p.id, c.code, s.code, p.code, p.name, p.description,
					p.price, p.discountPrice, p.inventoryQuantity, p.soldQuantity,
					p.point, p.avgRating, p.reviewCount, d.name,
					p.createdDate, p.createdBy, p.modifiedDate, p.modifiedBy
			ORDER BY SUM(od.quantity) DESC
			""")
    List<ProductResponse> findTop5BestSellersToday(
            @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query(
            """
			SELECT new com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse(
				p.id, COALESCE(c.code, ''), COALESCE(s.code, ''), p.code, p.name, p.description,
				CAST(p.price AS integer), CAST(p.discountPrice AS integer),
				CAST(p.inventoryQuantity AS integer), CAST(SUM(od.quantity) AS integer),
				CAST(p.point AS integer), p.avgRating, CAST(p.reviewCount AS integer),
				COALESCE(d.name, ''), null,
				p.createdDate, COALESCE(p.createdBy, ''), p.modifiedDate, COALESCE(p.modifiedBy, '')
			)
			FROM OrderDetail od
			JOIN od.product p
			JOIN od.order o
			LEFT JOIN p.category c
			LEFT JOIN p.supplier s
			LEFT JOIN p.discount d
			WHERE o.createdDate >= :startDate AND o.createdDate < :endDate AND o.status = 'COMPLETED'
			GROUP BY p.id, c.code, s.code, p.code, p.name, p.description,
					p.price, p.discountPrice, p.inventoryQuantity, p.soldQuantity,
					p.point, p.avgRating, p.reviewCount, d.name,
					p.createdDate, p.createdBy, p.modifiedDate, p.modifiedBy
			ORDER BY SUM(od.quantity) DESC
			""")
    List<ProductResponse> findTop5BestSellersThisMonth(
            @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query(
            """
			SELECT new com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse(
				p.id, COALESCE(c.code, ''), COALESCE(s.code, ''), p.code, p.name, p.description,
				CAST(p.price AS integer), CAST(p.discountPrice AS integer),
				CAST(p.inventoryQuantity AS integer), CAST(SUM(od.quantity) AS integer),
				CAST(p.point AS integer), p.avgRating, CAST(p.reviewCount AS integer),
				COALESCE(d.name, ''), null,
				p.createdDate, COALESCE(p.createdBy, ''), p.modifiedDate, COALESCE(p.modifiedBy, '')
			)
			FROM OrderDetail od
			JOIN od.product p
			JOIN od.order o
			LEFT JOIN p.category c
			LEFT JOIN p.supplier s
			LEFT JOIN p.discount d
			WHERE o.createdDate >= :startDate AND o.createdDate < :endDate AND o.status = 'COMPLETED'
			GROUP BY p.id, c.code, s.code, p.code, p.name, p.description,
					p.price, p.discountPrice, p.inventoryQuantity, p.soldQuantity,
					p.point, p.avgRating, p.reviewCount, d.name,
					p.createdDate, p.createdBy, p.modifiedDate, p.modifiedBy
			ORDER BY SUM(od.quantity) DESC
			""")
    List<ProductResponse> findTop5BestSellersThisYear(
            @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query(
            """
		SELECT new com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse(
			p.id, COALESCE(c.code, ''), COALESCE(s.code, ''), p.code,
			p.name, p.description, CAST(p.price AS integer), CAST(p.discountPrice AS integer),
			CAST(p.inventoryQuantity AS integer), CAST(p.soldQuantity AS integer),
			CAST(p.point AS integer), p.avgRating, CAST(p.reviewCount AS integer),
			COALESCE(disc.name, ''), null,
			p.createdDate, COALESCE(p.createdBy, ''), p.modifiedDate, COALESCE(p.modifiedBy, '')
		)
		FROM Product p
		LEFT JOIN p.category c
		LEFT JOIN p.supplier s
		LEFT JOIN p.discount disc
		WHERE p.inventoryQuantity <= :threshold
		ORDER BY p.inventoryQuantity ASC
	""")
    List<ProductResponse> findLowStockProducts(@Param("threshold") int threshold);

    @Query(
            """
		SELECT new com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse(
			p.id, COALESCE(c.code, ''), COALESCE(s.code, ''), p.code,
			p.name, p.description, CAST(p.price AS integer), CAST(p.discountPrice AS integer),
			CAST(SUM(d.quantity) AS integer), CAST(p.soldQuantity AS integer),
			CAST(p.point AS integer), p.avgRating, CAST(p.reviewCount AS integer),
			COALESCE(disc.name, ''), null,
			p.createdDate, COALESCE(p.createdBy, ''), p.modifiedDate, COALESCE(p.modifiedBy, '')
		)
		FROM InventoryReceiptDetail d
		JOIN d.product p
		JOIN d.receipt r
		LEFT JOIN p.category c
		LEFT JOIN p.supplier s
		LEFT JOIN p.discount disc
		WHERE d.expiryDate >= :startDate AND d.expiryDate <= :endDate
			AND r.status = com.dotuandat.thesis.freshmarket.enums.InventoryStatus.COMPLETED
		GROUP BY p.id, c.code, s.code, p.code, p.name, p.description,
				p.price, p.discountPrice, p.soldQuantity, p.point,
				p.avgRating, p.reviewCount, disc.name, d.expiryDate,
				p.createdDate, p.createdBy, p.modifiedDate, p.modifiedBy
	""")
    List<ProductResponse> findProductsByExpiryDateRange(
            @Param("startDate") Date startDate, @Param("endDate") Date endDate);
}
