package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.converters.OrderConverter;
import com.dotuandat.thesis.freshmarket.converters.ProductConverter;
import com.dotuandat.thesis.freshmarket.dtos.response.home.SaleStatistic;
import com.dotuandat.thesis.freshmarket.dtos.response.home.TimeSeriesStatistic;
import com.dotuandat.thesis.freshmarket.dtos.response.order.OrderResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
import com.dotuandat.thesis.freshmarket.entities.Order;
import com.dotuandat.thesis.freshmarket.entities.Product;
import com.dotuandat.thesis.freshmarket.repositories.HomeRepository;
import com.dotuandat.thesis.freshmarket.repositories.ProductRepository;
import com.dotuandat.thesis.freshmarket.services.HomeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class HomeServiceImpl implements HomeService {

    HomeRepository homeRepository;
    ProductRepository productRepository;
    OrderConverter orderConverter;
    ProductConverter productConverter;

    @Override
    @Transactional(readOnly = true)
    public List<SaleStatistic> getSaleStatistics() {
        LocalDateTime now = LocalDateTime.now();
        return Arrays.asList(
                getSaleStatisticForPeriod("today", "Hôm nay", now),
                getSaleStatisticForPeriod("thisMonth", "Tháng này", now),
                getSaleStatisticForPeriod("thisYear", "Năm nay", now));
    }

    private SaleStatistic getSaleStatisticForPeriod(String period, String periodLabel, LocalDateTime now) {
        LocalDateTime startDate, endDate, prevStartDate, prevEndDate;

        switch (period) {
            case "today":
                startDate = now.with(LocalTime.MIN);
                endDate = now.with(LocalTime.MAX);
                prevStartDate = now.minusDays(1).with(LocalTime.MIN);
                prevEndDate = now.minusDays(1).with(LocalTime.MAX);
                break;
            case "thisMonth":
                startDate = now.withDayOfMonth(1).with(LocalTime.MIN);
                endDate = now.withDayOfMonth(
                                now.getMonth().length(now.toLocalDate().isLeapYear()))
                        .with(LocalTime.MAX);
                prevStartDate = now.minusMonths(1).withDayOfMonth(1).with(LocalTime.MIN);
                prevEndDate = now.minusMonths(1)
                        .withDayOfMonth(now.minusMonths(1)
                                .getMonth()
                                .length(now.toLocalDate().isLeapYear()))
                        .with(LocalTime.MAX);
                break;
            case "thisYear":
                startDate = now.withDayOfYear(1).with(LocalTime.MIN);
                endDate = now.withMonth(12).withDayOfMonth(31).with(LocalTime.MAX);
                prevStartDate = now.minusYears(1).withDayOfYear(1).with(LocalTime.MIN);
                prevEndDate = now.minusYears(1).withMonth(12).withDayOfMonth(31).with(LocalTime.MAX);
                break;
            default:
                throw new IllegalArgumentException("Invalid period: " + period);
        }

        long totalProductsSold = homeRepository.getProductsSoldBetween(startDate, endDate);
        long totalRevenue = homeRepository.getRevenueBetween(startDate, endDate);
        long totalCustomers = homeRepository.getCustomersBetween(startDate, endDate);

        long prevProductsSold = homeRepository.getProductsSoldBetween(prevStartDate, prevEndDate);
        long prevRevenue = homeRepository.getRevenueBetween(prevStartDate, prevEndDate);
        long prevCustomers = homeRepository.getCustomersBetween(prevStartDate, prevEndDate);

        double salesGrowthPercent = calculateGrowthPercentage(totalProductsSold, prevProductsSold);
        double revenueGrowthPercent = calculateGrowthPercentage(totalRevenue, prevRevenue);
        double customersGrowthPercent = calculateGrowthPercentage(totalCustomers, prevCustomers);

        return SaleStatistic.builder()
                .totalProductsSold(totalProductsSold)
                .salesGrowthPercent(salesGrowthPercent)
                .totalRevenue(totalRevenue)
                .revenueGrowthPercent(revenueGrowthPercent)
                .totalCustomers(totalCustomers)
                .customersGrowthPercent(customersGrowthPercent)
                .period(period)
                .periodLabel(periodLabel)
                .build();
    }

    private double calculateGrowthPercentage(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return Math.round(((double) (current - previous) / previous) * 100 * 100.0) / 100.0;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeSeriesStatistic> getTimeSeriesStatistics(String period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate, endDate;

        switch (period) {
            case "today":
                startDate = now.with(LocalTime.MIN);
                endDate = now.with(LocalTime.MAX);
                return getHourlyStatistics(startDate, endDate);
            case "thisMonth":
                startDate = now.withDayOfMonth(1).with(LocalTime.MIN);
                endDate = now.withDayOfMonth(
                                now.getMonth().length(now.toLocalDate().isLeapYear()))
                        .with(LocalTime.MAX);
                return getDailyStatistics(startDate, endDate);
            case "thisYear":
                startDate = now.withDayOfYear(1).with(LocalTime.MIN);
                endDate = now.withMonth(12).withDayOfMonth(31).with(LocalTime.MAX);
                return getMonthlyStatistics(startDate, endDate);
            default:
                throw new IllegalArgumentException("Invalid period: " + period);
        }
    }

    private List<TimeSeriesStatistic> getHourlyStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        return homeRepository.getHourlyStatisticsOptimized(startDate, endDate).stream()
                .map(row -> TimeSeriesStatistic.builder()
                        .timestamp((String) row[0])
                        .totalProductsSold(((Number) row[1]).longValue())
                        .totalRevenue(((Number) row[2]).doubleValue() / 1_000.0)
                        .totalCustomers(((Number) row[3]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<TimeSeriesStatistic> getDailyStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        return homeRepository.getDailyStatisticsOptimized(startDate, endDate).stream()
                .map(row -> TimeSeriesStatistic.builder()
                        .timestamp((String) row[0])
                        .totalProductsSold(((Number) row[1]).longValue())
                        .totalRevenue(((Number) row[2]).doubleValue() / 1_000_000.0)
                        .totalCustomers(((Number) row[3]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<TimeSeriesStatistic> getMonthlyStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        return homeRepository.getMonthlyStatisticsOptimized(startDate, endDate).stream()
                .map(row -> TimeSeriesStatistic.builder()
                        .timestamp((String) row[0])
                        .totalProductsSold(((Number) row[1]).longValue())
                        .totalRevenue(((Number) row[2]).doubleValue() / 1_000_000_000.0)
                        .totalCustomers(((Number) row[3]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getRecentRevenue(String filter) {
        List<Order> orders = null;
        switch (filter) {
            case "today":
                orders = homeRepository.findTop5ByCreatedDateToday();
                break;
            case "thisMonth":
                orders = homeRepository.findTop5ByCreatedDateThisMonth();
                break;
            case "thisYear":
                orders = homeRepository.findTop5ByCreatedDateThisYear();
                break;
        }
        return orders.stream().map(orderConverter::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getTop5Products(String filter) {
        if (filter == null) {
            throw new IllegalArgumentException("Filter cannot be null. Valid options: today, thisMonth, thisYear");
        }

        Pageable topFive = PageRequest.of(0, 5);
        LocalDateTime startDate;
        LocalDateTime endDate;

        switch (filter) {
            case "today":
                startDate = LocalDate.now().atStartOfDay();
                endDate = LocalDateTime.now().with(LocalTime.MAX);
                break;
            case "thisMonth":
                startDate = LocalDate.now().withDayOfMonth(1).atStartOfDay();
                endDate = LocalDate.now().plusMonths(1).withDayOfMonth(1).atStartOfDay();
                break;
            case "thisYear":
                startDate = LocalDate.now().withDayOfYear(1).atStartOfDay();
                endDate = LocalDate.now().plusYears(1).withDayOfYear(1).atStartOfDay();
                break;
            default:
                throw new IllegalArgumentException(
                        "Invalid filter: " + filter + ". Valid options: today, thisMonth, thisYear");
        }

        // Query trả về Object[]: [0] = Product, [1] = SUM(od.quantity)
        List<Object[]> rows = switch (filter) {
            case "today" -> productRepository.findTop5BestSellersToday(startDate, endDate, topFive);
            case "thisMonth" -> productRepository.findTop5BestSellersThisMonth(startDate, endDate, topFive);
            case "thisYear" -> productRepository.findTop5BestSellersThisYear(startDate, endDate, topFive);
            default -> throw new IllegalArgumentException(
                    "Invalid filter: " + filter + ". Valid options: today, thisMonth, thisYear");
        };

        return rows.stream()
                .map(this::mapBestSellerRow)
                .collect(Collectors.toList());
    }

    /**
     * Map Object[] từ findTop5BestSellers* sang ProductResponse.
     * row[0] = Product, row[1] = SUM(od.quantity) as totalSold
     */
    private ProductResponse mapBestSellerRow(Object[] row) {
        Product product = (Product) row[0];
        int totalSold = ((Long) row[1]).intValue();
        ProductResponse response = productConverter.toResponse(product);
        response.setSoldQuantity(totalSold);
        return response;
    }

    /**
     * Map Object[] từ findProductsByExpiryDateRange sang ProductResponse.
     * row[0] = Product, row[1] = SUM(d.quantity) as totalQuantity
     */
    private ProductResponse mapExpiryProductRow(Object[] row) {
        Product product = (Product) row[0];
        int totalQuantity = ((Long) row[1]).intValue();
        ProductResponse response = productConverter.toResponse(product);
        response.setInventoryQuantity(totalQuantity);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts(int threshold) {
        // findLowStockProducts trả về List<Product> trực tiếp
        return productRepository.findLowStockProducts(threshold, PageRequest.of(0, 10))
                .stream()
                .map(productConverter::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getExpiringProducts(String filter) {
        Date startDate;
        Date endDate;

        switch (filter.toLowerCase()) {
            case "today":
                startDate = Date.from(LocalDate.now()
                        .atStartOfDay()
                        .atZone(ZoneId.systemDefault())
                        .toInstant());
                endDate = Date.from(LocalDateTime.now()
                        .with(LocalTime.MAX)
                        .atZone(ZoneId.systemDefault())
                        .toInstant());
                break;
            case "thismonth":
                startDate = Date.from(LocalDate.now()
                        .withDayOfMonth(1)
                        .atStartOfDay()
                        .atZone(ZoneId.systemDefault())
                        .toInstant());
                endDate = Date.from(LocalDate.now()
                        .withDayOfMonth(1)
                        .plusMonths(1)
                        .atStartOfDay()
                        .minusSeconds(1)
                        .atZone(ZoneId.systemDefault())
                        .toInstant());
                break;
            case "thisyear":
                startDate = Date.from(LocalDate.now()
                        .withDayOfYear(1)
                        .atStartOfDay()
                        .atZone(ZoneId.systemDefault())
                        .toInstant());
                endDate = Date.from(LocalDate.now()
                        .plusMonths(3)
                        .atTime(LocalTime.MAX)
                        .atZone(ZoneId.systemDefault())
                        .toInstant());
                break;
            default:
                throw new IllegalArgumentException(
                        "Invalid filter: " + filter + ". Valid options: today, thisMonth, thisYear");
        }

        // findProductsByExpiryDateRange trả về Object[]: [0] = Product, [1] = SUM(d.quantity)
        return productRepository.findProductsByExpiryDateRange(startDate, endDate)
                .stream()
                .map(this::mapExpiryProductRow)
                .collect(Collectors.toList());
    }
}