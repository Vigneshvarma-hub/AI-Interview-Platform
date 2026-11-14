
package com.varma.aiinterviewplatform.repository;

import com.varma.aiinterviewplatform.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.varma.aiinterviewplatform.entity.ContactMessage.Status;

@Repository
public interface ContactMessageRepository
        extends JpaRepository<ContactMessage, Long> {
    // Fetch messages with the newest messages first.
    List<ContactMessage> findAllByOrderByCreatedAtDesc();

    // Count messages by status, such as PENDING or REPLIED.
    long countByStatus(Status status);
}
