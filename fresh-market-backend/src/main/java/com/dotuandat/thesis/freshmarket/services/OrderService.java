package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.order.OrderRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.order.OrderSearchRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.order.OrderStatusRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.order.OrderResponse;
import com.dotuandat.thesis.freshmarket.enums.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

public interface OrderService {
    PageResponse<OrderResponse> search(OrderSearchRequest request, Pageable pageable);

    OrderResponse create(OrderRequest request, OrderStatus status);

    OrderResponse createWithId(String id, OrderRequest request, OrderStatus status);

    OrderResponse getOneByOrderId(String orderId);

    OrderResponse getById(String orderId);

    OrderResponse getByIdAndEmail(String id, String email);

    PageResponse<OrderResponse> getByUser(OrderStatus status, String userId, Pageable pageable);

    OrderResponse cancel(String orderId);

    PageResponse<OrderResponse> getAllByStatus(OrderStatus status, Pageable pageable);

    OrderResponse updateStatus(String orderId, OrderStatusRequest request);

    int countTotalPendingOrders();

    @Transactional
    void cancelBySystem(String orderId);
}
