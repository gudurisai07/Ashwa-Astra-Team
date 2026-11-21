package com.smarthire.service;

import com.smarthire.dto.ApplicationDtos.ApplicationResponse;
import com.smarthire.dto.ApplicationDtos.ApplyRequest;
import com.smarthire.entity.Application;
import com.smarthire.entity.Candidate;
import com.smarthire.entity.Job;
import com.smarthire.entity.User;
import com.smarthire.exception.ApiException;
import com.smarthire.repository.ApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApplicationService {
    private final ApplicationRepository applications;
    private final JobService jobs;
    private final CurrentUserService current;

    public ApplicationService(ApplicationRepository applications, JobService jobs, CurrentUserService current) {
        this.applications = applications;
        this.jobs = jobs;
        this.current = current;
    }

    @Transactional
    public ApplicationResponse apply(ApplyRequest req) {
        Candidate c = current.candidate();
        Job job = jobs.find(req.jobId());
        if (job.getStatus() != Job.Status.ACTIVE) {
            throw ApiException.badRequest("This job is no longer accepting applications");
        }
        if (c.getResumePath() == null) {
            throw ApiException.badRequest("Please upload a PDF resume before applying");
        }
        if (applications.existsByCandidateIdAndJobId(c.getId(), job.getId())) {
            throw ApiException.conflict("You have already applied to this job");
        }
        Application a = new Application();
        a.setCandidate(c);
        a.setJob(job);
        a.setCoverNote(req.coverNote());
        a.setResumeFileName(c.getResumeFileName());
        a.setResumePath(c.getResumePath());
        return toResponse(applications.save(a));
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> mine() {
        Candidate c = current.candidate();
        return applications.findByCandidateIdOrderByCreatedAtDesc(c.getId()).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> forRecruiter() {
        User r = current.recruiter();
        return applications.findByJobRecruiterIdOrderByCreatedAtDesc(r.getId()).stream().map(this::toResponse).toList();
    }

    /** Recruiter decision. This is always an explicit human action; the AI never changes status. */
    @Transactional
    public ApplicationResponse updateStatus(Long id, String status) {
        User r = current.recruiter();
        Application a = applications.findById(id).orElseThrow(() -> ApiException.notFound("Application not found"));
        if (!a.getJob().getRecruiter().getId().equals(r.getId())) {
            throw ApiException.forbidden("This application does not belong to one of your jobs");
        }
        a.setStatus(Application.Status.valueOf(status));
        return toResponse(applications.save(a));
    }

    private ApplicationResponse toResponse(Application a) {
        Candidate c = a.getCandidate();
        Job j = a.getJob();
        return new ApplicationResponse(a.getId(), j.getId(), j.getTitle(), j.getCompanyName(),
                c.getId(), c.getUser().getFullName(), c.getUser().getEmail(), c.getSkills(),
                c.getExperienceYears(), a.getStatus().name(), a.getCoverNote(),
                a.getResumePath() != null, a.getCreatedAt(), a.getUpdatedAt());
    }
}
