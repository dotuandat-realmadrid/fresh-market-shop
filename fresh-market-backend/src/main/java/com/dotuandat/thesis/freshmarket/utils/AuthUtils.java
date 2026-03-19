package com.dotuandat.thesis.freshmarket.utils;

import org.springframework.security.core.context.SecurityContextHolder;

public class AuthUtils {
    public static boolean hasPermission(String permission) {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> permission.equals(authority.getAuthority()));
    }
}
