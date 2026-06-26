package com.toni.furniture_marketplace.web;

import com.toni.furniture_marketplace.dto.SellerRequest;
import com.toni.furniture_marketplace.dto.SellerResponse;
import com.toni.furniture_marketplace.service.SellerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sellers")
public class SellerController {

    private final SellerService service;

    public SellerController(SellerService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SellerResponse create(@Valid @RequestBody SellerRequest request) {
        return SellerResponse.from(service.create(request));
    }

    @GetMapping("/{id}")
    public SellerResponse getOne(@PathVariable Long id) {
        return SellerResponse.from(service.getById(id));
    }
}
