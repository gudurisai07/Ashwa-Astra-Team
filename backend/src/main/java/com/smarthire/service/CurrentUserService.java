package com.smarthire.service;

import com.smarthire.entity.Candidate;
import com.smarthire.entity.User;
import com.smarthire.exception.ApiException;
import com.smarthire.repository.CandidateRepository;
import com.smarthire.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CurrentUserService {
    private final UserRepository users;
    private final CandidateRepository candidates;

    public CurrentUserService(UserRepository users, CandidateRepository candidates) {
        this.users = users;
        this.candidates = candidates;
    }

    public User user() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        User user = users.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User no longer exists"));
        if (Boolean.FALSE.equals(user.getActive())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Account is deactivated");
        }
        return user;
    }

    @Transactional
    public Candidate candidate() {
        User u = user();
        if (u.getRole() != User.Role.CANDIDATE) {
            throw ApiException.forbidden("Candidate account required");
        }
        // Auto-create Candidate profile if it doesn't exist (e.g. users registered before migration)
        return candidates.findByUserId(u.getId()).orElseGet(() -> {
            Candidate c = new Candidate();
            c.setUser(u);
            return candidates.save(c);
        });
    }

    public User recruiter() {
        User u = user();
        if (u.getRole() != User.Role.RECRUITER) {
            throw ApiException.forbidden("Recruiter account required");
        }
        return u;
    }
}
