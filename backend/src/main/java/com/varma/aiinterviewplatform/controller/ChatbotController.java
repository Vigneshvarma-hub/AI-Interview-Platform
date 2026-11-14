
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.service.ChatbotService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    // Spring injects the chatbot service automatically.
    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    // Request body validation for incoming chat messages.
    public record ChatRequest(
            @NotBlank(message = "Please enter a message.")
            @Size(max = 4000, message = "Message must not exceed 4000 characters.")
            String message
    ) {}

    // Response format sent back to the React frontend.
    public record ChatResponse(String answer) {}

    // POST /api/chatbot/message
    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(
            @Valid @RequestBody ChatRequest request) {

        String answer = chatbotService.getChatbotResponse(
                request.message()
        );

        return ResponseEntity.ok(new ChatResponse(answer));
    }
}
