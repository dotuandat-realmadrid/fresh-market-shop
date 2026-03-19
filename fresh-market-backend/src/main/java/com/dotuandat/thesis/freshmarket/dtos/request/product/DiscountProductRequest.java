package com.dotuandat.thesis.freshmarket.dtos.request.product;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DiscountProductRequest {
    List<String> productIds;
}
