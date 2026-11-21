package com.smarthire.repository;

import com.smarthire.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findFirstByRole(User.Role role);
    boolean existsByEmail(String email);
    long countByActive(boolean active);
    long countByRoleAndActive(User.Role role, boolean active);
    long countByRole(User.Role role);
}
