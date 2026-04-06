package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.services.PaymentService;
import com.dotuandat.thesis.freshmarket.utils.PaymentUtil;
import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
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

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    PaymentUtil paymentUtil;

    @NonFinal @Value("${vnpay.pay-url}")    String vnpPayUrl;
    @NonFinal @Value("${vnpay.return-url}") String vnpReturnUrl;
    @NonFinal @Value("${vnpay.tmn-code}")   String vnpTmnCode;
    @NonFinal @Value("${vnpay.secret-key}") String secretKey;
    @NonFinal @Value("${vnpay.api-url}")    String vnpApiUrl;

    public PaymentServiceImpl(PaymentUtil paymentUtil) {
        this.paymentUtil = paymentUtil;
    }

    /**
     * Tạo VNPay payment URL.
     * orderId: ID đơn hàng đã tạo sẵn với status PENDING
     * amount: số tiền (chưa nhân 100)
     * redirectTo: URL trang frontend muốn nhận kết quả
     */
    @Override
    public String pay(String orderId, String amount, String redirectTo, HttpServletRequest request)
            throws Exception {

        long amt = Long.parseLong(amount) * 100;
        String vnp_IpAddr = paymentUtil.getIpAddress(request);

        // Nhét redirectTo vào vnp_ReturnUrl — VNPay sẽ forward nguyên xi về backend
        String returnUrlWithRedirect = vnpReturnUrl
                + "?redirectTo=" + URLEncoder.encode(redirectTo, StandardCharsets.UTF_8);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version",   "2.1.0");
        vnp_Params.put("vnp_Command",   "pay");
        vnp_Params.put("vnp_TmnCode",   vnpTmnCode);
        vnp_Params.put("vnp_Amount",    String.valueOf(amt));
        vnp_Params.put("vnp_CurrCode",  "VND");
        vnp_Params.put("vnp_TxnRef",    orderId);   // dùng orderId làm TxnRef, không cần lưu tạm
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + orderId);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale",    "vn");
        vnp_Params.put("vnp_ReturnUrl", returnUrlWithRedirect);
        vnp_Params.put("vnp_IpAddr",    vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));
        cld.add(Calendar.MINUTE, 15);
        vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        // Build query string và hash
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String vnp_SecureHash = paymentUtil.hmacSHA512(secretKey, hashData.toString());
        return vnpPayUrl + "?" + query + "&vnp_SecureHash=" + vnp_SecureHash;
    }

    @Override
    public String refund(String trantype, String order_id, String amount, String trans_date,
                         String user, HttpServletRequest request) throws Exception {
        String vnp_RequestId  = paymentUtil.getRandomNumber(8);
        String vnp_TxnRef     = order_id;
        long amt              = Long.parseLong(amount) * 100;
        String vnp_Amount     = String.valueOf(amt);
        String vnp_OrderInfo  = "Hoan tien GD OrderId:" + vnp_TxnRef;
        String vnp_TransactionNo = "";

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        String vnp_IpAddr     = paymentUtil.getIpAddress(request);

        String hash_Data = String.join("|",
                vnp_RequestId, "2.1.0", "refund", vnpTmnCode,
                trantype, vnp_TxnRef, vnp_Amount, vnp_TransactionNo,
                trans_date, user, vnp_CreateDate, vnp_IpAddr, vnp_OrderInfo);

        String vnp_SecureHash = paymentUtil.hmacSHA512(secretKey, hash_Data);

        JsonObject params = new JsonObject();
        params.addProperty("vnp_RequestId",       vnp_RequestId);
        params.addProperty("vnp_Version",         "2.1.0");
        params.addProperty("vnp_Command",         "refund");
        params.addProperty("vnp_TmnCode",         vnpTmnCode);
        params.addProperty("vnp_TransactionType", trantype);
        params.addProperty("vnp_TxnRef",          vnp_TxnRef);
        params.addProperty("vnp_Amount",          vnp_Amount);
        params.addProperty("vnp_OrderInfo",       vnp_OrderInfo);
        params.addProperty("vnp_TransactionDate", trans_date);
        params.addProperty("vnp_CreateBy",        user);
        params.addProperty("vnp_CreateDate",      vnp_CreateDate);
        params.addProperty("vnp_IpAddr",          vnp_IpAddr);
        params.addProperty("vnp_SecureHash",      vnp_SecureHash);
        return sendPostRequest(params);
    }

    @Override
    public String query(String order_id, String trans_date, HttpServletRequest request) throws Exception {
        String vnp_RequestId = paymentUtil.getRandomNumber(8);
        String vnp_TxnRef    = order_id;
        String vnp_OrderInfo = "Kiem tra ket qua GD OrderId:" + vnp_TxnRef;

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        String vnp_IpAddr     = paymentUtil.getIpAddress(request);

        String hash_Data = String.join("|",
                vnp_RequestId, "2.1.0", "querydr", vnpTmnCode,
                vnp_TxnRef, trans_date, vnp_CreateDate, vnp_IpAddr, vnp_OrderInfo);

        String vnp_SecureHash = paymentUtil.hmacSHA512(secretKey, hash_Data);

        JsonObject params = new JsonObject();
        params.addProperty("vnp_RequestId",       vnp_RequestId);
        params.addProperty("vnp_Version",         "2.1.0");
        params.addProperty("vnp_Command",         "querydr");
        params.addProperty("vnp_TmnCode",         vnpTmnCode);
        params.addProperty("vnp_TxnRef",          vnp_TxnRef);
        params.addProperty("vnp_OrderInfo",       vnp_OrderInfo);
        params.addProperty("vnp_TransactionDate", trans_date);
        params.addProperty("vnp_CreateDate",      vnp_CreateDate);
        params.addProperty("vnp_IpAddr",          vnp_IpAddr);
        params.addProperty("vnp_SecureHash",      vnp_SecureHash);
        return sendPostRequest(params);
    }

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
            String line;
            while ((line = in.readLine()) != null) response.append(line);
            return response.toString();
        }
    }
}