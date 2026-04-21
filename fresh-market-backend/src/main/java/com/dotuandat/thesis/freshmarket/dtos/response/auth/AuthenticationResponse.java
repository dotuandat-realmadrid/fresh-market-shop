package com.dotuandat.thesis.freshmarket.dtos.response.auth;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    String token;
}
