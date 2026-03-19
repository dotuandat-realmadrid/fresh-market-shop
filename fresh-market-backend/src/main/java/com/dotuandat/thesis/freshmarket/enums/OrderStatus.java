package com.dotuandat.thesis.freshmarket.enums;

public enum OrderStatus {
    PENDING, // Đang chờ xử lý
    CANCELLED, // Đã hủy
    CONFIRMED, // Đã xác nhận
    SHIPPING, // Đang giao hàng
    COMPLETED, // Đã hoàn thành
    FAILED, // Giao hàng thất bại
}
