package com.dotuandat.thesis.freshmarket.dtos.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApiResponse<T> implements Serializable {
    private static final long serialVersionUID = 1L;
    @Builder.Default // giá trị mặc định luôn được sử dụng khi dùng builder
    int code = 1000;

    String message;
    T result;
}
