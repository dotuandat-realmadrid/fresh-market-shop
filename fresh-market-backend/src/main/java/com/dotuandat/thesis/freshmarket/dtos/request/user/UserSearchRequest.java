package com.dotuandat.thesis.freshmarket.dtos.request.user;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserSearchRequest {
    String id;
    String username;
    String fullName;
    String phone;
    String role;
    String isGuest;
}
