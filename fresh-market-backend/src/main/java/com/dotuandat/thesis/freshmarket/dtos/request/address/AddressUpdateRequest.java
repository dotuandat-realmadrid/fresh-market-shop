package com.dotuandat.thesis.freshmarket.dtos.request.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class AddressUpdateRequest {
    @NotBlank(message = "FULL_NAME_NOT_BLANK")
    String fullName;

    @NotBlank(message = "PHONE_NOT_BLANK")
    @Pattern(regexp = "^0\\d{9}$", message = "INVALID_PHONE")
    String phone;

    @NotBlank(message = "PROVINCE_NOT_BLANK")
    String province;

    @NotBlank(message = "DISTRICT_NOT_BLANK")
    String district;

    @NotBlank(message = "WARD_NOT_BLANK")
    String ward;

    @NotBlank(message = "ADDRESS_DETAIL_NOT_BLANK")
    String detail;
}
