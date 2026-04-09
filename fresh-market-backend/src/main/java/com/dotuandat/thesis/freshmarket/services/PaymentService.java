package com.dotuandat.thesis.freshmarket.services;

import jakarta.servlet.http.HttpServletRequest;

public interface PaymentService {
    String pay(String orderId, String amount, String redirectTo, HttpServletRequest request)
            throws Exception;

    String refund(String trantype, String order_id, String amount, String trans_date,
                  String user, HttpServletRequest request) throws Exception;

    String query(String order_id, String trans_date, HttpServletRequest request) throws Exception;
}
