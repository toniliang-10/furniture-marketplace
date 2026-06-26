package com.toni.furniture_marketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FurnitureMarketplaceApplication {

	public static void main(String[] args) {
		SpringApplication.run(FurnitureMarketplaceApplication.class, args);
	}

}
