package com.toni.furniture_marketplace.web;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.toni.furniture_marketplace.config.SecurityConfig;
import com.toni.furniture_marketplace.config.WebConfig;
import com.toni.furniture_marketplace.model.Category;
import com.toni.furniture_marketplace.model.FurnitureItem;
import com.toni.furniture_marketplace.service.FurnitureService;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(FurnitureController.class)
@Import({SecurityConfig.class, WebConfig.class})
class FurnitureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FurnitureService service;

    @Test
    void getOne_returnsItem() throws Exception {
        FurnitureItem item = new FurnitureItem(
                "Sofa", "comfy", new BigDecimal("100"), Category.SOFA, null);
        when(service.findById(1L)).thenReturn(item);

        mockMvc.perform(get("/api/furniture/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Sofa"))
                .andExpect(jsonPath("$.category").value("SOFA"));
    }

    @Test
    @WithMockUser
    void create_withInvalidBody_returns400() throws Exception {
        mockMvc.perform(post("/api/furniture")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
