package com.dotuandat.thesis.freshmarket.dtos.request.order;

import com.dotuandat.thesis.freshmarket.enums.OrderStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class OrderStatusRequest {
    OrderStatus status;
}
