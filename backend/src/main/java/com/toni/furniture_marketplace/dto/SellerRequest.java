package com.toni.furniture_marketplace.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SellerRequest(
        @NotBlank String name,
        @NotBlank @Email String email) {
}
