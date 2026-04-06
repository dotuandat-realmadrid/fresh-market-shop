package com.dotuandat.thesis.freshmarket.services;

public interface OrderPdfService {
    /**
     * Generates a PDF invoice for the given order ID.
     *
     * @param orderId the order to export
     * @return raw PDF bytes
     */
    byte[] exportInvoicePdf(String orderId);
}