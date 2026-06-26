package com.toni.furniture_marketplace.service;

import com.toni.furniture_marketplace.event.InterestCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onInterestCreated(InterestCreatedEvent event) {
        if (event.sellerEmail() == null) {
            log.warn("Interest {} has no seller email; skipping notification", event.interestId());
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(event.sellerEmail());
        message.setSubject("New interest in your listing: " + event.itemTitle());
        message.setText(buildBody(event));

        mailSender.send(message);
        log.info("Sent interest notification for '{}' to {}", event.itemTitle(), event.sellerEmail());
    }

    private String buildBody(InterestCreatedEvent event) {
        return """
                Hi %s,

                %s is interested in your listing "%s".

                Their message:
                %s

                You can reply to them directly at: %s
                """.formatted(
                event.sellerName(),
                event.buyerName(),
                event.itemTitle(),
                event.message(),
                event.buyerEmail());
    }
}
