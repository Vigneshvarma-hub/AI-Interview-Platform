
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.entity.ContactMessage;
import com.varma.aiinterviewplatform.service.ContactEmailService;
import com.varma.aiinterviewplatform.service.ContactMessageService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/contact-messages")
public class AdminContactMessageController {

    private final ContactMessageService contactMessageService;
    private final ContactEmailService contactEmailService;

    // Inject both services: one manages messages, the other sends emails.
    public AdminContactMessageController(
            ContactMessageService contactMessageService,
            ContactEmailService contactEmailService) {
        this.contactMessageService = contactMessageService;
        this.contactEmailService = contactEmailService;
    }

    // DTO returned to the frontend; avoids exposing the entity directly.
    public record ContactMessageResponse(
            Long id,
            String name,
            String email,
            String subject,
            String message,
            String status,
            String createdAt,
            String repliedAt
    ) {}

    // Summary counts for the admin inbox.
    public record ContactMessageSummary(
            long pending,
            long replied,
            long total
    ) {}

    // Request body for sending a reply to the message owner.
    public record ReplyRequest(
            @NotBlank(message = "Reply text cannot be empty")
            String replyText
    ) {}

    // Convert the database entity into a frontend-friendly response.
    private ContactMessageResponse toResponse(
            ContactMessage contactMessage) {

        return new ContactMessageResponse(
                contactMessage.getId(),
                contactMessage.getName(),
                contactMessage.getEmail(),
                contactMessage.getSubject(),
                contactMessage.getMessage(),
                contactMessage.getStatus().name(),
                contactMessage.getCreatedAt() == null
                        ? null
                        : contactMessage.getCreatedAt().toString(),
                contactMessage.getRepliedAt() == null
                        ? null
                        : contactMessage.getRepliedAt().toString()
        );
    }

    // GET /api/admin/contact-messages
    // Return all messages, newest first.
    @GetMapping
    public List<ContactMessageResponse> getAllMessages() {
        return contactMessageService.getAllMessages()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // GET /api/admin/contact-messages/summary
    // Return Pending, Replied, and Total counts.
    @GetMapping("/summary")
    public ContactMessageSummary getSummary() {

        long pending = contactMessageService.getPendingCount();
        long replied = contactMessageService.getRepliedCount();

        return new ContactMessageSummary(
                pending,
                replied,
                pending + replied
        );
    }

    // PATCH /api/admin/contact-messages/{id}/reply
    // Send the actual reply email, then mark the message as replied.
    @PatchMapping("/{id}/reply")
    public ContactMessageResponse replyToMessage(
            @PathVariable Long id,
            @Valid @RequestBody ReplyRequest request) {

        try {
            // Find the message before attempting to send a reply.
            ContactMessage contactMessage =
                    contactMessageService.getMessageById(id);

            // Send the admin's reply to the email on the original message.
            contactEmailService.sendReplyToUser(
                    contactMessage,
                    request.replyText()
            );

            // Mark as replied only after the send operation succeeds.
            ContactMessage updatedMessage =
                    contactMessageService.markAsReplied(id);

            return toResponse(updatedMessage);

        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    exception.getMessage()
            );
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to send the reply email. The message was not marked as replied."
            );
        }
    }
}
