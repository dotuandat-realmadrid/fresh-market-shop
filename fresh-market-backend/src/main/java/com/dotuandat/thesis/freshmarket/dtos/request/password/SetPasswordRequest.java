package com.dotuandat.thesis.freshmarket.dtos.request.password;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SetPasswordRequest {
    @NotBlank(message = "PASSWORD_NOT_BLANK")
    @Size(min = 8, max = 32, message = "INVALID_PASSWORD")
    String password;
}
