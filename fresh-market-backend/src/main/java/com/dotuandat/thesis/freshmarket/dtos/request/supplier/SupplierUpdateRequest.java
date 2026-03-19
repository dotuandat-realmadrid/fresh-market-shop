package com.dotuandat.thesis.freshmarket.dtos.request.supplier;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class SupplierUpdateRequest {
    @NotBlank(message = "NAME_NOT_BLANK")
    String name;
}
