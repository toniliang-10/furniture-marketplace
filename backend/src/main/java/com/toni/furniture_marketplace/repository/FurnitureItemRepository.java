package com.toni.furniture_marketplace.repository;

import com.toni.furniture_marketplace.model.FurnitureItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FurnitureItemRepository extends JpaRepository<FurnitureItem, Long> {
}
