package com.dotuandat.thesis.freshmarket.dtos.request.order;

import com.dotuandat.thesis.freshmarket.enums.RefundStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class RefundStatusRequest {
    RefundStatus status;
    String note;
}
