package com.smarthire.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class ProfileDtos {
    private ProfileDtos() {}

    public record ProfileRequest(
            @Size(max = 30) String phone,
            @Size(max = 200) String headline,
            @Size(max = 150) String location,
            @Min(0) Integer experienceYears,
            @Size(max = 1000) String skills) {}

    public record ResumeResponse(
            Long candidateId, String fullName, String email, String phone, String headline,
            String location, Integer experienceYears, String skills,
            boolean hasResume, String resumeFileName, Long resumeSizeBytes,
            Integer resumeTextLength, LocalDateTime resumeUploadedAt) {
        public boolean resumeUploaded() {
            return hasResume;
        }
    }
}
