package com.toni.furniture_marketplace.service;

import com.toni.furniture_marketplace.dto.FurnitureRequest;
import com.toni.furniture_marketplace.exception.NotFoundException;
import com.toni.furniture_marketplace.model.Category;
import com.toni.furniture_marketplace.model.FurnitureItem;
import com.toni.furniture_marketplace.model.ItemStatus;
import com.toni.furniture_marketplace.repository.FurnitureItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class FurnitureService {

    private final FurnitureItemRepository repository;
    private final SellerService sellerService;

    public FurnitureService(FurnitureItemRepository repository, SellerService sellerService) {
        this.repository = repository;
        this.sellerService = sellerService;
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
                .orElseThrow(() -> new NotFoundException("Furniture item " + id + " not found"));
    }

    public FurnitureItem create(FurnitureRequest request) {
        FurnitureItem item = new FurnitureItem(
                request.title(),
                request.description(),
                request.price(),
                request.category(),
                request.imageUrl());
        if (request.status() != null) {
            item.setStatus(request.status());
        }
        if (request.sellerId() != null) {
            item.setSeller(sellerService.getById(request.sellerId()));
        }
        return repository.save(item);
    }

    public FurnitureItem update(Long id, FurnitureRequest request) {
        FurnitureItem existing = findById(id);

        existing.setTitle(request.title());
        existing.setDescription(request.description());
        existing.setPrice(request.price());
        existing.setCategory(request.category());
        existing.setImageUrl(request.imageUrl());
        if (request.status() != null) {
            existing.setStatus(request.status());
        }
        if (request.sellerId() != null) {
            existing.setSeller(sellerService.getById(request.sellerId()));
        }

        return repository.save(existing);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Furniture item " + id + " not found");
        }
        repository.deleteById(id);
    }
}
