package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.converters.RefundConverter;
import com.dotuandat.thesis.freshmarket.dtos.request.order.RefundRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.order.RefundStatusRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.order.RefundResponse;
import com.dotuandat.thesis.freshmarket.entities.Refund;
import com.dotuandat.thesis.freshmarket.entities.User;
import com.dotuandat.thesis.freshmarket.enums.RefundStatus;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.RefundRepository;
import com.dotuandat.thesis.freshmarket.repositories.UserRepository;
import com.dotuandat.thesis.freshmarket.services.RefundService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RefundServiceImpl implements RefundService {

    RefundRepository refundRepository;
    UserRepository userRepository;
    RefundConverter refundConverter;

    @Override
    @Transactional
    public PageResponse<RefundResponse> search(Pageable pageable) {
        Page<Refund> refunds = refundRepository.findAllByIsActive(StatusConstant.ACTIVE, pageable);
        List<RefundResponse> refundResponses =
                refunds.stream().map(refundConverter::toResponse).collect(Collectors.toList());
        return PageResponse.<RefundResponse>builder()
                .totalPage(refunds.getTotalPages())
                .currentPage(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .totalElements(refunds.getTotalElements())
                .data(refundResponses)
                .build();
    }

    @Override
    @Transactional
    public RefundResponse create(RefundRequest request, RefundStatus status) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Refund refund = refundConverter.toEntity(request);
        refund.setStatus(status);

        if (!username.equals(refund.getOrder().getUser().getUsername())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        refundRepository.save(refund);

        return refundConverter.toResponse(refund);
    }

    @Override
    @Transactional
    public PageResponse<RefundResponse> getAllByStatus(RefundStatus status, Pageable pageable) {
        Page<Refund> refunds = refundRepository.findAllByStatus(status, pageable);
        List<RefundResponse> refundResponses =
                refunds.stream().map(refundConverter::toResponse).collect(Collectors.toList());
        return PageResponse.<RefundResponse>builder()
                .totalPage(refunds.getTotalPages())
                .currentPage(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .totalElements(refunds.getTotalElements())
                .data(refundResponses)
                .build();
    }

    @Override
    @Transactional
    public RefundResponse getById(String id) {
        Refund refund = refundRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.REFUND_NOT_EXISTED));
        return refundConverter.toResponse(refund);
    }

    @Override
    @Transactional
    public PageResponse<RefundResponse> getByUser(RefundStatus status, String userId, Pageable pageable) {
        // check valid permission
        String currentUsername =
                SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepository
                .findByUsernameAndIsActive(currentUsername, StatusConstant.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!userId.equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        Page<Refund> refunds = refundRepository.findByStatusAndUser_Id(status, userId, pageable);

        List<RefundResponse> refundResponses =
                refunds.stream().map(refundConverter::toResponse).collect(Collectors.toList());

        return PageResponse.<RefundResponse>builder()
                .totalPage(refunds.getTotalPages())
                .currentPage(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .totalElements(refunds.getTotalElements())
                .data(refundResponses)
                .build();
    }

    @Override
    @Transactional
    public RefundResponse updateStatus(String refundId, RefundStatusRequest request) {

        Refund refund =
                refundRepository.findById(refundId).orElseThrow(() -> new AppException(ErrorCode.REFUND_NOT_EXISTED));

        if (request.getStatus() != RefundStatus.COMPLETED && request.getStatus() != RefundStatus.REJECTED) {
            throw new AppException(ErrorCode.CAN_NOT_EDITABLE);
        }

        refund.setStatus(request.getStatus());
        refund.setNote(request.getNote());
        refundRepository.save(refund);

        return refundConverter.toResponse(refund);
    }

    @Override
    public int countTotalPendingRefunds() {
        return refundRepository.countByStatus(RefundStatus.PENDING);
    }
}