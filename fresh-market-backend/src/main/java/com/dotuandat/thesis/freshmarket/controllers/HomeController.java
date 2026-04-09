package com.dotuandat.thesis.freshmarket.controllers;

import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.home.ActivityLogResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.home.SaleStatistic;
import com.dotuandat.thesis.freshmarket.dtos.response.home.TimeSeriesStatistic;
import com.dotuandat.thesis.freshmarket.dtos.response.inventoryReceipt.InventoryReceiptResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.order.OrderResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import com.dotuandat.thesis.freshmarket.services.HomeService;
import com.dotuandat.thesis.freshmarket.services.InventoryReceiptService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/home")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HomeController {

    HomeService homeService;
    ActivityLogService activityLogService;
    InventoryReceiptService receiptService;

    @GetMapping("/sales")
    public ApiResponse<List<SaleStatistic>> getSalesStatistics() {
        return ApiResponse.<List<SaleStatistic>>builder()
                .result(homeService.getSaleStatistics())
                .build();
    }

    @GetMapping("/time-series")
    public ApiResponse<List<TimeSeriesStatistic>> getTimeSeriesStatistics(
            @RequestParam(defaultValue = "today") String period) {
        return ApiResponse.<List<TimeSeriesStatistic>>builder()
                .result(homeService.getTimeSeriesStatistics(period))
                .build();
    }

    @GetMapping("/recent-revenue")
    public ApiResponse<List<OrderResponse>> getRecentRevenue(
            @RequestParam(value = "filter", defaultValue = "thisMonth") String filter) {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(homeService.getRecentRevenue(filter))
                .build();
    }

    @GetMapping("/top-products")
    public ApiResponse<List<ProductResponse>> getTop5Products(
            @RequestParam(value = "filter", defaultValue = "today") String filter) {
        return ApiResponse.<List<ProductResponse>>builder()
                .result(homeService.getTop5Products(filter))
                .build();
    }

    @GetMapping("/recent-activities")
    public ApiResponse<List<ActivityLogResponse>> getRecentActivities(
            @RequestParam(value = "filter", defaultValue = "today") String filter) {
        Pageable topTen = PageRequest.of(0, 10);
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

        return ApiResponse.<List<ActivityLogResponse>>builder()
                .result(activityLogService.findRecentActivities(startDate, endDate, topTen))
                .build();
    }

    @GetMapping("/low-stock")
    public ApiResponse<List<ProductResponse>> getLowStockProducts(@RequestParam(defaultValue = "10") int threshold) {
        return ApiResponse.<List<ProductResponse>>builder()
                .result(homeService.getLowStockProducts(threshold))
                .build();
    }

    @GetMapping("/expiring-receipts")
    public ApiResponse<List<InventoryReceiptResponse>> getExpiringReceipts(
            @RequestParam(value = "filter", defaultValue = "thismonth") String filter) {
        return ApiResponse.<List<InventoryReceiptResponse>>builder()
                .result(receiptService.getExpiringProducts(filter))
                .build();
    }

    @GetMapping("/expiring-products")
    public ApiResponse<List<ProductResponse>> getExpiringProducts(
            @RequestParam(value = "filter", defaultValue = "thismonth") String filter) {
        return ApiResponse.<List<ProductResponse>>builder()
                .result(homeService.getExpiringProducts(filter))
                .build();
    }
}
