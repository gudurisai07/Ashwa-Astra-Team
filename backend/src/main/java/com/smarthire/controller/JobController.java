package com.smarthire.controller;

import com.smarthire.dto.JobDtos.JobRequest;
import com.smarthire.dto.JobDtos.JobResponse;
import com.smarthire.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobService jobs;

    public JobController(JobService jobs) {
        this.jobs = jobs;
    }

    @GetMapping
    public List<JobResponse> list(@RequestParam(required = false) String q,
                                  @RequestParam(required = false) String skill,
                                  @RequestParam(required = false) Integer maxExperience) {
        return jobs.search(q, skill, maxExperience);
    }

    @GetMapping("/mine")
    public List<JobResponse> mine() {
        return jobs.mine();
    }

    @GetMapping("/{id}")
    public JobResponse get(@PathVariable Long id) {
        return jobs.get(id);
    }

    @PostMapping
    public ResponseEntity<JobResponse> create(@Valid @RequestBody JobRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobs.create(req));
    }

    @PutMapping("/{id}")
    public JobResponse update(@PathVariable Long id, @Valid @RequestBody JobRequest req) {
        return jobs.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        jobs.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
