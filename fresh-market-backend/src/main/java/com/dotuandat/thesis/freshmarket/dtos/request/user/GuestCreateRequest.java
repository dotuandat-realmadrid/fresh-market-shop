package com.dotuandat.thesis.freshmarket.dtos.request.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GuestCreateRequest {
    @NotBlank(message = "EMAIL_NOT_BLANK")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "INVALID_EMAIL")
    String username;

    @NotBlank(message = "FULL_NAME_NOT_BLANK")
    String fullName;

    @NotBlank(message = "PHONE_NOT_BLANK")
    @Pattern(regexp = "^0\\d{9}$", message = "INVALID_PHONE")
    String phone;
}
