
package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.entity.ContactMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class ContactEmailService {

    private static final Logger logger =
            LoggerFactory.getLogger(ContactEmailService.class);

    private final JavaMailSender mailSender;

    // Email address that receives new Contact Us notifications.
    @Value("${CONTACT_ADMIN_EMAIL:}")
    private String adminEmail;

    // Gmail address configured for sending emails through SMTP.
    @Value("${spring.mail.username:}")
    private String senderEmail;

    public ContactEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Notify the administrator when a new contact message is received.
    public void sendAdminNotification(ContactMessage contactMessage) {

        if (adminEmail == null || adminEmail.isBlank()) {
            logger.warn(
                    "Admin notification skipped: CONTACT_ADMIN_EMAIL is not configured."
            );
            return;
        }

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(adminEmail.trim());
        email.setSubject(
                "NexPrep AI - New Contact Message: "
                        + contactMessage.getSubject()
        );

        email.setText(
                "A new contact message has been received.\n\n"
                        + "Name: " + contactMessage.getName() + "\n"
                        + "Email: " + contactMessage.getEmail() + "\n"
                        + "Subject: " + contactMessage.getSubject() + "\n\n"
                        + "Message:\n" + contactMessage.getMessage() + "\n\n"
                        + "Message ID: " + contactMessage.getId() + "\n"
                        + "Status: " + contactMessage.getStatus() + "\n\n"
                        + "Please open the NexPrep AI admin dashboard to review it."
        );

        // Email failure should not prevent the contact message from being saved.
        try {
            mailSender.send(email);
            logger.info(
                    "Admin notification sent for contact message ID: {}",
                    contactMessage.getId()
            );
        } catch (RuntimeException exception) {
            logger.error(
                    "Unable to send contact notification to the administrator.",
                    exception
            );
        }
    }

    // Send an automatic acknowledgement to the person who submitted the form.
    public void sendUserAcknowledgement(ContactMessage contactMessage) {

        if (senderEmail == null || senderEmail.isBlank()) {
            logger.warn(
                    "User acknowledgement skipped: spring.mail.username is not configured."
            );
            return;
        }

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(contactMessage.getEmail());
        email.setSubject("NexPrep AI - We received your message");

        email.setText(
                "Hello " + contactMessage.getName() + ",\n\n"
                        + "Thank you for contacting NexPrep AI.\n"
                        + "We have received your message and our team will review it.\n\n"
                        + "Subject: " + contactMessage.getSubject() + "\n"
                        + "Reference ID: " + contactMessage.getId() + "\n\n"
                        + "This is an automatic acknowledgement, not a personal reply.\n\n"
                        + "Regards,\n"
                        + "NexPrep AI Team"
        );

        try {
            mailSender.send(email);
            logger.info(
                    "Acknowledgement email sent for contact message ID: {}",
                    contactMessage.getId()
            );
        } catch (RuntimeException exception) {
            logger.error(
                    "Unable to send contact acknowledgement to the sender.",
                    exception
            );
        }
    }

    // Send the administrator's actual reply to the user by email.
    public void sendReplyToUser(
            ContactMessage contactMessage,
            String replyText
    ) {
        if (contactMessage.getEmail() == null
                || contactMessage.getEmail().isBlank()) {
            logger.warn(
                    "Reply email skipped: contact message has no email address."
            );
            return;
        }

        if (replyText == null || replyText.isBlank()) {
            throw new IllegalArgumentException(
                    "Reply message cannot be empty."
            );
        }

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(contactMessage.getEmail());
        email.setSubject("NexPrep AI - Reply to your contact message");

        email.setText(
                "Hello " + contactMessage.getName() + ",\n\n"
                        + "Thank you for contacting NexPrep AI.\n\n"
                        + "Our team has replied to your message:\n\n"
                        + replyText.trim() + "\n\n"
                        + "Regards,\n"
                        + "NexPrep AI Team"
        );

        try {
            mailSender.send(email);
            logger.info(
                    "Contact reply email sent for message ID: {}",
                    contactMessage.getId()
            );
        } catch (RuntimeException exception) {
            logger.error(
                    "Unable to send contact reply email for message ID: {}",
                    contactMessage.getId(),
                    exception
            );

            // Report delivery failure to the caller instead of silently
            // treating the reply as successfully sent.
            throw exception;
        }
    }
}
