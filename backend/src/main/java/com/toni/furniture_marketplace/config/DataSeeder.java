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

    // Base URL for the seed/template images served from src/main/resources/static/.
    // Anything under static/ is served at the web root, so static/images/furniture/sofa1.png
    // resolves at http://localhost:8080/images/furniture/sofa1.png.
    private static final String IMG = "http://localhost:8080/images/furniture/";

    private final SellerRepository sellerRepository;

    public DataSeeder(SellerRepository sellerRepository) {
        this.sellerRepository = sellerRepository;
    }

    @Override
    public void run(String... args) {
        if (sellerRepository.count() > 0) {
            return; // already seeded
        }

        Seller alice = new Seller("Alice", "toniliang10@gmail.com");
        alice.addItem(new FurnitureItem(
                "Mid-century sofa",
                "Comfortable 3-seater, light wear",
                new BigDecimal("450.00"),
                Category.SOFA,
                IMG + "sofa1.png"));
        alice.addItem(new FurnitureItem(
                "Leather loveseat",
                "Two-seater, supple tan leather",
                new BigDecimal("380.00"),
                Category.SOFA,
                IMG + "sofa2.png"));
        alice.addItem(new FurnitureItem(
                "Oak dining table",
                "Seats six, solid oak",
                new BigDecimal("300.00"),
                Category.TABLE,
                IMG + "table1.png"));
        alice.addItem(new FurnitureItem(
                "Glass coffee table",
                "Tempered glass top, steel frame",
                new BigDecimal("150.00"),
                Category.TABLE,
                IMG + "table2.png"));

        Seller bob = new Seller("Bob", "toniliang10@gmail.com");
        bob.addItem(new FurnitureItem(
                "Ergonomic office chair",
                "Adjustable height and lumbar support",
                new BigDecimal("120.00"),
                Category.CHAIR,
                IMG + "chair1.png"));
        bob.addItem(new FurnitureItem(
                "Upholstered accent armchair",
                "Cozy reading chair with wooden legs",
                new BigDecimal("90.00"),
                Category.CHAIR,
                IMG + "chair2.png"));
        bob.addItem(new FurnitureItem(
                "Sit-stand desk",
                "Electric height adjustment, walnut top",
                new BigDecimal("260.00"),
                Category.DESK,
                IMG + "desk1.png"));
        bob.addItem(new FurnitureItem(
                "Compact writing desk",
                "Small footprint, one drawer",
                new BigDecimal("110.00"),
                Category.DESK,
                IMG + "desk2.png"));

        Seller carol = new Seller("Carol", "toniliang10@gmail.com");
        carol.addItem(new FurnitureItem(
                "Queen platform bed",
                "Low-profile frame, no box spring needed",
                new BigDecimal("420.00"),
                Category.BED,
                IMG + "bed1.png"));
        carol.addItem(new FurnitureItem(
                "Solid wood bunk bed",
                "Twin over twin, includes ladder",
                new BigDecimal("340.00"),
                Category.BED,
                IMG + "bed2.png"));

        sellerRepository.saveAll(java.util.List.of(alice, bob, carol));
    }
}
