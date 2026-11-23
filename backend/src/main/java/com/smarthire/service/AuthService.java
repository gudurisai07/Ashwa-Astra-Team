package com.smarthire.service;

import com.smarthire.dto.AuthDtos.AuthResponse;
import com.smarthire.dto.AuthDtos.LoginRequest;
import com.smarthire.dto.AuthDtos.RegisterRequest;
import com.smarthire.dto.AuthDtos.UpdateProfileRequest;
import com.smarthire.entity.Candidate;
import com.smarthire.entity.User;
import com.smarthire.exception.ApiException;
import com.smarthire.repository.CandidateRepository;
import com.smarthire.repository.UserRepository;
import com.smarthire.util.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.regex.Pattern;

@Service
public class AuthService {
    private static final Pattern STRONG_PASSWORD = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,72}$"
    );

    private final UserRepository users;
    private final CandidateRepository candidates;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;
    private final CloudinaryService cloudinary;

    public AuthService(UserRepository users, CandidateRepository candidates, PasswordEncoder encoder, JwtUtil jwt, CloudinaryService cloudinary) {
        this.users = users;
        this.candidates = candidates;
        this.encoder = encoder;
        this.jwt = jwt;
        this.cloudinary = cloudinary;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw ApiException.conflict("An account with this email already exists");
        }

        // Strict 100% verifying strong password check
        if (req.password() == null || !STRONG_PASSWORD.matcher(req.password()).matches()) {
            throw ApiException.badRequest("Password must be at least 8 characters and contain at least one uppercase letter (A-Z), one lowercase letter (a-z), one number (0-9), and one special symbol (!@#$%^&*)");
        }

        User.Role role = User.Role.valueOf(req.role());
        User u = new User();
        u.setFullName(req.fullName().trim());
        u.setEmail(email);
        u.setPassword(encoder.encode(req.password()));
        u.setRole(role);
        u.setProfileImageUrl(req.profileImageUrl());
        if (role == User.Role.RECRUITER) {
            u.setCompanyName(req.companyName() == null ? null : req.companyName().trim());
        }
        u = users.save(u);

        if (role == User.Role.CANDIDATE) {
            Candidate c = new Candidate();
            c.setUser(u);
            c.setPhone(req.phone());
            c.setHeadline(req.headline());
            c.setLocation(req.location());
            c.setExperienceYears(req.experienceYears());
            c.setSkills(req.skills());
            c.setProfileImageUrl(req.profileImageUrl());
            candidates.save(c);
        }
        return toResponse(u);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User u = users.findByEmail(req.email().trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!encoder.matches(req.password(), u.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        return toResponse(u);
    }

    public String uploadProfileImage(MultipartFile file) {
        return cloudinary.uploadImage(file, "smarthire/profiles");
    }

    @Transactional
    public AuthResponse updateProfile(User user, UpdateProfileRequest req) {
        if (req.fullName() != null && !req.fullName().isBlank()) {
            user.setFullName(req.fullName().trim());
        }
        if (req.companyName() != null) {
            user.setCompanyName(req.companyName().trim());
        }
        if (req.profileImageUrl() != null && !req.profileImageUrl().isBlank()) {
            user.setProfileImageUrl(req.profileImageUrl().trim());
        }
        user = users.save(user);

        if (user.getRole() == User.Role.CANDIDATE) {
            final User finalUser = user;
            Candidate c = candidates.findByUserId(user.getId()).orElseGet(() -> {
                Candidate newC = new Candidate();
                newC.setUser(finalUser);
                return newC;
            });
            if (req.phone() != null) c.setPhone(req.phone().trim());
            if (req.headline() != null) c.setHeadline(req.headline().trim());
            if (req.location() != null) c.setLocation(req.location().trim());
            if (req.experienceYears() != null) c.setExperienceYears(req.experienceYears());
            if (req.skills() != null) c.setSkills(req.skills().trim());
            if (req.profileImageUrl() != null && !req.profileImageUrl().isBlank()) {
                c.setProfileImageUrl(req.profileImageUrl().trim());
            }
            candidates.save(c);
        }
        return toResponse(user);
    }

    public AuthResponse toResponse(User u) {
        return new AuthResponse(
                jwt.generateToken(u.getEmail(), u.getRole().name()),
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getRole().name(),
                u.getProfileImageUrl(),
                u.getCompanyName()
        );
    }
}
