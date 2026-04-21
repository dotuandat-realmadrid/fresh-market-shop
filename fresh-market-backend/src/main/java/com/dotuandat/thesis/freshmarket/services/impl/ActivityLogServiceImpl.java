package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.dtos.response.home.ActivityLogResponse;
import com.dotuandat.thesis.freshmarket.entities.ActivityLog;
import com.dotuandat.thesis.freshmarket.repositories.ActivityLogRepository;
import com.dotuandat.thesis.freshmarket.services.ActivityLogService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ActivityLogServiceImpl implements ActivityLogService {

    ActivityLogRepository activityLogRepository;
    ModelMapper modelMapper;
    SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public ActivityLogResponse create(String username, String actionType, String description) {
        if (!StringUtils.hasText(username) || !StringUtils.hasText(actionType) || !StringUtils.hasText(description)) {
            log.error(
                    "Invalid input for activity log: username={}, actionType={}, description={}",
                    username,
                    actionType,
                    description);
            throw new IllegalArgumentException("Username, actionType, and description must not be empty");
        }

        ActivityLog activityLog = ActivityLog.builder()
                .username(username)
                .actionType(actionType)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();

        try {
            ActivityLog savedLog = activityLogRepository.save(activityLog);
            log.info("Activity log created: id={}, username={}, actionType={}", savedLog.getId(), username, actionType);
            
            ActivityLogResponse response = modelMapper.map(savedLog, ActivityLogResponse.class);
            
            // Broadcast to all subscribers
            messagingTemplate.convertAndSend("/topic/activities", response);
            
            return response;
        } catch (Exception e) {
            log.error("Failed to save activity log: {}", e.getMessage());
            throw new RuntimeException("Could not save activity log", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogResponse> findRecentActivities(
            LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        if (startDate == null || endDate == null || pageable == null) {
            log.error("Invalid parameters: startDate={}, endDate={}, pageable={}", startDate, endDate, pageable);
            throw new IllegalArgumentException("startDate, endDate, and pageable must not be null");
        }

        List<ActivityLog> logs = activityLogRepository.findRecentActivities(startDate, endDate, pageable);
        log.info("Retrieved {} recent activities from {} to {}", logs.size(), startDate, endDate);
        return logs.stream()
                .map(log -> modelMapper.map(log, ActivityLogResponse.class))
                .collect(Collectors.toList());
    }
}
