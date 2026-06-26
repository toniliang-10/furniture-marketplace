package com.toni.furniture_marketplace.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import java.time.Instant;

@Entity
public class Interest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private FurnitureItem item;

    private String buyerName;

    private String buyerEmail;

    private String message;

    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Interest() {
    }

    public Interest(FurnitureItem item, String buyerName, String buyerEmail, String message) {
        this.item = item;
        this.buyerName = buyerName;
        this.buyerEmail = buyerEmail;
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public FurnitureItem getItem() {
        return item;
    }

    public void setItem(FurnitureItem item) {
        this.item = item;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public String getBuyerEmail() {
        return buyerEmail;
    }

    public void setBuyerEmail(String buyerEmail) {
        this.buyerEmail = buyerEmail;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
