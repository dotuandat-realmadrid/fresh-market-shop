package com.dotuandat.thesis.freshmarket.dtos.response.trash;

import com.dotuandat.thesis.freshmarket.dtos.response.user.UserResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserTrashBinResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    String id;
    UserResponse user;
    LocalDateTime deletedDate;
    String remainingTime;
}
