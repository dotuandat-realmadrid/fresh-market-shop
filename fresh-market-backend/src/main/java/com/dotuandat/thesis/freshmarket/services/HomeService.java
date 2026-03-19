package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.response.home.SaleStatistic;
import com.dotuandat.thesis.freshmarket.dtos.response.home.TimeSeriesStatistic;
import com.dotuandat.thesis.freshmarket.dtos.response.order.OrderResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;

import java.util.List;

public interface HomeService {
    List<SaleStatistic> getSaleStatistics();

    List<TimeSeriesStatistic> getTimeSeriesStatistics(String period);

    List<OrderResponse> getRecentRevenue(String filter);

    List<ProductResponse> getTop5Products(String filter);

    List<ProductResponse> getLowStockProducts(int threshold);

    List<ProductResponse> getExpiringProducts(String filter);
}
