package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.chatbot.ChatbotRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.chatbot.ChatbotResponse;

public interface ChatbotService {
    ChatbotResponse chat(ChatbotRequest request);
}
