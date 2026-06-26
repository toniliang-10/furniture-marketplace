package com.toni.furniture_marketplace.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FurnitureItem> items = new ArrayList<>();

    public Seller() {
    }

    public Seller(String name, String email) {
        this.name = name;
        this.email = email;
    }

    // --- convenience helper to keep both sides of the relationship in sync ---
    public void addItem(FurnitureItem item) {
        items.add(item);
        item.setSeller(this);
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<FurnitureItem> getItems() {
        return items;
    }

    public void setItems(List<FurnitureItem> items) {
        this.items = items;
    }
}
