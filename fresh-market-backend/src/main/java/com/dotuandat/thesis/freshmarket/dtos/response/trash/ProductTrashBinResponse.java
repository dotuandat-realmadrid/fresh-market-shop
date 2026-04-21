package com.dotuandat.thesis.freshmarket.dtos.response.trash;

import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductTrashBinResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    String id;
    ProductResponse product;
    LocalDateTime deletedDate;
    String remainingTime;
}
