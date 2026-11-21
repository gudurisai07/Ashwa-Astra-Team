package com.smarthire.repository;

import com.smarthire.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);

    List<Application> findByJobRecruiterIdOrderByCreatedAtDesc(Long recruiterId);

    boolean existsByCandidateIdAndJobId(Long candidateId, Long jobId);

    boolean existsByCandidateIdAndJobRecruiterId(Long candidateId, Long recruiterId);

    long countByCandidateId(Long candidateId);

    long countByCandidateIdAndStatus(Long candidateId, Application.Status status);

    long countByJobRecruiterId(Long recruiterId);

    long countByJobRecruiterIdAndStatus(Long recruiterId, Application.Status status);

    long countByJobId(Long jobId);
}
