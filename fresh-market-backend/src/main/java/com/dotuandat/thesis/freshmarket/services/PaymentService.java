package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.order.OrderRequest;
import jakarta.servlet.http.HttpServletRequest;

public interface PaymentService {

    String pay(String amount, String bankCode, String language, String orderInfo, HttpServletRequest request)
            throws Exception;

    String refund(
            String trantype, String order_id, String amount, String trans_date, String user, HttpServletRequest request)
            throws Exception;

    String query(String order_id, String trans_date, HttpServletRequest request) throws Exception;

    OrderRequest retrieveAndRemoveOrderData(String key);
}
