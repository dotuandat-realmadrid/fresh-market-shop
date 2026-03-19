package com.dotuandat.thesis.freshmarket.dtos.request.role;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleRequest {
    String id;

    @NotBlank(message = "CODE_NOT_BLANK")
    String code;

    String description;
    List<String> permissions;
}
