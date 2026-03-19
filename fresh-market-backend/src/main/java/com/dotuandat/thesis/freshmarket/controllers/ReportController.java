package com.dotuandat.thesis.freshmarket.controllers;

import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.report.*;
import com.dotuandat.thesis.freshmarket.services.ReportService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReportController {
    ReportService reportService;

    @GetMapping("/order-summary")
    public ApiResponse<OrderSummary> getOrderSummary() {
        return ApiResponse.<OrderSummary>builder()
                .result(reportService.getOrderSummary())
                .build();
    }

    @GetMapping("/weekly-trend")
    public ApiResponse<List<WeeklyRevenueTrend>> getMonthlyRevenueTrend() {
        return ApiResponse.<List<WeeklyRevenueTrend>>builder()
                .result(reportService.getMonthlyRevenueTrend())
                .build();
    }

    @GetMapping("/order-type")
    public ApiResponse<List<RevenueByOrderType>> getRevenueByOrderType() {
        return ApiResponse.<List<RevenueByOrderType>>builder()
                .result(reportService.getRevenueByOrderType())
                .build();
    }

    @GetMapping("/category-report")
    public ApiResponse<List<CategoryReport>> getCategoryReport() {
        return ApiResponse.<List<CategoryReport>>builder()
                .result(reportService.getCategoryReport())
                .build();
    }

    @GetMapping("/supplier-report")
    public ApiResponse<List<SupplierReport>> getSupplierReport() {
        return ApiResponse.<List<SupplierReport>>builder()
                .result(reportService.getSupplierReport())
                .build();
    }

    @GetMapping("/user-growth")
    public ApiResponse<List<UserGrowthRate>> getUserGrowth() {
        return ApiResponse.<List<UserGrowthRate>>builder()
                .result(reportService.getUserGrowth())
                .build();
    }

    @GetMapping("/products/top-revenue")
    public ApiResponse<List<ProductReport>> getTop5ProductsByRevenue() {
        return ApiResponse.<List<ProductReport>>builder()
                .result(reportService.getTop5ProductsByRevenue())
                .build();
    }

    @GetMapping("/products/lowest-revenue")
    public ApiResponse<List<ProductReport>> getBottom5ProductsByRevenue() {
        return ApiResponse.<List<ProductReport>>builder()
                .result(reportService.getBottom5ProductsByRevenue())
                .build();
    }

    @GetMapping("/products/{productCode}")
    public ApiResponse<RevenueByProduct> getRevenueByProduct(@PathVariable String productCode) {
        return ApiResponse.<RevenueByProduct>builder()
                .result(reportService.getRevenueByProduct(productCode))
                .build();
    }
}
