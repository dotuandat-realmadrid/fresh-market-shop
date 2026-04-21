package com.dotuandat.thesis.freshmarket.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Collections;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PageResponse<T> implements Serializable {
    private static final long serialVersionUID = 1L;
    int totalPage;
    int pageSize;
    int currentPage;
    long totalElements;

    @Builder.Default
    List<T> data = Collections.emptyList();
}
