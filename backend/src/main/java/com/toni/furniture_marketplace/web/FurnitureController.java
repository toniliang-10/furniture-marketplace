package com.toni.furniture_marketplace.web;

import com.toni.furniture_marketplace.dto.FurnitureRequest;
import com.toni.furniture_marketplace.dto.FurnitureResponse;
import com.toni.furniture_marketplace.model.Category;
import com.toni.furniture_marketplace.model.ItemStatus;
import com.toni.furniture_marketplace.service.FurnitureService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/furniture")
public class FurnitureController {

    private final FurnitureService service;

    public FurnitureController(FurnitureService service) {
        this.service = service;
    }

    @GetMapping
    public PagedModel<FurnitureResponse> list(
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) ItemStatus status,
            Pageable pageable) {
        Page<FurnitureResponse> page = service.search(category, status, pageable)
                .map(FurnitureResponse::from);
        return new PagedModel<>(page);
    }

    @GetMapping("/{id}")
    public FurnitureResponse getOne(@PathVariable Long id) {
        return FurnitureResponse.from(service.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FurnitureResponse create(@Valid @RequestBody FurnitureRequest request) {
        return FurnitureResponse.from(service.create(request));
    }

    @PutMapping("/{id}")
    public FurnitureResponse update(@PathVariable Long id, @Valid @RequestBody FurnitureRequest request) {
        return FurnitureResponse.from(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
