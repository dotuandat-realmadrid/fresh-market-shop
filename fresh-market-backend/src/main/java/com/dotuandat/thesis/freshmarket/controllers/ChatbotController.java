package com.dotuandat.thesis.freshmarket.controllers;

import com.dotuandat.thesis.freshmarket.dtos.request.chatbot.ChatbotRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.chatbot.ChatbotResponse;
import com.dotuandat.thesis.freshmarket.services.ChatbotService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatbotController {

    ChatbotService chatbotService;

    /**
     * POST /fresh-market/chatbot/chat
     * Body: { "message": "...", "history": [...] }
     */
    @PostMapping("/chat")
    public ApiResponse<ChatbotResponse> chat(@RequestBody ChatbotRequest request) {
        log.info("[Chatbot] Câu hỏi: {}", request.getMessage());
        return ApiResponse.<ChatbotResponse>builder()
                .code(1000)
                .result(chatbotService.chat(request))
                .build();
    }
}
