package com.toni.furniture_marketplace.service;

import com.toni.furniture_marketplace.model.Category;
import com.toni.furniture_marketplace.model.FurnitureItem;
import com.toni.furniture_marketplace.model.ItemStatus;
import com.toni.furniture_marketplace.repository.FurnitureItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FurnitureService {

    private final FurnitureItemRepository repository;

    public FurnitureService(FurnitureItemRepository repository) {
        this.repository = repository;
    }

    public Page<FurnitureItem> search(Category category, ItemStatus status, Pageable pageable) {
        if (category != null && status != null) {
            return repository.findByCategoryAndStatus(category, status, pageable);
        }
        if (category != null) {
            return repository.findByCategory(category, pageable);
        }
        if (status != null) {
            return repository.findByStatus(status, pageable);
        }
        return repository.findAll(pageable);
    }

    public FurnitureItem findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Furniture item " + id + " not found"));
    }

    public FurnitureItem create(FurnitureItem item) {
        return repository.save(item);
    }

    public FurnitureItem update(Long id, FurnitureItem changes) {
        FurnitureItem existing = findById(id);

        existing.setTitle(changes.getTitle());
        existing.setDescription(changes.getDescription());
        existing.setPrice(changes.getPrice());
        existing.setCategory(changes.getCategory());
        existing.setImageUrl(changes.getImageUrl());
        if (changes.getStatus() != null) {
            existing.setStatus(changes.getStatus());
        }

        return repository.save(existing);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Furniture item " + id + " not found");
        }
        repository.deleteById(id);
    }
}
