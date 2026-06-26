package com.toni.furniture_marketplace.service;

import com.toni.furniture_marketplace.dto.SellerRequest;
import com.toni.furniture_marketplace.exception.NotFoundException;
import com.toni.furniture_marketplace.model.Seller;
import com.toni.furniture_marketplace.repository.SellerRepository;
import org.springframework.stereotype.Service;

@Service
public class SellerService {

    private final SellerRepository repository;

    public SellerService(SellerRepository repository) {
        this.repository = repository;
    }

    public Seller create(SellerRequest request) {
        Seller seller = new Seller(request.name(), request.email());
        return repository.save(seller);
    }

    public Seller getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Seller " + id + " not found"));
    }
}
