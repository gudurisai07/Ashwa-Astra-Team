package com.smarthire.controller;

import com.smarthire.dto.AdminDtos.*;
import com.smarthire.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // -------- Users --------
    @GetMapping("/users")
    public ResponseEntity<PagedResponse<UserDto>> listUsers(@Valid UserSearchParams params) {
        return ResponseEntity.ok(adminService.listUsers(params));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDetailDto> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserDetail(id));
    }

    @PutMapping("/users/{id}/active")
    public ResponseEntity<Map<String, String>> setActive(@PathVariable Long id, @RequestBody @Valid ActiveToggleDto toggle) {
        adminService.toggleActive(id, toggle.active());
        return ResponseEntity.ok(Map.of("message", "User activation updated"));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, String>> setRole(@PathVariable Long id, @RequestBody @Valid RoleChangeDto dto) {
        adminService.changeRole(id, dto.role());
        return ResponseEntity.ok(Map.of("message", "User role updated"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // -------- Jobs --------
    @PostMapping("/jobs")
    public ResponseEntity<JobDto> createJob(@Valid @RequestBody CreateJobDto dto) {
        return new ResponseEntity<>(adminService.createJob(dto), HttpStatus.CREATED);
    }


    @PutMapping("/jobs/{id}/status")
    public ResponseEntity<Map<String, String>> setJobStatus(@PathVariable Long id, @RequestBody @Valid JobStatusDto dto) {
        adminService.updateJobStatus(id, dto.status());
        return ResponseEntity.ok(Map.of("message", "Job status updated"));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        adminService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    // -------- Applications --------
    @GetMapping("/applications")
    public ResponseEntity<PagedResponse<ApplicationDto>> listApplications(@Valid ApplicationSearchParams params) {
        return ResponseEntity.ok(adminService.listApplications(params));
    }

    // -------- Analytics --------
    @GetMapping("/analytics/overview")
    public ResponseEntity<AnalyticsOverviewDto> overview() {
        return ResponseEntity.ok(adminService.analyticsOverview());
    }

    @GetMapping("/analytics/ai-usage")
    public ResponseEntity<AiUsageDto> aiUsage() {
        return ResponseEntity.ok(adminService.aiUsage());
    }

    // -------- Audit Logs --------
    @GetMapping("/audit-logs")
    public ResponseEntity<PagedResponse<AuditLogDto>> auditLogs(@Valid AuditLogSearchParams params) {
        return ResponseEntity.ok(adminService.auditLogs(params));
    }
}
