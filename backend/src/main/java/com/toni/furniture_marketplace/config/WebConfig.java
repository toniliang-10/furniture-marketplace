package com.toni.furniture_marketplace.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final Path uploadDir;
    private final List<String> allowedOrigins;

    public WebConfig(
            @Value("${app.upload.dir}") String uploadDir,
            // Comma-separated list of origins allowed to call /api/**. Defaults to the
            // local dev servers; set APP_CORS_ORIGINS in deployed environments to your
            // frontend URL, e.g. https://furniture.vercel.app
            @Value("${app.cors.origins:http://localhost:3000,http://localhost:5173}") String allowedOrigins) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    /**
     * Serve user-uploaded furniture images from the filesystem upload directory
     * at /images/uploads/**. The bundled placeholder images under
     * classpath:/static/images/ continue to be served by the default handler.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Resource locations must end with a slash; Path.toUri() only adds one
        // when the directory already exists, so append it defensively.
        String location = uploadDir.toUri().toString();
        if (!location.endsWith("/")) {
            location += "/";
        }
        registry.addResourceHandler("/images/uploads/**")
                .addResourceLocations(location);
    }
}
