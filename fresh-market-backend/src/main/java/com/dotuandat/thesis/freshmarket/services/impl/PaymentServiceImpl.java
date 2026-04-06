package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.dtos.request.order.OrderRequest;
import com.dotuandat.thesis.freshmarket.services.PaymentService;
import com.dotuandat.thesis.freshmarket.utils.PaymentUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    PaymentUtil paymentUtil;

    Map<String, OrderRequest> tempOrderStorage = new ConcurrentHashMap<>();
    ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @NonFinal
    @Value("${vnpay.pay-url}")
    String vnpPayUrl;

    @NonFinal
    @Value("${vnpay.return-url}")
    String vnpReturnUrl;

    @NonFinal
    @Value("${vnpay.tmn-code}")
    String vnpTmnCode;

    @NonFinal
    @Value("${vnpay.secret-key}")
    String secretKey;

    @NonFinal
    @Value("${vnpay.api-url}")
    String vnpApiUrl;

    public PaymentServiceImpl() {
        this.paymentUtil = new PaymentUtil();
        scheduler.scheduleAtFixedRate(this::cleanupExpiredOrders, 10, 10, TimeUnit.MINUTES);
    }

    @Override
    public String pay(String amount, String bankCode, String language, String orderData, HttpServletRequest request)
            throws Exception {

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        long amt = Long.parseLong(amount) * 100;
        String vnp_TxnRef = UUID.randomUUID().toString();
        String vnp_IpAddr = paymentUtil.getIpAddress(request);

        if (orderData != null && !orderData.isEmpty()) {
            try {
                OrderRequest orderRequest = new ObjectMapper().readValue(orderData, OrderRequest.class);

                // Chưa set paymentRef ở đây, sẽ set sau khi VNPay confirm thành công
                tempOrderStorage.put(vnp_TxnRef, orderRequest);
                log.info("Stored temporary order data with key: {}", vnp_TxnRef);

                scheduler.schedule(() -> {
                    tempOrderStorage.remove(vnp_TxnRef);
                    log.debug("Removed expired order data with key: {}", vnp_TxnRef);
                }, 15, TimeUnit.MINUTES);

            } catch (Exception e) {
                log.error("Failed to parse orderData: {}", e.getMessage(), e);
            }
        }

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnpTmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amt));
        vnp_Params.put("vnp_CurrCode", "VND");

        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }

        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);

        if (language != null && !language.isEmpty()) {
            vnp_Params.put("vnp_Locale", language);
        } else {
            vnp_Params.put("vnp_Locale", "vn");
        }

        vnp_Params.put("vnp_ReturnUrl", vnpReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = paymentUtil.hmacSHA512(secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return vnpPayUrl + "?" + queryUrl;
    }

    @Override
    public String refund(String trantype, String order_id, String amount, String trans_date, String user,
                         HttpServletRequest request) throws Exception {

        String vnp_RequestId = paymentUtil.getRandomNumber(8);
        String vnp_Version = "2.1.0";
        String vnp_Command = "refund";
        String vnp_TxnRef = order_id;
        long amt = Long.parseLong(amount) * 100;
        String vnp_Amount = String.valueOf(amt);
        String vnp_OrderInfo = "Hoan tien GD OrderId:" + vnp_TxnRef;
        String vnp_TransactionNo = "";
        String vnp_TransactionDate = trans_date;
        String vnp_CreateBy = user;

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        String vnp_IpAddr = paymentUtil.getIpAddress(request);

        String hash_Data = String.join("|",
                vnp_RequestId, vnp_Version, vnp_Command, vnpTmnCode,
                trantype, vnp_TxnRef, vnp_Amount, vnp_TransactionNo,
                vnp_TransactionDate, vnp_CreateBy, vnp_CreateDate,
                vnp_IpAddr, vnp_OrderInfo);

        log.info("Hash data for refund: {}", hash_Data);
        String vnp_SecureHash = paymentUtil.hmacSHA512(secretKey, hash_Data);

        JsonObject vnp_Params = new JsonObject();
        vnp_Params.addProperty("vnp_RequestId", vnp_RequestId);
        vnp_Params.addProperty("vnp_Version", vnp_Version);
        vnp_Params.addProperty("vnp_Command", vnp_Command);
        vnp_Params.addProperty("vnp_TmnCode", vnpTmnCode);
        vnp_Params.addProperty("vnp_TransactionType", trantype);
        vnp_Params.addProperty("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.addProperty("vnp_Amount", vnp_Amount);
        vnp_Params.addProperty("vnp_OrderInfo", vnp_OrderInfo);

        if (vnp_TransactionNo != null && !vnp_TransactionNo.isEmpty()) {
            vnp_Params.addProperty("vnp_TransactionNo", vnp_TransactionNo);
        }

        vnp_Params.addProperty("vnp_TransactionDate", vnp_TransactionDate);
        vnp_Params.addProperty("vnp_CreateBy", vnp_CreateBy);
        vnp_Params.addProperty("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.addProperty("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.addProperty("vnp_SecureHash", vnp_SecureHash);

        return sendPostRequest(vnp_Params);
    }

    @Override
    public String query(String order_id, String trans_date, HttpServletRequest request) throws Exception {

        String vnp_RequestId = paymentUtil.getRandomNumber(8);
        String vnp_Version = "2.1.0";
        String vnp_Command = "querydr";
        String vnp_TxnRef = order_id;
        String vnp_OrderInfo = "Kiem tra ket qua GD OrderId:" + vnp_TxnRef;

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        String vnp_IpAddr = paymentUtil.getIpAddress(request);

        String hash_Data = String.join("|",
                vnp_RequestId, vnp_Version, vnp_Command, vnpTmnCode,
                vnp_TxnRef, trans_date, vnp_CreateDate,
                vnp_IpAddr, vnp_OrderInfo);

        log.info("Hash data for query: {}", hash_Data);
        String vnp_SecureHash = paymentUtil.hmacSHA512(secretKey, hash_Data);

        JsonObject vnp_Params = new JsonObject();
        vnp_Params.addProperty("vnp_RequestId", vnp_RequestId);
        vnp_Params.addProperty("vnp_Version", vnp_Version);
        vnp_Params.addProperty("vnp_Command", vnp_Command);
        vnp_Params.addProperty("vnp_TmnCode", vnpTmnCode);
        vnp_Params.addProperty("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.addProperty("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.addProperty("vnp_TransactionDate", trans_date);
        vnp_Params.addProperty("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.addProperty("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.addProperty("vnp_SecureHash", vnp_SecureHash);

        return sendPostRequest(vnp_Params);
    }

    @Override
    public OrderRequest retrieveAndRemoveOrderData(String key) {
        OrderRequest orderRequest = tempOrderStorage.remove(key);
        if (orderRequest != null) {
            log.info("Retrieved and removed order data with key: {}", key);
        } else {
            log.warn("Order data not found or expired for key: {}", key);
        }
        return orderRequest;
    }

    // Tách riêng để tái sử dụng cho cả refund và query
    private String sendPostRequest(JsonObject params) throws Exception {
        URL url = new URL(vnpApiUrl);
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("POST");
        con.setRequestProperty("Content-Type", "application/json");
        con.setDoOutput(true);

        try (DataOutputStream wr = new DataOutputStream(con.getOutputStream())) {
            wr.writeBytes(params.toString());
            wr.flush();
        }

        try (BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()))) {
            StringBuilder response = new StringBuilder();
            String output;
            while ((output = in.readLine()) != null) {
                response.append(output);
            }
            return response.toString();
        }
    }

    private void cleanupExpiredOrders() {
        log.debug("Current temp order storage size: {}", tempOrderStorage.size());
    }

    public int getStorageSize() {
        return tempOrderStorage.size();
    }
}
