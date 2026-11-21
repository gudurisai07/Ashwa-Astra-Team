package com.smarthire.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class JobDtos {
    private JobDtos() {}

    public record JobRequest(
            @NotBlank @Size(max = 200) String title,
            @NotBlank @Size(max = 200) String companyName,
            @NotBlank @Size(max = 8000) String description,
            @NotBlank @Size(max = 1000) String requiredSkills,
            @NotNull @Min(0) Integer experience,
            @Size(max = 100) String salaryRange,
            @NotBlank @Size(max = 150) String location,
            @NotBlank @Size(max = 30) String employmentType,
            String status) {}

    public record JobResponse(
            Long id, String title, String companyName, String description, String requiredSkills,
            Integer experience, String salaryRange, String location, String employmentType,
            Long recruiterId, String status, long applicationCount, LocalDateTime createdAt) {}
}
