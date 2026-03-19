package com.dotuandat.thesis.freshmarket.dtos.request.order;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class OrderSearchRequest {
    String id;
    String email;
    String fullName;
    String phone;
    LocalDate startDate;
    LocalDate endDate;
}
