package com.toni.furniture_marketplace.dto;

import com.toni.furniture_marketplace.model.Category;
import com.toni.furniture_marketplace.model.ItemStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record FurnitureRequest(
        @NotBlank String title,
        String description,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal price,
        @NotNull Category category,
        String imageUrl,
        ItemStatus status,
        Long sellerId) {
}
