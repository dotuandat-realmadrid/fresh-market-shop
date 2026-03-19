package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.order.RefundRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.order.RefundStatusRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.order.RefundResponse;
import com.dotuandat.thesis.freshmarket.enums.RefundStatus;
import org.springframework.data.domain.Pageable;

public interface RefundService {

    PageResponse<RefundResponse> search(Pageable pageable);

    RefundResponse create(RefundRequest request, RefundStatus status);

    PageResponse<RefundResponse> getAllByStatus(RefundStatus status, Pageable pageable);

    RefundResponse getById(String id);

    PageResponse<RefundResponse> getByUser(RefundStatus status, String userId, Pageable pageable);

    RefundResponse updateStatus(String refundId, RefundStatusRequest request);

    int countTotalPendingRefunds();
}
