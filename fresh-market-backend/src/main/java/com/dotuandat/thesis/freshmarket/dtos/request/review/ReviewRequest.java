package com.dotuandat.thesis.freshmarket.dtos.request.review;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ReviewRequest {
    String userId;
    String orderId;
    String productId;
    int rating;
    String comment;
}
