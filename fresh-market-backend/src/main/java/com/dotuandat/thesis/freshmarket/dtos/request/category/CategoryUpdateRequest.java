package com.dotuandat.thesis.freshmarket.dtos.request.category;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class CategoryUpdateRequest {
    @NotBlank(message = "NAME_NOT_BLANK")
    String name;

    Integer level;

    List<String> parentCodes; // Đổi thành List

    String description;

    List<String> supplierCodes;
}
