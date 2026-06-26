package com.toni.furniture_marketplace.web;

import com.toni.furniture_marketplace.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * Receives furniture image uploads. Stores the file and returns an absolute URL
 * pointing at the served static resource, matching the convention used by the
 * seeded images (e.g. http://localhost:8080/images/uploads/<file>). The Sell
 * flow uploads here first, then sends the returned URL as the listing imageUrl.
 */
@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final FileStorageService storage;

    public UploadController(FileStorageService storage) {
        this.storage = storage;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UploadResponse upload(@RequestParam("file") MultipartFile file) {
        String filename = storage.store(file);
        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/images/uploads/")
                .path(filename)
                .toUriString();
        return new UploadResponse(url, filename);
    }

    public record UploadResponse(String url, String filename) {
    }
}
