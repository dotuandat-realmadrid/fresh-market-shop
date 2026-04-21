package com.dotuandat.thesis.freshmarket.dtos.response.review;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    String id;
    String userId;
    String username;
    String fullName;
    String orderId;
    String productId;
    int rating;
    String title;
    String comment;
    LocalDateTime createdDate;
}
