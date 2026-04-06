package com.dotuandat.thesis.freshmarket.dtos.request.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductUpdateRequest {
    @NotNull(message = "CATEGORY_NOT_NULL")
    @Size(min = 1, message = "CATEGORY_NOT_BLANK")
    List<String> categoryCodes;

    @NotBlank(message = "SUPPLIER_NOT_BLANK")
    String supplierCode;

    @NotBlank(message = "NAME_NOT_BLANK")
    String name;

    String branch;

    String description;

    @NotNull(message = "PRICE_NOT_NULL")
    @Min(value = 1000, message = "MIN_PRICE")
    long price;

    String discountId;
}
