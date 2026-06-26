package com.toni.furniture_marketplace.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.toni.furniture_marketplace.model.Category;
import com.toni.furniture_marketplace.model.FurnitureItem;
import com.toni.furniture_marketplace.model.ItemStatus;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

@DataJpaTest
class FurnitureItemRepositoryTest {

    @Autowired
    private FurnitureItemRepository repository;

    @Test
    void findByCategory_returnsOnlyMatchingItems() {
        repository.save(new FurnitureItem("Sofa", "comfy", new BigDecimal("100"), Category.SOFA, null));
        repository.save(new FurnitureItem("Chair", "wooden", new BigDecimal("50"), Category.CHAIR, null));

        Page<FurnitureItem> sofas = repository.findByCategory(Category.SOFA, PageRequest.of(0, 10));

        assertThat(sofas.getTotalElements()).isEqualTo(1);
        assertThat(sofas.getContent().get(0).getTitle()).isEqualTo("Sofa");
    }

    @Test
    void findByStatus_filtersByStatus() {
        FurnitureItem sold = new FurnitureItem("Old desk", "scratched", new BigDecimal("20"), Category.DESK, null);
        sold.setStatus(ItemStatus.SOLD);
        repository.save(sold);
        repository.save(new FurnitureItem("New table", "oak", new BigDecimal("80"), Category.TABLE, null));

        Page<FurnitureItem> available = repository.findByStatus(ItemStatus.AVAILABLE, PageRequest.of(0, 10));

        assertThat(available.getTotalElements()).isEqualTo(1);
        assertThat(available.getContent().get(0).getTitle()).isEqualTo("New table");
    }
}
