package com.toni.furniture_marketplace.service;

import com.toni.furniture_marketplace.dto.InterestRequest;
import com.toni.furniture_marketplace.event.InterestCreatedEvent;
import com.toni.furniture_marketplace.model.FurnitureItem;
import com.toni.furniture_marketplace.model.Interest;
import com.toni.furniture_marketplace.model.Seller;
import com.toni.furniture_marketplace.repository.InterestRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InterestService {

    private final FurnitureService furnitureService;
    private final InterestRepository interestRepository;
    private final ApplicationEventPublisher events;

    public InterestService(FurnitureService furnitureService,
                           InterestRepository interestRepository,
                           ApplicationEventPublisher events) {
        this.furnitureService = furnitureService;
        this.interestRepository = interestRepository;
        this.events = events;
    }

    @Transactional
    public Interest expressInterest(Long itemId, InterestRequest request) {
        FurnitureItem item = furnitureService.findById(itemId);

        Interest interest = new Interest(
                item, request.buyerName(), request.buyerEmail(), request.message());
        Interest saved = interestRepository.save(interest);

        // Gather everything the email needs now, while the seller association
        // is still loaded inside this transaction, then publish.
        Seller seller = item.getSeller();
        events.publishEvent(new InterestCreatedEvent(
                saved.getId(),
                item.getTitle(),
                seller != null ? seller.getName() : null,
                seller != null ? seller.getEmail() : null,
                saved.getBuyerName(),
                saved.getBuyerEmail(),
                saved.getMessage()));

        return saved;
    }
}
