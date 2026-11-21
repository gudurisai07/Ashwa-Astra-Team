package com.smarthire.controller;

import com.smarthire.dto.ApplicationDtos.ApplicationResponse;
import com.smarthire.dto.ApplicationDtos.ApplyRequest;
import com.smarthire.dto.ApplicationDtos.StatusRequest;
import com.smarthire.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> apply(@Valid @RequestBody ApplyRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.apply(req));
    }

    @GetMapping("/my")
    public List<ApplicationResponse> my() {
        return service.mine();
    }

    @GetMapping("/recruiter")
    public List<ApplicationResponse> recruiter() {
        return service.forRecruiter();
    }

    @PutMapping("/{id}/status")
    public ApplicationResponse status(@PathVariable Long id, @Valid @RequestBody StatusRequest req) {
        return service.updateStatus(id, req.status());
    }
}
