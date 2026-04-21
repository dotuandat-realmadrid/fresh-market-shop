package com.dotuandat.thesis.freshmarket.dtos.response.home;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityLogResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    private String id;
    private String username;
    private String actionType;
    private String description;
    private LocalDateTime timestamp;
}
