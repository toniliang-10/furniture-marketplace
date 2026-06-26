package com.toni.furniture_marketplace.service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stores uploaded furniture images on the local filesystem under the configured
 * upload directory ({@code app.upload.dir}). Saved files are served back as
 * static resources at {@code /images/uploads/**} (see WebConfig), so the public
 * {@code GET /images/**} rule already exposes them.
 */
@Service
public class FileStorageService {

    // Image content types we accept, mapped to the extension we save them under.
    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif");

    private static final long MAX_BYTES = 8L * 1024 * 1024; // 8 MB

    private final Path uploadDir;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not create upload directory: " + uploadDir, e);
        }
    }

    /**
     * Validate and persist an uploaded image.
     *
     * @return the generated filename (e.g. {@code 9f3c...a1.png}), to be served
     *         at {@code /images/uploads/<filename>}.
     * @throws IllegalArgumentException if the file is empty or not a supported image
     */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No image file was provided.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("Image is too large. Maximum size is 8 MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null
                || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException(
                    "Unsupported image type. Please upload a PNG, JPEG, WebP, or GIF.");
        }

        String filename = UUID.randomUUID().toString().replace("-", "")
                + extensionFor(contentType);
        Path target = uploadDir.resolve(filename).normalize();
        // Guard against any path traversal from a crafted filename.
        if (!target.getParent().equals(uploadDir)) {
            throw new IllegalArgumentException("Invalid file name.");
        }

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store uploaded image.", e);
        }
        return filename;
    }

    private static String extensionFor(String contentType) {
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg"; // image/jpeg, image/jpg
        };
    }
}
