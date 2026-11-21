package com.smarthire.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidates", indexes = @Index(name = "idx_candidates_user", columnList = "user_id"))
@Getter
@Setter
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 30)
    private String phone;

    @Column(length = 200)
    private String headline;

    @Column(length = 150)
    private String location;

    private Integer experienceYears;

    @Column(length = 1000)
    private String skills;

    // Current resume (metadata + extracted text)
    @Column(length = 255)
    private String profileImageUrl;

    @Column(length = 400)
    private String resumePath;

    @Column(length = 100)
    private String resumeContentType;

    private Long resumeSizeBytes;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String resumeText;

    private LocalDateTime resumeUploadedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
