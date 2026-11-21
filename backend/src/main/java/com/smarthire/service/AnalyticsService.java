package com.smarthire.service;

import com.smarthire.entity.Application;
import com.smarthire.entity.Candidate;
import com.smarthire.entity.Job;
import com.smarthire.entity.ResumeAnalysis;
import com.smarthire.entity.User;
import com.smarthire.repository.ApplicationRepository;
import com.smarthire.repository.JobMatchRepository;
import com.smarthire.repository.JobRepository;
import com.smarthire.repository.ResumeAnalysisRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {
    private final ApplicationRepository applications;
    private final JobRepository jobs;
    private final ResumeAnalysisRepository analyses;
    private final JobMatchRepository matches;
    private final CurrentUserService current;

    public AnalyticsService(ApplicationRepository applications, JobRepository jobs, ResumeAnalysisRepository analyses,
                            JobMatchRepository matches, CurrentUserService current) {
        this.applications = applications;
        this.jobs = jobs;
        this.analyses = analyses;
        this.matches = matches;
        this.current = current;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> candidate() {
        Candidate c = current.candidate();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalApplications", applications.countByCandidateId(c.getId()));
        m.put("pending", applications.countByCandidateIdAndStatus(c.getId(), Application.Status.PENDING));
        m.put("shortlisted", applications.countByCandidateIdAndStatus(c.getId(), Application.Status.SHORTLISTED));
        m.put("rejected", applications.countByCandidateIdAndStatus(c.getId(), Application.Status.REJECTED));
        m.put("hasResume", c.getResumePath() != null);
        m.put("latestResumeScore", analyses
                .findTopByCandidateIdAndAnalysisTypeOrderByCreatedAtDesc(c.getId(), ResumeAnalysis.Type.ANALYSIS)
                .map(ResumeAnalysis::getQualityScore).orElse(null));
        List<Map<String, Object>> recent = new ArrayList<>();
        matches.findByCandidateIdOrderByCreatedAtDesc(c.getId()).stream().limit(8).forEach(jm -> {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("jobId", jm.getJob().getId());
            r.put("jobTitle", jm.getJob().getTitle());
            r.put("matchPercentage", jm.getMatchPercentage());
            r.put("createdAt", jm.getCreatedAt());
            recent.add(r);
        });
        m.put("recentMatches", recent);
        return m;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> recruiter() {
        User r = current.recruiter();
        Long id = r.getId();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalJobs", jobs.countByRecruiterId(id));
        m.put("totalApplications", applications.countByJobRecruiterId(id));
        m.put("pending", applications.countByJobRecruiterIdAndStatus(id, Application.Status.PENDING));
        m.put("shortlisted", applications.countByJobRecruiterIdAndStatus(id, Application.Status.SHORTLISTED));
        m.put("rejected", applications.countByJobRecruiterIdAndStatus(id, Application.Status.REJECTED));

        List<Map<String, Object>> perJob = new ArrayList<>();
        for (Job j : jobs.findByRecruiterIdOrderByCreatedAtDesc(id)) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("jobId", j.getId());
            row.put("title", j.getTitle());
            row.put("applications", applications.countByJobId(j.getId()));
            perJob.add(row);
        }
        m.put("applicationsPerJob", perJob);

        List<Map<String, Object>> recent = new ArrayList<>();
        applications.findByJobRecruiterIdOrderByCreatedAtDesc(id).stream().limit(6).forEach(a -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("applicationId", a.getId());
            row.put("candidateName", a.getCandidate().getUser().getFullName());
            row.put("jobTitle", a.getJob().getTitle());
            row.put("status", a.getStatus().name());
            row.put("appliedAt", a.getCreatedAt());
            recent.add(row);
        });
        m.put("recentApplicants", recent);
        return m;
    }
}
