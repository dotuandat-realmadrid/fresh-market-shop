// package com.dotuandat.thesis.freshmarket.repositories;
//
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;
// import org.springframework.stereotype.Repository;
//
// import com.dotuandat.thesis.freshmarket.entities.Order;
// import java.time.LocalDateTime;
// import java.util.List;
//
// @Repository
// public interface HomeRepository extends JpaRepository<Order, String> {
//
//    // Tổng số sản phẩm bán được trong khoảng thời gian
//    @Query("""
//        SELECT COALESCE(SUM(od.quantity), 0) FROM Order o
//        JOIN o.orderDetails od
//        WHERE o.createdDate >= :startDate AND o.createdDate < :endDate
//        AND o.status = 'COMPLETED'
//        """)
//    long getProductsSoldBetween(
//        @Param("startDate") LocalDateTime startDate,
//        @Param("endDate") LocalDateTime endDate
//    );
//
//    // Tổng doanh thu trong khoảng thời gian
//    @Query(nativeQuery = true, value = """
//        SELECT COALESCE(SUM(o.total_price), 0) FROM `order` o
//        WHERE o.createdDate >= :startDate AND o.createdDate < :endDate
//        AND o.status = 'COMPLETED'
//        """)
//    long getRevenueBetween(
//        @Param("startDate") LocalDateTime startDate,
//        @Param("endDate") LocalDateTime endDate
//    );
//
//    // Tổng số khách hàng duy nhất trong khoảng thời gian
//    @Query(nativeQuery = true, value = """
//        SELECT COALESCE(COUNT(DISTINCT u.username), 0)
//        FROM `order` o
//        JOIN `user` u ON o.user_id = u.id
//        WHERE o.createdDate >= :startDate AND o.createdDate < :endDate
//        AND o.status = 'COMPLETED'
//        """)
//    long getCustomersBetween(
//        @Param("startDate") LocalDateTime startDate,
//        @Param("endDate") LocalDateTime endDate
//    );
//
//    // Dữ liệu time-series cho "Hôm nay" (theo giờ, cách 1 giờ)
//    @Query(nativeQuery = true, value = """
//        WITH RECURSIVE time_series AS (
//		    SELECT '2025-07-21 00:00:00' AS hour_start
//		    UNION ALL
//		    SELECT DATE_ADD(hour_start, INTERVAL 1 HOUR)
//		    FROM time_series
//		    WHERE hour_start < '2025-07-22 00:00:00'
//		)
//		SELECT
//		    DATE_FORMAT(time_series.hour_start, '%Y-%m-%dT%H:00:00.000Z') AS timestamp,
//		    COALESCE(
//		        (SELECT SUM(od2.quantity)
//		         FROM `order` o2
//		         JOIN order_detail od2 ON o2.id = od2.order_id
//		         WHERE o2.createdDate >= time_series.hour_start
//		         AND o2.createdDate < DATE_ADD(time_series.hour_start, INTERVAL 1 HOUR)
//		         AND o2.status = 'COMPLETED'), 0
//		    ) AS totalProductsSold,
//		    COALESCE(
//		        (SELECT SUM(o3.total_price)
//		         FROM `order` o3
//		         WHERE o3.createdDate >= time_series.hour_start
//		         AND o3.createdDate < DATE_ADD(time_series.hour_start, INTERVAL 1 HOUR)
//		         AND o3.status = 'COMPLETED'), 0
//		    ) AS totalRevenue,
//		    COALESCE(
//		        (SELECT COUNT(DISTINCT u.username)
//		         FROM `order` o4
//		         JOIN `user` u ON o4.user_id = u.id
//		         WHERE o4.createdDate >= time_series.hour_start
//		         AND o4.createdDate < DATE_ADD(time_series.hour_start, INTERVAL 1 HOUR)
//		         AND o4.status = 'COMPLETED'), 0
//		    ) AS totalCustomers
//		FROM time_series
//		ORDER BY time_series.hour_start;
//        """)
//    List<Object[]> getHourlyStatistics(
//        @Param("startDate") LocalDateTime startDate,
//        @Param("endDate") LocalDateTime endDate
//    );
//
//    // Dữ liệu time-series cho "Tháng này" (theo ngày) - FIXED
//    @Query(nativeQuery = true, value = """
//        WITH RECURSIVE time_series AS (
//            SELECT :startDate AS day_start
//            UNION ALL
//            SELECT DATE_ADD(day_start, INTERVAL 1 DAY)
//            FROM time_series
//            WHERE day_start < :endDate
//        )
//        SELECT
//            DATE_FORMAT(time_series.day_start, '%Y-%m-%dT00:00:00.000Z') AS timestamp,
//            COALESCE(
//                (SELECT SUM(od2.quantity)
//                 FROM `order` o2
//                 JOIN order_detail od2 ON o2.id = od2.order_id
//                 WHERE o2.createdDate >= time_series.day_start
//                 AND o2.createdDate < DATE_ADD(time_series.day_start, INTERVAL 1 DAY)
//                 AND o2.status = 'COMPLETED'), 0
//            ) AS totalProductsSold,
//            COALESCE(
//                (SELECT SUM(o3.total_price)
//                 FROM `order` o3
//                 WHERE o3.createdDate >= time_series.day_start
//                 AND o3.createdDate < DATE_ADD(time_series.day_start, INTERVAL 1 DAY)
//                 AND o3.status = 'COMPLETED'), 0
//            ) AS totalRevenue,
//            COALESCE(
//                (SELECT COUNT(DISTINCT u.username)
//                 FROM `order` o4
//                 JOIN `user` u ON o4.user_id = u.id
//                 WHERE o4.createdDate >= time_series.day_start
//                 AND o4.createdDate < DATE_ADD(time_series.day_start, INTERVAL 1 DAY)
//                 AND o4.status = 'COMPLETED'), 0
//            ) AS totalCustomers
//        FROM time_series
//        ORDER BY time_series.day_start
//        """)
//    List<Object[]> getDailyStatistics(
//        @Param("startDate") LocalDateTime startDate,
//        @Param("endDate") LocalDateTime endDate
//    );
//
//    // Dữ liệu time-series cho "Năm nay" (theo tháng) - FIXED
//    @Query(nativeQuery = true, value = """
//        WITH RECURSIVE time_series AS (
//            SELECT :startDate AS month_start
//            UNION ALL
//            SELECT DATE_ADD(month_start, INTERVAL 1 MONTH)
//            FROM time_series
//            WHERE month_start < :endDate
//        )
//        SELECT
//            DATE_FORMAT(time_series.month_start, '%Y-%m-01T00:00:00.000Z') AS timestamp,
//            COALESCE(
//                (SELECT SUM(od2.quantity)
//                 FROM `order` o2
//                 JOIN order_detail od2 ON o2.id = od2.order_id
//                 WHERE o2.createdDate >= time_series.month_start
//                 AND o2.createdDate < DATE_ADD(time_series.month_start, INTERVAL 1 MONTH)
//                 AND o2.status = 'COMPLETED'), 0
//            ) AS totalProductsSold,
//            COALESCE(
//                (SELECT SUM(o3.total_price)
//                 FROM `order` o3
//                 WHERE o3.createdDate >= time_series.month_start
//                 AND o3.createdDate < DATE_ADD(time_series.month_start, INTERVAL 1 MONTH)
//                 AND o3.status = 'COMPLETED'), 0
//            ) AS totalRevenue,
//            COALESCE(
//                (SELECT COUNT(DISTINCT u.username)
//                 FROM `order` o4
//                 JOIN `user` u ON o4.user_id = u.id
//                 WHERE o4.createdDate >= time_series.month_start
//                 AND o4.createdDate < DATE_ADD(time_series.month_start, INTERVAL 1 MONTH)
//                 AND o4.status = 'COMPLETED'), 0
//            ) AS totalCustomers
//        FROM time_series
//        ORDER BY time_series.month_start
//        """)
//    List<Object[]> getMonthlyStatistics(
//        @Param("startDate") LocalDateTime startDate,
//        @Param("endDate") LocalDateTime endDate
//    );
// }

