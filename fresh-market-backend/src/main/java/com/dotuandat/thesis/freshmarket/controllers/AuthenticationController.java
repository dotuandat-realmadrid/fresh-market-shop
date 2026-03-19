package com.dotuandat.thesis.freshmarket.controllers;

import com.dotuandat.thesis.freshmarket.dtos.request.auth.AuthenticationRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.auth.IntrospectRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.auth.LogoutRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.auth.RefreshRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.auth.AuthenticationResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.auth.IntrospectResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.auth.RefreshResponse;
import com.dotuandat.thesis.freshmarket.services.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;

        @PostMapping("/login")
        ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
            return ApiResponse.<AuthenticationResponse>builder()
                    .result(authenticationService.authenticate(request))
                    .build();
        }

        @PostMapping("/logout")
        ApiResponse<?> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
            authenticationService.logout(request);
            return ApiResponse.builder().build();
        }

        @PostMapping("/refresh")
        ApiResponse<RefreshResponse> refreshToken(@RequestBody RefreshRequest request)
                throws ParseException, JOSEException {
            return ApiResponse.<RefreshResponse>builder()
                    .result(authenticationService.refreshToken(request))
                    .build();
        }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        return ApiResponse.<IntrospectResponse>builder()
                .result(authenticationService.introspect(request))
                .build();
    }

//    @PostMapping("/login")
//    ApiResponse<AuthenticationResponse> authenticate(
//            @RequestBody AuthenticationRequest request, HttpServletResponse response) {
//        AuthenticationResponse authResponse = authenticationService.authenticate(request);
//
//        // Set JWT token vào cookie
//        Cookie cookie = new Cookie("token", authResponse.getToken());
//        cookie.setHttpOnly(true);
//        cookie.setSecure(true); // bật nếu dùng HTTPScookie.setSecure(true) - Chỉ gửi qua HTTPS
//        cookie.setPath("/"); // Đặt path cho cookie
//        cookie.setMaxAge(60 * 60); // thời gian sống 1h
//        cookie.setAttribute("SameSite", "Strict"); // Ngăn gửi trong yêu cầu cross-site
//        response.addCookie(cookie);
//
//        return ApiResponse.<AuthenticationResponse>builder()
//                .result(authResponse)
//                .build();
//    }
//
//    @PostMapping("/refresh")
//    ApiResponse<RefreshResponse> refreshToken(@RequestBody RefreshRequest request, HttpServletResponse response)
//            throws ParseException, JOSEException {
//
//        RefreshResponse refreshResponse = authenticationService.refreshToken(request);
//
//        // Cập nhật cookie với token mới
//        Cookie cookie = new Cookie("token", refreshResponse.getToken());
//        cookie.setHttpOnly(true);
//        cookie.setSecure(true); // bật nếu dùng HTTPS
//        cookie.setPath("/");
//        cookie.setMaxAge(60 * 60);
//        cookie.setAttribute("SameSite", "Strict"); // Ngăn gửi trong yêu cầu cross-site
//        response.addCookie(cookie);
//
//        return ApiResponse.<RefreshResponse>builder().result(refreshResponse).build();
//    }
//
//    @PostMapping("/logout")
//    ApiResponse<?> logout(@RequestBody LogoutRequest request, HttpServletResponse response)
//            throws ParseException, JOSEException {
//
//        authenticationService.logout(request);
//
//        // Xóa cookie bằng cách đặt maxAge = 0
//        Cookie cookie = new Cookie("token", null);
//        cookie.setHttpOnly(true);
//        cookie.setSecure(true);
//        cookie.setPath("/");
//        cookie.setMaxAge(0); // Xóa cookie
//        cookie.setAttribute("SameSite", "Strict"); // Ngăn gửi trong yêu cầu cross-site
//        response.addCookie(cookie);
//
//        return ApiResponse.builder().build();
//    }
}
