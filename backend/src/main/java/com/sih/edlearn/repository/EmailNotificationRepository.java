package com.sih.edlearn.repository;

import com.sih.edlearn.entity.EmailNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailNotificationRepository extends JpaRepository<EmailNotification, Long> {

    Page<EmailNotification> findByRecipientEmailAndStatusOrderByCreatedAtDesc(
            String email, EmailNotification.Status status, Pageable pageable);

    Page<EmailNotification> findByStatusOrderByCreatedAtDesc(
            EmailNotification.Status status, Pageable pageable);

    List<EmailNotification> findByStatusAndCreatedAtBefore(
            EmailNotification.Status status, LocalDateTime dateTime);

    long countByStatusAndRecipientEmail(EmailNotification.Status status, String email);

    Page<EmailNotification> findByTypeAndStatusOrderByCreatedAtDesc(
            EmailNotification.NotificationType type, EmailNotification.Status status, Pageable pageable);
}