package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HomeRepository extends JpaRepository<Order, String> {

    // Lấy 5 đơn hàng mới nhất trong ngày hôm nay
    @Query(
            value = "SELECT * FROM `order` WHERE DATE(createdDate) = CURDATE() ORDER BY createdDate DESC LIMIT 5",
            nativeQuery = true)
    List<Order> findTop5ByCreatedDateToday();

    // Lấy 5 đơn hàng mới nhất trong tháng này
    @Query(
            value =
                    """
	SELECT * FROM `order`
	WHERE YEAR(createdDate) = YEAR(CURDATE()) AND MONTH(createdDate) = MONTH(CURDATE())
	ORDER BY createdDate DESC LIMIT 5
	""",
            nativeQuery = true)
    List<Order> findTop5ByCreatedDateThisMonth();

    // Lấy 5 đơn hàng mới nhất trong năm nay
    @Query(
            value = "SELECT * FROM `order` WHERE YEAR(createdDate) = YEAR(CURDATE()) ORDER BY createdDate DESC LIMIT 5",
            nativeQuery = true)
    List<Order> findTop5ByCreatedDateThisYear();

    // Tổng số sản phẩm bán được trong khoảng thời gian
    @Query(
            """
		SELECT COALESCE(SUM(od.quantity), 0) FROM Order o
		JOIN o.orderDetails od
		WHERE o.createdDate >= :startDate AND o.createdDate < :endDate
		AND o.status = 'COMPLETED'
		""")
    long getProductsSoldBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Tổng doanh thu trong khoảng thời gian
    @Query(
            nativeQuery = true,
            value =
                    """
		SELECT COALESCE(SUM(o.total_price), 0) FROM `order` o
		WHERE o.createdDate >= :startDate AND o.createdDate < :endDate
		AND o.status = 'COMPLETED'
		""")
    long getRevenueBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Tổng số khách hàng duy nhất trong khoảng thời gian
    @Query(
            nativeQuery = true,
            value =
                    """
		SELECT COALESCE(COUNT(DISTINCT u.username), 0)
		FROM `order` o
		JOIN `user` u ON o.user_id = u.id
		WHERE o.createdDate >= :startDate AND o.createdDate < :endDate
		AND o.status = 'COMPLETED'
		""")
    long getCustomersBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(
            nativeQuery = true,
            value =
                    """
		WITH RECURSIVE time_series AS (
			SELECT :startDate AS time_start
			UNION ALL
			SELECT DATE_ADD(time_start, INTERVAL 1 HOUR)
			FROM time_series
			WHERE time_start < :endDate
		),
		order_stats AS (
			SELECT
				o.id,
				o.createdDate,
				o.total_price,
				u.username,
				SUM(od.quantity) as order_quantity
			FROM `order` o
			JOIN order_detail od ON o.id = od.order_id
			JOIN `user` u ON o.user_id = u.id
			WHERE o.createdDate >= :startDate
			AND o.createdDate < :endDate
			AND o.status = 'COMPLETED'
			GROUP BY o.id, o.createdDate, o.total_price, u.username
		)
		SELECT
			DATE_FORMAT(ts.time_start, '%Y-%m-%dT%H:00:00.000Z') AS timestamp,
			COALESCE(SUM(os.order_quantity), 0) AS totalProductsSold,
			COALESCE(SUM(os.total_price), 0) AS totalRevenue,
			COALESCE(COUNT(DISTINCT os.username), 0) AS totalCustomers
		FROM time_series ts
		LEFT JOIN order_stats os ON
			os.createdDate >= ts.time_start
			AND os.createdDate < DATE_ADD(ts.time_start, INTERVAL 1 HOUR)
		GROUP BY ts.time_start
		ORDER BY ts.time_start
		""")
    List<Object[]> getHourlyStatisticsOptimized(
            @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(
            nativeQuery = true,
            value =
                    """
		WITH RECURSIVE time_series AS (
			SELECT :startDate AS day_start
			UNION ALL
			SELECT DATE_ADD(day_start, INTERVAL 1 DAY)
			FROM time_series
			WHERE day_start < :endDate
		)
		SELECT
			DATE_FORMAT(ts.day_start, '%Y-%m-%dT00:00:00.000Z') AS timestamp,
			COALESCE(daily_data.totalProductsSold, 0) AS totalProductsSold,
			COALESCE(daily_data.totalRevenue, 0) AS totalRevenue,
			COALESCE(daily_data.totalCustomers, 0) AS totalCustomers
		FROM time_series ts
		LEFT JOIN (
			SELECT
				DATE(o.createdDate) as order_date,
				SUM(od.quantity) as totalProductsSold,
				SUM(o.total_price) as totalRevenue,
				COUNT(DISTINCT u.username) as totalCustomers
			FROM `order` o
			JOIN order_detail od ON o.id = od.order_id
			JOIN `user` u ON o.user_id = u.id
			WHERE o.createdDate >= :startDate
			AND o.createdDate < :endDate
			AND o.status = 'COMPLETED'
			GROUP BY DATE(o.createdDate)
		) daily_data ON DATE(ts.day_start) = daily_data.order_date
		ORDER BY ts.day_start
		""")
    List<Object[]> getDailyStatisticsOptimized(
            @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(
            nativeQuery = true,
            value =
                    """
		WITH RECURSIVE time_series AS (
			SELECT :startDate AS month_start
			UNION ALL
			SELECT DATE_ADD(month_start, INTERVAL 1 MONTH)
			FROM time_series
			WHERE month_start < :endDate
		)
		SELECT
			DATE_FORMAT(ts.month_start, '%Y-%m-01T00:00:00.000Z') AS timestamp,
			COALESCE(monthly_data.totalProductsSold, 0) AS totalProductsSold,
			COALESCE(monthly_data.totalRevenue, 0) AS totalRevenue,
			COALESCE(monthly_data.totalCustomers, 0) AS totalCustomers
		FROM time_series ts
		LEFT JOIN (
			SELECT
				DATE_FORMAT(o.createdDate, '%Y-%m-01') as month_key,
				SUM(od.quantity) as totalProductsSold,
				SUM(o.total_price) as totalRevenue,
				COUNT(DISTINCT u.username) as totalCustomers
			FROM `order` o
			JOIN order_detail od ON o.id = od.order_id
			JOIN `user` u ON o.user_id = u.id
			WHERE o.createdDate >= :startDate
			AND o.createdDate < :endDate
			AND o.status = 'COMPLETED'
			GROUP BY DATE_FORMAT(o.createdDate, '%Y-%m-01')
		) monthly_data ON DATE_FORMAT(ts.month_start, '%Y-%m-01') = monthly_data.month_key
		ORDER BY ts.month_start
		""")
    List<Object[]> getMonthlyStatisticsOptimized(
            @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(
            nativeQuery = true,
            value =
                    """
		SELECT
			SUM(od.quantity) as totalProductsSold,
			SUM(o.total_price) as totalRevenue,
			COUNT(DISTINCT u.username) as totalCustomers,
			COUNT(DISTINCT o.id) as totalOrders
		FROM `order` o
		JOIN order_detail od ON o.id = od.order_id
		JOIN `user` u ON o.user_id = u.id
		WHERE o.createdDate >= :startDate
		AND o.createdDate < :endDate
		AND o.status = 'COMPLETED'
		""")
    Object[] getAllMetricsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
