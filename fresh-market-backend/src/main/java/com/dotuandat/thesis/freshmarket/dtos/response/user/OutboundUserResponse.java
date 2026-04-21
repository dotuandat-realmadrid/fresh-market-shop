package com.dotuandat.thesis.freshmarket.dtos.response.user;

import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OutboundUserResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    String email;
    String name;
    String phoneNumber;
    LocalDate birthday;
}
