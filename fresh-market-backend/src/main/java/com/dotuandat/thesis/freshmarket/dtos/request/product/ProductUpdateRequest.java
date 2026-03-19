package com.dotuandat.thesis.freshmarket.dtos.request.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductUpdateRequest {
    @NotBlank(message = "CATEGORY_NOT_BLANK")
    String categoryCode;

    @NotBlank(message = "SUPPLIER_NOT_BLANK")
    String supplierCode;

    @NotBlank(message = "NAME_NOT_BLANK")
    String name;

    String description;

    @NotNull(message = "PRICE_NOT_NULL")
    @Min(value = 1000, message = "MIN_PRICE")
    long price;

    String discountId;
}
