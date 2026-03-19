package com.dotuandat.thesis.freshmarket.dtos.request.user;

import com.dotuandat.thesis.freshmarket.validators.DobConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreateRequest {
    @NotBlank(message = "EMAIL_NOT_BLANK")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "INVALID_EMAIL")
    String username;

    @NotBlank(message = "PASSWORD_NOT_BLANK")
    @Size(min = 8, max = 32, message = "INVALID_PASSWORD")
    String password;

    @NotBlank(message = "FULL_NAME_NOT_BLANK")
    String fullName;

    @NotBlank(message = "PHONE_NOT_BLANK")
    @Pattern(regexp = "^0\\d{9}$", message = "INVALID_PHONE")
    String phone;

    String gender;

    @DobConstraint(min = 6, max = 80, message = "INVALID_DOB")
    LocalDate dob;

    List<String> roles;
}
