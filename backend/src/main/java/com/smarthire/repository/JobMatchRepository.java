package com.smarthire.repository;

import com.smarthire.entity.JobMatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobMatchRepository extends JpaRepository<JobMatch, Long> {
    List<JobMatch> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);

    Optional<JobMatch> findTopByCandidateIdAndJobIdOrderByCreatedAtDesc(Long candidateId, Long jobId);
}
