package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.converters.InventoryReceiptConverter;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryReceiptRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventorySearchRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.inventoryReceipt.InventoryStatusRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.inventoryReceipt.InventoryReceiptDetailResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.inventoryReceipt.InventoryReceiptResponse;
import com.dotuandat.thesis.freshmarket.entities.InventoryReceipt;
import com.dotuandat.thesis.freshmarket.entities.InventoryReceiptDetail;
import com.dotuandat.thesis.freshmarket.entities.Product;
import com.dotuandat.thesis.freshmarket.enums.InventoryStatus;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.InventoryReceiptDetailRepository;
import com.dotuandat.thesis.freshmarket.repositories.InventoryReceiptRepository;
import com.dotuandat.thesis.freshmarket.repositories.ProductRepository;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import com.dotuandat.thesis.freshmarket.services.InventoryReceiptService;
import com.dotuandat.thesis.freshmarket.specifications.InventorySpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InventoryReceiptServiceImpl implements InventoryReceiptService {
    InventoryReceiptRepository receiptRepository;
    ProductRepository productRepository;
    InventoryReceiptDetailRepository receiptDetailRepository;
    ModelMapper modelMapper;
    InventoryReceiptConverter converter;
    ActivityLogService activityLogService;

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('CRU_RECEIPT')")
    public PageResponse<InventoryReceiptResponse> search(InventorySearchRequest request, Pageable pageable) {
        Specification<InventoryReceipt> specification = Specification.where(
                        InventorySpecification.withId(request.getId()))
                .and(InventorySpecification.withEmail(request.getEmail()))
                .and(InventorySpecification.withDateRange(request.getStartDate(), request.getEndDate()));

        Page<InventoryReceipt> receipts = receiptRepository.findAll(specification, pageable);

        List<InventoryReceiptResponse> receiptResponses = receipts.stream()
                .map((receipt) -> modelMapper.map(receipt, InventoryReceiptResponse.class))
                .toList();

        return PageResponse.<InventoryReceiptResponse>builder()
                .totalPage(receipts.getTotalPages())
                .pageSize(pageable.getPageSize())
                .currentPage(pageable.getPageNumber() + 1)
                .totalElements(receipts.getTotalElements())
                .data(receiptResponses)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('CRU_RECEIPT')")
    public PageResponse<InventoryReceiptResponse> getAllByStatus(InventoryStatus status, Pageable pageable) {
        Page<InventoryReceipt> receipts = receiptRepository.findAllByStatus(status, pageable);

        List<InventoryReceiptResponse> receiptResponses = receipts.stream()
                .map((receipt) -> modelMapper.map(receipt, InventoryReceiptResponse.class))
                .toList();

        return PageResponse.<InventoryReceiptResponse>builder()
                .totalPage(receipts.getTotalPages())
                .pageSize(pageable.getPageSize())
                .currentPage(pageable.getPageNumber() + 1)
                .totalElements(receipts.getTotalElements())
                .data(receiptResponses)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('CRU_RECEIPT')")
    public InventoryReceiptResponse getById(String id) {
        InventoryReceipt receipt = receiptRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_RECEIPT_NOT_EXISTED));

        return converter.toResponse(receipt, receipt.getDetails());
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CRU_RECEIPT')")
    public InventoryReceiptResponse create(InventoryReceiptRequest request) {
        // save receipt
        InventoryReceipt receipt = InventoryReceipt.builder()
                .totalAmount(request.getTotalAmount())
                .status(InventoryStatus.PENDING)
                .note(request.getNote())
                .createdDate(LocalDateTime.now())
                .modifiedDate(LocalDateTime.now())
                .build();

        // receipt detail
        List<InventoryReceiptDetail> details = converter.toDetailEntity(receipt, request.getDetails());
        receipt.setDetails(details);

        receiptRepository.save(receipt);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(username, "CREATE", "Tài khoản " + username + " vừa thêm phiếu nhập");

        return converter.toResponse(receipt, details);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('CRU_RECEIPT')")
    public InventoryReceiptResponse update(String id, InventoryReceiptRequest request) {
        InventoryReceipt receipt = receiptRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_RECEIPT_NOT_EXISTED));

        // Chỉ update khi ở trạng thái pending
        if (!InventoryStatus.PENDING.equals(receipt.getStatus())) throw new AppException(ErrorCode.CAN_NOT_EDITABLE);

        // save updated receipt
        receipt.setTotalAmount(request.getTotalAmount());
        receipt.setNote(request.getNote());
        receipt.setModifiedDate(LocalDateTime.now());

        // Xóa liên kết cũ
        receipt.getDetails().clear();

        // Thêm danh sách mới
        receipt.getDetails().addAll(converter.toDetailEntity(receipt, request.getDetails()));

        receiptRepository.save(receipt);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(username, "UPDATE", "Tài khoản " + username + " vừa cập nhật phiếu nhập");

        return converter.toResponse(receipt, receipt.getDetails());
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public InventoryReceiptResponse updateStatus(String id, InventoryStatusRequest request) {
        InventoryReceipt receipt = receiptRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_RECEIPT_NOT_EXISTED));

        // Chỉ update khi ở trạng thái pending
        if (!InventoryStatus.PENDING.equals(receipt.getStatus())) throw new AppException(ErrorCode.CAN_NOT_EDITABLE);

        // New status: COMPLETED, update số lượng sản phẩm
        if (InventoryStatus.COMPLETED.equals(request.getStatus())) {
            updateProductInventory(receipt);
        }

        receipt.setStatus(request.getStatus());
        receipt.setModifiedDate(LocalDateTime.now());
        receiptRepository.save(receipt);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(username, "UPDATE", "Tài khoản " + username + " vừa cập nhật trạng thái phiếu nhập");

        return converter.toResponse(receipt, receipt.getDetails());
    }

    @Override
    public int countTotalPendingReceipts() {
        return receiptRepository.countByStatus(InventoryStatus.PENDING);
    }

    private void updateProductInventory(InventoryReceipt receipt) {
        List<Product> updatedProducts = receipt.getDetails().stream()
                .map(detail -> {
                    Product product = detail.getProduct();
                    // update inventory quantity
                    product.setInventoryQuantity(product.getInventoryQuantity() + detail.getQuantity());
                    return product;
                })
                .toList();

        productRepository.saveAll(updatedProducts);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryReceiptResponse> getExpiringProducts(String filter) {
        // Xác định khoảng thời gian
        Date startDate, endDate;
        switch (filter.toLowerCase()) {
            case "today":
                startDate = Date.from(
                        LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant());
                endDate = Date.from(LocalDate.now()
                        .atTime(23, 59, 59)
                        .atZone(ZoneId.systemDefault())
                        .toInstant());
                break;
            case "thismonth":
                startDate = Date.from(LocalDate.now()
                        .withDayOfMonth(1)
                        .atStartOfDay(ZoneId.systemDefault())
                        .toInstant());
                endDate = Date.from(LocalDate.now()
                        .withDayOfMonth(LocalDate.now().lengthOfMonth())
                        .atTime(23, 59, 59)
                        .atZone(ZoneId.systemDefault())
                        .toInstant());
                break;
            case "thisyear":
                startDate = Date.from(LocalDate.now()
                        .withDayOfYear(1)
                        .atStartOfDay(ZoneId.systemDefault())
                        .toInstant());
                endDate = Date.from(LocalDate.now()
                        .withDayOfYear(LocalDate.now().lengthOfYear())
                        .atTime(23, 59, 59)
                        .atZone(ZoneId.systemDefault())
                        .toInstant());
                break;
            default:
                throw new IllegalArgumentException("Invalid filter: " + filter);
        }

        // Lấy danh sách InventoryReceiptDetailResponse
        List<InventoryReceiptDetailResponse> details =
                receiptDetailRepository.findProductsByExpiryDateRange(startDate, endDate);

        // Nhóm details theo receipt_id
        Map<String, List<InventoryReceiptDetailResponse>> groupedByReceipt = details.stream()
                .collect(Collectors.groupingBy(detail -> {
                    InventoryReceiptDetail detailEntity =
                            receiptDetailRepository.findById(detail.getId()).orElse(null);
                    return detailEntity != null ? detailEntity.getReceipt().getId() : null;
                }));

        // Chuyển thành InventoryReceiptResponse sử dụng converter
        return groupedByReceipt.entrySet().stream()
                .filter(entry -> entry.getKey() != null)
                .map(entry -> {
                    InventoryReceipt receipt =
                            receiptRepository.findById(entry.getKey()).orElse(null);
                    if (receipt == null) return null;
                    // Sử dụng mối quan hệ @OneToMany để lấy details
                    List<InventoryReceiptDetail> detailEntities = receipt.getDetails();
                    return converter.toResponse(
                            receipt, detailEntities != null ? detailEntities : Collections.emptyList());
                })
                .filter(response -> response != null)
                .collect(Collectors.toList());
    }
}
