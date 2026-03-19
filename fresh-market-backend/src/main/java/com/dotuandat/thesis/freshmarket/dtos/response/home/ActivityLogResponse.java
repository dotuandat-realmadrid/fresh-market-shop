package com.dotuandat.thesis.freshmarket.dtos.response.home;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityLogResponse {
    private String id;
    private String username;
    private String actionType;
    private String description;
    private LocalDateTime timestamp;
}
