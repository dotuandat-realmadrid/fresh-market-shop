package com.dotuandat.thesis.freshmarket.dtos.response.trash;

import com.dotuandat.thesis.freshmarket.dtos.response.category.CategoryResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryTrashBinResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    String id;
    CategoryResponse category;
    LocalDateTime deletedDate;
    String remainingTime;
}
