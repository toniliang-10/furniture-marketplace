package com.toni.furniture_marketplace.config;

import com.toni.furniture_marketplace.model.Category;
import com.toni.furniture_marketplace.model.FurnitureItem;
import com.toni.furniture_marketplace.model.Seller;
import com.toni.furniture_marketplace.repository.SellerRepository;
import java.math.BigDecimal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final SellerRepository sellerRepository;

    public DataSeeder(SellerRepository sellerRepository) {
        this.sellerRepository = sellerRepository;
    }

    @Override
    public void run(String... args) {
        if (sellerRepository.count() > 0) {
            return; // already seeded
        }

        Seller alice = new Seller("Alice", "alice@example.com");
        alice.addItem(new FurnitureItem(
                "Mid-century sofa",
                "Comfortable 3-seater, light wear",
                new BigDecimal("450.00"),
                Category.SOFA,
                "https://example.com/sofa.jpg"));
        alice.addItem(new FurnitureItem(
                "Oak dining table",
                "Seats six, solid oak",
                new BigDecimal("300.00"),
                Category.TABLE,
                "https://example.com/table.jpg"));

        Seller bob = new Seller("Bob", "bob@example.com");
        bob.addItem(new FurnitureItem(
                "Ergonomic office chair",
                "Adjustable height and lumbar support",
                new BigDecimal("120.00"),
                Category.CHAIR,
                "https://example.com/chair.jpg"));

        sellerRepository.saveAll(java.util.List.of(alice, bob));
    }
}
