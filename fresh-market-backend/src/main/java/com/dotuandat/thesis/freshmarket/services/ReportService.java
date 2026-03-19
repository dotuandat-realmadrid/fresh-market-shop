package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.response.report.*;

import java.util.List;

public interface ReportService {
    OrderSummary getOrderSummary();

    List<WeeklyRevenueTrend> getMonthlyRevenueTrend();

    List<RevenueByOrderType> getRevenueByOrderType();

    List<CategoryReport> getCategoryReport();

    List<SupplierReport> getSupplierReport();

    List<UserGrowthRate> getUserGrowth();

    List<ProductReport> getTop5ProductsByRevenue();

    List<ProductReport> getBottom5ProductsByRevenue();

    RevenueByProduct getRevenueByProduct(String productCode);
}
