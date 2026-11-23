package com.smarthire.controller;

import com.smarthire.dto.AuthDtos.AuthResponse;
import com.smarthire.dto.AuthDtos.LoginRequest;
import com.smarthire.dto.AuthDtos.RegisterRequest;
import com.smarthire.dto.AuthDtos.UpdateProfileRequest;
import com.smarthire.service.AuthService;
import com.smarthire.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final CurrentUserService current;
    private final String uploadDir;

    public AuthController(AuthService auth, CurrentUserService current,
                          @Value("${smarthire.upload-dir:uploads}") String uploadDir) {
        this.auth = auth;
        this.current = current;
        this.uploadDir = uploadDir;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auth.register(req));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return auth.login(req);
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = auth.uploadProfileImage(file);
        return Map.of("url", url);
    }

    @GetMapping("/me")
    public AuthResponse me() {
        return auth.toResponse(current.user());
    }

    @PutMapping("/profile")
    public AuthResponse updateProfile(@RequestBody UpdateProfileRequest req) {
        return auth.updateProfile(current.user(), req);
    }

    @GetMapping("/profile-image/view/{filename:.+}")
    public ResponseEntity<Resource> viewProfileImage(@PathVariable String filename) {
        try {
            Path file = Paths.get(uploadDir, "avatars").resolve(filename).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = filename.toLowerCase().endsWith(".png") ? "image/png"
                        : filename.toLowerCase().endsWith(".webp") ? "image/webp" : "image/jpeg";
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                        .body(resource);
            }
        } catch (Exception ignored) {}
        return ResponseEntity.notFound().build();
    }
}
