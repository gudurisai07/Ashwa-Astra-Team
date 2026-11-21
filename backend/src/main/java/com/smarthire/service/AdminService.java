package com.smarthire.service;

import com.smarthire.dto.AdminDtos.*;
import com.smarthire.entity.AuditLog;
import com.smarthire.entity.Job;
import com.smarthire.entity.User;
import com.smarthire.exception.ApiException;
import com.smarthire.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final UserRepository userRepo;
    private final CandidateRepository candidateRepo;
    private final JobRepository jobRepo;
    private final ApplicationRepository appRepo;
    private final AuditLogRepository auditRepo;
    private final CurrentUserService currentUserService;

    public AdminService(UserRepository userRepo, CandidateRepository candidateRepo,
                        JobRepository jobRepo, ApplicationRepository appRepo,
                        AuditLogRepository auditRepo, CurrentUserService currentUserService) {
        this.userRepo = userRepo;
        this.candidateRepo = candidateRepo;
        this.jobRepo = jobRepo;
        this.appRepo = appRepo;
        this.auditRepo = auditRepo;
        this.currentUserService = currentUserService;
    }

    // ---------- Users ----------
    @Transactional(readOnly = true)
    public PagedResponse<UserDto> listUsers(UserSearchParams params) {
        Pageable pg = PageRequest.of(params.page(), params.size());
        Page<User> page = userRepo.findAll(pg);
        List<UserDto> content = page.stream()
                .map(u -> new UserDto(u.getId(), u.getFullName(), u.getEmail(), u.getRole().name(), u.getActive()))
                .collect(Collectors.toList());
        return new PagedResponse<>(content, page.getTotalElements(), page.getTotalPages(), page.getNumber());
    }

    @Transactional(readOnly = true)
    public UserDetailDto getUserDetail(Long id) {
        User u = userRepo.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        long jobCount = jobRepo.countByRecruiterId(u.getId());
        long appCount = appRepo.countByCandidateId(u.getId());
        return new UserDetailDto(u.getId(), u.getFullName(), u.getEmail(), u.getRole().name(), u.getActive(),
                (int) jobCount, (int) appCount);
    }

    @Transactional
    public void toggleActive(Long id, Boolean active) {
        User admin = getCurrentAdmin();
        User target = userRepo.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        if (target.getId().equals(admin.getId())) throw ApiException.forbidden("Cannot deactivate yourself");
        if (target.getRole() == User.Role.ADMIN && !active) {
            long activeAdmins = userRepo.countByRoleAndActive(User.Role.ADMIN, true);
            if (activeAdmins <= 1) throw ApiException.forbidden("At least one active admin required");
        }
        target.setActive(active);
        userRepo.save(target);
        auditRepo.save(new AuditLog(admin.getId(), "TOGGLE_ACTIVE", "USER", target.getId(), "active=" + active));
    }

    @Transactional
    public void changeRole(Long id, String roleStr) {
        User admin = getCurrentAdmin();
        User target = userRepo.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        if (target.getId().equals(admin.getId())) throw ApiException.forbidden("Cannot change your own role");
        User.Role newRole;
        try { newRole = User.Role.valueOf(roleStr.toUpperCase()); } catch (Exception e) { throw ApiException.badRequest("Invalid role"); }
        if (newRole == User.Role.ADMIN) throw ApiException.forbidden("Cannot assign ADMIN role via API");
        target.setRole(newRole);
        userRepo.save(target);
        auditRepo.save(new AuditLog(admin.getId(), "CHANGE_ROLE", "USER", target.getId(), "role=" + newRole));
    }

    @Transactional
    public void deleteUser(Long id) {
        User admin = getCurrentAdmin();
        User target = userRepo.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        if (target.getId().equals(admin.getId())) throw ApiException.forbidden("Cannot delete yourself");
        long depJobs = jobRepo.countByRecruiterId(target.getId());
        long depApps = appRepo.countByCandidateId(target.getId());
        if (depJobs > 0 || depApps > 0) throw new ApiException(HttpStatus.CONFLICT, "User has dependent data; deactivate instead");
        userRepo.delete(target);
        auditRepo.save(new AuditLog(admin.getId(), "DELETE_USER", "USER", target.getId(), null));
    }

    // ---------- Jobs ----------
    @Transactional(readOnly = true)
    public PagedResponse<JobDto> listJobs(JobSearchParams params) {
        Pageable pg = PageRequest.of(params.page(), params.size());
        Page<Job> page = jobRepo.findAll(pg);
        List<JobDto> content = page.stream()
                .map(j -> new JobDto(j.getId(), j.getTitle(), j.getRecruiter().getFullName(), j.getStatus().name(), j.getCreatedAt()))
                .collect(Collectors.toList());
        return new PagedResponse<>(content, page.getTotalElements(), page.getTotalPages(), page.getNumber());
    }

    @Transactional
    public void updateJobStatus(Long id, String status) {
        User admin = getCurrentAdmin();
        Job job = jobRepo.findById(id).orElseThrow(() -> ApiException.notFound("Job not found"));
        job.setStatus(Job.Status.valueOf(status.toUpperCase()));
        jobRepo.save(job);
        auditRepo.save(new AuditLog(admin.getId(), "SET_JOB_STATUS", "JOB", job.getId(), "status=" + status));
    }

    @Transactional
    public void deleteJob(Long id) {
        User admin = getCurrentAdmin();
        Job job = jobRepo.findById(id).orElseThrow(() -> ApiException.notFound("Job not found"));
        jobRepo.delete(job);
        auditRepo.save(new AuditLog(admin.getId(), "DELETE_JOB", "JOB", id, null));
    }

    @Transactional
    public JobDto createJob(CreateJobDto dto) {
        User recruiter = userRepo.findFirstByRole(User.Role.RECRUITER)
                .orElseThrow(() -> ApiException.notFound("No recruiter found to assign the job"));
        Job job = new Job();
        job.setTitle(dto.title());
        job.setCompanyName(null);
        job.setDescription(dto.description());
        job.setRequiredSkills(dto.requiredSkills());
        job.setExperience(dto.experience());
        job.setSalaryRange(dto.salaryRange());
        job.setLocation(dto.location());
        job.setEmploymentType(dto.employmentType());
        job.setStatus(Job.Status.ACTIVE);
        job.setRecruiter(recruiter);
        jobRepo.save(job);
        User admin = getCurrentAdmin();
        auditRepo.save(new AuditLog(admin.getId(), "CREATE_JOB", "JOB", job.getId(), null));
        return new JobDto(job.getId(), job.getTitle(), recruiter.getFullName(), job.getStatus().name(), job.getCreatedAt());
    }

    // ---------- Applications ----------
    @Transactional(readOnly = true)
    public PagedResponse<ApplicationDto> listApplications(ApplicationSearchParams params) {
        Pageable pg = PageRequest.of(params.page(), params.size());
        Page<com.smarthire.entity.Application> page = appRepo.findAll(pg);
        List<ApplicationDto> content = page.stream()
                .map(a -> new ApplicationDto(a.getId(), a.getJob().getId(), a.getCandidate().getId(), a.getStatus().name(), a.getCreatedAt()))
                .collect(Collectors.toList());
        return new PagedResponse<>(content, page.getTotalElements(), page.getTotalPages(), page.getNumber());
    }

    // ---------- Analytics ----------
    @Transactional(readOnly = true)
    public AnalyticsOverviewDto analyticsOverview() {
        long totalUsers = userRepo.count();
        long activeUsers = userRepo.countByActive(true);
        long totalJobs = jobRepo.count();
        long closedJobs = jobRepo.countByStatus(Job.Status.CLOSED);
        long totalApplications = appRepo.count();
        long resumesUploaded = candidateRepo.countByResumePathIsNotNull();
        return new AnalyticsOverviewDto(totalUsers, activeUsers, totalJobs, closedJobs, totalApplications,
                resumesUploaded, List.of(), List.of(), List.of(), List.of(), List.of());
    }

    @Transactional(readOnly = true)
    public AiUsageDto aiUsage() {
        return new AiUsageDto(0, 0, 0, 0, List.of(), List.of(), List.of(), List.of(), 0.0, 0.0, false, null);
    }

    // ---------- Audit Logs ----------
    @Transactional(readOnly = true)
    public PagedResponse<AuditLogDto> auditLogs(AuditLogSearchParams params) {
        Pageable pg = PageRequest.of(params.page(), params.size());
        Page<AuditLog> page = auditRepo.findAll(pg);
        List<AuditLogDto> content = page.stream()
                .map(a -> new AuditLogDto(a.getId(), a.getAdminUserId(), a.getAction(), a.getTargetType(),
                        a.getTargetId(), a.getDetails(), a.getCreatedAt()))
                .collect(Collectors.toList());
        return new PagedResponse<>(content, page.getTotalElements(), page.getTotalPages(), page.getNumber());
    }

    private User getCurrentAdmin() {
        User u = currentUserService.user();
        if (u.getRole() != User.Role.ADMIN) throw ApiException.forbidden("Admin role required");
        return u;
    }
}
