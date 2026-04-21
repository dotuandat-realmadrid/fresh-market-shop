package com.dotuandat.thesis.freshmarket.dtos.response.chatbot;

import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatbotResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    String reply;
    List<ProductResponse> products;
}
