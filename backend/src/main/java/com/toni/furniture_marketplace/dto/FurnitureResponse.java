package com.toni.furniture_marketplace.dto;

import com.toni.furniture_marketplace.model.Category;
import com.toni.furniture_marketplace.model.FurnitureItem;
import com.toni.furniture_marketplace.model.ItemStatus;
import com.toni.furniture_marketplace.model.Seller;
import java.math.BigDecimal;
import java.time.Instant;

public record FurnitureResponse(
        Long id,
        String title,
        String description,
        BigDecimal price,
        Category category,
        String imageUrl,
        ItemStatus status,
        Long sellerId,
        String sellerName,
        Instant createdAt) {

    public static FurnitureResponse from(FurnitureItem item) {
        Seller seller = item.getSeller();
        return new FurnitureResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getPrice(),
                item.getCategory(),
                item.getImageUrl(),
                item.getStatus(),
                seller != null ? seller.getId() : null,
                seller != null ? seller.getName() : null,
                item.getCreatedAt());
    }
}
