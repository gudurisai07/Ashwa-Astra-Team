package com.smarthire.controller;

import com.smarthire.dto.ProfileDtos.ProfileRequest;
import com.smarthire.dto.ProfileDtos.ResumeResponse;
import com.smarthire.service.ResumeService;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {
    private final ResumeService resumes;

    public ResumeController(ResumeService resumes) {
        this.resumes = resumes;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeResponse> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resumes.upload(file));
    }

    public record ResumeTextRequest(String text) {}

    @GetMapping("/text")
    public java.util.Map<String, String> getResumeText() {
        return java.util.Map.of("text", resumes.getResumeText());
    }

    @PutMapping("/text")
    public ResumeResponse updateResumeText(@RequestBody ResumeTextRequest req) {
        return resumes.updateResumeText(req.text() == null ? "" : req.text());
    }

    @GetMapping("/my")
    public ResumeResponse my() {
        return resumes.mine();
    }

    @PutMapping("/profile")
    public ResumeResponse profile(@Valid @RequestBody ProfileRequest req) {
        return resumes.updateProfile(req);
    }

    @GetMapping("/download/{candidateId}")
    public ResponseEntity<Resource> download(@PathVariable Long candidateId) {
        ResumeService.ResumeFile f = resumes.download(candidateId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(f.fileName()).build().toString())
                .body(f.resource());
    }
}
