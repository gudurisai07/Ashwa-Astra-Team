package com.smarthire.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** Stores Gemini resume analysis and resume improvement results (distinguished by analysisType). */
@Entity
@Table(name = "resume_analysis", indexes = @Index(name = "idx_resume_analysis_candidate", columnList = "candidate_id"))
@Getter
@Setter
public class ResumeAnalysis {
    public enum Type { ANALYSIS, IMPROVEMENT }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Type analysisType;

    /** Resume quality score (0-100) for ANALYSIS rows; null for IMPROVEMENT rows. */
    private Integer qualityScore; 

    /** ATS readiness score (0-100) for ANALYSIS rows; null for IMPROVEMENT rows. */
    @Column(nullable = true)
    private Integer atsScore;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String resultJson;

    @Column(length = 100)
    private String modelName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
