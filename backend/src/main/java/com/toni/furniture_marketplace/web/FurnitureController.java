package com.toni.furniture_marketplace.web;

import com.toni.furniture_marketplace.model.Category;
import com.toni.furniture_marketplace.model.FurnitureItem;
import com.toni.furniture_marketplace.model.ItemStatus;
import com.toni.furniture_marketplace.service.FurnitureService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public PagedModel<FurnitureItem> list(
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) ItemStatus status,
            Pageable pageable) {
        return new PagedModel<>(service.search(category, status, pageable));
    }

    @GetMapping("/{id}")
    public FurnitureItem getOne(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<FurnitureItem> create(@RequestBody FurnitureItem item) {
        FurnitureItem saved = service.create(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public FurnitureItem update(@PathVariable Long id, @RequestBody FurnitureItem item) {
        return service.update(id, item);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
