package com.toni.furniture_marketplace.repository;

import com.toni.furniture_marketplace.model.Category;
import com.toni.furniture_marketplace.model.FurnitureItem;
import com.toni.furniture_marketplace.model.ItemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FurnitureItemRepository extends JpaRepository<FurnitureItem, Long> {

    Page<FurnitureItem> findByCategory(Category category, Pageable pageable);

    Page<FurnitureItem> findByStatus(ItemStatus status, Pageable pageable);

    Page<FurnitureItem> findByCategoryAndStatus(Category category, ItemStatus status, Pageable pageable);
}
