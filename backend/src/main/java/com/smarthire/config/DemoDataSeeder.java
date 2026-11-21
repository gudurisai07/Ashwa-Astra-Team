package com.smarthire.config;

import com.smarthire.entity.Candidate;
import com.smarthire.entity.User;
import com.smarthire.repository.CandidateRepository;
import com.smarthire.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates synthetic demo accounts with properly BCrypt-hashed passwords on first startup.
 * Disable with SEED_DEMO_USERS=false. database/data.sql adds demo jobs/applications for these accounts.
 */
@Component
public class DemoDataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final String DEMO_PASSWORD = "Password@123";

    private final UserRepository users;
    private final CandidateRepository candidates;
    private final PasswordEncoder encoder;
    private final boolean enabled;

    public DemoDataSeeder(UserRepository users, CandidateRepository candidates, PasswordEncoder encoder,
                          @Value("${smarthire.seed-demo-users}") boolean enabled) {
        this.users = users;
        this.candidates = candidates;
        this.encoder = encoder;
        this.enabled = enabled;
    }

    @Override
    public void run(String... args) {
        if (!enabled) return;
        recruiter("Riya Recruiter", "recruiter1@smarthire.demo", "Northwind Technologies");
        recruiter("Rahul Hiring", "recruiter2@smarthire.demo", "Bluepeak Systems");
        candidate("Asha Candidate", "candidate1@smarthire.demo", "Java Full Stack Developer", "Hyderabad", 2, "Java, Spring Boot, React, MySQL");
        candidate("Dev Candidate", "candidate2@smarthire.demo", "Data Analyst", "Bengaluru", 1, "SQL, Python, Excel, Power BI");
        log.info("Demo accounts ready (password for all: {}). Synthetic data only.", DEMO_PASSWORD);
    }

    private User user(String name, String email, User.Role role, String company) {
        return users.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setFullName(name);
            u.setEmail(email);
            u.setPassword(encoder.encode(DEMO_PASSWORD));
            u.setRole(role);
            u.setCompanyName(company);
            return users.save(u);
        });
    }

    private void recruiter(String name, String email, String company) {
        user(name, email, User.Role.RECRUITER, company);
    }

    private void candidate(String name, String email, String headline, String location, int years, String skills) {
        User u = user(name, email, User.Role.CANDIDATE, null);
        if (candidates.findByUserId(u.getId()).isEmpty()) {
            Candidate c = new Candidate();
            c.setUser(u);
            c.setHeadline(headline);
            c.setLocation(location);
            c.setExperienceYears(years);
            c.setSkills(skills);
            candidates.save(c);
        }
    }
}
