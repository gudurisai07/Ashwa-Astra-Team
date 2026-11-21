package com.smarthire.repository;

import com.smarthire.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    Optional<InterviewQuestion> findTopByCandidateIdAndJobIdOrderByCreatedAtDesc(Long candidateId, Long jobId);
}
