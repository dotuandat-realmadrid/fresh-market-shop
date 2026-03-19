package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.response.home.ActivityLogResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface ActivityLogService {

    ActivityLogResponse create(String username, String actionType, String description);

    List<ActivityLogResponse> findRecentActivities(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
}
