package com.dotuandat.thesis.freshmarket.controllers;

import com.dotuandat.thesis.freshmarket.dtos.request.order.OrderRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.order.OrderResponse;
import com.dotuandat.thesis.freshmarket.enums.OrderStatus;
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

    @PostMapping("/vnpay/pay")
    public ApiResponse<String> pay(
            @RequestParam String amount,
            @RequestParam(required = false) String bankCode,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String orderData,
            HttpServletRequest request) {
        try {
            log.info("VNPay payment request - Amount: {}, BankCode: {}, Language: {}, OrderData: {}",
                    amount, bankCode, language, orderData);

            String paymentUrl = paymentService.pay(amount, bankCode, language, orderData, request);

            log.info("VNPay pay initiated successfully - PaymentUrl: {}", paymentUrl);

            return ApiResponse.<String>builder()
                    .code(1000)
                    .message("Payment initiated successfully")
                    .result(paymentUrl)
                    .build();
        } catch (Exception e) {
            log.error("Payment error: {}", e.getMessage(), e);
            return ApiResponse.<String>builder()
                    .code(5000)
                    .message("Payment error: " + e.getMessage())
                    .build();
        }
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
            String response = paymentService.refund(trantype, order_id, amount, trans_date, user, request);
            return ApiResponse.<String>builder()
                    .code(1000)
                    .message("Refund processed successfully")
                    .result(response)
                    .build();
        } catch (Exception e) {
            return ApiResponse.<String>builder()
                    .code(5000)
                    .message("Refund error: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/vnpay/query")
    public ApiResponse<String> query(
            @RequestParam String order_id,
            @RequestParam String trans_date,
            HttpServletRequest request) {
        try {
            String response = paymentService.query(order_id, trans_date, request);
            return ApiResponse.<String>builder()
                    .code(1000)
                    .message("Query executed successfully")
                    .result(response)
                    .build();
        } catch (Exception e) {
            return ApiResponse.<String>builder()
                    .code(5000)
                    .message("Query error: " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<Void> handleVnPayReturn(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements(); ) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = fields.remove("vnp_SecureHash");
        String signValue = paymentUtil.hashAllFields(fields);

        String vnp_ResponseCode = fields.get("vnp_ResponseCode");
        String vnp_TxnRef = fields.get("vnp_TxnRef");

        log.info("VNPay return - ResponseCode: {}, TxnRef: {}, SecureHash: {}, SignValue: {}",
                vnp_ResponseCode, vnp_TxnRef, vnp_SecureHash, signValue);

        String redirectUrl;

        if (signValue.equals(vnp_SecureHash)) {
            if ("00".equals(vnp_ResponseCode)) {
                try {
                    OrderRequest orderRequest = paymentService.retrieveAndRemoveOrderData(vnp_TxnRef);

                    if (orderRequest == null) {
                        log.error("Cannot find order data for TxnRef: {}", vnp_TxnRef);
                        redirectUrl = "http://localhost:3001/confirm?error=invalid_order_info";
                    } else {
                        // Gắn paymentRef = vnp_TxnRef để lưu vào DB
                        orderRequest.setPaymentRef(vnp_TxnRef);

                        log.info("Creating order with paymentRef (VNPay TxnRef): {}", vnp_TxnRef);

                        OrderResponse orderResponse = orderService.create(orderRequest, OrderStatus.PENDING);

                        if (orderResponse != null && orderResponse.getId() != null) {
                            log.info("Order created successfully - OrderId: {}, PaymentRef: {}",
                                    orderResponse.getId(), vnp_TxnRef);

                            String userId = orderRequest.getUserId();
                            if (userId != null && !userId.isEmpty()) {
                                try {
                                    cartService.clearCart(userId);
                                    log.info("Cart cleared successfully for user: {}", userId);
                                } catch (Exception e) {
                                    log.warn("Failed to clear cart for user: {}, Error: {}", userId, e.getMessage());
                                }
                            }

                            redirectUrl = "http://localhost:3001/confirm?orderId=" + orderResponse.getId();
                        } else {
                            log.error("Failed to create order, paymentRef: {}", vnp_TxnRef);
                            redirectUrl = "http://localhost:3001/confirm?error=create_order_failed";
                        }
                    }
                } catch (Exception e) {
                    log.error("Error processing successful payment - TxnRef: {}, Error: {}",
                            vnp_TxnRef, e.getMessage(), e);
                    redirectUrl = "http://localhost:3001/confirm?error=processing_failed";
                }
            } else {
                log.warn("Payment failed - ResponseCode: {}, TxnRef: {}", vnp_ResponseCode, vnp_TxnRef);
                redirectUrl = "http://localhost:3001/confirm?error=payment_failed&responseCode=" + vnp_ResponseCode;
            }
        } else {
            log.warn("Invalid signature - Expected: {}, Actual: {}", vnp_SecureHash, signValue);
            redirectUrl = "http://localhost:3001/confirm?error=invalid_signature";
        }

        log.info("Redirecting to: {}", redirectUrl);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(java.net.URI.create(redirectUrl))
                .build();
    }
}
