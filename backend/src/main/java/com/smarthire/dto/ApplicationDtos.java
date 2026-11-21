package com.smarthire.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class ApplicationDtos {
    private ApplicationDtos() {}

    public record ApplyRequest(@NotNull Long jobId, @Size(max = 1000) String coverNote) {}

    public record StatusRequest(
            @NotBlank @Pattern(regexp = "PENDING|SHORTLISTED|REJECTED", message = "Status must be PENDING, SHORTLISTED or REJECTED") String status) {}

    public record ApplicationResponse(
            Long id, Long jobId, String jobTitle, String companyName,
            Long candidateId, String candidateName, String candidateEmail, String candidateSkills,
            Integer candidateExperienceYears, String status, String coverNote,
            boolean hasResume, LocalDateTime appliedAt, LocalDateTime updatedAt) {}
}
