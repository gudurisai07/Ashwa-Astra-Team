package com.smarthire.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank @Size(max = 150) String fullName,
            @NotBlank @Email @Size(max = 190) String email,
            @NotBlank
            @Size(min = 8, max = 72, message = "Password must be 8-72 characters")
            @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,72}$",
                message = "Password must be at least 8 characters and contain at least one uppercase letter (A-Z), one lowercase letter (a-z), one number (0-9), and one special symbol (!@#$%^&*)"
            )
            String password,
            @NotNull @Pattern(regexp = "CANDIDATE|RECRUITER", message = "Role must be CANDIDATE or RECRUITER") String role,
            @Size(max = 150) String companyName,
            // Profile fields (supports both candidates and recruiters)
            @Size(max = 30) String phone,
            @Size(max = 200) String headline,
            @Size(max = 150) String location,
            Integer experienceYears,
            @Size(max = 1000) String skills,
            @Size(max = 500) String profileImageUrl) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record AuthResponse(
            String token,
            Long userId,
            String fullName,
            String email,
            String role,
            String profileImageUrl,
            String companyName) {}

    public record UpdateProfileRequest(
            String fullName,
            String companyName,
            String profileImageUrl,
            String phone,
            String headline,
            String location,
            Integer experienceYears,
            String skills) {}
}
