package com.toni.furniture_marketplace.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InterestRequest(
        @NotBlank String buyerName,
        @NotBlank @Email String buyerEmail,
        @NotBlank String message) {
}
