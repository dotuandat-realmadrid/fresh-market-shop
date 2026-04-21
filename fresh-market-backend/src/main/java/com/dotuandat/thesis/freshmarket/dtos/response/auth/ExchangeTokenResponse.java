package com.dotuandat.thesis.freshmarket.dtos.response.auth;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExchangeTokenResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    String accessToken;
    Long expiresIn;
    String refreshToken;
    String scope;
    String tokenType;
}
