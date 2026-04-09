package com.dotuandat.thesis.freshmarket.dtos.request.chatbot;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatbotRequest {
    String message;

    // Lịch sử hội thoại (mỗi phần tử là một cặp {role, text})
    List<ChatbotHistory> history;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatbotHistory {
        String role;   // "user" hoặc "model"
        String text;
    }
}
