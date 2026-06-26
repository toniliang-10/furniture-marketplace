package com.toni.furniture_marketplace.repository;

import com.toni.furniture_marketplace.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SellerRepository extends JpaRepository<Seller, Long> {
}
