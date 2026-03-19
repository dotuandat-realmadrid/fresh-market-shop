package com.dotuandat.thesis.freshmarket.controllers;

import com.dotuandat.thesis.freshmarket.dtos.request.password.ChangePasswordRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.password.SetPasswordRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
import com.dotuandat.thesis.freshmarket.services.PasswordService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/password")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PasswordController {

    PasswordService passwordService;

    @PutMapping("/change")
    public ApiResponse<Void> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        passwordService.changePassword(request);

        return ApiResponse.<Void>builder()
                .message("Change password successfully")
                .build();
    }

    /*
     * set password cho user login bằng bên thứ 3
     */
    @PutMapping("/set")
    public ApiResponse<Void> setPassword(@RequestBody @Valid SetPasswordRequest request) {
        passwordService.setPassword(request.getPassword());

        return ApiResponse.<Void>builder().message("Set password successfully").build();
    }

    @PutMapping("/reset/{id}")
    public ApiResponse<Void> resetPassword(@PathVariable String id) {
        passwordService.resetPassword(id);

        return ApiResponse.<Void>builder().message("Default password: 12345678").build();
    }

    @PostMapping("/forgot")
    public ApiResponse<Object> forgotPassword(@RequestBody @Valid Object object) {
        var result = passwordService.forgotPassword(object);

        return ApiResponse.builder().result(result).build();
    }
}
