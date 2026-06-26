package com.toni.furniture_marketplace.event;

public record InterestCreatedEvent(
        Long interestId,
        String itemTitle,
        String sellerName,
        String sellerEmail,
        String buyerName,
        String buyerEmail,
        String message) {
}
