package com.smarthire.repository;

import com.smarthire.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByUserId(Long userId);

    @Query("select count(c) from Candidate c where c.resumePath is not null")
    long countByResumePathIsNotNull();
}
