package com.smarthire.service;

import com.smarthire.dto.AuthDtos.AuthResponse;
import com.smarthire.dto.AuthDtos.LoginRequest;
import com.smarthire.dto.AuthDtos.RegisterRequest;
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

@Service
public class AuthService {
    private final UserRepository users;
    private final CandidateRepository candidates;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    public AuthService(UserRepository users, CandidateRepository candidates, PasswordEncoder encoder, JwtUtil jwt) {
        this.users = users;
        this.candidates = candidates;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw ApiException.conflict("An account with this email already exists");
        }
        // Role is validated by the DTO pattern: only CANDIDATE or RECRUITER can self-register.
        User.Role role = User.Role.valueOf(req.role());
        User u = new User();
        u.setFullName(req.fullName().trim());
        u.setEmail(email);
        u.setPassword(encoder.encode(req.password()));
        u.setRole(role);
        if (role == User.Role.RECRUITER) {
            u.setCompanyName(req.companyName() == null ? null : req.companyName().trim());
        }
        u = users.save(u);
        if (role == User.Role.CANDIDATE) {
            Candidate c = new Candidate();
            c.setUser(u);
            // optional profile fields from request – may be null
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

    private AuthResponse toResponse(User u) {
        return new AuthResponse(jwt.generateToken(u.getEmail(), u.getRole().name()),
                u.getId(), u.getFullName(), u.getEmail(), u.getRole().name());
    }
}
