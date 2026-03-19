package com.dotuandat.thesis.freshmarket.dtos.response.category;

import com.dotuandat.thesis.freshmarket.dtos.response.supplier.SupplierResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryResponse {
    String code;
    String name;
    Integer level;
    String imagePath;
    String description;
    List<String> parents;
    List<SupplierResponse> suppliers;
    List<CategoryResponse> children;
}
