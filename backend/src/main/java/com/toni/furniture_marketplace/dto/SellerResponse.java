package com.toni.furniture_marketplace.dto;

import com.toni.furniture_marketplace.model.Seller;

public record SellerResponse(
        Long id,
        String name,
        String email) {

    public static SellerResponse from(Seller seller) {
        return new SellerResponse(seller.getId(), seller.getName(), seller.getEmail());
    }
}
