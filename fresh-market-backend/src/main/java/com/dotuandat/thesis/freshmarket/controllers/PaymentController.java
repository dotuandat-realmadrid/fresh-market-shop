package com.dotuandat.thesis.freshmarket.controllers;

import com.dotuandat.thesis.freshmarket.dtos.request.order.OrderRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.order.OrderResponse;
import com.dotuandat.thesis.freshmarket.enums.OrderStatus;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import com.dotuandat.thesis.freshmarket.services.CartService;
import com.dotuandat.thesis.freshmarket.services.OrderService;
import com.dotuandat.thesis.freshmarket.services.PaymentService;
import com.dotuandat.thesis.freshmarket.utils.PaymentUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    @Autowired
    private PaymentService paymentService;
    @Autowired
    private OrderService orderService;
    @Autowired
    private CartService cartService;
    @Autowired
    private PaymentUtil paymentUtil;
    @Autowired
    private ActivityLogService activityLogService;

    /**
     * Bước 1: Frontend gọi để tạo order + lấy VNPay payment URL.
     *
     * @param orderData  JSON string của OrderRequest (giữ nguyên như cũ)
     * @param amount     số tiền
     * @param redirectTo URL trang frontend muốn nhận kết quả (ví dụ:
     *                   http://localhost:3001/confirm)
     */
    @PostMapping("/vnpay/pay")
    public ApiResponse<String> pay(
            @RequestParam String amount,
            @RequestParam(required = false) String bankCode,
            @RequestParam(required = false) String language,
            @RequestParam String orderData,
            @RequestParam String redirectTo,
            HttpServletRequest request) {
        try {
            // Parse orderData như cũ
            OrderRequest orderRequest = new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(orderData, OrderRequest.class);

            // Tạo order PENDING trước khi redirect sang VNPay
            OrderResponse order = orderService.create(orderRequest, OrderStatus.PENDING);

            if (order == null || order.getId() == null) {
                return ApiResponse.<String>builder()
                        .code(5000)
                        .message("Không thể tạo đơn hàng")
                        .build();
            }

            log.info("Order created PENDING - OrderId: {}", order.getId());

            // Tạo payment URL, truyền orderId làm TxnRef
            String paymentUrl = paymentService.pay(order.getId(), amount, redirectTo, request);

            return ApiResponse.<String>builder()
                    .code(1000)
                    .message("Tạo payment URL thành công")
                    .result(paymentUrl)
                    .build();

        } catch (Exception e) {
            log.error("Payment error: {}", e.getMessage(), e);
            return ApiResponse.<String>builder()
                    .code(5000)
                    .message("Lỗi tạo thanh toán: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Bước 2: VNPay redirect browser về đây sau khi thanh toán.
     * Verify signature → clear cart nếu thành công → redirect về frontend.
     *
     * Logic đơn giản vì order đã tạo sẵn rồi, chỉ cần clear cart + redirect.
     */
    @GetMapping("/vnpay-return")
    public ResponseEntity<Void> handleVnPayReturn(HttpServletRequest request,
            HttpServletResponse response) throws IOException {
        String redirectTo = request.getParameter("redirectTo");
        String baseUrl = (redirectTo != null && !redirectTo.isEmpty())
                ? redirectTo
                : "http://localhost:3001/confirm";

        // Collect fields để verify (bỏ vnp_SecureHash và redirectTo)
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            if ("vnp_SecureHash".equals(fieldName) || "redirectTo".equals(fieldName))
                continue;
            String fieldValue = request.getParameter(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        String signValue = paymentUtil.hashAllFields(fields);
        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
        String vnp_TxnRef = request.getParameter("vnp_TxnRef"); // orderId

        log.info("VNPay return - OrderId: {}, ResponseCode: {}", vnp_TxnRef, vnp_ResponseCode);

        String finalUrl;

        if (!signValue.equals(vnp_SecureHash)) {
            log.warn("Invalid signature - OrderId: {}", vnp_TxnRef);
            finalUrl = baseUrl + "?error=invalid_signature";

        } else if (!"00".equals(vnp_ResponseCode)) {
            log.warn("Payment failed/cancelled - OrderId: {}, Code: {}", vnp_TxnRef, vnp_ResponseCode);

            // Hủy order, hoàn lại inventory
            try {
                orderService.cancelBySystem(vnp_TxnRef);
            } catch (Exception e) {
                log.warn("Failed to cancel order - OrderId: {}, Error: {}", vnp_TxnRef, e.getMessage());
            }

            if ("24".equals(vnp_ResponseCode)) {
                // 24 = user chủ động bấm hủy trên VNPay
                finalUrl = baseUrl + "?error=payment_cancelled";
            } else {
                // Các lỗi khác: hết hạn, sai OTP, ngân hàng từ chối...
                finalUrl = baseUrl + "?error=payment_failed&code=" + vnp_ResponseCode;
            }
        } else {
            log.info("Payment success - OrderId: {}", vnp_TxnRef);
            try {
                // Lấy thông tin đơn hàng
                OrderResponse order = orderService.getById(vnp_TxnRef);

                // Cập nhật trạng thái đơn hàng sang CONFIRMED (đã thanh toán)
                com.dotuandat.thesis.freshmarket.dtos.request.order.OrderStatusRequest statusRequest = new com.dotuandat.thesis.freshmarket.dtos.request.order.OrderStatusRequest(
                        OrderStatus.CONFIRMED);
                orderService.updateStatus(vnp_TxnRef, statusRequest);

                // Ghi Log Hoạt động (Để Dashboard nhận Realtime)
                String userLog = (order.getUsername() != null) ? order.getUsername() : "Guest";
                activityLogService.create(userLog, "PAYMENT",
                        "Khách hàng " + order.getFullName() + " vừa thanh toán thành công đơn hàng #" + vnp_TxnRef
                                + " qua VNPay");

                // Xóa giỏ hàng
                if (order.getUserId() != null && !order.getUserId().isEmpty()) {
                    cartService.clearCart(order.getUserId());
                    log.info("Cart cleared for user: {}", order.getUserId());
                }
            } catch (Exception e) {
                log.warn("Failed to process payment success logic - OrderId: {}, Error: {}", vnp_TxnRef,
                        e.getMessage());
            }
            finalUrl = baseUrl + "?orderId=" + vnp_TxnRef;
        }

        log.info("Redirecting to: {}", finalUrl);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(finalUrl))
                .build();
    }

    @PostMapping("/vnpay/refund")
    public ApiResponse<String> refund(
            @RequestParam String trantype,
            @RequestParam String order_id,
            @RequestParam String amount,
            @RequestParam String trans_date,
            @RequestParam String user,
            HttpServletRequest request) {
        try {
            String result = paymentService.refund(trantype, order_id, amount, trans_date, user, request);
            return ApiResponse.<String>builder()
                    .code(1000).message("Refund processed").result(result).build();
        } catch (Exception e) {
            return ApiResponse.<String>builder()
                    .code(5000).message("Refund error: " + e.getMessage()).build();
        }
    }

    @PostMapping("/vnpay/query")
    public ApiResponse<String> query(
            @RequestParam String order_id,
            @RequestParam String trans_date,
            HttpServletRequest request) {
        try {
            String result = paymentService.query(order_id, trans_date, request);
            return ApiResponse.<String>builder()
                    .code(1000).message("Query success").result(result).build();
        } catch (Exception e) {
            return ApiResponse.<String>builder()
                    .code(5000).message("Query error: " + e.getMessage()).build();
        }
    }
}