package com.dotuandat.thesis.freshmarket.dtos.request.permission;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PermissionRequest {
    String id;

    @NotBlank(message = "CODE_NOT_BLANK")
    String code;

    String description;
}
