package com.smarthire.service;

import com.smarthire.dto.JobDtos.JobRequest;
import com.smarthire.dto.JobDtos.JobResponse;
import com.smarthire.entity.Job;
import com.smarthire.entity.User;
import com.smarthire.exception.ApiException;
import com.smarthire.repository.ApplicationRepository;
import com.smarthire.repository.JobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class JobService {
    private final JobRepository jobs;
    private final ApplicationRepository applications;
    private final CurrentUserService current;

    public JobService(JobRepository jobs, ApplicationRepository applications, CurrentUserService current) {
        this.jobs = jobs;
        this.applications = applications;
        this.current = current;
    }

    /** Public listing of ACTIVE jobs with optional text, skill and experience filters. */
    @Transactional(readOnly = true)
    public List<JobResponse> search(String q, String skill, Integer maxExperience) {
        return jobs.search(Job.Status.ACTIVE,
                        q == null ? "" : q.trim(),
                        skill == null ? "" : skill.trim(),
                        maxExperience == null ? Integer.MAX_VALUE : maxExperience)
                .stream().map(j -> toResponse(j, false)).toList();
    }

    @Transactional(readOnly = true)
    public JobResponse get(Long id) {
        return toResponse(find(id), false);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> mine() {
        User r = current.recruiter();
        return jobs.findByRecruiterIdOrderByCreatedAtDesc(r.getId()).stream().map(j -> toResponse(j, true)).toList();
    }

    @Transactional
    public JobResponse create(JobRequest req) {
        User r = current.recruiter();
        Job j = new Job();
        j.setRecruiter(r);
        apply(j, req);
        return toResponse(jobs.save(j), true);
    }

    @Transactional
    public JobResponse update(Long id, JobRequest req) {
        Job j = owned(id);
        apply(j, req);
        return toResponse(jobs.save(j), true);
    }

    /** Soft delete: the job is marked CLOSED so existing applications keep their history. */
    @Transactional
    public void deactivate(Long id) {
        Job j = owned(id);
        j.setStatus(Job.Status.CLOSED);
        jobs.save(j);
    }

    public Job find(Long id) {
        return jobs.findById(id).orElseThrow(() -> ApiException.notFound("Job not found"));
    }

    private Job owned(Long id) {
        User r = current.recruiter();
        Job j = find(id);
        if (!j.getRecruiter().getId().equals(r.getId())) {
            throw ApiException.forbidden("You can only modify your own jobs");
        }
        return j;
    }

    private void apply(Job j, JobRequest req) {
        j.setTitle(req.title().trim());
        j.setCompanyName(req.companyName().trim());
        j.setDescription(req.description().trim());
        j.setRequiredSkills(req.requiredSkills().trim());
        j.setExperience(req.experience());
        j.setSalaryRange(req.salaryRange());
        j.setLocation(req.location().trim());
        j.setEmploymentType(req.employmentType().trim());
        if (req.status() != null && !req.status().isBlank()) {
            try {
                j.setStatus(Job.Status.valueOf(req.status().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw ApiException.badRequest("Status must be ACTIVE or CLOSED");
            }
        }
    }

    private JobResponse toResponse(Job j, boolean withCount) {
        return new JobResponse(j.getId(), j.getTitle(), j.getCompanyName(), j.getDescription(), j.getRequiredSkills(),
                j.getExperience(), j.getSalaryRange(), j.getLocation(), j.getEmploymentType(),
                j.getRecruiter().getId(), j.getStatus().name(),
                withCount ? applications.countByJobId(j.getId()) : 0, j.getCreatedAt());
    }
}
