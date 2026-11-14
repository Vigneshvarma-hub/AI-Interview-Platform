
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.ContactMessageRequest;
import com.varma.aiinterviewplatform.entity.ContactMessage;
import com.varma.aiinterviewplatform.service.ContactMessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactMessageController {

    private final ContactMessageService contactMessageService;

    public ContactMessageController(
            ContactMessageService contactMessageService) {
        this.contactMessageService = contactMessageService;
    }

    // Response returned after the contact form is submitted.
    public record ContactMessageResponse(
            String message,
            Long id
    ) {}

    // Public endpoint: accept and save a user's contact message.
    @PostMapping
    public ResponseEntity<ContactMessageResponse> submitContactMessage(
            @Valid @RequestBody ContactMessageRequest request) {

        ContactMessage savedMessage =
                contactMessageService.saveMessage(request);

        ContactMessageResponse response = new ContactMessageResponse(
                "Thank you for contacting us. Your message has been received.",
                savedMessage.getId()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
