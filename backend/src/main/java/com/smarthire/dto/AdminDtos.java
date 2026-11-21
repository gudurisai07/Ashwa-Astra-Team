package com.smarthire.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

public class AdminDtos {
    // ---------- Pagination wrapper ----------
    public record PagedResponse<T>(
            List<T> content,
            long totalElements,
            int totalPages,
            int pageNumber) {}

    // ---------- User management ----------
    public record UserDto(Long id, String fullName, String email, String role, boolean active) {}
    public record UserDetailDto(Long id, String fullName, String email, String role, boolean active,
                                int jobCount, int applicationCount) {}
    public record ActiveToggleDto(@NotNull Boolean active) {}
    public record RoleChangeDto(@NotBlank @Size(max = 20) String role) {}
    public record UserSearchParams(@NotBlank String query,
                                   String role,
                                   Boolean active,
                                   int page,
                                   int size) {}

    // ---------- Job moderation ----------
    public record JobSearchParams(String status, String query, int page, int size) {}
    public record JobDto(Long id, String title, String recruiterName, String status, LocalDateTime createdAt) {}
    public record JobStatusDto(@NotBlank String status) {}
    public record CreateJobDto(String title,
                              String description,
                              String requiredSkills,
                              int experience,
                              String salaryRange,
                              String location,
                              String employmentType,
                              String status) {}


    // ---------- Application oversight ----------
    public record ApplicationDto(Long id, Long jobId, Long candidateId, String status, LocalDateTime appliedAt) {}
    public record ApplicationSearchParams(String status,
                                          Long jobId,
                                          Long recruiterId,
                                          LocalDateTime from,
                                          LocalDateTime to,
                                          int page,
                                          int size) {}

    // ---------- Analytics ----------
    public record AnalyticsOverviewDto(long totalUsers,
                                      long activeUsers,
                                      long totalJobs,
                                      long closedJobs,
                                      long totalApplications,
                                      long resumesUploaded,
                                      List<DailyStat> dailyNewUsers,
                                      List<DailyStat> dailyNewJobs,
                                      List<DailyStat> dailyNewApplications,
                                      List<TopJob> topJobs,
                                      List<TopSkill> topSkills) {}
    public record DailyStat(LocalDateTime day, long count) {}
    public record TopJob(Long jobId, String title, long applications) {}
    public record TopSkill(String skill, long count) {}

    public record AiUsageDto(long totalAnalyses,
                              long totalImprovements,
                              long totalMatches,
                              long totalInterviewSets,
                              List<DailyStat> analysesPerDay,
                              List<DailyStat> improvementsPerDay,
                              List<DailyStat> matchesPerDay,
                              List<DailyStat> interviewSetsPerDay,
                              double avgResumeQualityScore,
                              double avgMatchPercentage,
                              boolean isConfigured,
                              String modelName) {}

    // ---------- Audit log ----------
    public record AuditLogDto(Long id,
                               Long adminUserId,
                               String action,
                               String targetType,
                               Long targetId,
                               String details,
                               LocalDateTime createdAt) {}
    public record AuditLogSearchParams(String action,
                                        String targetType,
                                        Long adminUserId,
                                        LocalDateTime from,
                                        LocalDateTime to,
                                        int page,
                                        int size) {}
}
