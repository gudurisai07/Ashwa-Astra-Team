package com.smarthire.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.smarthire.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {
    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final String uploadDir;
    private volatile Cloudinary cloudinary;

    public CloudinaryService(@Value("${smarthire.cloudinary.cloud-name:}") String cloudName,
                             @Value("${smarthire.cloudinary.api-key:}") String apiKey,
                             @Value("${smarthire.cloudinary.api-secret:}") String apiSecret,
                             @Value("${smarthire.upload-dir:uploads}") String uploadDir) {
        this.cloudName = cloudName == null ? "" : cloudName.trim();
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.apiSecret = apiSecret == null ? "" : apiSecret.trim();
        this.uploadDir = uploadDir == null ? "uploads" : uploadDir.trim();
    }

    public boolean isConfigured() {
        return !cloudName.isBlank() && !apiKey.isBlank() && !apiSecret.isBlank();
    }

    /**
     * Uploads an image to Cloudinary if configured; otherwise saves locally and returns local URL.
     */
    public String uploadImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("Please select an image file to upload");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw ApiException.badRequest("Only image files (JPEG, PNG, WEBP, GIF) are allowed");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw ApiException.badRequest("Image size must be less than 5MB");
        }

        // 1. Upload to Cloudinary if configured
        if (isConfigured()) {
            try {
                Cloudinary c = getClient();
                Map<?, ?> options = ObjectUtils.asMap(
                        "folder", folder != null && !folder.isBlank() ? folder : "smarthire/profiles",
                        "resource_type", "image"
                );
                Map<?, ?> uploadResult = c.uploader().upload(file.getBytes(), options);
                String secureUrl = (String) uploadResult.get("secure_url");
                if (secureUrl != null && !secureUrl.isBlank()) {
                    log.info("Successfully uploaded image to Cloudinary: {}", secureUrl);
                    return secureUrl;
                }
            } catch (Exception e) {
                log.error("Cloudinary upload failed: {}. Falling back to local storage...", e.getMessage(), e);
            }
        }

        // 2. Fallback: Save locally
        try {
            Path targetDir = Paths.get(uploadDir, "avatars");
            Files.createDirectories(targetDir);
            String ext = "";
            String orig = file.getOriginalFilename();
            if (orig != null && orig.contains(".")) {
                ext = orig.substring(orig.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID() + ext;
            Path targetPath = targetDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Saved profile image locally at: {}", targetPath);
            return "/api/auth/profile-image/view/" + fileName;
        } catch (IOException e) {
            log.error("Failed to store image locally: {}", e.getMessage(), e);
            // 3. Fallback to inline Base64 data URL if local disk fails
            try {
                return "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(file.getBytes());
            } catch (IOException ex) {
                throw ApiException.badRequest("Could not process image file: " + ex.getMessage());
            }
        }
    }

    private Cloudinary getClient() {
        if (cloudinary == null) {
            synchronized (this) {
                if (cloudinary == null) {
                    cloudinary = new Cloudinary(ObjectUtils.asMap(
                            "cloud_name", cloudName,
                            "api_key", apiKey,
                            "api_secret", apiSecret,
                            "secure", true
                    ));
                }
            }
        }
        return cloudinary;
    }
}
