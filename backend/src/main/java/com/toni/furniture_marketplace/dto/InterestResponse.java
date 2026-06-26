package com.toni.furniture_marketplace.dto;

import com.toni.furniture_marketplace.model.FurnitureItem;
import com.toni.furniture_marketplace.model.Interest;
import java.time.Instant;

public record InterestResponse(
        Long id,
        Long itemId,
        String itemTitle,
        String buyerName,
        String buyerEmail,
        String message,
        Instant createdAt) {

    public static InterestResponse from(Interest interest) {
        FurnitureItem item = interest.getItem();
        return new InterestResponse(
                interest.getId(),
                item != null ? item.getId() : null,
                item != null ? item.getTitle() : null,
                interest.getBuyerName(),
                interest.getBuyerEmail(),
                interest.getMessage(),
                interest.getCreatedAt());
    }
}
