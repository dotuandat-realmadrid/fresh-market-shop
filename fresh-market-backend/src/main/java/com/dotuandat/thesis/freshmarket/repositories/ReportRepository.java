package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.dtos.response.report.*;
import com.dotuandat.thesis.freshmarket.entities.Order;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReportRepository extends JpaRepository<Order, String> {
    @Query(
            """
				SELECT new com.dotuandat.thesis.freshmarket.dtos.response.report.OrderSummary(
					(SELECT COUNT(o) FROM Order o WHERE o.status = 'COMPLETED'),
					(SELECT COALESCE(SUM(o.totalPrice), 0) FROM Order o WHERE o.status = 'COMPLETED'),
					(SELECT COALESCE(SUM(d.price * d.quantity), 0) FROM InventoryReceiptDetail d
						WHERE d.receipt.status = 'COMPLETED')
				)
			""")
    OrderSummary getOrderSummary();

    @Query(
            """
				SELECT new com.dotuandat.thesis.freshmarket.dtos.response.report.WeeklyRevenueTrend(
					WEEK(o.modifiedDate), YEAR(o.modifiedDate),
					COUNT(o), SUM(o.totalPrice)
				)
				FROM Order o
				WHERE o.status = 'COMPLETED'
				GROUP BY YEAR(o.modifiedDate), WEEK(o.modifiedDate)
				ORDER BY YEAR(o.modifiedDate) ASC, WEEK(o.modifiedDate) ASC
			""")
    List<WeeklyRevenueTrend> getWeeklyRevenueTrend();

    @Query(
            """
				SELECT new com.dotuandat.thesis.freshmarket.dtos.response.report.RevenueByOrderType(
					o.orderType, COUNT(o), SUM(o.totalPrice)
				)
				FROM Order o
				WHERE o.status = 'COMPLETED'
				GROUP BY o.orderType
			""")
    List<RevenueByOrderType> getRevenueByOrderType();

    @Query(
            """
				SELECT new com.dotuandat.thesis.freshmarket.dtos.response.report.CategoryReport(
					c.name,
					COALESCE(SUM(od.quantity), 0),
					COALESCE(SUM(od.priceAtPurchase * od.quantity), 0)
				)
				FROM Category c
				LEFT JOIN Product p ON p.category = c
				LEFT JOIN OrderDetail od ON od.product = p AND od.order.status = 'COMPLETED'
				WHERE c.isActive = 1
				GROUP BY c
				ORDER BY c.code
			""")
    List<CategoryReport> getCategoryReport();

    @Query(
            """
				SELECT new com.dotuandat.thesis.freshmarket.dtos.response.report.SupplierReport(
					s.name,
					COALESCE(SUM(od.quantity), 0),
					COALESCE(SUM(od.priceAtPurchase * od.quantity), 0)
				)
				FROM Supplier s
				LEFT JOIN Product p ON p.supplier = s
				LEFT JOIN OrderDetail od ON od.product = p AND od.order.status = 'COMPLETED'
				WHERE s.isActive = 1
				GROUP BY s
				ORDER BY s.code
			""")
    List<SupplierReport> getSupplierReport();

    @Query(
            """
				SELECT new com.dotuandat.thesis.freshmarket.dtos.response.report.UserGrowthRate(
					WEEK(u.createdDate), YEAR(u.createdDate), COUNT(u)
				)
				FROM User u
				GROUP BY YEAR(u.createdDate), WEEK(u.createdDate)
				ORDER BY YEAR(u.createdDate) DESC, WEEK(u.createdDate) DESC
			""")
    List<UserGrowthRate> getUserGrowthRate();

    @Query(
            """
			SELECT new com.dotuandat.thesis.freshmarket.dtos.response.report.ProductReport(
				p.code, p.name,
				COALESCE(SUM(od.quantity), 0),
				COALESCE(SUM(od.priceAtPurchase * od.quantity), 0)
			)
			FROM Product p
			LEFT JOIN OrderDetail od ON od.product = p
				AND od.order.status = 'COMPLETED'
			WHERE p.isActive = 1
			GROUP BY p.code, p.name
			ORDER BY COALESCE(SUM(od.priceAtPurchase * od.quantity), 0) DESC
			""")
    List<ProductReport> getTopProductsByRevenue(Pageable pageable);

    @Query(
            """
			SELECT new com.dotuandat.thesis.freshmarket.dtos.response.report.ProductReport(
				p.code, p.name,
				COALESCE(SUM(od.quantity), 0),
				COALESCE(SUM(od.priceAtPurchase * od.quantity), 0)
			)
			FROM Product p
			LEFT JOIN OrderDetail od ON od.product = p
				AND od.order.status = 'COMPLETED'
			WHERE p.isActive = 1
			GROUP BY p.code, p.name
			ORDER BY COALESCE(SUM(od.priceAtPurchase * od.quantity), 0) ASC
			""")
    List<ProductReport> getLowestProductsByRevenue(Pageable pageable);

    @Query(
            """
			SELECT new com.dotuandat.thesis.freshmarket.dtos.response.report.RevenueByProduct(
				p.code,
				COALESCE((SELECT SUM(d.quantity) FROM InventoryReceiptDetail d
						WHERE d.product.id = p.id AND d.receipt.status = 'COMPLETED'), 0),
				COALESCE((SELECT SUM(d.quantity * d.price) FROM InventoryReceiptDetail d
						WHERE d.product.id = p.id AND d.receipt.status = 'COMPLETED'), 0),
				COALESCE((SELECT SUM(od.quantity) FROM OrderDetail od
						WHERE od.product.id = p.id AND od.order.status = 'COMPLETED'), 0),
				COALESCE((SELECT SUM(od.quantity * od.priceAtPurchase) FROM OrderDetail od
						WHERE od.product.id = p.id AND od.order.status = 'COMPLETED'), 0)
			)
			FROM Product p
			WHERE p.code = :productCode
			""")
    RevenueByProduct getRevenueByProduct(@Param("productCode") String productCode);
}
