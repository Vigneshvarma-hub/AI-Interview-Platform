
package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.ContactMessageRequest;
import com.varma.aiinterviewplatform.entity.ContactMessage;
import com.varma.aiinterviewplatform.repository.ContactMessageRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;
    private final ContactEmailService contactEmailService;

    public ContactMessageService(
            ContactMessageRepository contactMessageRepository,
            ContactEmailService contactEmailService) {
        this.contactMessageRepository = contactMessageRepository;
        this.contactEmailService = contactEmailService;
    }

    // Save the contact message and then attempt email notifications.
    @Transactional
    public ContactMessage saveMessage(ContactMessageRequest request) {
        ContactMessage contactMessage = new ContactMessage();

        contactMessage.setName(request.name().trim());
        contactMessage.setEmail(request.email().trim());
        contactMessage.setSubject(request.subject().trim());
        contactMessage.setMessage(request.message().trim());

        ContactMessage savedMessage =
                contactMessageRepository.saveAndFlush(contactMessage);

        // Email service handles delivery failures internally.
        contactEmailService.sendAdminNotification(savedMessage);
        contactEmailService.sendUserAcknowledgement(savedMessage);

        return savedMessage;
    }

    // Return all messages, newest first.
    @Transactional(readOnly = true)
    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc();
    }

    // Count pending messages.
    @Transactional(readOnly = true)
    public long getPendingCount() {
        return contactMessageRepository.countByStatus(
                ContactMessage.Status.PENDING
        );
    }

    // Count replied messages.
    @Transactional(readOnly = true)
    public long getRepliedCount() {
        return contactMessageRepository.countByStatus(
                ContactMessage.Status.REPLIED
        );
    }

    // Mark a message as replied.
    @Transactional
    public ContactMessage markAsReplied(Long id) {
        ContactMessage contactMessage =
                contactMessageRepository.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Contact message not found with ID: " + id
                        ));

        contactMessage.setStatus(ContactMessage.Status.REPLIED);

        return contactMessageRepository.save(contactMessage);
    }
    // Find a contact message by ID or report that it does not exist.
    @Transactional(readOnly = true)
    public ContactMessage getMessageById(Long id) {
        return contactMessageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Contact message not found with ID: " + id
                ));
    }
}
