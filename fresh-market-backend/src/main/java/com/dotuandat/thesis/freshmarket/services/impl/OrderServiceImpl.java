package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.converters.OrderConverter;
import com.dotuandat.thesis.freshmarket.dtos.request.order.OrderRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.order.OrderSearchRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.order.OrderStatusRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.order.OrderResponse;
import com.dotuandat.thesis.freshmarket.entities.Order;
import com.dotuandat.thesis.freshmarket.entities.OrderDetail;
import com.dotuandat.thesis.freshmarket.entities.Product;
import com.dotuandat.thesis.freshmarket.entities.User;
import com.dotuandat.thesis.freshmarket.enums.OrderStatus;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.OrderRepository;
import com.dotuandat.thesis.freshmarket.repositories.ProductRepository;
import com.dotuandat.thesis.freshmarket.repositories.UserRepository;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import com.dotuandat.thesis.freshmarket.services.OrderService;
import com.dotuandat.thesis.freshmarket.specifications.OrderSpecification;
import com.dotuandat.thesis.freshmarket.utils.AuthUtils;
import com.dotuandat.thesis.freshmarket.utils.PointCalculator;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderServiceImpl implements OrderService {
    OrderRepository orderRepository;
    OrderConverter orderConverter;
    ProductRepository productRepository;
    UserRepository userRepository;
    ActivityLogService activityLogService;

    @Override
    public PageResponse<OrderResponse> search(OrderSearchRequest request, Pageable pageable) {
        Specification<Order> specification = Specification.where(OrderSpecification.withId(request.getId()))
                .and(OrderSpecification.withEmail(request.getEmail()))
                .and(OrderSpecification.withPhone(request.getPhone()))
                .and(OrderSpecification.withFullName(request.getFullName()))
                .and(OrderSpecification.withDateRange(request.getStartDate(), request.getEndDate()));

        Page<Order> orders = orderRepository.findAll(specification, pageable);

        List<OrderResponse> orderResponses =
                orders.stream().map(orderConverter::toResponse).toList();

        return PageResponse.<OrderResponse>builder()
                .currentPage(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .totalElements(orders.getTotalElements())
                .totalPage(orders.getTotalPages())
                .data(orderResponses)
                .build();
    }

    @Override
    @Transactional
    public OrderResponse create(OrderRequest request, OrderStatus status) {
        Order order = orderConverter.toEntity(request);
        order.setStatus(status);
        order.setCreatedDate(LocalDateTime.now());

        List<OrderDetail> details = orderConverter.toDetailEntity(order, request.getDetails());
        order.setOrderDetails(details);

        updateInventoryQuantity(details, false); // - inventory quantity

        orderRepository.save(order);

        // Handle anonymous (VNPay callback không có token)
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            String username = authentication.getName();
            activityLogService.create(username, "CREATE", "Tài khoản " + username + " vừa thêm đơn hàng");
        }

        return orderConverter.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse createWithId(String id, OrderRequest request, OrderStatus status) {
        Order order = orderConverter.toEntity(request);
        order.setId(id);
        order.setStatus(status);
        order.setCreatedDate(LocalDateTime.now());

        List<OrderDetail> details = orderConverter.toDetailEntity(order, request.getDetails());
        order.setOrderDetails(details);

        updateInventoryQuantity(details, false); // - inventory quantity

        orderRepository.save(order);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(username, "CREATE", "Tài khoản " + username + " vừa thêm đơn hàng");

        return orderConverter.toResponse(order);
    }

    @Override
    public OrderResponse getOneByOrderId(String orderId) {
        Order order = validatePermission(orderId);
        return orderConverter.toResponse(order);
    }

    @Override
    public OrderResponse getById(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_EXISTED));
        return orderConverter.toResponse(order);
    }

    @Override
    public OrderResponse getByIdAndEmail(String id, String email) {
        return orderConverter.toResponse(orderRepository
                .findByIdAndUser_Username(id, email)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_EXISTED)));
    }

    @Override
    public PageResponse<OrderResponse> getByUser(OrderStatus status, String userId, Pageable pageable) {
        // check valid permission
        String currentUsername =
                SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepository
                .findByUsernameAndIsActive(currentUsername, StatusConstant.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!userId.equals(currentUser.getId()) && !AuthUtils.hasPermission("RUD_ORDER")) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        //
        Page<Order> orders = orderRepository.findByStatusAndUser_Id(status, userId, pageable);

        List<OrderResponse> orderResponses =
                orders.stream().map(orderConverter::toResponse).toList();

        return PageResponse.<OrderResponse>builder()
                .currentPage(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .totalElements(orders.getTotalElements())
                .totalPage(orders.getTotalPages())
                .data(orderResponses)
                .build();
    }

    @Override
    @Transactional
    public OrderResponse cancel(String orderId) {
        Order order = validatePermission(orderId);

        handleCancel(order);

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        return orderConverter.toResponse(order);
    }

    @Override
    @PreAuthorize("hasAuthority('RUD_ORDER')")
    public PageResponse<OrderResponse> getAllByStatus(OrderStatus status, Pageable pageable) {
        Page<Order> orders = orderRepository.findAllByStatus(status, pageable);

        List<OrderResponse> orderResponses =
                orders.stream().map(orderConverter::toResponse).toList();

        return PageResponse.<OrderResponse>builder()
                .currentPage(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .totalElements(orders.getTotalElements())
                .totalPage(orders.getTotalPages())
                .data(orderResponses)
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('RUD_ORDER')")
    public OrderResponse updateStatus(String orderId, OrderStatusRequest request) {
        Order order =
                orderRepository.findById(orderId).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_EXISTED));

        switch (request.getStatus()) {
            case CANCELLED:
                handleCancel(order);
                break;
            case CONFIRMED:
                handleConfirm(order);
                break;
            case SHIPPING:
                handleShipping(order);
                break;
            case COMPLETED:
                handleCompleted(order);
                break;
            case FAILED:
                handleFailed(order);
                break;
            default:
                throw new AppException(ErrorCode.CAN_NOT_EDITABLE);
        }

        order.setStatus(request.getStatus());
        order.setModifiedDate(LocalDateTime.now());
        orderRepository.save(order);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityLogService.create(username, "UPDATE", "Tài khoản " + username + " vừa cập nhật trạng thái đơn hàng");

        return orderConverter.toResponse(order);
    }

    @Override
    public int countTotalPendingOrders() {
        return orderRepository.countByStatus(OrderStatus.PENDING);
    }

    private void handleCancel(Order order) {
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.CAN_NOT_EDITABLE);
        }

        updateInventoryQuantity(order.getOrderDetails(), true); // + inventory quantity
    }

    @Transactional
    @Override
    public void cancelBySystem(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_EXISTED));

        // Chỉ cancel nếu đang PENDING, tránh double cancel
        if (order.getStatus() != OrderStatus.PENDING) {
            log.warn("Cannot cancel order - not in PENDING status, OrderId: {}", orderId);
            return;
        }

        updateInventoryQuantity(order.getOrderDetails(), true); // hoàn inventory
        order.setStatus(OrderStatus.CANCELLED);
        order.setModifiedDate(LocalDateTime.now());
        orderRepository.save(order);
        log.info("Order cancelled by system - OrderId: {}", orderId);
    }

    private void handleConfirm(Order order) {
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.CAN_NOT_EDITABLE);
        }
    }

    private void handleShipping(Order order) {
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new AppException(ErrorCode.CAN_NOT_EDITABLE);
        }
    }

    private void handleCompleted(Order order) {
        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new AppException(ErrorCode.CAN_NOT_EDITABLE);
        }

        updateSoldQuantity(order.getOrderDetails()); // + sold quantity
        updateProductPoint(order.getOrderDetails());
    }

    private void handleFailed(Order order) {
        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new AppException(ErrorCode.CAN_NOT_EDITABLE);
        }

        updateInventoryQuantity(order.getOrderDetails(), true); // + inventory quantity
    }

    private void updateInventoryQuantity(List<OrderDetail> details, boolean isAddition) {
        List<Product> products = details.stream()
                .map(detail -> {
                    Product product = detail.getProduct();
                    product.setInventoryQuantity(product.getInventoryQuantity()
                            + (isAddition ? detail.getQuantity() : -detail.getQuantity()));

                    if (product.getInventoryQuantity() < 0) {
                        throw new AppException(ErrorCode.INVENTORY_NOT_ENOUGH);
                    }
                    return product;
                })
                .toList();

        productRepository.saveAll(products);
    }

    private void updateSoldQuantity(List<OrderDetail> details) {
        List<Product> products = details.stream()
                .map(detail -> {
                    Product product = detail.getProduct();
                    product.setSoldQuantity(product.getSoldQuantity() + detail.getQuantity());
                    return product;
                })
                .toList();

        productRepository.saveAll(products);
    }

    private void updateProductPoint(List<OrderDetail> details) {
        List<Product> products = details.stream()
                .map(detail -> {
                    Product product = detail.getProduct();
                    double point = PointCalculator.calculatePoint(
                            product.getSoldQuantity(), product.getAvgRating(), product.getReviewCount());
                    product.setPoint(point);
                    return product;
                })
                .toList();

        productRepository.saveAll(products);
    }

    private Order validatePermission(String orderId) {
        String currentUsername =
                SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepository
                .findByUsernameAndIsActive(currentUsername, StatusConstant.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Order order =
                orderRepository.findById(orderId).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_EXISTED));

        if (!order.getUser().getId().equals(currentUser.getId()) && !AuthUtils.hasPermission("RUD_ORDER")) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return order;
    }
}
