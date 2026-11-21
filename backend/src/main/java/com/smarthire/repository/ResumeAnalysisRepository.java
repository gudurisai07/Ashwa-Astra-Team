package com.smarthire.repository;

import com.smarthire.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {
    Optional<ResumeAnalysis> findTopByCandidateIdAndAnalysisTypeOrderByCreatedAtDesc(Long candidateId, ResumeAnalysis.Type type);
}
